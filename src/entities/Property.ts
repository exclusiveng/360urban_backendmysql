import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User.js';
import { Area } from './Area.js';
import { PropertyImage } from './PropertyImage.js';
import { Favorite } from './Favorite.js';
import { ContactInquiry } from './ContactInquiry.js';

export enum PropertyCategory {
  RENT = 'Rent',
  SALE = 'Sale',
  LAND = 'Land',
}

export enum PropertyStatus {
  AVAILABLE = 'Available',
  RENTED = 'Rented',
  SOLD = 'Sold',
}

export enum PropertyType {
  FLAT = 'Flat',
  DUPLEX = 'Duplex',
  HOUSE = 'House',
  LAND = 'Land',
  SELF_CONTAIN = 'Self-Contain',
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: PropertyCategory,
  })
  category: PropertyCategory;

  @Column({
    type: 'enum',
    enum: PropertyType,
  })
  propertyType: PropertyType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar' })
  city: string;

  @Column({ type: 'varchar' })
  state: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'integer', default: 0 })
  rooms: number;

  @Column({ type: 'integer', default: 0 })
  bathrooms: number;

  @Column({ type: 'integer', default: 0 })
  parking: number;

  @Column({ type: 'boolean', default: false })
  water: boolean;

  @Column({ type: 'varchar', default: 'None' })
  electricity: string;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.AVAILABLE,
  })
  status: PropertyStatus;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  agentFee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  inspectionFee: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.properties, { eager: true })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column('uuid')
  ownerId: string;

  @ManyToOne(() => Area, { eager: true })
  @JoinColumn({ name: 'areaId' })
  area: Area;

  @Column('uuid')
  areaId: string;

  @OneToMany(() => PropertyImage, (image) => image.property)
  images: PropertyImage[];

  @OneToMany(() => Favorite, (favorite) => favorite.property)
  favorites: Favorite[];

  @OneToMany(() => ContactInquiry, (inquiry) => inquiry.property)
  inquiries: ContactInquiry[];
}
