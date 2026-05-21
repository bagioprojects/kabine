import { Request, Response } from 'express';
import { ImageUploadService } from '../../../../services/images/ImageUploadService';

export class ImageUploadController {
  public static async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Lütfen yüklenecek bir resim dosyası seçin.',
        });
      }

      // Process and convert image to WebP format
      const filename = await ImageUploadService.processAndSaveImage(req.file.buffer);

      // Build static public asset URL
      const serverUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

      return res.status(200).json({
        success: true,
        message: 'Resim başarıyla yüklendi ve WebP formatına dönüştürüldü.',
        data: {
          filename,
          url: serverUrl,
        },
      });
    } catch (error: any) {
      console.error('Resim yükleme ve dönüştürme hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Resim işlenirken sunucu hatası oluştu.',
        error: error.message,
      });
    }
  }
}
