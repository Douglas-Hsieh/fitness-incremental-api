import { IsJSON, IsNotEmpty } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './users.entity';

@Entity()
export class SavedGameEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @Unique(['userId'])
  userId: number;

  @OneToOne(() => UserEntity, user => user.savedGame, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  @Column()
  @IsJSON()
  gameStateSerialized: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
