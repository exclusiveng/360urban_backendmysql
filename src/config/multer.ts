import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { Request } from 'express';
import { AppError } from '../utils/errors.js';

// Ensure upload directories exist
const ensureUploadDirs = async () => {
  try {
    await fs.ensureDir('uploads/properties');
    await fs.ensureDir('uploads/areas');
    console.log('✓ Upload directories created');
  } catch (err) {
    console.error('Error creating upload directories:', err);
  }
};

ensureUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    let uploadPath = 'uploads/';

    // Determine subdirectory based on route or field
    if (req.baseUrl.includes('properties')) {
      uploadPath += 'properties';
    } else if (req.baseUrl.includes('areas')) {
      uploadPath += 'areas';
    } else {
      uploadPath += 'others';
    }

    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename: timestamp-random-originalName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter (images only)
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Not an image! Please upload only images.'));
  }
};

// Export upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
