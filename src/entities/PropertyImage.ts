import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Property } from './Property.js';

@Entity('property_images')
export class PropertyImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'integer', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Property, (property) => property.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column('uuid')
  propertyId: string;
}
