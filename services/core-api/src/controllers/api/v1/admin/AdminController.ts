import { Request, Response } from 'express';
import { AdminService } from '../../../../services/admin/AdminService';

export class AdminController {

  /**
   * POST /api/v1/admin/login
   */
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const trimmedUsername = typeof username === 'string' ? username.trim() : '';
      const rawPassword = typeof password === 'string' ? password : '';

      if (!trimmedUsername || !rawPassword) {
        return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gereklidir.' });
      }

      const result = await AdminService.loginAdmin(trimmedUsername, rawPassword);

      res.status(200).json({
        success: true,
        message: 'Yönetici girişi başarılı.',
        token: result.token,
        user: result.user
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 401;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/v1/admin/stats
   */
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/v1/admin/users
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const users = await AdminService.getUsers(search as string);
      res.status(200).json({ success: true, users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/v1/admin/users/:id
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { cash, bankCheckingBalance, bankSavingsBalance, politicalInfluence, politicalRole, isAdmin } = req.body;
      
      const updatedUser = await AdminService.updateUser(id, {
        cash,
        bankCheckingBalance,
        bankSavingsBalance,
        politicalInfluence,
        politicalRole,
        isAdmin
      } as any);

      res.status(200).json({ success: true, message: 'Kullanıcı başarıyla güncellendi.', user: updatedUser });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/v1/admin/users/:id
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AdminService.deleteUser(id);
      res.status(200).json({ success: true, message: 'Kullanıcı başarıyla silindi.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/v1/admin/commodities
   */
  static async getCommodities(req: Request, res: Response) {
    try {
      const commodities = await AdminService.getCommodities();
      res.status(200).json({ success: true, commodities });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/v1/admin/commodities/:id
   */
  static async updateCommodityPrice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { currentPrice } = req.body;

      const updatedCommodity = await AdminService.updateCommodityPrice(id, currentPrice);

      const io = req.app.get('io');
      if (io) {
        io.to('market:updates').emit('market:price-update', {
          commodityId: id,
          currentPrice,
          priceTrend: updatedCommodity.priceTrend,
        });
      }

      res.status(200).json({ success: true, message: 'Emtia fiyatı güncellendi ve yayınlandı.', commodity: updatedCommodity });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/v1/admin/laws
   */
  static async getLaws(req: Request, res: Response) {
    try {
      const laws = await AdminService.getLaws();
      res.status(200).json({ success: true, laws });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/admin/laws
   */
  static async createLaw(req: Request, res: Response) {
    try {
      const { title, description } = req.body;
      const law = await AdminService.createLaw(title, description);
      res.status(201).json({ success: true, message: 'Yasa tasarısı başarıyla meclise sunuldu.', law });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/v1/admin/laws/:id
   */
  static async updateLawStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedLaw = await AdminService.updateLawStatus(id, status);
      res.status(200).json({ success: true, message: 'Yasa tasarısı güncellendi.', law: updatedLaw });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/v1/admin/trucks
   */
  static async getTrucks(req: Request, res: Response) {
    try {
      const trucks = await AdminService.getTrucks();
      res.status(200).json({ success: true, trucks });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/admin/trucks
   */
  static async createTruck(req: Request, res: Response) {
    try {
      const { plateNumber, model, capacity } = req.body;
      const truck = await AdminService.createTruck(plateNumber, model, capacity);
      res.status(201).json({ success: true, message: 'Yeni lojistik tırı başarıyla eklendi.', truck });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
