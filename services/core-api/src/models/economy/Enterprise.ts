import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/User';

export enum EnterpriseType {
  FARM = 'FARM',
  MINE = 'MINE',
  FACTORY = 'FACTORY',
  POWER_PLANT = 'POWER_PLANT',
  RETAIL = 'RETAIL' // Sells final goods to the public (NPCs)
}

export enum EnterpriseCondition {
  PRISTINE = 'PRISTINE', // 90-100%
  OPERATIONAL = 'OPERATIONAL', // 50-89%
  NEEDS_REPAIR = 'NEEDS_REPAIR', // 20-49%
  BROKEN = 'BROKEN' // 0-19% (Stops producing)
}

@Entity('enterprises')
export class Enterprise {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @Column()
  ownerId!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string; // e.g., "Karadeniz Çelik A.Ş."

  @Column({ type: 'enum', enum: EnterpriseType })
  type!: EnterpriseType;

  // Fiziksel Konum (Lojistik için kritik)
  @Column({ type: 'int' })
  provinceId!: number;

  @Column({ type: 'int' })
  districtId!: number;

  // Kapasite ve Seviye
  @Column({ type: 'smallint', default: 1 })
  level!: number;

  @Column({ type: 'int', default: 10 })
  currentWorkers!: number;

  @Column({ type: 'int', default: 50 })
  maxWorkers!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  hourlySalaryPerWorker!: number;

  // Üretim Çarpanları ve Sağlık
  @Column({ type: 'enum', enum: EnterpriseCondition, default: EnterpriseCondition.PRISTINE })
  conditionState!: EnterpriseCondition;

  @Column({ type: 'smallint', default: 100 })
  conditionHealth!: number; // 0 to 100

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 1.0 })
  productionEfficiencyMultiplier!: number; // Affected by worker happiness, education, and machine health

  // Çevresel Etki (Siyasi Mutluluğu Etkiler)
  @Column({ type: 'smallint', default: 10 })
  pollutionGeneratedPerHour!: number;

  // Finansal Değer (Vergilendirme ve Satış için)
  @Column({ type: 'numeric', precision: 18, scale: 2 })
  appraisedValue!: number; // Devletin veya bankanın biçtiği değer

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
