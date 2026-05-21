import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple';
import { User, PoliticalRole, EducationLevel } from '../../models/users/User';
import { AppDataSource } from '../../config/database';
import { UserMaterial } from '../../models/economy/UserMaterial';

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_POLITIC_KEY_2026';

export class AuthService {
  /**
   * Registers a new user with high-security checks
   */
  public static async registerUser(payload: Partial<User>): Promise<{ user: Partial<User> & { materials?: Record<string, number> }; token: string }> {
    console.log('[AuthService] Checking if username or phone exists...');
    const userRepository = AppDataSource.getRepository(User);
    
    const normalizedUsername = payload.username!.trim().toLowerCase();
    if (normalizedUsername === 'yalova') {
      throw new Error('Kullanıcı adı "yalova" olamaz.');
    }
    const normalizedPhone = payload.phoneNumber!.replace(/\D/g, '');

    if (normalizedPhone.length !== 12 || !normalizedPhone.startsWith('90')) {
      throw new Error('Geçersiz telefon numarası formatı! Telefon +90 ile başlamalı ve ardına 10 hane gelmelidir.');
    }

    const existingUser = await userRepository.findOne({
      where: [
        { username: normalizedUsername },
        { phoneNumber: normalizedPhone }
      ]
    });
    if (existingUser) throw new Error('Bu kullanıcı adı veya telefon numarası zaten kullanımda!');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.passwordHash as string, salt);

    // Create User Entity
    const newUser = new User();
    newUser.username = normalizedUsername;
    newUser.phoneNumber = normalizedPhone;
    newUser.characterName = capitalizeTurkish(payload.characterName!.trim());
    newUser.characterSurname = capitalizeTurkish(payload.characterSurname!.trim());
    newUser.passwordHash = hashedPassword;
    
    // Set default starting values
    newUser.cash = 250000;
    newUser.bankCheckingBalance = 150000;
    newUser.bankSavingsBalance = 500000;
    newUser.creditScore = 620;
    
    // Initialize factory levels and political influence
    newUser.politicalInfluence = 840;
    newUser.coalMineLevel = 0;
    newUser.autoFactoryLevel = 0;
    newUser.defenseFactoryLevel = 0;
    
    newUser.politicalRole = PoliticalRole.VATANDAS;
    newUser.politicalReputation = 15;
    newUser.currentProvinceId = 6; // Ankara Cumhuriyeti
    newUser.citizenshipProvinceId = 6;
    newUser.currentDistrictId = 60; // Ankara Çankaya
    newUser.citizenshipDistrictId = 60;
    newUser.residencyApprovedAt = new Date(); // Initial residency start date
    
    // Explicitly set default DB fields to prevent undefined fields in memory/JSON response
    newUser.isCharacterCreated = false;
    newUser.characterCreationStep = 1;
    newUser.health = 100;
    newUser.hunger = 100;
    newUser.thirst = 100;
    newUser.energy = 100;
    newUser.happiness = 100;
    newUser.isSick = false;
    newUser.addictionLevel = 0;
    newUser.educationLevel = EducationLevel.ILKOKUL;
    newUser.hasVotedThisTerm = false;

    // Generate a unique 7-digit citizenId during registration
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
    newUser.citizenId = uniqueCitizenId;

    await userRepository.save(newUser);

    // Seed default materials in the database for the new user
    const userMaterialRepo = AppDataSource.getRepository(UserMaterial);
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

    console.log(`[AuthService] New citizen registered: ${newUser.characterName} ${newUser.characterSurname}`);

    const token = this.generateToken(newUser.id);

    // Don't send password hash back to client
    const { passwordHash, ...userWithoutPassword } = newUser;

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

    return { 
      user: {
        ...userWithoutPassword,
        materials: materialsDict
      }, 
      token 
    };
  }

  /**
   * Authenticates a user
   */
  public static async loginUser(username: string, passwordPlain: string): Promise<{ user: Partial<User> & { materials?: Record<string, number> }; token: string }> {
    const userRepository = AppDataSource.getRepository(User);
    const normalizedUsername = username.trim().toLowerCase();
    
    if (normalizedUsername === 'yalova') {
      throw new Error('Kullanıcı adı "yalova" olamaz.');
    }

    const user = await userRepository.findOne({ where: { username: normalizedUsername } });
    if (!user) throw new Error('Kullanıcı adı veya şifre hatalı!');

    // Yönetici engeli: Admin kullanıcıları normal vatandaş oyununa giriş yapamaz
    if (user.isAdmin) {
      throw new Error('Yöneticiler vatandaş oyununa giriş yapamaz! Lütfen admin panelini kullanın.');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) throw new Error('Kullanıcı adı veya şifre hatalı!');

    const token = this.generateToken(user.id);
    
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

    const { passwordHash, ...userWithoutPassword } = user;
    return { 
      user: {
        ...userWithoutPassword,
        materials: materialsDict
      }, 
      token 
    };
  }

  private static generateToken(userId: string): string {
    const payload = {
      sub: userId,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days expiration
    };
    return jwt.encode(payload, JWT_SECRET);
  }
}

function capitalizeTurkish(str: string): string {
  if (!str) return '';
  return str
    .split(/\s+/)
    .map(word => {
      if (!word) return '';
      // Capitalize first letter with Turkish rules
      const firstChar = word.charAt(0);
      let firstUpper = firstChar;
      if (firstChar === 'i') firstUpper = 'İ';
      else if (firstChar === 'ı') firstUpper = 'I';
      else firstUpper = firstChar.toLocaleUpperCase('tr-TR');

      // Lowercase remaining letters with Turkish rules
      const rest = word.slice(1);
      let restLower = '';
      for (let i = 0; i < rest.length; i++) {
        const c = rest.charAt(i);
        if (c === 'I') restLower += 'ı';
        else if (c === 'İ') restLower += 'i';
        else restLower += c.toLocaleLowerCase('tr-TR');
      }
      return firstUpper + restLower;
    })
    .join(' ');
}

