import { Router } from 'express';
import {
  createProperty,
  getProperties,
  getPropertyBySlug,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
} from '../controllers/propertyController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/slug/:slug', getPropertyBySlug);
router.get('/:id', getPropertyById);

import { upload } from '../config/multer.js';

// Protected routes (authenticated users)
router.post('/', authenticate, upload.array('images', 10), createProperty);
router.patch('/:id', authenticate, upload.array('images', 10), updateProperty);
router.delete('/:id', authenticate, deleteProperty);

export default router;
