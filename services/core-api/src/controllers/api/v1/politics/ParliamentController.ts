import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../middlewares/authMiddleware';
import { AppDataSource } from '../../../../config/database';
import { Law } from '../../../../models/politics/Law';
import { LawVote } from '../../../../models/politics/LawVote';
import { Parliament } from '../../../../models/politics/Parliament';

export class ParliamentController {
  
  /**
   * Propose a new legislative bill.
   */
  public static async proposeLaw(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (user.politicalRole !== 'MILLETVEKILI') {
        return res.status(403).json({
          success: false,
          message: 'Yasa önerisi ve oylamaları yalnızca milletvekilleri tarafından yapılabilir.'
        });
      }

      const { title, content, parliamentId } = req.body;
      if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content are required to propose a law.' });
      }

      // Check if parliament exists, or fallback to default TBMM
      const parliamentRepo = AppDataSource.getRepository(Parliament);
      const targetParliamentId = parliamentId || 'default-tbmm';
      const parliament = await parliamentRepo.findOne({ where: { id: targetParliamentId } });

      if (!parliament) {
        return res.status(400).json({ success: false, message: `Parliament with ID ${targetParliamentId} not found.` });
      }

      const lawRepo = AppDataSource.getRepository(Law);
      const newLaw = new Law();
      newLaw.title = title;
      newLaw.content = content;
      newLaw.isApproved = false;
      newLaw.parliamentId = parliament.id;

      await lawRepo.save(newLaw);

      return res.status(201).json({
        success: true,
        message: 'Law proposal submitted to the parliament chambers successfully!',
        data: newLaw
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Cast a vote on a law.
   */
  public static async voteLaw(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (user.politicalRole !== 'MILLETVEKILI') {
        return res.status(403).json({
          success: false,
          message: 'Yasa önerisi ve oylamaları yalnızca milletvekilleri tarafından yapılabilir.'
        });
      }

      const { lawId, vote } = req.body;
      if (!lawId || !vote || (vote !== 'yes' && vote !== 'no')) {
        return res.status(400).json({ success: false, message: 'Valid lawId and vote ("yes" or "no") are required.' });
      }

      const lawRepo = AppDataSource.getRepository(Law);
      const law = await lawRepo.findOne({ where: { id: lawId } });
      if (!law) {
        return res.status(404).json({ success: false, message: 'Law proposal not found.' });
      }

      if (law.isApproved) {
        return res.status(400).json({ success: false, message: 'This law has already been finalized/archived.' });
      }

      const voteRepo = AppDataSource.getRepository(LawVote);
      
      // Check if user already voted (Anti-duplicate check)
      const existingVote = await voteRepo.findOne({
        where: {
          lawId,
          userId: user.id
        }
      });

      if (existingVote) {
        return res.status(400).json({ success: false, message: 'You have already voted on this law proposal.' });
      }

      // Record vote
      const newVote = new LawVote();
      newVote.lawId = lawId;
      newVote.userId = user.id;
      newVote.vote = vote;

      await voteRepo.save(newVote);

      return res.status(200).json({
        success: true,
        message: 'Your vote has been cast successfully.',
        data: newVote
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get all active and archived laws.
   */
  public static async getLaws(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const lawRepo = AppDataSource.getRepository(Law);
      const voteRepo = AppDataSource.getRepository(LawVote);

      const laws = await lawRepo.find({
        order: { createdAt: 'DESC' }
      });

      const responseList = [];

      for (const law of laws) {
        // Count votes
        const yesVotes = await voteRepo.count({ where: { lawId: law.id, vote: 'yes' } });
        const noVotes = await voteRepo.count({ where: { lawId: law.id, vote: 'no' } });

        // Check if user has voted on this law
        const userVote = await voteRepo.findOne({
          where: {
            lawId: law.id,
            userId: user.id
          }
        });

        responseList.push({
          id: law.id,
          title: law.title,
          description: law.content,
          isApproved: law.isApproved,
          createdAt: law.createdAt,
          yesVotes,
          noVotes,
          voted: userVote ? userVote.vote : null
        });
      }

      return res.status(200).json({
        success: true,
        laws: responseList
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
