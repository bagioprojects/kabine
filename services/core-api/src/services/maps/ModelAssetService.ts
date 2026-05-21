import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AppDataSource } from '../../config/database';
import { ModelCategory } from '../../models/maps/ModelCategory';
import { ModelAsset } from '../../models/maps/ModelAsset';
import { CustomMap } from '../../models/maps/CustomMap';
import { DistrictMap } from '../../models/maps/DistrictMap';

export class ModelAssetService {
  private static uploadDir  = path.join(__dirname, '../../../public/uploads');
  private static modelsDir  = path.join(__dirname, '../../../public/uploads/models');
  private static texturesDir= path.join(__dirname, '../../../public/uploads/textures');

  /**
   * Removes all cells that reference `assetId` from every CustomMap and DistrictMap.
   * Called whenever a model's grid footprint changes (or on delete).
   */
  private static async purgeAssetFromAllMaps(assetId: string): Promise<void> {
    const customMapRepo  = AppDataSource.getRepository(CustomMap);
    const districtMapRepo = AppDataSource.getRepository(DistrictMap);

    const removeFromCells = (cells: any[]): { cleaned: any[]; changed: boolean } => {
      // Collect all pivot rows/cols that reference this assetId
      const pivotKeys = new Set<string>();
      for (const cell of cells) {
        if (cell.buildingId === assetId && cell.isBuildingPivot) {
          pivotKeys.add(`${cell.row},${cell.col}`);
        }
      }
      if (pivotKeys.size === 0) return { cleaned: cells, changed: false };

      // Also collect anchor-children referencing those pivots
      const cleaned = cells.map((cell: any) => {
        const isPivot = cell.buildingId === assetId && cell.isBuildingPivot;
        const isChild = cell.buildingAnchor && pivotKeys.has(`${cell.buildingAnchor.row},${cell.buildingAnchor.col}`);
        if (isPivot || isChild) {
          return {
            ...cell,
            type: 'grass',
            buildingId: null,
            isBuildingPivot: false,
            buildingAnchor: null,
            roadDirection: null,
          };
        }
        return cell;
      });
      return { cleaned, changed: true };
    };

    // Clean all CustomMaps
    const customMaps = await customMapRepo.find();
    for (const map of customMaps) {
      if (!Array.isArray(map.gridCells) || map.gridCells.length === 0) continue;
      const { cleaned, changed } = removeFromCells(map.gridCells);
      if (changed) {
        map.gridCells = cleaned;
        await customMapRepo.save(map);
      }
    }

    // Clean all DistrictMaps (local override cells)
    const districtMaps = await districtMapRepo.find();
    for (const dm of districtMaps) {
      if (!Array.isArray(dm.gridCells) || dm.gridCells.length === 0) continue;
      const { cleaned, changed } = removeFromCells(dm.gridCells);
      if (changed) {
        dm.gridCells = cleaned;
        await districtMapRepo.save(dm);
      }
    }

    console.log(`[ModelAssetService] Purged asset ${assetId} references from all maps.`);
  }

  // Categories API
  public static async getCategories(): Promise<ModelCategory[]> {
    const categoryRepo = AppDataSource.getRepository(ModelCategory);
    return await categoryRepo.find({ order: { name: 'ASC' } });
  }

  public static async createCategory(name: string): Promise<ModelCategory> {
    const categoryRepo = AppDataSource.getRepository(ModelCategory);
    const existing = await categoryRepo.findOne({ where: { name } });
    if (existing) {
      throw new Error('Bu kategori adı zaten mevcut.');
    }
    const category = new ModelCategory();
    category.name = name;
    return await categoryRepo.save(category);
  }

