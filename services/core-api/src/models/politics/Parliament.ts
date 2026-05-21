import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Law } from './Law';

@Entity('parliaments')
export class Parliament {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  regionName!: string; // e.g., 'TBMM', 'Istanbul Buyuksehir'

  @Column({ type: 'int', default: 600 })
  totalSeats!: number;

  @Column({ type: 'jsonb', default: {} })
  seatDistribution!: Record<string, number>; // { partyId: seatCount }

  @Column({ type: 'decimal', precision: 5, default: 10.0 })
  electionThreshold!: number; // Percentage required to enter

  @OneToMany(() => Law, law => law.parliament)
  activeLaws!: Law[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
