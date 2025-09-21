#!/usr/bin/env node

import app from './app';
import { logger } from './utils/logger.util';

// Iniciar la aplicación
app.start().catch((error) => {
  logger.error('Error fatal iniciando la aplicación:', error);
  process.exit(1);
});
