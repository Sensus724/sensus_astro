import { Router } from 'express';
import userController from '../controllers/user.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas (sin autenticación)
router.post('/create', userController.createUser);

// Rutas que requieren autenticación
router.use(authMiddleware.verifyToken);

// Rutas del usuario
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/stats', userController.getStats);
router.get('/preferences', userController.getPreferences);
router.put('/preferences', userController.updatePreferences);
router.get('/privacy', userController.getPrivacySettings);
router.put('/privacy', userController.updatePrivacySettings);
router.delete('/account', userController.deleteAccount);

// Rutas de administración (requieren permisos de admin)
router.get('/admin/users', authMiddleware.verifyAdmin, userController.getAllUsers);
router.get('/admin/stats', authMiddleware.verifyAdmin, userController.getAdminStats);

export default router;
