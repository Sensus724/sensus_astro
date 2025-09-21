import { Request, Response, NextFunction } from 'express';
import FirebaseService from '../services/firebase.service';
import { logger } from '../utils/logger.util';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        displayName?: string;
        photoURL?: string;
      };
    }
  }
}

class AuthMiddleware {
  // Middleware para verificar autenticación con Firebase
  async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Token de acceso requerido',
          message: 'Debes proporcionar un token de autenticación válido'
        });
        return;
      }

      const token = authHeader.substring(7); // Remover 'Bearer '

      try {
        const auth = FirebaseService.getAuth();
        const decodedToken = await auth.verifyIdToken(token);
        
        // Agregar información del usuario a la request
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          displayName: decodedToken.name,
          photoURL: decodedToken.picture
        };

        logger.info(`Usuario autenticado: ${decodedToken.uid}`);
        next();
      } catch (tokenError) {
        logger.error('Error verificando token:', tokenError);
        res.status(401).json({
          success: false,
          error: 'Token inválido',
          message: 'El token de autenticación no es válido o ha expirado'
        });
        return;
      }
    } catch (error) {
      logger.error('Error en middleware de autenticación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'Error procesando la autenticación'
      });
    }
  }

  // Middleware opcional para autenticación (no falla si no hay token)
  async optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No hay token, continuar sin usuario autenticado
        next();
        return;
      }

      const token = authHeader.substring(7);

      try {
        const auth = FirebaseService.getAuth();
        const decodedToken = await auth.verifyIdToken(token);
        
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          displayName: decodedToken.name,
          photoURL: decodedToken.picture
        };

        logger.info(`Usuario autenticado (opcional): ${decodedToken.uid}`);
      } catch (tokenError) {
        logger.warn('Token inválido en autenticación opcional:', tokenError);
        // Continuar sin usuario autenticado
      }

      next();
    } catch (error) {
      logger.error('Error en middleware de autenticación opcional:', error);
      next(); // Continuar incluso si hay error
    }
  }

  // Middleware para verificar que el usuario existe en la base de datos
  async verifyUserExists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado',
          message: 'Debes estar autenticado para acceder a este recurso'
        });
        return;
      }

      const db = FirebaseService.getFirestore();
      const userDoc = await db.collection('users').doc(req.user.uid).get();

      if (!userDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'Tu perfil de usuario no existe en el sistema'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error verificando existencia del usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'Error verificando el usuario'
      });
    }
  }

  // Middleware para verificar permisos de administrador
  async verifyAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado',
          message: 'Debes estar autenticado para acceder a este recurso'
        });
        return;
      }

      const db = FirebaseService.getFirestore();
      const userDoc = await db.collection('users').doc(req.user.uid).get();

      if (!userDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'Tu perfil de usuario no existe en el sistema'
        });
        return;
      }

      const userData = userDoc.data();
      const isAdmin = userData?.role === 'admin' || userData?.subscription?.plan === 'admin';

      if (!isAdmin) {
        res.status(403).json({
          success: false,
          error: 'Acceso denegado',
          message: 'No tienes permisos de administrador para acceder a este recurso'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error verificando permisos de administrador:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'Error verificando permisos'
      });
    }
  }

  // Middleware para verificar suscripción premium
  async verifyPremium(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado',
          message: 'Debes estar autenticado para acceder a este recurso'
        });
        return;
      }

      const db = FirebaseService.getFirestore();
      const userDoc = await db.collection('users').doc(req.user.uid).get();

      if (!userDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'Tu perfil de usuario no existe en el sistema'
        });
        return;
      }

      const userData = userDoc.data();
      const subscription = userData?.subscription;
      const isPremium = subscription?.plan === 'premium' || subscription?.plan === 'admin';

      if (!isPremium) {
        res.status(403).json({
          success: false,
          error: 'Suscripción premium requerida',
          message: 'Esta funcionalidad requiere una suscripción premium'
        });
        return;
      }

      // Verificar si la suscripción no ha expirado
      if (subscription?.endDate && subscription.endDate.toDate() < new Date()) {
        res.status(403).json({
          success: false,
          error: 'Suscripción expirada',
          message: 'Tu suscripción premium ha expirado'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error verificando suscripción premium:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'Error verificando suscripción'
      });
    }
  }
}

export default new AuthMiddleware();
