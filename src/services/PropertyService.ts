import { AppDataSource } from '../config/database.js';
import { Property, PropertyCategory, PropertyStatus, PropertyType } from '../entities/Property.js';
import { Area } from '../entities/Area.js';
import { PropertyImage } from '../entities/PropertyImage.js';
import { User, UserRole } from '../entities/User.js';
import { AppError } from '../utils/errors.js';
import { generateSlug, getPaginationParams } from '../utils/validators.js';
import { PaginatedResponse } from '../types/index.js';

export class PropertyService {
  private propertyRepository = AppDataSource.getRepository(Property);
  private areaRepository = AppDataSource.getRepository(Area);
  private imageRepository = AppDataSource.getRepository(PropertyImage);

  async createProperty(
    data: {
      title: string;
      description: string;
      category: PropertyCategory;
      propertyType: PropertyType;
      price: number;
      address: string;
      city: string;
      state: string;
      latitude?: number;
      longitude?: number;
      rooms?: number;
      bathrooms?: number;
      parking?: number;
      water?: boolean;
      electricity?: string;
      areaId: string;
      images?: string[];
      agentFee?: number;
      inspectionFee?: number;
      featured?: boolean;
    },
    ownerId: string
  ): Promise<Property> {
    // Verify area exists
    const area = await this.areaRepository.findOne({
      where: { id: data.areaId },
    });
    if (!area) {
      throw new AppError(404, 'Area not found');
    }

    // Generate slug
    const slug = generateSlug(data.title);

    // Check if slug is unique
    const existingProperty = await this.propertyRepository.findOne({
      where: { slug },
    });
    if (existingProperty) {
      throw new AppError(409, 'Property with similar title already exists');
    }

    // Create property
    const { images, ...propertyData } = data;
    const property = this.propertyRepository.create({
      ...propertyData,
      slug,
      ownerId,
      areaId: data.areaId,
    });

    await this.propertyRepository.save(property);

    // Add images if provided
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const image = this.imageRepository.create({
          url: data.images[i],
          order: i,
          propertyId: property.id,
        });
        await this.imageRepository.save(image);
      }

      // Reload property with images
      return this.propertyRepository.findOne({
        where: { id: property.id },
        relations: ['images', 'area', 'owner'],
      }) as Promise<Property>;
    }

    return property;
  }

  async getProperties(filters?: {
    page?: number;
    limit?: number;
    category?: PropertyCategory;
    propertyType?: PropertyType;
    area?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    status?: PropertyStatus;
  }): Promise<PaginatedResponse<Property>> {
    const { page, limit } = getPaginationParams(filters?.page, filters?.limit);

    let query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.area', 'area');

    // Apply filters
    if (filters?.category) {
      query = query.where('property.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.propertyType) {
      query = query.andWhere('property.propertyType = :propertyType', {
        propertyType: filters.propertyType,
      });
    }

    if (filters?.area) {
      // Check if it's a UUID (simplified check) or a slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        filters.area
      );

      if (isUuid) {
        query = query.andWhere('property.areaId = :areaId', {
          areaId: filters.area,
        });
      } else {
        query = query.andWhere('area.slug = :areaSlug', {
          areaSlug: filters.area,
        });
      }
    }

    if (filters?.minPrice) {
      query = query.andWhere('property.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters?.maxPrice) {
      query = query.andWhere('property.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters?.featured !== undefined) {
      query = query.andWhere('property.featured = :featured', {
        featured: filters.featured,
      });
    }

    if (filters?.status) {
      query = query.andWhere('property.status = :status', {
        status: filters.status,
      });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination and ordering
    const data = await query
      .leftJoinAndSelect('property.images', 'images')
      .leftJoinAndSelect('property.owner', 'owner')
      .orderBy('property.createdAt', 'DESC')
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

  async getPropertyBySlug(slug: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { slug },
      relations: ['images', 'area', 'owner'],
    });

    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    return property;
  }

  async getPropertyById(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
    });

    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    return property;
  }

  async updateProperty(id: string, userId: string, data: any): Promise<Property> {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    // Verify ownership
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    if (user?.role !== UserRole.ADMIN && property.ownerId !== userId) {
      throw new AppError(403, 'You can only edit your own properties');
    }

    // Extract images if provided
    const { images, ...propertyData } = data;

    // Update property fields
    Object.assign(property, propertyData);
    await this.propertyRepository.save(property);

    // Update images if provided
    if (images !== undefined) {
      // Delete existing images
      await this.imageRepository.delete({ propertyId: id });

      // Add new images
      if (Array.isArray(images) && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = this.imageRepository.create({
            url: images[i],
            order: i,
            propertyId: id,
          });
          await this.imageRepository.save(image);
        }
      }
    }

    return this.getPropertyById(id);
  }

  async deleteProperty(id: string, ownerId: string): Promise<void> {
    const property = await this.propertyRepository.findOne({
      where: { id },
    });

    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    if (property.ownerId !== ownerId) {
      throw new AppError(403, 'You can only delete your own properties');
    }

    await this.propertyRepository.delete(id);
  }

  async getFeaturedProperties(limit: number = 6): Promise<Property[]> {
    return this.propertyRepository.find({
      where: { featured: true, status: PropertyStatus.AVAILABLE },
      relations: ['images', 'area', 'owner'],
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }
}
