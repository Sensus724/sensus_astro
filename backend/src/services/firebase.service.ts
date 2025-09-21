import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';
import { logger } from '../utils/logger.util';

class FirebaseService {
  private app: App | null = null;
  private db: Firestore | null = null;
  private auth: Auth | null = null;
  private storage: Storage | null = null;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      // Verificar si ya existe una app inicializada
      if (getApps().length === 0) {
        this.app = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
          storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
        });

        this.db = getFirestore(this.app);
        this.auth = getAuth(this.app);
        this.storage = getStorage(this.app);

        logger.info('Firebase inicializado correctamente');
      } else {
        // Usar la app existente
        this.app = getApps()[0];
        this.db = getFirestore(this.app);
        this.auth = getAuth(this.app);
        this.storage = getStorage(this.app);
        
        logger.info('Firebase ya estaba inicializado');
      }
    } catch (error) {
      logger.error('Error inicializando Firebase:', error);
      throw new Error('No se pudo inicializar Firebase');
    }
  }

  getFirestore(): Firestore {
    if (!this.db) {
      throw new Error('Firestore no está inicializado');
    }
    return this.db;
  }

  getAuth(): Auth {
    if (!this.auth) {
      throw new Error('Firebase Auth no está inicializado');
    }
    return this.auth;
  }

  getStorage(): Storage {
    if (!this.storage) {
      throw new Error('Firebase Storage no está inicializado');
    }
    return this.storage;
  }

  getApp(): App {
    if (!this.app) {
      throw new Error('Firebase App no está inicializado');
    }
    return this.app;
  }

  // Método para verificar la conexión
  async testConnection(): Promise<boolean> {
    try {
      const db = this.getFirestore();
      await db.collection('_test').doc('connection').get();
      logger.info('Conexión a Firestore verificada');
      return true;
    } catch (error) {
      logger.error('Error verificando conexión a Firestore:', error);
      return false;
    }
  }

  // Método para obtener información del proyecto
  getProjectInfo(): { projectId: string; storageBucket: string } {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    };
  }
}

// Exportar instancia singleton
export default new FirebaseService();
