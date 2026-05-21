import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Parliament } from './Parliament';

@Entity('laws')
export class Law {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'boolean', default: false })
  isApproved!: boolean;

  @Column()
  parliamentId!: string;

  @ManyToOne(() => Parliament, parliament => parliament.activeLaws)
  @JoinColumn({ name: 'parliamentId' })
  parliament!: Parliament;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
