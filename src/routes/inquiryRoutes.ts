import { Router } from 'express';
import {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from '../controllers/inquiryController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Public route for creating inquiries
router.post('/', createInquiry);

// Admin/Agent routes
router.get('/', authenticate, getInquiries);
router.patch('/:inquiryId/status', authenticate, updateInquiryStatus);
router.delete('/:inquiryId', authenticate, deleteInquiry);

export default router;
