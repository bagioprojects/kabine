import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ModelCategory } from './ModelCategory';

@Entity('model_assets')
export class ModelAsset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  modelType!: string; // 'fbx' | 'obj' | 'glb'

  @Column({ type: 'varchar', length: 255 })
  fileUrl!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  textureUrl!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: 'int', default: 1 })
  gridSizeX!: number;

  @Column({ type: 'int', default: 1 })
  gridSizeY!: number;

  @Column({ type: 'float', default: 1.0 })
  scale!: number;

  @Column({ type: 'boolean', default: true })
  isResizable!: boolean;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => ModelCategory, (category) => category.assets, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'categoryId' })
  category!: ModelCategory;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
