import { IsEmail, IsNotEmpty } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from '@interfaces/users.interface';
import { FitnessLocationEntity } from './fitness-location.entity';
import { SavedGameEntity } from './saved-games.entity';

@Entity()
export class UserEntity extends BaseEntity implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @Unique(['sub'])
  sub: string;

  @Column({ default: '' })
  roles: string;

  @Column()
  @IsNotEmpty()
  os: string;

  @Column({ nullable: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  timezoneOffsetMinutes: number;

  @Column({ nullable: true })
  expoPushToken: string;

  @Column({ nullable: true })
  lastNotificationTime: Date;

  @Column({ nullable: true })
  oAuthCredentials: string;

  @OneToMany(() => FitnessLocationEntity, fitnessLocation => fitnessLocation.user)
  fitnessLocations: FitnessLocationEntity[];

  @OneToOne(() => SavedGameEntity, savedGame => savedGame.user)
  savedGame: SavedGameEntity;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
