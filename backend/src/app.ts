import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Importar servicios
import FirebaseService from './services/firebase.service';
import { logger } from './utils/logger.util';

// Importar rutas
import diaryRoutes from './routes/diary.routes';
import evaluationRoutes from './routes/evaluation.routes';
import userRoutes from './routes/user.routes';

// Cargar variables de entorno
dotenv.config();

class App {
  public app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Configuración de seguridad
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:4321',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Compresión
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // límite por IP
      message: {
        success: false,
        error: 'Demasiadas solicitudes',
        message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Parseo de JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging de requests
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Ruta de salud
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Sensus Backend está funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Ruta de información de la API
    this.app.get('/api/info', (req, res) => {
      res.status(200).json({
        success: true,
        data: {
          name: 'Sensus Backend API',
          version: '1.0.0',
          description: 'API para la aplicación de bienestar mental Sensus',
          endpoints: {
            health: '/health',
            info: '/api/info',
            users: '/api/v1/users',
            diary: '/api/v1/diary',
            evaluations: '/api/v1/evaluations'
          },
          documentation: 'https://docs.sensus.app/api'
        }
      });
    });

    // Rutas de la API
    const apiVersion = process.env.API_VERSION || 'v1';
    this.app.use(`/api/${apiVersion}/users`, userRoutes);
    this.app.use(`/api/${apiVersion}/diary`, diaryRoutes);
    this.app.use(`/api/${apiVersion}/evaluations`, evaluationRoutes);

    // Ruta 404 para endpoints no encontrados
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado',
        message: `La ruta ${req.originalUrl} no existe`,
        availableEndpoints: [
          '/health',
          '/api/info',
          `/api/${apiVersion}/users`,
          `/api/${apiVersion}/diary`,
          `/api/${apiVersion}/evaluations`
        ]
      });
    });
  }

  private initializeErrorHandling(): void {
    // Middleware de manejo de errores
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Error no manejado:', error);

      // Error de validación
      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          error: 'Error de validación',
          message: error.message,
          details: error.details
        });
        return;
      }

      // Error de Firebase
      if (error.code && error.code.startsWith('firebase/')) {
        res.status(400).json({
          success: false,
          error: 'Error de Firebase',
          message: 'Error en la base de datos',
          code: error.code
        });
        return;
      }

      // Error de autenticación
      if (error.name === 'UnauthorizedError') {
        res.status(401).json({
          success: false,
          error: 'No autorizado',
          message: 'Token de autenticación inválido o expirado'
        });
        return;
      }

      // Error genérico
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'production' 
          ? 'Ha ocurrido un error interno' 
          : error.message
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Verificar conexión a Firebase
      const isConnected = await FirebaseService.testConnection();
      if (!isConnected) {
        throw new Error('No se pudo conectar a Firebase');
      }

      // Iniciar servidor
      this.app.listen(this.port, () => {
        logger.info(`🚀 Servidor iniciado en puerto ${this.port}`);
        logger.info(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`🔗 URL: http://localhost:${this.port}`);
        logger.info(`📚 API: http://localhost:${this.port}/api/info`);
        logger.info(`❤️  Salud: http://localhost:${this.port}/health`);
      });
    } catch (error) {
      logger.error('Error iniciando servidor:', error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Crear e iniciar la aplicación
const app = new App();

// Manejar cierre graceful
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

export default app;
