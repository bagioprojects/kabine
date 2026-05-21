import { DataSource } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User, PoliticalRole } from '../models/users/User';
import { Enterprise } from '../models/economy/Enterprise';
import { Commodity, CommodityCategory } from './../models/economy/Commodity';
import { UserMaterial } from './../models/economy/UserMaterial';
import { StateReserve } from '../models/economy/StateReserve';
import { UserDailyActivity } from '../models/users/UserDailyActivity';
import { LawVote } from '../models/politics/LawVote';
import { Law } from '../models/politics/Law';
import { Parliament } from '../models/politics/Parliament';
import { Truck } from '../models/logistics/Truck';
import { Route } from '../models/logistics/Route';
import { DistrictMap } from '../models/maps/DistrictMap';
import { CustomMap } from '../models/maps/CustomMap';
import { ModelCategory } from '../models/maps/ModelCategory';
import { ModelAsset } from '../models/maps/ModelAsset';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5440'),
  username: process.env.DB_USERNAME || 'politic_user',
  password: process.env.DB_PASSWORD || 'politic_password',
  database: process.env.DB_DATABASE || 'politic_db',
  synchronize: true, // Dev mode auto-schema sync
  logging: false,
  entities: [User, Enterprise, Commodity, UserMaterial, StateReserve, UserDailyActivity, LawVote, Law, Parliament, Truck, Route, DistrictMap, CustomMap, ModelCategory, ModelAsset],
  subscribers: [],
  migrations: [],
});

export async function initializeDatabase() {
  await AppDataSource.initialize();
  await seedDatabase();
}

