import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Column,
} from 'typeorm';
import { Property } from './Property.js';
import { User } from './User.js';

@Entity('favorites')
@Unique(['userId', 'propertyId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.favorites, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => Property, (property) => property.favorites, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column('uuid')
  propertyId: string;
}
