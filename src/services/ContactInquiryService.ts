import { AppDataSource } from '../config/database.js';
import { ContactInquiry, InquiryStatus } from '../entities/ContactInquiry.js';
import { Property } from '../entities/Property.js';
import { AppError } from '../utils/errors.js';
import { validateEmail } from '../utils/validators.js';
import { PaginatedResponse } from '../types/index.js';
import { getPaginationParams } from '../utils/validators.js';

export class ContactInquiryService {
  private inquiryRepository = AppDataSource.getRepository(ContactInquiry);
  private propertyRepository = AppDataSource.getRepository(Property);

  async createInquiry(data: {
    propertyId: string;
    email: string;
    phone: string;
    message: string;
    userId?: string;
  }): Promise<ContactInquiry> {
    // Validate email
    if (!validateEmail(data.email)) {
      throw new AppError(400, 'Invalid email format');
    }

    // Validate phone
    if (!data.phone || data.phone.length < 10) {
      throw new AppError(400, 'Invalid phone number');
    }

    // Verify property exists
    const property = await this.propertyRepository.findOne({
      where: { id: data.propertyId },
    });

    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    // Create inquiry
    const inquiry = this.inquiryRepository.create({
      propertyId: data.propertyId,
      email: data.email,
      phone: data.phone,
      message: data.message,
      userId: data.userId,
    });

    return this.inquiryRepository.save(inquiry);
  }

  async getInquiries(
    filters?: {
      page?: number;
      limit?: number;
      status?: InquiryStatus;
      propertyId?: string;
    }
  ): Promise<PaginatedResponse<ContactInquiry>> {
    const { page, limit } = getPaginationParams(
      filters?.page,
      filters?.limit
    );

    let query = this.inquiryRepository.createQueryBuilder('inquiry');

    if (filters?.status) {
      query = query.where('inquiry.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.propertyId) {
      query = query.andWhere('inquiry.propertyId = :propertyId', {
        propertyId: filters.propertyId,
      });
    }

    const total = await query.getCount();

    const data = await query
      .leftJoinAndSelect('inquiry.property', 'property')
      .orderBy('inquiry.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateInquiryStatus(
    inquiryId: string,
    status: InquiryStatus
  ): Promise<ContactInquiry> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new AppError(404, 'Inquiry not found');
    }

    inquiry.status = status;
    return this.inquiryRepository.save(inquiry);
  }

  async deleteInquiry(inquiryId: string): Promise<void> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new AppError(404, 'Inquiry not found');
    }

    await this.inquiryRepository.delete(inquiryId);
  }
}
