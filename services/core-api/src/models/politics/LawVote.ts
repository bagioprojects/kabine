import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('law_votes')
@Unique(['lawId', 'userId'])
export class LawVote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  lawId!: string;

  @Column()
  userId!: string;

  @Column({ type: 'varchar', length: 10 }) // 'yes' or 'no'
  vote!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
