import { Request, Response, NextFunction } from 'express';
import { ContactInquiryService } from '../services/ContactInquiryService.js';
import { asyncHandler } from '../utils/errors.js';
import { InquiryStatus } from '../entities/ContactInquiry.js';

const inquiryService = new ContactInquiryService();

export const createInquiry = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { propertyId, email, phone, message } = req.body;

    if (!propertyId || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const inquiry = await inquiryService.createInquiry({
      propertyId,
      email,
      phone,
      message,
      userId: req.user?.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry created successfully',
      data: inquiry,
    });
  }
);

export const getInquiries = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      status: req.query.status as InquiryStatus,
      propertyId: req.query.propertyId as string,
    };

    Object.keys(filters).forEach(
      (key) => filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]
    );

    const result = await inquiryService.getInquiries(filters);

    return res.status(200).json({
      success: true,
      message: 'Inquiries retrieved successfully',
      data: result,
    });
  }
);

export const updateInquiryStatus = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { inquiryId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const inquiry = await inquiryService.updateInquiryStatus(inquiryId as string, status);

    return res.status(200).json({
      success: true,
      message: 'Inquiry status updated successfully',
      data: inquiry,
    });
  }
);

export const deleteInquiry = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { inquiryId } = req.params;

    await inquiryService.deleteInquiry(inquiryId as string);

    return res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  }
);
