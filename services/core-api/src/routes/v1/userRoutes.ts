import { Router } from 'express';
import { AuthController } from '../../controllers/api/v1/users/AuthController';
import { UserController } from '../../controllers/api/v1/users/UserController';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const userRoutes = Router();

userRoutes.post('/register', AuthController.register);
userRoutes.post('/login', AuthController.login);
userRoutes.post('/heartbeat', authMiddleware as any, UserController.heartbeat as any);
userRoutes.get('/me', authMiddleware as any, UserController.getProfile as any);
userRoutes.post('/setup-character', authMiddleware as any, UserController.setupCharacter as any);
userRoutes.post('/update-character-draft', authMiddleware as any, UserController.updateCharacterDraft as any);
userRoutes.post('/sync-economy', authMiddleware as any, UserController.syncEconomy as any);
