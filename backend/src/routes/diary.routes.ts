import { Router } from 'express';
import diaryController from '../controllers/diary.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// Aplicar autenticación a todas las rutas del diario
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.verifyUserExists);

// Rutas del diario
router.post('/', diaryController.createEntry);
router.get('/', diaryController.getEntries);
router.get('/stats', diaryController.getStats);
router.get('/search', diaryController.searchEntries);
router.get('/:entryId', diaryController.getEntryById);
router.put('/:entryId', diaryController.updateEntry);
router.delete('/:entryId', diaryController.deleteEntry);

export default router;
