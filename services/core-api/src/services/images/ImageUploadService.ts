import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

export class ImageUploadService {
  private static uploadDir = path.join(__dirname, '../../../public/uploads');

  public static async processAndSaveImage(fileBuffer: Buffer): Promise<string> {
    // Ensure destination directory exists recursively
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Generate cryptographically secure unique filename to prevent path traversal/guessing
    const uniqueId = crypto.randomUUID();
    const filename = `${uniqueId}.webp`;
    const destinationPath = path.join(this.uploadDir, filename);

    // Convert to WebP, auto-rotate based on orientation, and strip EXIF metadata (sharp does this by default)
    await sharp(fileBuffer)
      .rotate()
      .webp({ quality: 85 })
      .toFile(destinationPath);

    return filename;
  }
}
