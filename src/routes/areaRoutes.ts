import { Router } from 'express';
import {
  getAllAreas,
  getAreaBySlug,
  getAreaById,
  createArea,
  updateArea,
} from '../controllers/areaController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Public routes
router.get('/', getAllAreas);
router.get('/slug/:slug', getAreaBySlug);
router.get('/:id', getAreaById);

import { upload } from '../config/multer.js';

// Protected routes (admin and agents)
router.post('/', authenticate, authorize('admin', 'agent'), upload.array('images', 5), createArea);
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'agent'),
  upload.array('images', 5),
  updateArea
);

export default router;
