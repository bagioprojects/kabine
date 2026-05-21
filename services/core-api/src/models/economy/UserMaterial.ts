import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/User';
import { Commodity } from './Commodity';

@Entity('user_materials')
@Unique(['userId', 'commodityId'])
export class UserMaterial {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => Commodity)
  @JoinColumn({ name: 'commodityId' })
  commodity!: Commodity;

  @Column()
  commodityId!: string;

  @Column({ type: 'numeric', precision: 15, scale: 4, default: 0 })
  amount!: number; // Kullanıcının sahip olduğu miktar
}
