import { Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/PropertyService.js';
import { asyncHandler } from '../utils/errors.js';
import { PropertyCategory, PropertyType, PropertyStatus } from '../entities/Property.js';

const propertyService = new PropertyService();

export const createProperty = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { title, description, category, propertyType, price, address, city, state, areaId, ...rest } = req.body;

    if (!title || !description || !category || !propertyType || !price || !address || !areaId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields (title, description, category, propertyType, price, address, or areaId)',
      });
    }

    // Process uploaded images
    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      imageUrls = (req.files as Express.Multer.File[]).map(
        (file) => `${req.protocol}://${req.get('host')}/uploads/properties/${file.filename}`
      );
    } else if (req.body.images && Array.isArray(req.body.images)) {
        // Fallback for existing URL support if any
        imageUrls = req.body.images;
    }

    const property = await propertyService.createProperty(
      {
        title,
        description,
        category,
        propertyType,
        price: parseFloat(price),
        address,
        city: city || 'Abuja',
        state: state || 'FCT',
        areaId,
        rooms: req.body.rooms ? parseInt(req.body.rooms, 10) : 0,
        bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms, 10) : 0,
        parking: req.body.parking ? parseInt(req.body.parking, 10) : 0,
        images: imageUrls,
        ...rest,
      },
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });
  }
);

export const getProperties = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      category: req.query.category as PropertyCategory,
      propertyType: req.query.propertyType as PropertyType,
      area: req.query.area as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      featured: req.query.featured === 'true' ? true : undefined,
      status: req.query.status as PropertyStatus,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(
      (key) => filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]
    );

    const result = await propertyService.getProperties(filters);

    return res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: result,
    });
  }
);

export const getPropertyBySlug = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { slug } = req.params;

    const property = await propertyService.getPropertyBySlug(slug as string);

    return res.status(200).json({
      success: true,
      message: 'Property retrieved successfully',
      data: property,
    });
  }
);

export const getPropertyById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const property = await propertyService.getPropertyById(id as string);

    return res.status(200).json({
      success: true,
      message: 'Property retrieved successfully',
      data: property,
    });
  }
);

export const updateProperty = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { id } = req.params;
    
    // Handle image updates
    let updateData = { ...req.body };
    
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
       const newImageUrls = (req.files as Express.Multer.File[]).map(
        (file) => `${req.protocol}://${req.get('host')}/uploads/properties/${file.filename}`
      );
      // Determine how to handle existing images. For now, let's assume if new files are uploaded, 
      // we might want to append or replace. 
      // If the frontend sends 'existingImages', we could merge them.
      // But PropertyService logic might need adjustment.
      // For simplicity, we'll pass the new images. The service might need to handle merging if required.
      // However, typically an update might be "add these images".
      // Let's assume we pass "images" and valid fields.
      
      // If we want to ADD to existing, we need to fetch existing first, or handle in service.
      // If request has `images` from body (existing URLs) AND files (new), we merge.
      
      let existingImages = req.body.existingImages || [];
      if (typeof existingImages === 'string') existingImages = [existingImages];
      
      updateData.images = [...existingImages, ...newImageUrls];
    }

    const property = await propertyService.updateProperty(id as string, req.user.id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property,
    });
  }
);

export const deleteProperty = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { id } = req.params;
    await propertyService.deleteProperty(id as string, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  }
);

export const getFeaturedProperties = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
    const properties = await propertyService.getFeaturedProperties(limit);

    return res.status(200).json({
      success: true,
      message: 'Featured properties retrieved successfully',
      data: properties,
    });
  }
);
