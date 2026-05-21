import { Router } from 'express';
import { ImageUploadController } from '../../controllers/api/v1/images/ImageUploadController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { imageUploadMiddleware } from '../../middlewares/imageUploadMiddleware';

export const imageRoutes = Router();

imageRoutes.post(
  '/upload',
  authMiddleware as any,
  imageUploadMiddleware as any,
  ImageUploadController.uploadImage as any
);
