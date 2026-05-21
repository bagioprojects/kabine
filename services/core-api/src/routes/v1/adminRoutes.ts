import { Router } from 'express';
import { AdminController } from '../../controllers/api/v1/admin/AdminController';
import { MapController } from '../../controllers/api/v1/maps/MapController';
import { ModelController } from '../../controllers/api/v1/maps/ModelController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';
import { modelUploadMiddleware, modelUpdateMiddleware } from '../../middlewares/modelUploadMiddleware';

export const adminRoutes = Router();

// ── Giriş rotası (Korumasız) ──────────────────────────────────────────────────
adminRoutes.post('/login', AdminController.login);

// ── Kimlik doğrulama + admin yetki kontrolü ───────────────────────────────────
adminRoutes.use(authMiddleware as any);
adminRoutes.use(adminMiddleware as any);

// ── Dashboard İstatistikleri ──────────────────────────────────────────────────
adminRoutes.get('/stats', AdminController.getDashboardStats);

// ── Kullanıcı Yönetimi ────────────────────────────────────────────────────────
adminRoutes.get('/users', AdminController.getUsers);
adminRoutes.put('/users/:id', AdminController.updateUser);
adminRoutes.delete('/users/:id', AdminController.deleteUser);

// ── Borsa ve Emtia Yönetimi ───────────────────────────────────────────────────
adminRoutes.get('/commodities', AdminController.getCommodities);
adminRoutes.put('/commodities/:id', AdminController.updateCommodityPrice);

// ── Meclis ve Yasa Yönetimi ───────────────────────────────────────────────────
adminRoutes.get('/laws', AdminController.getLaws);
adminRoutes.post('/laws', AdminController.createLaw);
adminRoutes.put('/laws/:id', AdminController.updateLawStatus);

// ── Lojistik ve Tır Filosu ────────────────────────────────────────────────────
adminRoutes.get('/trucks', AdminController.getTrucks);
adminRoutes.post('/trucks', AdminController.createTruck);

// ── Harita Tasarım Editörü ────────────────────────────────────────────────────
adminRoutes.post('/maps', MapController.saveMap);
adminRoutes.post('/maps/assign', MapController.assignMapToDistrict);
adminRoutes.get('/districts', MapController.getAdminDistricts);
adminRoutes.get('/custom-maps', MapController.getCustomMaps);
adminRoutes.post('/custom-maps', MapController.createCustomMap);
adminRoutes.get('/custom-maps/:id', MapController.getCustomMapById);
adminRoutes.put('/custom-maps/:id', MapController.updateCustomMap);
adminRoutes.delete('/custom-maps/:id', MapController.deleteCustomMap);

// ── Model Kategori Yönetimi ───────────────────────────────────────────────────
adminRoutes.get('/model-categories', ModelController.getCategories);
adminRoutes.post('/model-categories', ModelController.createCategory);
adminRoutes.put('/model-categories/:id', ModelController.updateCategory);
adminRoutes.delete('/model-categories/:id', ModelController.deleteCategory);

// ── Model Varlık Yönetimi ─────────────────────────────────────────────────────
adminRoutes.get('/model-assets', ModelController.getAssets);
adminRoutes.post('/model-assets', modelUploadMiddleware as any, ModelController.createAsset);
adminRoutes.put('/model-assets/:id', modelUpdateMiddleware as any, ModelController.updateAsset); // modelFile optional
adminRoutes.delete('/model-assets/:id', ModelController.deleteAsset);
