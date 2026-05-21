import { Router } from 'express';
import { MapController } from '../../controllers/api/v1/maps/MapController';
import { ModelController } from '../../controllers/api/v1/maps/ModelController';

export const mapRoutes = Router();

mapRoutes.get('/model-assets', ModelController.getAssets);
mapRoutes.get('/:districtId', MapController.getMapByDistrict);
