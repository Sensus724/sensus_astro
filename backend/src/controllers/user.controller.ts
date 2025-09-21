import { Request, Response } from 'express';
import userService from '../services/user.service';
import { logger } from '../utils/logger.util';
import { CreateUserRequest, UpdateUserRequest } from '../models/user.model';

class UserController {
  // Crear nuevo usuario
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const data: CreateUserRequest = req.body;
      const user = await userService.createUser(userId, data);
      const response = userService.formatUserResponse(user);

      logger.info(`Usuario creado: ${userId}`);
      res.status(201).json({
        success: true,
        data: response,
        message: 'Usuario creado exitosamente'
      });
    } catch (error) {
      logger.error('Error creando usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener perfil del usuario
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El perfil de usuario no existe'
        });
        return;
      }

      const response = userService.formatUserResponse(user);

      res.status(200).json({
        success: true,
        data: response,
        message: 'Perfil obtenido exitosamente'
      });
    } catch (error) {
      logger.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Actualizar perfil del usuario
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const data: UpdateUserRequest = req.body;
      const updatedUser = await userService.updateUser(userId, data);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El perfil de usuario no existe'
        });
        return;
      }

      const response = userService.formatUserResponse(updatedUser);

      logger.info(`Perfil actualizado: ${userId}`);
      res.status(200).json({
        success: true,
        data: response,
        message: 'Perfil actualizado exitosamente'
      });
    } catch (error) {
      logger.error('Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener estadísticas del usuario
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const stats = await userService.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estadísticas obtenidas exitosamente'
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener preferencias del usuario
  async getPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const preferences = await userService.getUserPreferences(userId);

      res.status(200).json({
        success: true,
        data: preferences,
        message: 'Preferencias obtenidas exitosamente'
      });
    } catch (error) {
      logger.error('Error obteniendo preferencias:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Actualizar preferencias del usuario
  async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const preferences = req.body;
      const success = await userService.updateUserPreferences(userId, preferences);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El perfil de usuario no existe'
        });
        return;
      }

      logger.info(`Preferencias actualizadas: ${userId}`);
      res.status(200).json({
        success: true,
        message: 'Preferencias actualizadas exitosamente'
      });
    } catch (error) {
      logger.error('Error actualizando preferencias:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener configuración de privacidad
  async getPrivacySettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El perfil de usuario no existe'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user.privacy,
        message: 'Configuración de privacidad obtenida exitosamente'
      });
    } catch (error) {
      logger.error('Error obteniendo configuración de privacidad:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Actualizar configuración de privacidad
  async updatePrivacySettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const privacySettings = req.body;
      const success = await userService.updateUser(userId, { privacy: privacySettings });

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El perfil de usuario no existe'
        });
        return;
      }

      logger.info(`Configuración de privacidad actualizada: ${userId}`);
      res.status(200).json({
        success: true,
        message: 'Configuración de privacidad actualizada exitosamente'
      });
    } catch (error) {
      logger.error('Error actualizando configuración de privacidad:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Eliminar cuenta de usuario
  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const success = await userService.deleteUser(userId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El perfil de usuario no existe'
        });
        return;
      }

      logger.info(`Cuenta eliminada: ${userId}`);
      res.status(200).json({
        success: true,
        message: 'Cuenta eliminada exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando cuenta:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener todos los usuarios (admin)
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      // Esta funcionalidad requeriría implementación adicional
      res.status(501).json({
        success: false,
        error: 'No implementado',
        message: 'Esta funcionalidad no está implementada aún'
      });
    } catch (error) {
      logger.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener estadísticas de administración
  async getAdminStats(req: Request, res: Response): Promise<void> {
    try {
      // Esta funcionalidad requeriría implementación adicional
      res.status(501).json({
        success: false,
        error: 'No implementado',
        message: 'Esta funcionalidad no está implementada aún'
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas de admin:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

export default new UserController();
