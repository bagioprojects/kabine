import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('district_maps')
@Unique(['districtId'])
export class DistrictMap {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  districtId!: number;

  @Column({ type: 'jsonb', default: [] })
  gridCells!: any[];

  @Column({ type: 'uuid', nullable: true })
  customMapId!: string | null;
}
