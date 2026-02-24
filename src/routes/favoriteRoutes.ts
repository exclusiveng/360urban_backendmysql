import { Router } from 'express';
import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  isFavorited,
} from '../controllers/favoriteController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// All favorite routes require authentication
router.post('/:propertyId', authenticate, addFavorite);
router.delete('/:propertyId', authenticate, removeFavorite);
router.get('/', authenticate, getUserFavorites);
router.get('/:propertyId/check', authenticate, isFavorited);

export default router;
