import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.util';
import FirebaseService from '../services/firebase.service';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
  };
}

class AuthMiddleware {
  // Verificar token JWT
  async verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Token requerido',
          message: 'Debe proporcionar un token de autenticación'
        });
        return;
      }

      const token = authHeader.substring(7); // Remover 'Bearer '

      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Token requerido',
          message: 'Token de autenticación no proporcionado'
        });
        return;
      }

      // Verificar token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      if (!decoded.userId || !decoded.email) {
        res.status(401).json({
          success: false,
          error: 'Token inválido',
          message: 'El token no contiene la información necesaria'
        });
        return;
      }

      // Agregar información del usuario a la request
      req.user = {
        uid: decoded.userId,
        email: decoded.email
      };

      logger.info(`Token verificado para usuario: ${decoded.userId}`);
      next();

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          error: 'Token inválido',
          message: 'El token proporcionado no es válido'
        });
        return;
      }

      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          error: 'Token expirado',
          message: 'El token ha expirado, por favor inicia sesión nuevamente'
        });
        return;
      }

      logger.error('Error verificando token:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'Error verificando autenticación'
      });
    }
  }

  // Verificar que el usuario existe en la base de datos
  async verifyUserExists(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuario no identificado',
          message: 'No se pudo identificar al usuario'
        });
        return;
      }

      const db = FirebaseService.getFirestore();
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El usuario no existe en la base de datos'
        });
        return;
      }

      const userData = userDoc.data();
      
      if (!userData.isActive) {
        res.status(403).json({
          success: false,
          error: 'Cuenta desactivada',
          message: 'Tu cuenta ha sido desactivada'
        });
        return;
      }

      logger.info(`Usuario verificado: ${userId}`);
      next();

    } catch (error) {
      logger.error('Error verificando usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'Error verificando usuario'
      });
    }
  }

  // Middleware opcional para verificar token (no falla si no hay token)
  async optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No hay token, continuar sin autenticación
        next();
        return;
      }

      const token = authHeader.substring(7);

      if (!token) {
        next();
        return;
      }

      // Intentar verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      if (decoded.userId && decoded.email) {
        req.user = {
          uid: decoded.userId,
          email: decoded.email
        };
      }

      next();

    } catch (error) {
      // Si hay error con el token, continuar sin autenticación
      logger.warn('Token opcional inválido:', error.message);
      next();
    }
  }

  // Verificar roles de usuario (para futuras implementaciones)
  async verifyRole(requiredRoles: string[]) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = req.user?.uid;

        if (!userId) {
          res.status(401).json({
            success: false,
            error: 'Usuario no identificado',
            message: 'No se pudo identificar al usuario'
          });
          return;
        }

        const db = FirebaseService.getFirestore();
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
          res.status(404).json({
            success: false,
            error: 'Usuario no encontrado',
            message: 'El usuario no existe'
          });
          return;
        }

        const userData = userDoc.data();
        const userRole = userData.role || 'user';

        if (!requiredRoles.includes(userRole)) {
          res.status(403).json({
            success: false,
            error: 'Permisos insuficientes',
            message: 'No tienes permisos para realizar esta acción'
          });
          return;
        }

        next();

      } catch (error) {
        logger.error('Error verificando rol:', error);
        res.status(500).json({
          success: false,
          error: 'Error interno del servidor',
          message: 'Error verificando permisos'
        });
      }
    };
  }
}

export default new AuthMiddleware();