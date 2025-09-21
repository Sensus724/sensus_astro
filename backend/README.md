# Sensus Backend

Backend API para la aplicación de bienestar mental Sensus, construido con Node.js, TypeScript y Firebase.

## 🚀 Características

- **API RESTful** completa para gestión de usuarios, diario y evaluaciones
- **Autenticación** con Firebase Auth
- **Base de datos NoSQL** con Firestore
- **Encriptación** de datos sensibles
- **Validación** robusta de datos
- **Logging** estructurado
- **Rate limiting** y seguridad
- **Documentación** completa de API

## 📋 Requisitos

- Node.js 18+
- npm o yarn
- Cuenta de Firebase
- Variables de entorno configuradas

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd sensus-astro-1/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus credenciales de Firebase
```

4. **Compilar TypeScript**
```bash
npm run build
```

5. **Iniciar el servidor**
```bash
npm start
```

## 🔧 Desarrollo

### Scripts disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar tests
npm test

# Linting
npm run lint

# Deploy a Firebase
npm run deploy
```

### Estructura del proyecto

```
backend/
├── src/
│   ├── controllers/     # Controladores de API
│   ├── services/        # Lógica de negocio
│   ├── models/          # Modelos de datos
│   ├── middleware/      # Middleware personalizado
│   ├── utils/           # Utilidades
│   ├── routes/          # Definición de rutas
│   ├── app.ts           # Configuración de Express
│   └── index.ts         # Punto de entrada
├── firebase/
│   ├── firestore.rules  # Reglas de seguridad
│   └── firestore.indexes.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Variables de Entorno

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com

# Server Configuration
PORT=3000
NODE_ENV=development
API_VERSION=v1

# Security
JWT_SECRET=tu-secreto-jwt-super-seguro
ENCRYPTION_KEY=tu-clave-de-encriptacion-32-caracteres

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:4321
```

## 📚 API Endpoints

### Autenticación
- `POST /api/v1/users/create` - Crear usuario
- `GET /api/v1/users/profile` - Obtener perfil
- `PUT /api/v1/users/profile` - Actualizar perfil

### Diario
- `POST /api/v1/diary` - Crear entrada
- `GET /api/v1/diary` - Obtener entradas
- `GET /api/v1/diary/:id` - Obtener entrada específica
- `PUT /api/v1/diary/:id` - Actualizar entrada
- `DELETE /api/v1/diary/:id` - Eliminar entrada
- `GET /api/v1/diary/stats` - Estadísticas del diario
- `GET /api/v1/diary/search` - Buscar entradas

### Evaluaciones
- `POST /api/v1/evaluations` - Crear evaluación
- `GET /api/v1/evaluations` - Obtener evaluaciones
- `GET /api/v1/evaluations/:id` - Obtener evaluación específica
- `GET /api/v1/evaluations/stats` - Estadísticas de evaluaciones
- `GET /api/v1/evaluations/latest/:testType` - Última evaluación
- `GET /api/v1/evaluations/compare/:testType` - Comparar evaluaciones

### Sistema
- `GET /health` - Estado del servidor
- `GET /api/info` - Información de la API

## 🔒 Seguridad

- **Autenticación** con Firebase Auth
- **Autorización** con reglas de Firestore
- **Encriptación** de datos sensibles
- **Rate limiting** para prevenir abuso
- **Validación** de datos de entrada
- **CORS** configurado
- **Helmet** para headers de seguridad

## 📊 Base de Datos

### Colecciones principales

- `users` - Perfiles de usuario
- `diary_entries` - Entradas del diario
- `evaluations` - Evaluaciones psicológicas
- `exercise_sessions` - Sesiones de ejercicios
- `wellness_plans` - Planes de bienestar
- `notifications` - Notificaciones
- `analytics` - Datos analíticos
- `public_content` - Contenido público

### Índices optimizados

- Consultas por usuario y fecha
- Filtros por tipo de contenido
- Búsquedas por etiquetas
- Ordenamiento por relevancia

## 🚀 Deploy

### Firebase Functions

```bash
# Deploy completo
npm run deploy

# Solo reglas de Firestore
npm run deploy:rules

# Solo índices
npm run deploy:indexes
```

### Variables de entorno en producción

Asegúrate de configurar todas las variables de entorno en tu plataforma de deploy:

- Firebase credentials
- JWT secret
- Encryption key
- CORS origin
- Rate limiting settings

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📝 Logging

El sistema utiliza Winston para logging estructurado:

- **Console** en desarrollo
- **Archivos** en producción
- **Niveles** configurables
- **Formato** JSON estructurado

## 🔧 Configuración

### TypeScript

Configuración optimizada en `tsconfig.json`:
- Strict mode habilitado
- Path mapping configurado
- Source maps para debugging
- Declaraciones generadas

### ESLint

Configuración de linting en `.eslintrc.js`:
- Reglas de TypeScript
- Estilo de código consistente
- Detección de errores comunes

## 📈 Monitoreo

### Métricas recomendadas

- Tiempo de respuesta de API
- Tasa de errores
- Uso de memoria y CPU
- Conexiones a Firebase
- Rate limiting hits

### Alertas

Configura alertas para:
- Errores 5xx
- Tiempo de respuesta > 2s
- Uso de memoria > 80%
- Fallos de conexión a Firebase

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de Firebase

## 🔄 Changelog

### v1.0.0
- Implementación inicial
- API completa para usuarios, diario y evaluaciones
- Autenticación con Firebase
- Encriptación de datos sensibles
- Sistema de logging
- Reglas de seguridad de Firestore
