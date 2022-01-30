import { FitnessLocation } from '@/interfaces/fitness-location.interface';
import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity()
export class FitnessLocationEntity extends BaseEntity implements FitnessLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @Unique(['userId'])
  userId: number;

  @Column()
  @IsNotEmpty()
  imageUri: string;

  @Column('double precision', { array: true })
  coordinates: number[];

  @Column({ nullable: true })
  isVerified: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
