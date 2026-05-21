import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple';
import { AppDataSource } from '../../config/database';
import { User } from '../../models/users/User';
import { Commodity } from '../../models/economy/Commodity';
import { StateReserve } from '../../models/economy/StateReserve';
import { Law } from '../../models/politics/Law';
import { Truck, TruckStatus } from '../../models/logistics/Truck';

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_POLITIC_KEY_2026';

export class AdminService {
  
  /**
   * Authenticates an admin user
   */
  public static async loginAdmin(username: string, passwordPlain: string): Promise<{ user: Partial<User>; token: string }> {
    const userRepository = AppDataSource.getRepository(User);
    const normalizedUsername = username.trim().toLowerCase();

    // Find the user by username
    const user = await userRepository.findOne({ where: { username: normalizedUsername } });
    if (!user) {
      throw new Error('Kullanıcı adı veya şifre hatalı!');
    }

    // Role check: Only admin members are allowed
    if (!user.isAdmin) {
      // 403 equivalents should be handled by throwing error that indicates lack of privileges
      const err = new Error('Yetkisiz erişim: Bu panele giriş yapmak için yönetici (Admin) yetkiniz olmalıdır.');
      (err as any).statusCode = 403;
      throw err;
    }

    // Password validation
    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('Kullanıcı adı veya şifre hatalı!');
    }

    // Generate JWT token (standard subject claims)
    const payload = {
      sub: user.id,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days expiration
    };
    const token = jwt.encode(payload, JWT_SECRET);

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Retrieves dashboard statistics
   */
  public static async getDashboardStats() {
    const userRepo = AppDataSource.getRepository(User);
    const truckRepo = AppDataSource.getRepository(Truck);
    const reserveRepo = AppDataSource.getRepository(StateReserve);

    const totalPlayers = await userRepo.count();

    const cashSumResult = await userRepo
      .createQueryBuilder('user')
      .select('SUM(user.cash + user.bankCheckingBalance + user.bankSavingsBalance)', 'totalCash')
      .getRawOne();
    const totalMoneyInCirculation = parseFloat(cashSumResult?.totalCash || '0');

    const totalTrucks = await truckRepo.count();

    const reserveSumResult = await reserveRepo
      .createQueryBuilder('reserve')
      .select('SUM(reserve.amount)', 'totalAmount')
      .getRawOne();
    const totalReserves = parseFloat(reserveSumResult?.totalAmount || '0');

    return {
      totalPlayers,
      totalMoneyInCirculation,
      totalTrucks,
      totalReserves,
    };
  }

  /**
   * Gets list of users
   */
  public static async getUsers(search?: string) {
    const userRepo = AppDataSource.getRepository(User);
    const query = userRepo.createQueryBuilder('user');

    if (search) {
      query.where(
        'user.username ILIKE :search OR user.characterName ILIKE :search OR user.characterSurname ILIKE :search',
        { search: `%${search}%` }
      );
    }

    query.orderBy('user.createdAt', 'DESC');
    return await query.getMany();
  }

  /**
   * Updates user profile info
   */
  public static async updateUser(id: string, updates: Partial<User>) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı.');
    }

    if (updates.cash !== undefined) user.cash = updates.cash;
    if (updates.bankCheckingBalance !== undefined) user.bankCheckingBalance = updates.bankCheckingBalance;
    if (updates.bankSavingsBalance !== undefined) user.bankSavingsBalance = updates.bankSavingsBalance;
    if (updates.politicalInfluence !== undefined) user.politicalInfluence = updates.politicalInfluence;
    if (updates.politicalRole !== undefined) user.politicalRole = updates.politicalRole;
    if (updates.isAdmin !== undefined) user.isAdmin = updates.isAdmin;

    return await userRepo.save(user);
  }

  /**
   * Deletes a user profile
   */
  public static async deleteUser(id: string) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı.');
    }

    return await userRepo.remove(user);
  }

  /**
   * Retrieves all market commodities
   */
  public static async getCommodities() {
    const commodityRepo = AppDataSource.getRepository(Commodity);
    return await commodityRepo.find();
  }

  /**
   * Updates commodity current price and trend
   */
  public static async updateCommodityPrice(id: string, currentPrice: number) {
    const commodityRepo = AppDataSource.getRepository(Commodity);
    const commodity = await commodityRepo.findOne({ where: { id } });

    if (!commodity) {
      throw new Error('Emtia bulunamadı.');
    }

    commodity.currentPrice = currentPrice;

    const priceTrend = commodity.priceTrend || [];
    priceTrend.push(currentPrice);
    if (priceTrend.length > 10) priceTrend.shift();
    commodity.priceTrend = priceTrend;

    return await commodityRepo.save(commodity);
  }

  /**
   * Retrieves all parliament laws
   */
  public static async getLaws() {
    const lawRepo = AppDataSource.getRepository(Law);
    const dbLaws = await lawRepo.find({ order: { createdAt: 'DESC' } });

    return dbLaws.map((law) => {
      const hash = law.id.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const yesVotes = (hash % 150) + 120;
      const noVotes = (hash % 100) + 70;
      const categories = ['TAX', 'BORDER', 'RESOURCE', 'MILITARY'];
      const category = categories[hash % categories.length];

      return {
        id: law.id,
        title: law.title,
        description: law.content,
        category: category,
        targetValue: '%18 KDV Oranı',
        status: law.isApproved ? 'APPROVED' : 'VOTING',
        yesVotes,
        noVotes,
        abstainVotes: 30,
        createdAt: law.createdAt,
        updatedAt: law.updatedAt
      };
    });
  }

  /**
   * Submits a new law bill to parliament
   */
  public static async createLaw(title: string, description: string) {
    const lawRepo = AppDataSource.getRepository(Law);

    const law = new Law();
    law.title = title;
    law.content = description;
    law.isApproved = false;
    law.parliamentId = '00000000-0000-0000-0000-000000000001';

    return await lawRepo.save(law);
  }

  /**
   * Updates law status (approved / vetoed)
   */
  public static async updateLawStatus(id: string, status: string) {
    const lawRepo = AppDataSource.getRepository(Law);
    const law = await lawRepo.findOne({ where: { id } });

    if (!law) {
      throw new Error('Yasa tasarısı bulunamadı.');
    }

    if (status === 'APPROVED') {
      law.isApproved = true;
    } else if (status === 'VETOED') {
      law.isApproved = false;
    }

    return await lawRepo.save(law);
  }

  /**
   * Retrieves logistics fleet trucks
   */
  public static async getTrucks() {
    const truckRepo = AppDataSource.getRepository(Truck);
    return await truckRepo.find();
  }

  /**
   * Adds a new truck to fleet
   */
  public static async createTruck(plateNumber: string, model: string, capacity: number) {
    const truckRepo = AppDataSource.getRepository(Truck);

    const truck = new Truck();
    truck.plateNumber = plateNumber;
    truck.model = model;
    truck.capacity = capacity;
    truck.status = TruckStatus.IDLE;
    truck.currentProvinceId = 77; // Yalova center
    truck.currentDistrictId = 898;

    return await truckRepo.save(truck);
  }
}
