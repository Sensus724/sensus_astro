import { Router } from 'express';
import userController from '../controllers/user.controller';
import authMiddleware from '../middleware/auth.middleware';
import AdvancedSecurityMiddleware from '../middleware/advanced-security.middleware';

const router = Router();

// Rutas públicas (sin autenticación)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rutas protegidas (requieren autenticación avanzada)
router.use(AdvancedSecurityMiddleware.advancedAuth);

// Rutas del usuario autenticado
router.get('/profile', userController.getProfile);
router.put('/profile', AdvancedSecurityMiddleware.sensitiveEndpoint, userController.updateProfile);
router.put('/change-password', AdvancedSecurityMiddleware.sensitiveEndpoint, userController.changePassword);
router.delete('/account', AdvancedSecurityMiddleware.sensitiveEndpoint, userController.deleteAccount);

export default router;