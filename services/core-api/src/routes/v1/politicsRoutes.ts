import { Router } from 'express';
import { ElectionController } from '../../controllers/api/v1/politics/ElectionController';
import { ParliamentController } from '../../controllers/api/v1/politics/ParliamentController';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const politicsRoutes = Router();

politicsRoutes.post('/elections/candidacy', authMiddleware as any, ElectionController.applyForCandidacy as any);
politicsRoutes.get('/elections/voters', authMiddleware as any, ElectionController.getVoters as any);
politicsRoutes.post('/elections/vote', authMiddleware as any, ElectionController.castVote as any);
politicsRoutes.post('/residency/apply', authMiddleware as any, ElectionController.applyForResidency as any);

// Parliament Laws
politicsRoutes.post('/laws/propose', authMiddleware as any, ParliamentController.proposeLaw as any);
politicsRoutes.post('/laws/vote', authMiddleware as any, ParliamentController.voteLaw as any);
politicsRoutes.get('/laws', authMiddleware as any, ParliamentController.getLaws as any);
