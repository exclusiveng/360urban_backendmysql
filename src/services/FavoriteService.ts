import { AppDataSource } from '../config/database.js';
import { Favorite } from '../entities/Favorite.js';
import { Property } from '../entities/Property.js';
import { AppError } from '../utils/errors.js';
import { PaginatedResponse } from '../types/index.js';
import { getPaginationParams } from '../utils/validators.js';

export class FavoriteService {
  private favoriteRepository = AppDataSource.getRepository(Favorite);
  private propertyRepository = AppDataSource.getRepository(Property);

  async addFavorite(userId: string, propertyId: string): Promise<Favorite> {
    // Verify property exists
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    // Check if already favorited
    const existing = await this.favoriteRepository.findOne({
      where: { userId, propertyId },
    });

    if (existing) {
      throw new AppError(409, 'Property already in favorites');
    }

    // Create favorite
    const favorite = this.favoriteRepository.create({
      userId,
      propertyId,
    });

    return this.favoriteRepository.save(favorite);
  }

  async removeFavorite(userId: string, propertyId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, propertyId },
    });

    if (!favorite) {
      throw new AppError(404, 'Favorite not found');
    }

    await this.favoriteRepository.delete(favorite.id);
  }

  async getUserFavorites(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<Property>> {
    const { page: p, limit: l } = getPaginationParams(page, limit);

    const [favorites, total] = await this.favoriteRepository.findAndCount({
      where: { userId },
      relations: ['property', 'property.images', 'property.area', 'property.owner'],
      skip: (p - 1) * l,
      take: l,
    });

    const properties = favorites.map((fav) => fav.property);

    return {
      data: properties,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async isFavorited(userId: string, propertyId: string): Promise<boolean> {
    const count = await this.favoriteRepository.count({
      where: { userId, propertyId },
    });

    return count > 0;
  }
}
