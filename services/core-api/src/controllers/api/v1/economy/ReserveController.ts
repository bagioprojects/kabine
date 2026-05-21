import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../middlewares/authMiddleware';
import { AppDataSource } from '../../../../config/database';
import { StateReserve } from '../../../../models/economy/StateReserve';
import { Commodity } from '../../../../models/economy/Commodity';
import { UserMaterial } from '../../../../models/economy/UserMaterial';
import { User } from '../../../../models/users/User';

export class ReserveController {
  /**
   * Get the state reserves for a province.
   */
  public static async getReserves(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Default to user's current province, fallback to 1 (Ankara)
      const provinceId = req.query.provinceId 
        ? parseInt(req.query.provinceId as string) 
        : (user.currentProvinceId || 1);

      const stateReserveRepo = AppDataSource.getRepository(StateReserve);
      const reserves = await stateReserveRepo.find({
        where: { provinceId },
        relations: ['commodity']
      });

      // Find the President of this province or state
      const userRepo = AppDataSource.getRepository(User);
      const president = await userRepo.findOne({
        where: { 
          citizenshipProvinceId: provinceId,
          politicalRole: 'CUMHURBASKANI' as any
        }
      });

      return res.status(200).json({
        success: true,
        provinceId,
        president: president ? {
          id: president.id,
          name: `${president.characterName} ${president.characterSurname}`
        } : null,
        reserves: reserves.map((r: StateReserve) => ({
          commodityId: r.commodityId,
          name: r.commodity.name,
          symbol: r.commodity.symbol,
          category: r.commodity.category,
          amount: parseFloat(r.amount as any),
          currentPrice: parseFloat(r.commodity.currentPrice as any)
        }))
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Manage state reserves. ONLY CUMHURBASKANI allowed.
   * Actions:
   * - deposit: Transfer commodity from President's inventory to State Depot.
   * - withdraw: Transfer commodity from State Depot to President's inventory.
   * - buy: Buy commodity from market into State Depot, paying with President's cash.
   * - sell: Sell commodity from State Depot to market, adding to President's cash.
   */
  public static async manageReserves(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // 1. Role Check: Only CUMHURBASKANI
      if (user.politicalRole !== 'CUMHURBASKANI') {
        return res.status(403).json({
          success: false,
          message: 'Devlet rezervlerini ve deposunu yalnızca Cumhurbaşkanı yönetebilir.'
        });
      }

      const { action, commodityId, amount } = req.body;
      const parsedAmount = parseFloat(amount);
      if (!action || !commodityId || isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz parametreler. action (deposit, withdraw, buy, sell), commodityId ve pozitif amount girilmelidir.'
        });
      }

      const provinceId = user.citizenshipProvinceId || 1;

      // 2. Fetch Commodity & State Reserve record
      const commodityRepo = AppDataSource.getRepository(Commodity);
      const commodity = await commodityRepo.findOne({ where: { id: commodityId } });
      if (!commodity) {
        return res.status(404).json({ success: false, message: 'Emtia ürünü bulunamadı.' });
      }

      const stateReserveRepo = AppDataSource.getRepository(StateReserve);
      let stateReserve = await stateReserveRepo.findOne({
        where: { provinceId, commodityId }
      });

      // If state reserve record doesn't exist, create one
      if (!stateReserve) {
        stateReserve = new StateReserve();
        stateReserve.provinceId = provinceId;
        stateReserve.commodityId = commodityId;
        stateReserve.amount = 0;
      }

      const userMaterialRepo = AppDataSource.getRepository(UserMaterial);
      let userMaterial = await userMaterialRepo.findOne({
        where: { userId: user.id, commodityId }
      });

      const userRepo = AppDataSource.getRepository(User);
      const currentPrice = parseFloat(commodity.currentPrice as any);
      const totalCost = parsedAmount * currentPrice;

      if (action === 'deposit') {
        // Transfer from President inventory -> State Depot
        if (!userMaterial || parseFloat(userMaterial.amount as any) < parsedAmount) {
          return res.status(400).json({
            success: false,
            message: `Kendi envanterinizde yeterli ${commodity.name} bulunmuyor.`
          });
        }

        userMaterial.amount = parseFloat(userMaterial.amount as any) - parsedAmount;
        stateReserve.amount = parseFloat(stateReserve.amount as any) + parsedAmount;

        await userMaterialRepo.save(userMaterial);
        await stateReserveRepo.save(stateReserve);

      } else if (action === 'withdraw') {
        // Transfer from State Depot -> President inventory
        if (parseFloat(stateReserve.amount as any) < parsedAmount) {
          return res.status(400).json({
            success: false,
            message: `Devlet deposunda yeterli ${commodity.name} bulunmuyor.`
          });
        }

        if (!userMaterial) {
          userMaterial = new UserMaterial();
          userMaterial.userId = user.id;
          userMaterial.commodityId = commodityId;
          userMaterial.amount = 0;
        }

        stateReserve.amount = parseFloat(stateReserve.amount as any) - parsedAmount;
        userMaterial.amount = parseFloat(userMaterial.amount as any) + parsedAmount;

        await userMaterialRepo.save(userMaterial);
        await stateReserveRepo.save(stateReserve);

      } else if (action === 'buy') {
        // Buy from Market -> State Depot (paying with President cash)
        const presidentCash = parseFloat(user.cash as any);
        if (presidentCash < totalCost) {
          return res.status(400).json({
            success: false,
            message: `Yetersiz bütçe. ${parsedAmount} ${commodity.name} satın almak için ₺${totalCost.toFixed(2)} gerekiyor. Cumhurbaşkanı kasası: ₺${presidentCash.toFixed(2)}`
          });
        }

        user.cash = presidentCash - totalCost;
        stateReserve.amount = parseFloat(stateReserve.amount as any) + parsedAmount;

        await userRepo.save(user);
        await stateReserveRepo.save(stateReserve);

      } else if (action === 'sell') {
        // Sell from State Depot -> Market (adding to President cash)
        if (parseFloat(stateReserve.amount as any) < parsedAmount) {
          return res.status(400).json({
            success: false,
            message: `Devlet deposunda satılacak yeterli ${commodity.name} bulunmuyor.`
          });
        }

        stateReserve.amount = parseFloat(stateReserve.amount as any) - parsedAmount;
        user.cash = parseFloat(user.cash as any) + totalCost;

        await userRepo.save(user);
        await stateReserveRepo.save(stateReserve);

      } else {
        return res.status(400).json({ success: false, message: 'Geçersiz eylem.' });
      }

      // Reload user model to return latest state
      const updatedUser = await userRepo.findOne({ where: { id: user.id } });

      return res.status(200).json({
        success: true,
        message: 'Devlet deposu işlemi başarıyla tamamlandı.',
        data: {
          action,
          commodityId,
          amount: parsedAmount,
          stateReserveAmount: stateReserve.amount,
          presidentCash: updatedUser ? parseFloat(updatedUser.cash as any) : user.cash
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
