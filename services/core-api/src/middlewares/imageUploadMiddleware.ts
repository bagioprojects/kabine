import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Memory storage to process buffer without disk writes
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Yalnızca PNG, JPEG, WEBP ve GIF resim formatları desteklenmektedir.'));
    }
    cb(null, true);
  },
}).single('image');

export const imageUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Dosya boyutu maksimum 5MB olmalıdır.' });
        }
        return res.status(400).json({ error: `Yükleme hatası: ${err.message}` });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Lütfen yüklenecek bir resim dosyası seçin.' });
    }

    const buffer = req.file.buffer;
    if (buffer.length < 12) {
      return res.status(400).json({ error: 'Geçersiz resim dosyası (boyutu çok küçük).' });
    }

    // Magic Bytes Verification
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a;

    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    const isWebp =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 && // 'RIFF'
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50; // 'WEBP'

    const isGif =
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38; // 'GIF8'

    if (!isPng && !isJpeg && !isWebp && !isGif) {
      return res.status(400).json({
        error: 'Güvenlik Uyarısı: Dosya içeriği geçerli bir resim imzası (PNG, JPG, WEBP, GIF) ile uyuşmuyor.',
      });
    }

    next();
  });
};
