import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CommodityCategory {
  ENERGY = 'ENERGY',
  RAW_MINERAL = 'RAW_MINERAL',
  REFINED_METAL = 'REFINED_METAL',
  SEMICONDUCTOR = 'SEMICONDUCTOR',
  STRATEGIC = 'STRATEGIC'
}

@Entity('commodities')
export class Commodity {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  id!: string; // e.g. "coal", "boron", "steel"

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string; // e.g. "Kömür", "Bor", "Çelik"

  @Column({ type: 'enum', enum: CommodityCategory })
  category!: CommodityCategory;

  @Column({ type: 'varchar', length: 10 })
  symbol!: string; // e.g. "COAL", "BOR", "STEEL"

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  basePrice!: number; // Baz borsa fiyatı

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  currentPrice!: number; // Güncel borsa fiyatı

  @Column({ type: 'jsonb', default: [] })
  priceTrend!: number[]; // Fiyat değişim grafiği serisi

  @Column({ type: 'text', nullable: true })
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
