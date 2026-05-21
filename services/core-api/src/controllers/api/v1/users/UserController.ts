import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../middlewares/authMiddleware';
import { AppDataSource } from '../../../../config/database';
import { UserDailyActivity } from '../../../../models/users/UserDailyActivity';
import { User } from '../../../../models/users/User';
import { UserMaterial } from '../../../../models/economy/UserMaterial';

export class UserController {
  /**
   * Get currently logged-in user profile details.
   */
  public static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Reload from DB to get the most recent data
      const userRepository = AppDataSource.getRepository(User);
      const freshUser = await userRepository.findOne({ where: { id: user.id } });
      
      if (!freshUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Hide password
      const { passwordHash, ...safeUser } = freshUser;

      // Load user materials from database
      const userMaterialRepo = AppDataSource.getRepository(UserMaterial);
      const userMaterials = await userMaterialRepo.find({
        where: { userId: user.id }
      });

      const materialsDict: Record<string, number> = {
        coal: 10,
        iron_ore: 5,
        steel: 0,
        copper: 0,
        aluminum: 0,
        lithium: 0,
        boron: 0,
        petroleum: 0,
        silicon: 0
      };

      for (const mat of userMaterials) {
        materialsDict[mat.commodityId] = parseFloat(mat.amount as any);
      }

      return res.status(200).json({
        success: true,
        data: {
          ...safeUser,
          materials: materialsDict
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Sync user economy status (cash, politicalInfluence, coalMineLevel, autoFactoryLevel, defenseFactoryLevel, materials)
   */
  public static async syncEconomy(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { cash, politicalInfluence, coalMineLevel, autoFactoryLevel, defenseFactoryLevel, materials } = req.body;

      const userRepository = AppDataSource.getRepository(User);
      const dbUser = await userRepository.findOne({ where: { id: user.id } });
      if (!dbUser) {
        return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
      }

      if (typeof cash === 'number') dbUser.cash = cash;
      if (typeof politicalInfluence === 'number') dbUser.politicalInfluence = politicalInfluence;
      if (typeof coalMineLevel === 'number') dbUser.coalMineLevel = coalMineLevel;
      if (typeof autoFactoryLevel === 'number') dbUser.autoFactoryLevel = autoFactoryLevel;
      if (typeof defenseFactoryLevel === 'number') dbUser.defenseFactoryLevel = defenseFactoryLevel;

      await userRepository.save(dbUser);

      // Sync materials if provided
      if (materials && typeof materials === 'object') {
        const userMaterialRepo = AppDataSource.getRepository(UserMaterial);
        const commodityIds = Object.keys(materials);

        for (const commodityId of commodityIds) {
          const amount = Number(materials[commodityId]);
          if (!isNaN(amount)) {
            let userMat = await userMaterialRepo.findOne({
              where: { userId: user.id, commodityId }
            });
            if (!userMat) {
              userMat = new UserMaterial();
              userMat.userId = user.id;
              userMat.commodityId = commodityId;
            }
            userMat.amount = amount;
            await userMaterialRepo.save(userMat);
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Ekonomi verileri başarıyla senkronize edildi!'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Heartbeat endpoint called by client every 1 minute.
   * Tracks daily activity securely.
   */
  public static async heartbeat(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const activityRepo = AppDataSource.getRepository(UserDailyActivity);
      
      // Get current date string (YYYY-MM-DD)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      // Find or create daily activity row
      let activity = await activityRepo.findOne({
        where: {
          userId: user.id,
          activityDate: todayStr
        }
      });

      if (activity) {
        // Anti-cheat: prevent spamming the heartbeat endpoint.
        // If the last update was less than 45 seconds ago, do not count this ping.
        const lastUpdated = new Date(activity.updatedAt).getTime();
        const diffMs = Date.now() - lastUpdated;
        
        if (diffMs < 45000) {
          return res.status(429).json({
            success: false,
            message: 'Heartbeat rate limit exceeded. Pings are allowed once per minute.',
            data: {
              activeMinutes: activity.activeMinutes
            }
          });
        }

        activity.activeMinutes += 1;
      } else {
        activity = new UserDailyActivity();
        activity.userId = user.id;
        activity.activityDate = todayStr;
        activity.activeMinutes = 1;
      }

      await activityRepo.save(activity);

      return res.status(200).json({
        success: true,
        message: 'Heartbeat recorded.',
        data: {
          activeMinutes: activity.activeMinutes
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Setup/create character options (avatar, backstory, isometric model, province/district)
   */
  public static async updateCharacterDraft(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { step, gender, characterAge, politicalIdeologyId, provinceId, districtId, backstoryId } = req.body;

      if (!step) {
        return res.status(400).json({ success: false, message: 'Adım (step) bilgisi gereklidir.' });
      }

      const userRepository = AppDataSource.getRepository(User);
      const dbUser = await userRepository.findOne({ where: { id: user.id } });
      if (!dbUser) {
        return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
      }

      const currentStep = Number(step);

      if (currentStep === 1) {
        if (!gender || !['male', 'female'].includes(gender)) {
          return res.status(400).json({ success: false, message: 'Geçersiz cinsiyet seçimi.' });
        }
        if (!characterAge || Number(characterAge) < 18 || Number(characterAge) > 75) {
          return res.status(400).json({ success: false, message: 'Yaş 18 ile 75 arasında olmalıdır.' });
        }
        if (!politicalIdeologyId || Number(politicalIdeologyId) < 1 || Number(politicalIdeologyId) > 10) {
          return res.status(400).json({ success: false, message: 'Geçersiz siyasi görüş seçimi.' });
        }

        dbUser.gender = gender;
        dbUser.characterAge = Number(characterAge);
        
        // Generate random birth date based on age and 2026 current year
        const birthYear = 2026 - Number(characterAge);
        const randomMonth = Math.floor(Math.random() * 12) + 1;
        const randomDay = Math.floor(Math.random() * 28) + 1;
        const pad = (num: number) => num.toString().padStart(2, '0');
        dbUser.birthDate = `${pad(randomDay)}.${pad(randomMonth)}.${birthYear}`;

        dbUser.politicalIdeologyId = Number(politicalIdeologyId);
        dbUser.avatarId = gender === 'male' ? 'avatar_m_1' : 'avatar_f_1';
        dbUser.isometricModelId = gender === 'male' ? 'char_diplomat_male' : 'char_diplomat_female';
        
        if (dbUser.characterCreationStep <= 1) {
          dbUser.characterCreationStep = 2;
        }
      } else if (currentStep === 2) {
        if (!provinceId || !districtId) {
          return res.status(400).json({ success: false, message: 'Şehir ve ilçe seçilmelidir.' });
        }

        dbUser.currentProvinceId = Number(provinceId);
        dbUser.citizenshipProvinceId = Number(provinceId);
        dbUser.currentDistrictId = Number(districtId);
        dbUser.citizenshipDistrictId = Number(districtId);

        if (dbUser.characterCreationStep <= 2) {
          dbUser.characterCreationStep = 3;
        }
      } else if (currentStep === 3) {
        const { isometricModelId } = req.body;
        if (!isometricModelId) {
          return res.status(400).json({ success: false, message: 'İzometrik görünüm seçilmelidir.' });
        }

        dbUser.isometricModelId = isometricModelId;
        dbUser.backstoryId = 'story_veteran'; // Suspended backstory default

        if (dbUser.characterCreationStep <= 3) {
          dbUser.characterCreationStep = 4;
        }
      } else {
        return res.status(400).json({ success: false, message: 'Geçersiz adım numarası.' });
      }

      await userRepository.save(dbUser);

      const { passwordHash, ...safeUser } = dbUser;
      return res.status(200).json({
        success: true,
        message: `Adım ${currentStep} taslağı başarıyla kaydedildi.`,
        data: safeUser
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async setupCharacter(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userRepository = AppDataSource.getRepository(User);
      const dbUser = await userRepository.findOne({ where: { id: user.id } });
      
      if (!dbUser) {
        return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
      }

      const { avatarId, isometricModelId, backstoryId, provinceId, districtId, gender, characterAge, politicalIdeologyId } = req.body;

      if (avatarId) dbUser.avatarId = avatarId;
      if (isometricModelId) dbUser.isometricModelId = isometricModelId;
      dbUser.backstoryId = backstoryId || dbUser.backstoryId || 'story_veteran';
      if (gender) dbUser.gender = gender;
      if (characterAge) {
        dbUser.characterAge = Number(characterAge);
        
        // Generate random birth date based on age and 2026 current year if not already set or updated
        const birthYear = 2026 - Number(characterAge);
        const randomMonth = Math.floor(Math.random() * 12) + 1;
        const randomDay = Math.floor(Math.random() * 28) + 1;
        const pad = (num: number) => num.toString().padStart(2, '0');
        dbUser.birthDate = `${pad(randomDay)}.${pad(randomMonth)}.${birthYear}`;
      }
      if (politicalIdeologyId) dbUser.politicalIdeologyId = Number(politicalIdeologyId);
      if (provinceId) {
        dbUser.currentProvinceId = Number(provinceId);
        dbUser.citizenshipProvinceId = Number(provinceId);
      }
      if (districtId) {
        dbUser.currentDistrictId = Number(districtId);
        dbUser.citizenshipDistrictId = Number(districtId);
      }

      // Security check: Make sure all required step values are populated
      if (!dbUser.gender || !dbUser.characterAge || !dbUser.politicalIdeologyId ||
          !dbUser.citizenshipProvinceId || !dbUser.citizenshipDistrictId || !dbUser.backstoryId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Karakter oluşturma sürecinde tamamlanmamış adımlar var. Lütfen tüm adımları doldurunuz.' 
        });
      }

      if (Number(dbUser.characterAge) < 18) {
        return res.status(400).json({ success: false, message: 'Karakter yaşınız 18 yaşından büyük veya eşit olmalıdır.' });
      }

      dbUser.isCharacterCreated = true;
      dbUser.characterCreationStep = 4;

      // Generate a unique 7-digit citizenId if not already present
      if (!dbUser.citizenId) {
        let uniqueCitizenId = '';
        let isTaken = true;
        
        while (isTaken) {
          const randomNum = Math.floor(1000000 + Math.random() * 9000000);
          uniqueCitizenId = randomNum.toString();
          
          const existingCitizen = await userRepository.findOne({ where: { citizenId: uniqueCitizenId } });
          if (!existingCitizen) {
            isTaken = false;
          }
        }
        
        dbUser.citizenId = uniqueCitizenId;
      }

      await userRepository.save(dbUser);

      const { passwordHash, ...safeUser } = dbUser;

      return res.status(200).json({
        success: true,
        message: 'Karakteriniz başarıyla oluşturuldu!',
        data: safeUser
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
