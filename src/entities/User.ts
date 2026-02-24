import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Property } from './Property.js';
import { ContactInquiry } from './ContactInquiry.js';
import { Favorite } from './Favorite.js';

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.AGENT,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Property, (property) => property.owner)
  properties: Property[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => ContactInquiry, (inquiry) => inquiry.user)
  inquiries: ContactInquiry[];
}
