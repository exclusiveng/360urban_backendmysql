import { AppDataSource } from '../config/database.js';
import { Area } from '../entities/Area.js';
import { Property } from '../entities/Property.js';
import { AppError } from '../utils/errors.js';
import { generateSlug } from '../utils/validators.js';

export class AreaService {
  private areaRepository = AppDataSource.getRepository(Area);
  private propertyRepository = AppDataSource.getRepository(Property);

  async getAllAreas(): Promise<Area[]> {
    return this.areaRepository.find({
      relations: ['properties'],
      order: { name: 'ASC' },
    });
  }

  async getAreaBySlug(slug: string): Promise<Area & { propertyCount: number }> {
    const area = await this.areaRepository.findOne({
      where: { slug },
      relations: ['properties'],
    });

    if (!area) {
      throw new AppError(404, 'Area not found');
    }

    const propertyCount = await this.propertyRepository.count({
      where: { areaId: area.id },
    });

    return {
      ...area,
      propertyCount,
    };
  }

  async getAreaById(id: string): Promise<Area & { propertyCount: number }> {
    const area = await this.areaRepository.findOne({
      where: { id },
      relations: ['properties'],
    });

    if (!area) {
      throw new AppError(404, 'Area not found');
    }

    const propertyCount = await this.propertyRepository.count({
      where: { areaId: area.id },
    });

    return {
      ...area,
      propertyCount,
    };
  }

  async createArea(data: {
    name: string;
    description?: string;
    image?: string;
    images?: string[];
  }): Promise<Area> {
    // Check if area already exists
    const slug = generateSlug(data.name);
    const existing = await this.areaRepository.findOne({
      where: { slug },
    });

    if (existing) {
      throw new AppError(400, `Area with name "${data.name}" already exists`);
    }

    // Create new area
    const area = this.areaRepository.create({
      name: data.name,
      slug,
      description: data.description || '',
      image: data.image || '',
      images: data.images || [],
    });

    return this.areaRepository.save(area);
  }

  async updateArea(
    id: string,
    data: { name?: string; description?: string; image?: string; images?: string[] }
  ): Promise<Area> {
    const area = await this.areaRepository.findOne({ where: { id } });

    if (!area) {
      throw new AppError(404, 'Area not found');
    }

    if (data.name) {
      area.name = data.name;
      area.slug = generateSlug(data.name);
    }

    if (data.description !== undefined) {
      area.description = data.description;
    }

    if (data.image !== undefined) {
      area.image = data.image;
    }

    if (data.images !== undefined) {
      area.images = data.images;
    }

    return this.areaRepository.save(area);
  }
}
