import { FitnessLocation } from '@/interfaces/fitness-location.interface';
import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './users.entity';

@Entity()
export class FitnessLocationEntity extends BaseEntity implements FitnessLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @Unique(['userId'])
  userId: number;

  @ManyToOne(() => UserEntity, user => user.fitnessLocations, { onDelete: 'CASCADE' })
  user: UserEntity;

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
