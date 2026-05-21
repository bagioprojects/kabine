import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Commodity } from './Commodity';

@Entity('state_reserves')
@Unique(['provinceId', 'commodityId'])
export class StateReserve {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  provinceId!: number; // e.g. 1 for Ankara, 2 for Yalova

  @ManyToOne(() => Commodity)
  @JoinColumn({ name: 'commodityId' })
  commodity!: Commodity;

  @Column()
  commodityId!: string;

  @Column({ type: 'numeric', precision: 15, scale: 4, default: 0 })
  amount!: number; // State reserve amount of this commodity
}
