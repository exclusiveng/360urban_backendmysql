import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Property } from './Property.js';
import { User } from './User.js';

export enum InquiryStatus {
  PENDING = 'Pending',
  CONTACTED = 'Contacted',
  CLOSED = 'Closed',
}

@Entity('contact_inquiries')
export class ContactInquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: InquiryStatus,
    default: InquiryStatus.PENDING,
  })
  status: InquiryStatus;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Property, (property) => property.inquiries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => User, (user) => user.inquiries, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid', { nullable: true })
  userId?: string;
}
