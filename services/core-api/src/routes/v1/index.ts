import { Router } from 'express';
import { economyRoutes } from './economyRoutes';
import { politicsRoutes } from './politicsRoutes';
import { logisticsRoutes } from './logisticsRoutes';
import { userRoutes } from './userRoutes';
import { imageRoutes } from './imageRoutes';
import { adminRoutes } from './adminRoutes';
import { mapRoutes } from './mapRoutes';

const router = Router();

router.use('/economy', economyRoutes);
router.use('/politics', politicsRoutes);
router.use('/logistics', logisticsRoutes);
router.use('/users', userRoutes);
router.use('/images', imageRoutes);
router.use('/admin', adminRoutes);
router.use('/maps', mapRoutes);

export default router;
