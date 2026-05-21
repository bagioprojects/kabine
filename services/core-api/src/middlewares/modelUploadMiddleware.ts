import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';

// Memory storage to process buffer without immediate disk write
const storage = multer.memoryStorage();

const uploadFields = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for 3D models
  },
}).fields([
  { name: 'modelFile', maxCount: 1 },
  { name: 'textureFile', maxCount: 1 },
]);

// ── For POST (create): modelFile is REQUIRED ──────────────────────────────────
export const modelUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  uploadFields(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, error: 'Dosya boyutu maksimum 50MB olmalıdır.' });
        }
        return res.status(400).json({ success: false, error: `Yükleme hatası: ${err.message}` });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (!files || !files.modelFile || files.modelFile.length === 0) {
      return res.status(400).json({ success: false, error: 'Lütfen yüklenecek bir model dosyası (.glb, .fbx, .obj) seçin.' });
    }

    const modelFile = files.modelFile[0];
    const ext = path.extname(modelFile.originalname).toLowerCase();
    if (!['.glb', '.fbx', '.obj'].includes(ext)) {
      return res.status(400).json({ success: false, error: 'Yalnızca .glb, .fbx ve .obj model formatları desteklenmektedir.' });
    }

    if (files.textureFile && files.textureFile.length > 0) {
      const textureFile = files.textureFile[0];
      const texExt = path.extname(textureFile.originalname).toLowerCase();
      if (!['.png', '.jpg', '.jpeg', '.webp'].includes(texExt)) {
        return res.status(400).json({ success: false, error: 'Yalnızca .png, .jpg, .jpeg ve .webp kaplama görsel formatları desteklenmektedir.' });
      }
    }

    next();
  });
};

// ── For PUT (update): modelFile is OPTIONAL ───────────────────────────────────
export const modelUpdateMiddleware = (req: Request, res: Response, next: NextFunction) => {
  uploadFields(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, error: 'Dosya boyutu maksimum 50MB olmalıdır.' });
        }
        return res.status(400).json({ success: false, error: `Yükleme hatası: ${err.message}` });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // modelFile is optional for updates - only validate extension if provided
    if (files?.modelFile && files.modelFile.length > 0) {
      const modelFile = files.modelFile[0];
      const ext = path.extname(modelFile.originalname).toLowerCase();
      if (!['.glb', '.fbx', '.obj'].includes(ext)) {
        return res.status(400).json({ success: false, error: 'Yalnızca .glb, .fbx ve .obj model formatları desteklenmektedir.' });
      }
    }

    if (files?.textureFile && files.textureFile.length > 0) {
      const textureFile = files.textureFile[0];
      const texExt = path.extname(textureFile.originalname).toLowerCase();
      if (!['.png', '.jpg', '.jpeg', '.webp'].includes(texExt)) {
        return res.status(400).json({ success: false, error: 'Yalnızca .png, .jpg, .jpeg ve .webp kaplama görsel formatları desteklenmektedir.' });
      }
    }

    next();
  });
};
