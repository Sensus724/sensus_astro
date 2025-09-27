import { Request, Response } from 'express';
import { logger } from '../utils/logger.util';
import FirebaseService from '../services/firebase.service';
import SecurityService from '../services/security.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class UserController {
  // Registrar nuevo usuario
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, birthDate } = req.body;

      // Validación básica
      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({
          success: false,
          error: 'Campos requeridos faltantes',
          message: 'Email, contraseña, nombre y apellido son obligatorios'
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: 'Email inválido',
          message: 'El formato del email no es válido'
        });
        return;
      }

      // Validar fortaleza de contraseña con servicio de seguridad
      const passwordValidation = SecurityService.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Contraseña débil',
          message: 'La contraseña no cumple con los requisitos de seguridad',
          details: passwordValidation.feedback
        });
        return;
      }

      const db = FirebaseService.getFirestore();
      
      // Verificar si el usuario ya existe
      const existingUser = await db.collection('users').where('email', '==', email).get();
      if (!existingUser.empty) {
        res.status(409).json({
          success: false,
          error: 'Usuario ya existe',
          message: 'Ya existe un usuario con este email'
        });
        return;
      }

      // Hash de la contraseña con servicio de seguridad
      const hashedPassword = await SecurityService.hashPassword(password);

      // Crear usuario
      const userData = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        birthDate: birthDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        lastLogin: null,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'es'
        }
      };

      const userRef = await db.collection('users').add(userData);
      const userId = userRef.id;

      // Generar JWT token seguro
      const token = SecurityService.generateSecureToken({
        userId,
        email,
        role: 'user',
        permissions: ['read:profile', 'write:profile', 'read:diary', 'write:diary']
      });

      logger.info(`Nuevo usuario registrado: ${userId} - ${email}`);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: userId,
            email,
            firstName,
            lastName,
            birthDate,
            createdAt: userData.createdAt,
            preferences: userData.preferences
          },
          token
        },
        message: 'Usuario registrado exitosamente'
      });

    } catch (error) {
      logger.error('Error registrando usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo registrar el usuario'
      });
    }
  }

  // Iniciar sesión
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Credenciales requeridas',
          message: 'Email y contraseña son obligatorios'
        });
        return;
      }

      // Verificar intentos de login
      const loginCheck = await SecurityService.checkLoginAttempts(ip, email);
      if (!loginCheck.allowed) {
        res.status(429).json({
          success: false,
          error: 'Cuenta bloqueada temporalmente',
          message: `Demasiados intentos fallidos. Intenta de nuevo en ${Math.ceil(loginCheck.lockoutTime! / 1000 / 60)} minutos`,
          retryAfter: loginCheck.lockoutTime
        });
        return;
      }

      const db = FirebaseService.getFirestore();
      
      // Buscar usuario por email
      const userSnapshot = await db.collection('users').where('email', '==', email).get();
      
      if (userSnapshot.empty) {
        res.status(401).json({
          success: false,
          error: 'Credenciales inválidas',
          message: 'Email o contraseña incorrectos'
        });
        return;
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Verificar si el usuario está activo
      if (!userData.isActive) {
        res.status(401).json({
          success: false,
          error: 'Cuenta desactivada',
          message: 'Tu cuenta ha sido desactivada'
        });
        return;
      }

      // Verificar contraseña con servicio de seguridad
      const isPasswordValid = await SecurityService.verifyPassword(password, userData.password);
      if (!isPasswordValid) {
        // Registrar intento fallido
        await SecurityService.recordLoginAttempt(ip, email, false, userAgent);
        
        res.status(401).json({
          success: false,
          error: 'Credenciales inválidas',
          message: 'Email o contraseña incorrectos',
          remainingAttempts: loginCheck.remainingAttempts - 1
        });
        return;
      }

      // Actualizar último login
      await db.collection('users').doc(userId!).update({
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Registrar login exitoso
      await SecurityService.recordLoginAttempt(ip, email, true, userAgent);

      // Generar JWT token seguro
      const token = SecurityService.generateSecureToken({
        userId,
        email,
        role: userData.role || 'user',
        permissions: userData.permissions || ['read:profile', 'write:profile', 'read:diary', 'write:diary']
      });

      logger.info(`Usuario inició sesión: ${userId} - ${email}`);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: userId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            birthDate: userData.birthDate,
            createdAt: userData.createdAt,
            lastLogin: new Date().toISOString(),
            preferences: userData.preferences
          },
          token
        },
        message: 'Inicio de sesión exitoso'
      });

    } catch (error) {
      logger.error('Error en inicio de sesión:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo iniciar sesión'
      });
    }
  }

  // Obtener perfil del usuario
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      const db = FirebaseService.getFirestore();
      const userDoc = await db.collection('users').doc(userId!).get();

      if (!userDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El usuario no existe'
        });
        return;
      }

      const userData = userDoc.data();
      
      // Remover datos sensibles
      const { password, ...safeUserData } = userData || {};

      res.status(200).json({
        success: true,
        data: {
          id: userId,
          ...safeUserData
        }
      });

    } catch (error) {
      logger.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el perfil'
      });
    }
  }

  // Actualizar perfil del usuario
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { firstName, lastName, birthDate, preferences } = req.body;

      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (birthDate) updateData.birthDate = birthDate;
      if (preferences) updateData.preferences = { ...preferences };

      const db = FirebaseService.getFirestore();
      await db.collection('users').doc(userId!).update(updateData);

      logger.info(`Perfil actualizado para usuario: ${userId}`);

      res.status(200).json({
        success: true,
        data: updateData,
        message: 'Perfil actualizado exitosamente'
      });

    } catch (error) {
      logger.error('Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar el perfil'
      });
    }
  }

  // Cambiar contraseña
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Contraseñas requeridas',
          message: 'Contraseña actual y nueva contraseña son obligatorias'
        });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          error: 'Contraseña débil',
          message: 'La nueva contraseña debe tener al menos 8 caracteres'
        });
        return;
      }

      const db = FirebaseService.getFirestore();
      const userDoc = await db.collection('users').doc(userId!).get();

      if (!userDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El usuario no existe'
        });
        return;
      }

      const userData = userDoc.data();
      
      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData?.password || '');
      if (!isCurrentPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Contraseña actual incorrecta',
          message: 'La contraseña actual no es correcta'
        });
        return;
      }

      // Hash de la nueva contraseña
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      await db.collection('users').doc(userId!).update({
        password: hashedNewPassword,
        updatedAt: new Date().toISOString()
      });

      logger.info(`Contraseña cambiada para usuario: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });

    } catch (error) {
      logger.error('Error cambiando contraseña:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo cambiar la contraseña'
      });
    }
  }

  // Eliminar cuenta
  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { password } = req.body;

      if (!password) {
        res.status(400).json({
          success: false,
          error: 'Contraseña requerida',
          message: 'Debes confirmar tu contraseña para eliminar la cuenta'
        });
        return;
      }

      const db = FirebaseService.getFirestore();
      const userDoc = await db.collection('users').doc(userId!).get();

      if (!userDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El usuario no existe'
        });
        return;
      }

      const userData = userDoc.data();
      
      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, userData?.password || '');
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Contraseña incorrecta',
          message: 'La contraseña no es correcta'
        });
        return;
      }

      // Eliminar datos del usuario (soft delete)
      await db.collection('users').doc(userId!).update({
        isActive: false,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Eliminar datos relacionados
      const batch = db.batch();
      
      // Eliminar entradas del diario
      const diarySnapshot = await db.collection('diary_entries').where('userId', '==', userId).get();
      diarySnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Eliminar evaluaciones
      const evaluationsSnapshot = await db.collection('evaluations').where('userId', '==', userId).get();
      evaluationsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      await batch.commit();

      logger.info(`Cuenta eliminada para usuario: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Cuenta eliminada exitosamente'
      });

    } catch (error) {
      logger.error('Error eliminando cuenta:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo eliminar la cuenta'
      });
    }
  }
}

export default new UserController();