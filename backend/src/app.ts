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
    // Configuración de seguridad básica
    this.app.use(helmet());

    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:4321',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Compresión
    this.app.use(compression());

    // Rate limiting básico
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // límite por IP
      message: {
        success: false,
        error: 'Demasiadas solicitudes',
        message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.'
      }
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
    // Ruta de salud básica
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
      });
    });

    // Ruta de información de la API
    this.app.get('/api/info', (req, res) => {
      res.json({
        success: true,
        data: {
          name: 'Sensus Backend API',
          version: '1.0.0',
          description: 'API para la aplicación de bienestar mental Sensus',
          endpoints: {
            health: '/health',
            users: '/api/v1/users',
            diary: '/api/v1/diary',
            evaluations: '/api/v1/evaluations'
          }
        }
      });
    });

    // Rutas de la API
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/diary', diaryRoutes);
    this.app.use('/api/v1/evaluations', evaluationRoutes);

    // Ruta 404 para endpoints no encontrados
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado',
        message: `La ruta ${req.originalUrl} no existe`
      });
    });
  }

  private initializeErrorHandling(): void {
    // Middleware de manejo de errores
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Error no manejado:', error);

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
