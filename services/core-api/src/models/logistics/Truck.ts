import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TruckStatus {
  IDLE = 'IDLE',
  EN_ROUTE = 'EN_ROUTE'
}

@Entity('trucks')
export class Truck {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  plateNumber!: string;

  @Column()
  model!: string;

  @Column({ type: 'numeric' })
  capacity!: number;

  @Column({
    type: 'enum',
    enum: TruckStatus,
    default: TruckStatus.IDLE
  })
  status!: TruckStatus;

  @Column({ type: 'integer', default: 77 })
  currentProvinceId!: number;

  @Column({ type: 'integer', default: 898 })
  currentDistrictId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
