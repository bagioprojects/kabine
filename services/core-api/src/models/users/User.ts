import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';

export enum PoliticalRole {
  VATANDAS = 'VATANDAS',
  MUHTAR = 'MUHTAR',
  BELEDIYE_BASKANI = 'BELEDIYE_BASKANI',
  MILLETVEKILI = 'MILLETVEKILI',
  BAKAN = 'BAKAN',
  CUMHURBASKANI = 'CUMHURBASKANI'
}

export enum PartyRank {
  UYE = 'UYE',
  IL_BASKANI = 'IL_BASKANI',
  YONETIM_KURULU = 'YONETIM_KURULU',
  GENEL_BASKAN = 'GENEL_BASKAN'
}

export enum EducationLevel {
  ILKOKUL = 'ILKOKUL',
  LISE = 'LISE',
  UNIVERSITE = 'UNIVERSITE',
  AKADEMISYEN = 'AKADEMISYEN'
}

@Entity('users')
export class User {
  // 🪪 1. Gerçek Kimlik ve Karakter Bilgileri
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, type: 'varchar', length: 50 })
  username!: string;

  @Column({ unique: true, type: 'varchar', length: 20 })
  phoneNumber!: string;

  @Column({ type: 'varchar', length: 50 })
  characterName!: string;

  @Column({ type: 'varchar', length: 50 })
  characterSurname!: string;

  @Column({ type: 'varchar' })
  passwordHash!: string;

  // 🏦 2. Gelişmiş Bankacılık ve Finans Sistemi
  @Column({ type: 'numeric', precision: 18, scale: 4, default: 0 })
  cash!: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, default: 1000 })
  bankCheckingBalance!: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, default: 0 })
  bankSavingsBalance!: number;

  @Column({ type: 'smallint', default: 500 })
  creditScore!: number; // 300 - 850

  @Column({ type: 'numeric', precision: 18, scale: 4, default: 0 })
  activeLoanDebt!: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, default: 0 })
  nextLoanPayment!: number;

  @Column({ type: 'numeric', precision: 18, scale: 4, default: 0 })
  taxDebt!: number;

  // 🏛️ 3. İleri Düzey Siyaset ve Coğrafya Yönetimi
  @Column({ type: 'int', nullable: true })
  currentProvinceId!: number;

  @Column({ type: 'int', nullable: true })
  currentDistrictId!: number;

  @Column({ type: 'int', nullable: true })
  citizenshipProvinceId!: number;

  @Column({ type: 'int', nullable: true })
  citizenshipDistrictId!: number;

  @Column({ type: 'enum', enum: PoliticalRole, default: PoliticalRole.VATANDAS })
  politicalRole!: PoliticalRole;

  @Column({ type: 'int', nullable: true })
  partyId!: number;

  @Column({ type: 'enum', enum: PartyRank, nullable: true })
  partyRank!: PartyRank;

  @Column({ type: 'smallint', default: 0 })
  politicalReputation!: number;

  @Column({ type: 'boolean', default: false })
  hasVotedThisTerm!: boolean;

  // 🩺 4. Hiper-Gerçekçi Sağlık ve Yaşam Barları
  @Column({ type: 'smallint', default: 100 })
  health!: number;

  @Column({ type: 'smallint', default: 100 })
  hunger!: number;

  @Column({ type: 'smallint', default: 100 })
  thirst!: number;

  @Column({ type: 'smallint', default: 100 })
  energy!: number;

  @Column({ type: 'smallint', default: 100 })
  happiness!: number;

  @Column({ type: 'boolean', default: false })
  isSick!: boolean;

  @Column({ type: 'int', nullable: true })
  activeDiseaseId!: number | null;

  @Column({ type: 'smallint', default: 0 })
  addictionLevel!: number;

  @Column({ type: 'enum', enum: EducationLevel, default: EducationLevel.ILKOKUL })
  educationLevel!: EducationLevel;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  residencyApprovedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  avatarId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  isometricModelId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  backstoryId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  gender!: string | null;

  @Column({ type: 'int', nullable: true })
  characterAge!: number | null;

  @Column({ type: 'varchar', nullable: true })
  birthDate!: string | null;

  @Column({ type: 'int', nullable: true })
  politicalIdeologyId!: number | null;

  @Column({ type: 'boolean', default: false })
  isCharacterCreated!: boolean;

  @Column({ type: 'int', default: 1 })
  characterCreationStep!: number;

  @Column({ type: 'boolean', default: false })
  isAdmin!: boolean;

  @Column({ type: 'varchar', length: 7, unique: true, nullable: true })
  citizenId!: string | null;

  @Column({ type: 'int', default: 840 })
  politicalInfluence!: number;

  @Column({ type: 'smallint', default: 0 })
  coalMineLevel!: number;

  @Column({ type: 'smallint', default: 0 })
  autoFactoryLevel!: number;

  @Column({ type: 'smallint', default: 0 })
  defenseFactoryLevel!: number;

  // Zaman Damgaları
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validatePhone() {
    if (this.phoneNumber) {
      const cleaned = this.phoneNumber.replace(/\D/g, '');
      // E.g. '905321234567' has length 12
      if (cleaned.length !== 12 || !cleaned.startsWith('90')) {
        throw new Error('Database Integrity Violation: Telefon numarası tam olarak 905xxxxxxxxx formatında olmalıdır.');
      }
    }
  }
}
