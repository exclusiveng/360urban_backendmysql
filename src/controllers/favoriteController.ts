import { Request, Response, NextFunction } from 'express';
import { FavoriteService } from '../services/FavoriteService.js';
import { asyncHandler } from '../utils/errors.js';

const favoriteService = new FavoriteService();

export const addFavorite = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { propertyId } = req.params;

    const favorite = await favoriteService.addFavorite(req.user.id, propertyId as string);

    res.status(201).json({
      success: true,
      message: 'Property added to favorites',
      data: favorite,
    });
  }
);

export const removeFavorite = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { propertyId } = req.params;

    await favoriteService.removeFavorite(req.user.id, propertyId as string);

    res.status(200).json({
      success: true,
      message: 'Property removed from favorites',
    });
  }
);

export const getUserFavorites = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await favoriteService.getUserFavorites(req.user.id, page, limit);

    res.status(200).json({
      success: true,
      message: 'User favorites retrieved successfully',
      data: result,
    });
  }
);

export const isFavorited = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { propertyId } = req.params;

    const favorited = await favoriteService.isFavorited(req.user.id, propertyId as string);

    res.status(200).json({
      success: true,
      data: { favorited },
    });
  }
);
