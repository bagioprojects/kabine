import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../middlewares/authMiddleware';
import { AppDataSource } from '../../../../config/database';
import { User } from '../../../../models/users/User';
import { Enterprise } from '../../../../models/economy/Enterprise';
import { UserDailyActivity } from '../../../../models/users/UserDailyActivity';
import { MoreThanOrEqual } from 'typeorm';

export class ElectionController {
  /**
   * Apply for Presidency Candidacy.
   * Checks candidacy rules:
   * 1. Political reputation (nüfuz) >= 1000
   * 2. Residency in the citizenship state >= 15 days
   * 3. Must own at least one enterprise in the citizenship state
   */
  public static async applyForCandidacy(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Check 1: Reputation
      if (user.politicalReputation < 1000) {
        return res.status(400).json({
          success: false,
          message: `Candidacy requires at least 1000 political reputation. Current: ${user.politicalReputation}`
        });
      }

      // Check 2: Residency of 15 days
      const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
      const residencyDuration = Date.now() - new Date(user.residencyApprovedAt).getTime();
      if (residencyDuration < fifteenDaysInMs) {
        const remainingDays = Math.ceil((fifteenDaysInMs - residencyDuration) / (24 * 60 * 60 * 1000));
        return res.status(400).json({
          success: false,
          message: `Residency requirement not met. You must wait another ${remainingDays} days in this province to qualify.`
        });
      }

      // Check 3: Owned enterprise in the citizenship province
      if (user.citizenshipProvinceId === null) {
        return res.status(400).json({ success: false, message: 'You do not have a citizenship province registered.' });
      }

      const enterpriseRepo = AppDataSource.getRepository(Enterprise);
      const enterpriseCount = await enterpriseRepo.count({
        where: {
          ownerId: user.id,
          provinceId: user.citizenshipProvinceId
        }
      });

      if (enterpriseCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Candidacy requires owning at least one active factory or company in your citizenship province.'
        });
      }

      // Validation passes!
      return res.status(200).json({
        success: true,
        message: 'Congratulations! You meet all rules and your candidacy has been approved.',
        data: {
          candidateId: user.id,
          name: `${user.characterName} ${user.characterSurname}`,
          provinceId: user.citizenshipProvinceId
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Returns a transparent list of voters in a province.
   * Calculates eligibility for each voter:
   * 1. 10 days of residency
   * 2. 3 hours of online playtime in the last 7 days
   */
  public static async getVoters(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const provinceId = req.query.provinceId
        ? parseInt(req.query.provinceId as string)
        : user.citizenshipProvinceId;

      if (!provinceId) {
        return res.status(400).json({ success: false, message: 'Province ID is required.' });
      }

      const userRepo = AppDataSource.getRepository(User);
      const activityRepo = AppDataSource.getRepository(UserDailyActivity);

      // Find all users who are registered citizens in the province
      const citizens = await userRepo.find({
        where: {
          citizenshipProvinceId: provinceId
        }
      });

      // Calculate start date for activity query (7 days ago YYYY-MM-DD)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const year = sevenDaysAgo.getFullYear();
      const month = String(sevenDaysAgo.getMonth() + 1).padStart(2, '0');
      const day = String(sevenDaysAgo.getDate()).padStart(2, '0');
      const sevenDaysAgoStr = `${year}-${month}-${day}`;

      const voterList = [];

      for (const citizen of citizens) {
        // Query playtime activities for this user in last 7 days
        const activities = await activityRepo.find({
          where: {
            userId: citizen.id,
            activityDate: MoreThanOrEqual(sevenDaysAgoStr)
          }
        });

        const activeMinutes = activities.reduce((sum: number, act: UserDailyActivity) => sum + act.activeMinutes, 0);

        // Check residency eligibility (10 days = 10 * 24 * 60 * 60 * 1000 ms)
        const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;
        const residencyDuration = Date.now() - new Date(citizen.residencyApprovedAt).getTime();
        const residencyOk = residencyDuration >= tenDaysInMs;

        // Check playtime eligibility (3 hours = 180 minutes)
        const playtimeOk = activeMinutes >= 180;

        voterList.push({
          id: citizen.id,
          characterName: citizen.characterName,
          characterSurname: citizen.characterSurname,
          residencyApprovedAt: citizen.residencyApprovedAt,
          activeMinutesLast7Days: activeMinutes,
          residencyEligible: residencyOk,
          playtimeEligible: playtimeOk,
          isEligibleToVote: residencyOk && playtimeOk
        });
      }

      return res.status(200).json({
        success: true,
        provinceId,
        voters: voterList
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Cast a vote in the election.
   * Verifies voter residency and playtime eligibility before accepting the vote.
   */
  public static async castVote(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { candidateId } = req.body;
      if (!candidateId) {
        return res.status(400).json({ success: false, message: 'Candidate ID is required to vote.' });
      }

      // Check 1: Has user already voted?
      if (user.hasVotedThisTerm) {
        return res.status(400).json({ success: false, message: 'You have already voted in this election cycle.' });
      }

      // Check 2: Residency eligibility (10 days)
      const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;
      const residencyDuration = Date.now() - new Date(user.residencyApprovedAt).getTime();
      if (residencyDuration < tenDaysInMs) {
        return res.status(400).json({
          success: false,
          message: 'Voter eligibility failed. You must have at least 10 days of residency in this province to vote.'
        });
      }

      // Check 3: Playtime eligibility (3 hours in the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const year = sevenDaysAgo.getFullYear();
      const month = String(sevenDaysAgo.getMonth() + 1).padStart(2, '0');
      const day = String(sevenDaysAgo.getDate()).padStart(2, '0');
      const sevenDaysAgoStr = `${year}-${month}-${day}`;

      const activityRepo = AppDataSource.getRepository(UserDailyActivity);
      const activities = await activityRepo.find({
        where: {
          userId: user.id,
          activityDate: MoreThanOrEqual(sevenDaysAgoStr)
        }
      });

      const activeMinutes = activities.reduce((sum: number, act: UserDailyActivity) => sum + act.activeMinutes, 0);
      if (activeMinutes < 180) {
        return res.status(400).json({
          success: false,
          message: `Voter eligibility failed. You require at least 3 hours (180 minutes) of online playtime in the last 7 days. Your current playtime: ${activeMinutes} minutes.`
        });
      }

      // Record the vote
      const userRepo = AppDataSource.getRepository(User);
      user.hasVotedThisTerm = true;
      await userRepo.save(user);

      return res.status(200).json({
        success: true,
        message: 'Vote cast successfully. Thank you for participating in the democratic process!',
        data: {
          voterId: user.id,
          candidateId
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Apply for residency relocation.
   * Checks if borders of the target province are frozen (e.g. 24h before election).
   */
  public static async applyForResidency(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { targetProvinceId } = req.body;
      if (targetProvinceId === undefined) {
        return res.status(400).json({ success: false, message: 'Target Province ID is required.' });
      }

      // Check if borders are frozen in target province.
      // Can be set globally or via process.env for testing / runtime control.
      const isBorderFrozen = process.env.IS_BORDER_FROZEN === 'true' || (global as any).isBorderFrozen === true; 
      
      if (isBorderFrozen) {
        return res.status(400).json({
          success: false,
          message: 'Relocation failed. The borders of the target province are frozen due to the upcoming elections (24 hours lock).'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Residency relocation application submitted successfully.',
        data: {
          userId: user.id,
          targetProvinceId,
          status: 'pending'
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