  public static async updateCategory(id: string, name: string): Promise<ModelCategory> {
    const categoryRepo = AppDataSource.getRepository(ModelCategory);
    const category = await categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new Error('Kategori bulunamadı.');
    }
    const existing = await categoryRepo.findOne({ where: { name } });
    if (existing && existing.id !== id) {
      throw new Error('Bu kategori adı başka bir kategori tarafından kullanılıyor.');
    }
    category.name = name;
    return await categoryRepo.save(category);
  }

  public static async deleteCategory(id: string): Promise<void> {
    const categoryRepo = AppDataSource.getRepository(ModelCategory);
    const category = await categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new Error('Kategori bulunamadı.');
    }
    await categoryRepo.remove(category);
  }

  // Assets API
  public static async getAssets(): Promise<ModelAsset[]> {
    const assetRepo = AppDataSource.getRepository(ModelAsset);
    return await assetRepo.find({ relations: ['category'], order: { name: 'ASC' } });
  }

  private static ensureDirsExist() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    if (!fs.existsSync(this.modelsDir)) {
      fs.mkdirSync(this.modelsDir, { recursive: true });
    }
    if (!fs.existsSync(this.texturesDir)) {
      fs.mkdirSync(this.texturesDir, { recursive: true });
    }
  }

  private static deletePhysicalFile(fileUrl: string) {
    const filename = path.basename(fileUrl);
    // Find correct path: models subfolder, textures subfolder, or legacy upload root folder
    let filePath = path.join(this.uploadDir, filename);
    if (fileUrl.includes('/textures/')) {
      filePath = path.join(this.texturesDir, filename);
    } else if (fileUrl.includes('/models/')) {
      filePath = path.join(this.modelsDir, filename);
    }
    
    // Check if file exists in determined path, fallback to parent upload dir
    if (!fs.existsSync(filePath)) {
      filePath = path.join(this.uploadDir, filename);
    }

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Error deleting physical file ${filePath}:`, err);
      }
    }
  }

  private static saveBase64Thumbnail(base64Str: string): string | null {
    if (!base64Str || !base64Str.startsWith('data:image/')) return base64Str;
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Str;

    const ext = matches[1] === 'image/jpeg' ? '.jpg' : '.png';
    const filename = `thumbnail-${crypto.randomUUID()}${ext}`;
    this.ensureDirsExist();
    const destPath = path.join(this.texturesDir, filename);
    const dataBuffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(destPath, dataBuffer);
    return `/uploads/textures/${filename}`;
  }

  public static async createAsset(
    params: {
      name: string;
      categoryId: string;
      modelType: string;
      gridSizeX: number;
      gridSizeY: number;
      scale: number;
      isResizable?: boolean;
      thumbnailUrl?: string | null;
    },
    modelFile: Express.Multer.File,
    textureFile?: Express.Multer.File
  ): Promise<ModelAsset> {
    const categoryRepo = AppDataSource.getRepository(ModelCategory);
    const assetRepo = AppDataSource.getRepository(ModelAsset);

    const category = await categoryRepo.findOne({ where: { id: params.categoryId } });
    if (!category) {
      throw new Error('Geçersiz kategori seçimi.');
    }

    // Ensure all directories exist
    this.ensureDirsExist();

    // Save Model File
    const modelUuid = crypto.randomUUID();
    const modelExt = path.extname(modelFile.originalname).toLowerCase();
    const modelFilename = `${modelUuid}${modelExt}`;
    const modelDestPath = path.join(this.modelsDir, modelFilename);
    fs.writeFileSync(modelDestPath, modelFile.buffer);

    let textureFilename: string | null = null;
    if (textureFile) {
      const texUuid = crypto.randomUUID();
      const texExt = path.extname(textureFile.originalname).toLowerCase();
      textureFilename = `${texUuid}${texExt}`;
      const texDestPath = path.join(this.texturesDir, textureFilename);
      fs.writeFileSync(texDestPath, textureFile.buffer);
    }

    const asset = new ModelAsset();
    asset.name = params.name;
    asset.categoryId = params.categoryId;
    asset.modelType = params.modelType;
    asset.gridSizeX = params.gridSizeX;
    asset.gridSizeY = params.gridSizeY;
    asset.scale = params.scale;
    asset.isResizable = params.isResizable ?? true;
    asset.fileUrl = `/uploads/models/${modelFilename}`;
    asset.textureUrl = textureFilename ? `/uploads/textures/${textureFilename}` : null;
    asset.thumbnailUrl = params.thumbnailUrl ? this.saveBase64Thumbnail(params.thumbnailUrl) : null;

    return await assetRepo.save(asset);
  }

  public static async updateAsset(
    id: string,
    params: {
      name?: string;
      categoryId?: string;
      gridSizeX?: number;
      gridSizeY?: number;
      scale?: number;
      isResizable?: boolean;
      thumbnailUrl?: string | null;
    },
    modelFile?: Express.Multer.File,
    textureFile?: Express.Multer.File,
    removeTexture?: boolean
  ): Promise<ModelAsset> {
    const categoryRepo = AppDataSource.getRepository(ModelCategory);
    const assetRepo = AppDataSource.getRepository(ModelAsset);

    const asset = await assetRepo.findOne({ where: { id } });
    if (!asset) {
      throw new Error('Model varlığı bulunamadı.');
    }

    if (params.categoryId) {
      const category = await categoryRepo.findOne({ where: { id: params.categoryId } });
      if (!category) {
        throw new Error('Geçersiz kategori seçimi.');
      }
      asset.categoryId = params.categoryId;
    }

    // If grid footprint changed, purge this asset from all maps to avoid broken placements
    const sizeXChanged = params.gridSizeX !== undefined && Number(params.gridSizeX) !== asset.gridSizeX;
    const sizeYChanged = params.gridSizeY !== undefined && Number(params.gridSizeY) !== asset.gridSizeY;
    const modelFileChanged = !!modelFile; // new model file also triggers purge (model may be completely different)

    if (params.name !== undefined) asset.name = params.name.trim();
    if (params.gridSizeX !== undefined) asset.gridSizeX = Number(params.gridSizeX) || 1;
    if (params.gridSizeY !== undefined) asset.gridSizeY = Number(params.gridSizeY) || 1;
    if (params.scale !== undefined) asset.scale = Number(params.scale) || 1.0;
    if (params.isResizable !== undefined) asset.isResizable = String(params.isResizable) === 'true';
    if (params.thumbnailUrl !== undefined) {
      asset.thumbnailUrl = params.thumbnailUrl ? this.saveBase64Thumbnail(params.thumbnailUrl) : null;
    }

    // Ensure all directories exist
    this.ensureDirsExist();

    // Save Model File if provided
    if (modelFile) {
      if (asset.fileUrl) this.deletePhysicalFile(asset.fileUrl);
      const modelUuid = crypto.randomUUID();
      const modelExt = path.extname(modelFile.originalname).toLowerCase();
      const modelFilename = `${modelUuid}${modelExt}`;
      fs.writeFileSync(path.join(this.modelsDir, modelFilename), modelFile.buffer);
      asset.fileUrl = `/uploads/models/${modelFilename}`;
      const lower = modelFile.originalname.toLowerCase();
      if (lower.endsWith('.glb'))      asset.modelType = 'glb';
      else if (lower.endsWith('.fbx')) asset.modelType = 'fbx';
      else if (lower.endsWith('.obj')) asset.modelType = 'obj';
    }

    // Save Texture File if provided
    if (textureFile) {
      if (asset.textureUrl) this.deletePhysicalFile(asset.textureUrl);
      const texUuid = crypto.randomUUID();
      const texExt = path.extname(textureFile.originalname).toLowerCase();
      const textureFilename = `${texUuid}${texExt}`;
      fs.writeFileSync(path.join(this.texturesDir, textureFilename), textureFile.buffer);
      asset.textureUrl = `/uploads/textures/${textureFilename}`;
    } else if (removeTexture) {
      if (asset.textureUrl) this.deletePhysicalFile(asset.textureUrl);
      asset.textureUrl = null;
    }

    const saved = await assetRepo.save(asset);

    // Purge from maps AFTER saving — only when footprint or model file changed
    if (sizeXChanged || sizeYChanged || modelFileChanged) {
      await this.purgeAssetFromAllMaps(id);
    }

    return saved;
  }

  public static async deleteAsset(id: string): Promise<void> {
    const assetRepo = AppDataSource.getRepository(ModelAsset);
    const asset = await assetRepo.findOne({ where: { id } });
    if (!asset) throw new Error('Model varlığı bulunamadı.');

    // Purge from all maps before deleting so no orphan references remain
    await this.purgeAssetFromAllMaps(id);

    if (asset.fileUrl)    this.deletePhysicalFile(asset.fileUrl);
    if (asset.textureUrl) this.deletePhysicalFile(asset.textureUrl);
    await assetRepo.remove(asset);
  }
}
