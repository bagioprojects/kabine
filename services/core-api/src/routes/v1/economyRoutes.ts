import { Router } from 'express';
import { ReserveController } from '../../controllers/api/v1/economy/ReserveController';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const economyRoutes = Router();

economyRoutes.get('/reserves', authMiddleware as any, ReserveController.getReserves as any);
economyRoutes.post('/reserves/manage', authMiddleware as any, ReserveController.manageReserves as any);
