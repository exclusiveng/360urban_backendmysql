import { Request, Response, NextFunction } from 'express';
import { AreaService } from '../services/AreaService.js';
import { asyncHandler } from '../utils/errors.js';

const areaService = new AreaService();

export const getAllAreas = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const areas = await areaService.getAllAreas();

  res.status(200).json({
    success: true,
    message: 'Areas retrieved successfully',
    data: areas,
  });
});

export const getAreaBySlug = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;

    const area = await areaService.getAreaBySlug(slug as string);

    res.status(200).json({
      success: true,
      message: 'Area retrieved successfully',
      data: area,
    });
  }
);

export const getAreaById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const area = await areaService.getAreaById(id as string);

  res.status(200).json({
    success: true,
    message: 'Area retrieved successfully',
    data: area,
  });
});

export const createArea = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, image } = req.body;

  // Validate required field
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Area name is required');
  }

  // Process uploaded images
  let imageUrls: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    imageUrls = (req.files as Express.Multer.File[]).map(
      (file) => `${req.protocol}://${req.get('host')}/uploads/areas/${file.filename}`
    );
  }

  const area = await areaService.createArea({
    name: name.trim(),
    description: description?.trim() || undefined,
    image: imageUrls.length > 0 ? imageUrls[0] : image?.trim() || undefined,
    images: imageUrls.length > 0 ? imageUrls : image ? [image] : [],
  });

  res.status(201).json({
    success: true,
    message: 'Area created successfully',
    data: area,
  });
});

export const updateArea = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, description, image, existingImages } = req.body;

  // Process uploaded images
  let newImageUrls: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    newImageUrls = (req.files as Express.Multer.File[]).map(
      (file) => `${req.protocol}://${req.get('host')}/uploads/areas/${file.filename}`
    );
  }

  // Handle existing images
  let currentImages: string[] = [];
  if (existingImages) {
    currentImages = Array.isArray(existingImages) ? existingImages : [existingImages];
  }

  const allImages = [...currentImages, ...newImageUrls];

  const area = await areaService.updateArea(id as string, {
    name: name?.trim(),
    description: description?.trim(),
    image: allImages.length > 0 ? allImages[0] : image?.trim() || undefined,
    images: allImages,
  });

  res.status(200).json({
    success: true,
    message: 'Area updated successfully',
    data: area,
  });
});
