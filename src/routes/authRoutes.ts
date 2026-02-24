import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, changePassword);

export default router;
