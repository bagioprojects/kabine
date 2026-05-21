import { Request, Response } from 'express';
import { ModelAssetService } from '../../../../services/maps/ModelAssetService';

export class ModelController {
  // Categories API
  public static async getCategories(req: Request, res: Response) {
    try {
      const categories = await ModelAssetService.getCategories();
      return res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      console.error('getCategories hatası:', error);
      return res.status(500).json({ success: false, message: 'Kategoriler listelenirken sunucu hatası oluştu.' });
    }
  }

  public static async createCategory(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Kategori adı boş olamaz.' });
      }
      const category = await ModelAssetService.createCategory(name.trim());
      return res.status(201).json({ success: true, message: 'Kategori başarıyla oluşturuldu.', data: category });
    } catch (error: any) {
      console.error('createCategory hatası:', error);
      return res.status(500).json({ success: false, message: error.message || 'Kategori oluşturulurken hata oluştu.' });
    }
  }

  public static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Kategori adı boş olamaz.' });
      }
      const category = await ModelAssetService.updateCategory(id, name.trim());
      return res.status(200).json({ success: true, message: 'Kategori başarıyla güncellendi.', data: category });
    } catch (error: any) {
      console.error('updateCategory hatası:', error);
      return res.status(500).json({ success: false, message: error.message || 'Kategori güncellenirken hata oluştu.' });
    }
  }

  public static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ModelAssetService.deleteCategory(id);
      return res.status(200).json({ success: true, message: 'Kategori başarıyla silindi.' });
    } catch (error: any) {
      console.error('deleteCategory hatası:', error);
      return res.status(500).json({ success: false, message: error.message || 'Kategori silinirken hata oluştu.' });
    }
  }

  // Assets API
  public static async getAssets(req: Request, res: Response) {
    try {
      const assets = await ModelAssetService.getAssets();
      return res.status(200).json({ success: true, data: assets });
    } catch (error: any) {
      console.error('getAssets hatası:', error);
      return res.status(500).json({ success: false, message: 'Model varlıkları listelenirken sunucu hatası oluştu.' });
    }
  }

  public static async createAsset(req: Request, res: Response) {
    try {
      const { name, categoryId, modelType, gridSizeX, gridSizeY, scale, thumbnailUrl } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, error: 'Model adı boş olamaz.' });
      }
      if (!categoryId) {
        return res.status(400).json({ success: false, error: 'Kategori seçimi zorunludur.' });
      }
      if (!modelType) {
        return res.status(400).json({ success: false, error: 'Model tipi belirtilmelidir.' });
      }

      const modelFile = files?.modelFile?.[0];
      if (!modelFile) {
        return res.status(400).json({ success: false, error: 'Model dosyası yüklenmelidir.' });
      }

      const textureFile = files?.textureFile?.[0];

      const asset = await ModelAssetService.createAsset(
        {
          name: name.trim(),
          categoryId,
          modelType,
          gridSizeX: Number(gridSizeX) || 1,
          gridSizeY: Number(gridSizeY) || 1,
          scale: Number(scale) || 1.0,
          thumbnailUrl: thumbnailUrl !== undefined ? (thumbnailUrl || null) : undefined,
        },
        modelFile,
        textureFile
      );

      return res.status(201).json({
        success: true,
        message: 'Model varlığı başarıyla yüklendi.',
        data: asset,
      });
    } catch (error: any) {
      console.error('createAsset hatası:', error);
      return res.status(500).json({ success: false, error: error.message || 'Model yüklenirken sunucu hatası oluştu.' });
    }
  }

    public static async updateAsset(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, categoryId, gridSizeX, gridSizeY, scale, removeTexture, thumbnailUrl } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      const modelFile = files?.modelFile?.[0];
      const textureFile = files?.textureFile?.[0];

      const asset = await ModelAssetService.updateAsset(
        id,
        {
          name: name ? name.trim() : undefined,
          categoryId,
          gridSizeX: gridSizeX !== undefined ? Number(gridSizeX) : undefined,
          gridSizeY: gridSizeY !== undefined ? Number(gridSizeY) : undefined,
          scale: scale !== undefined ? Number(scale) : undefined,
          thumbnailUrl: thumbnailUrl !== undefined ? (thumbnailUrl || null) : undefined,
        },
        modelFile,
        textureFile,
        removeTexture === 'true' || removeTexture === true
      );

      return res.status(200).json({
        success: true,
        message: 'Model varlığı başarıyla güncellendi.',
        data: asset,
      });
    } catch (error: any) {
      console.error('updateAsset hatası:', error);
      return res.status(500).json({ success: false, error: error.message || 'Model güncellenirken sunucu hatası oluştu.' });
    }
  }

  public static async deleteAsset(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ModelAssetService.deleteAsset(id);
      return res.status(200).json({ success: true, message: 'Model varlığı başarıyla silindi.' });
    } catch (error: any) {
      console.error('deleteAsset hatası:', error);
      return res.status(500).json({ success: false, message: error.message || 'Model varlığı silinirken hata oluştu.' });
    }
  }
}