async function seedDatabase() {
  try {
    // 1. Seed Commodities
    const commodityRepo = AppDataSource.getRepository(Commodity);
    const commCount = await commodityRepo.count();
    if (commCount === 0) {
      console.log('🌱 Seeding initial commodities...');
      const defaultCommodities = [
        { id: 'coal', name: 'Kömür', symbol: 'COAL', category: CommodityCategory.ENERGY, basePrice: 50, currentPrice: 50, priceTrend: [48, 49, 51, 50, 49, 50], description: 'Zonguldak Cumhuriyeti kaynaklı birincil enerji yakıtı.' },
        { id: 'iron_ore', name: 'Demir Cevheri', symbol: 'IRON', category: CommodityCategory.RAW_MINERAL, basePrice: 80, currentPrice: 80, priceTrend: [78, 81, 79, 80, 82, 80], description: 'Sivas Cumhuriyeti kaynaklı çelik alaşım ana hammaddesi.' },
        { id: 'steel', name: 'Çelik', symbol: 'STEEL', category: CommodityCategory.REFINED_METAL, basePrice: 200, currentPrice: 200, priceTrend: [195, 198, 202, 201, 199, 200], description: 'Karabük Cumhuriyeti eritme tesisleri ağır sanayi ürünü.' },
        { id: 'copper', name: 'Bakır', symbol: 'COPR', category: CommodityCategory.RAW_MINERAL, basePrice: 120, currentPrice: 120, priceTrend: [118, 122, 121, 119, 120, 120], description: 'Kastamonu Cumhuriyeti kaynaklı elektrik şebekesi hammaddesi.' },
        { id: 'aluminum', name: 'Alüminyum', symbol: 'ALUM', category: CommodityCategory.REFINED_METAL, basePrice: 150, currentPrice: 150, priceTrend: [147, 149, 151, 150, 152, 150], description: 'Konya Cumhuriyeti kaynaklı havacılık ve SİHA hafif gövde metali.' },
        { id: 'lithium', name: 'Lityum', symbol: 'LITH', category: CommodityCategory.RAW_MINERAL, basePrice: 350, currentPrice: 350, priceTrend: [340, 345, 352, 348, 351, 350], description: 'Eskişehir Cumhuriyeti kaynaklı batarya hücresi ana etken maddesi.' },
        { id: 'boron', name: 'Bor', symbol: 'BOR', category: CommodityCategory.STRATEGIC, basePrice: 500, currentPrice: 500, priceTrend: [490, 495, 502, 501, 498, 500], description: 'Balıkesir Cumhuriyeti kaynaklı zırh kaplama ve yüksek ısı elementi.' },
        { id: 'petroleum', name: 'Petrol', symbol: 'PETR', category: CommodityCategory.ENERGY, basePrice: 280, currentPrice: 280, priceTrend: [275, 279, 283, 281, 280, 280], description: 'Batman Cumhuriyeti kaynaklı ham akaryakıt hammaddesi.' },
        { id: 'silicon', name: 'Silikon', symbol: 'SLCN', category: CommodityCategory.SEMICONDUCTOR, basePrice: 400, currentPrice: 400, priceTrend: [390, 395, 401, 399, 402, 400], description: 'Ankara Cumhuriyeti kaynaklı mikroçip ve radar kartı bileşeni.' }
      ];
      for (const c of defaultCommodities) {
        const comm = new Commodity();
        Object.assign(comm, c);
        await commodityRepo.save(comm);
      }
      console.log('✅ Seeding commodities complete.');
    }

    // 2. Seed Parliament
    const parliamentRepo = AppDataSource.getRepository(Parliament);
    const parlCount = await parliamentRepo.count();
    if (parlCount === 0) {
      console.log('🌱 Seeding default TBMM Parliament...');
      const tbmm = new Parliament();
      tbmm.id = '00000000-0000-0000-0000-000000000001';
      tbmm.regionName = 'TBMM';
      tbmm.totalSeats = 600;
      tbmm.seatDistribution = { 'AKP': 268, 'CHP': 169, 'MHP': 50, 'IYI': 44, 'DEM': 57, 'DIGER': 12 };
      tbmm.electionThreshold = 7.0;
      await parliamentRepo.save(tbmm);
      console.log('✅ Seeding default Parliament complete.');
    }

    // 3. Seed State Reserves for the 9 commodities for province 1 and 2
    const stateReserveRepo = AppDataSource.getRepository(StateReserve);
    const reserveCount = await stateReserveRepo.count();
    if (reserveCount === 0) {
      console.log('🌱 Seeding initial state reserves...');
      const allCommodities = await commodityRepo.find();
      // Seed for all 81 provinces (1 to 81) to ensure co-located databases exist when traveling
      const targetProvinces = Array.from({ length: 81 }, (_, i) => i + 1);
      for (const provId of targetProvinces) {
        for (const comm of allCommodities) {
          const reserve = new StateReserve();
          reserve.provinceId = provId;
          reserve.commodityId = comm.id;
          reserve.amount = 1000; // Start with 1000 tons of reserves
          await stateReserveRepo.save(reserve);
        }
      }
      console.log('✅ Seeding initial state reserves complete.');
    }

    // 4. Clean up old test user 'yalova' if exists, and seed new demo accounts
    const userRepo = AppDataSource.getRepository(User);
    const userMaterialRepo = AppDataSource.getRepository(UserMaterial);

    const oldYalova = await userRepo.findOne({ where: { username: 'yalova' } });
    if (oldYalova) {
      console.log('🗑️ Removing old test user "yalova" from database...');
      await userMaterialRepo.delete({ userId: oldYalova.id });
      await userRepo.remove(oldYalova);
    }

    // Seed Admin user
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      console.log('🌱 Seeding demo Admin user "admin"...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);

      const newUser = new User();
      newUser.username = 'admin';
      newUser.phoneNumber = '905000000001';
      newUser.characterName = 'Admin';
      newUser.characterSurname = 'Yonetici';
      newUser.passwordHash = hashedPassword;
      newUser.cash = 10000000;
      newUser.bankCheckingBalance = 5000000;
      newUser.bankSavingsBalance = 25000000;
      newUser.creditScore = 800;
      newUser.politicalRole = PoliticalRole.CUMHURBASKANI;
      newUser.politicalReputation = 100;
      newUser.politicalInfluence = 1000;
      newUser.coalMineLevel = 0;
      newUser.autoFactoryLevel = 0;
      newUser.defenseFactoryLevel = 0;
      newUser.currentProvinceId = 77; // Yalova Cumhuriyeti
      newUser.citizenshipProvinceId = 77;
      newUser.currentDistrictId = 898; // Yalova Merkez
      newUser.citizenshipDistrictId = 898;
      newUser.isCharacterCreated = true;
      newUser.characterCreationStep = 4;
      newUser.gender = 'male';
      newUser.characterAge = 35;
      newUser.politicalIdeologyId = 1;
      newUser.backstoryId = 'backstory_diplomat';
      newUser.isAdmin = true;
      newUser.citizenId = '1000001';
      newUser.residencyApprovedAt = new Date();

      await userRepo.save(newUser);

      // Seed initial materials for admin
      const initialMaterials = [
        { commodityId: 'coal', amount: 10 },
        { commodityId: 'iron_ore', amount: 5 },
        { commodityId: 'steel', amount: 0 },
        { commodityId: 'copper', amount: 0 },
        { commodityId: 'aluminum', amount: 0 },
        { commodityId: 'lithium', amount: 0 },
        { commodityId: 'boron', amount: 0 },
        { commodityId: 'petroleum', amount: 0 },
        { commodityId: 'silicon', amount: 0 }
      ];

      for (const mat of initialMaterials) {
        const uMat = new UserMaterial();
        uMat.userId = newUser.id;
        uMat.commodityId = mat.commodityId;
        uMat.amount = mat.amount;
        await userMaterialRepo.save(uMat);
      }
    }

    // Seed Demo Normal user
    const demoUser = await userRepo.findOne({ where: { username: 'demouser' } });
    if (!demoUser) {
      console.log('🌱 Seeding demo Normal user "demouser"...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);

      const newUser = new User();
      newUser.username = 'demouser';
      newUser.phoneNumber = '905000000002';
      newUser.characterName = 'Demo';
      newUser.characterSurname = 'Vatandas';
      newUser.passwordHash = hashedPassword;
      newUser.cash = 250000;
      newUser.bankCheckingBalance = 150000;
      newUser.bankSavingsBalance = 500000;
      newUser.creditScore = 620;
      newUser.politicalRole = PoliticalRole.VATANDAS;
      newUser.politicalReputation = 15;
      newUser.politicalInfluence = 840;
      newUser.coalMineLevel = 0;
      newUser.autoFactoryLevel = 0;
      newUser.defenseFactoryLevel = 0;
      newUser.currentProvinceId = 6; // Ankara Cumhuriyeti
      newUser.citizenshipProvinceId = 6;
      newUser.currentDistrictId = 60; // Ankara Çankaya
      newUser.citizenshipDistrictId = 60;
      newUser.isCharacterCreated = true;
      newUser.characterCreationStep = 4;
      newUser.gender = 'male';
      newUser.characterAge = 28;
      newUser.politicalIdeologyId = 3;
      newUser.backstoryId = 'backstory_commander';
      newUser.isAdmin = false;
      newUser.citizenId = '1000002';
      newUser.residencyApprovedAt = new Date();

      await userRepo.save(newUser);

      // Seed initial materials for demouser
      const initialMaterials = [
        { commodityId: 'coal', amount: 10 },
        { commodityId: 'iron_ore', amount: 5 },
        { commodityId: 'steel', amount: 0 },
        { commodityId: 'copper', amount: 0 },
        { commodityId: 'aluminum', amount: 0 },
        { commodityId: 'lithium', amount: 0 },
        { commodityId: 'boron', amount: 0 },
        { commodityId: 'petroleum', amount: 0 },
        { commodityId: 'silicon', amount: 0 }
      ];

      for (const mat of initialMaterials) {
        const uMat = new UserMaterial();
        uMat.userId = newUser.id;
        uMat.commodityId = mat.commodityId;
        uMat.amount = mat.amount;
        await userMaterialRepo.save(uMat);
      }
    }
    console.log('✅ Seeding demo accounts complete.');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  }
}
