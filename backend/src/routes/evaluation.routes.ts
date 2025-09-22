import { Router } from 'express';
import evaluationController from '../controllers/evaluation.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// Aplicar autenticación a todas las rutas de evaluaciones
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.verifyUserExists);

// Rutas de evaluaciones
router.post('/', evaluationController.createEvaluation);
router.get('/', evaluationController.getEvaluations);
router.get('/stats', evaluationController.getStats);
router.get('/latest', evaluationController.getLatestEvaluation);
router.get('/:evaluationId', evaluationController.getEvaluationById);

export default router;