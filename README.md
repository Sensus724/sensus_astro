# 🧠 Sensus - Aplicación de Bienestar Mental

> Tu compañero inteligente para la calma. Test GAD-7 gratuito, diario emocional encriptado y recursos profesionales respaldados por la ciencia.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue)](https://www.typescriptlang.org/)
[![Astro](https://img.shields.io/badge/Astro-4.5+-orange)](https://astro.build/)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [API](#-api)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

### 🧠 Evaluación GAD-7
- Test de ansiedad validado científicamente
- Resultados inmediatos y personalizados
- Seguimiento del progreso a lo largo del tiempo

### 📖 Diario Emocional
- Entradas encriptadas end-to-end
- Análisis de patrones emocionales
- Estadísticas y tendencias

### 🔒 Privacidad y Seguridad
- Encriptación end-to-end
- Cumplimiento GDPR
- Sin venta de datos personales

### 📱 PWA (Progressive Web App)
- Funciona offline
- Instalable en dispositivos
- Notificaciones push

## 🛠 Tecnologías

### Frontend
- **Astro** - Framework web moderno
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS
- **PWA** - Aplicación web progresiva

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **TypeScript** - Tipado estático
- **Firebase** - Base de datos y autenticación

### DevOps
- **Docker** - Contenedores
- **Kubernetes** - Orquestación
- **Nginx** - Proxy reverso
- **Prometheus + Grafana** - Monitoreo

## 🚀 Instalación

### Prerrequisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker (opcional)
- Cuenta de Firebase

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sensus.git
cd sensus
```

### 2. Instalar dependencias
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp config/env.example .env

# Editar variables
nano .env
```

### 4. Configurar Firebase
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Firestore Database
3. Configurar Authentication
4. Obtener credenciales de servicio

## ⚙️ Configuración

### Variables de Entorno Requeridas

```env
# Aplicación
NODE_ENV=development
PORT=3000

# Firebase
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=tu-servicio@tu-proyecto.iam.gserviceaccount.com

# Autenticación
JWT_SECRET=tu-secreto-jwt-super-seguro
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:4321
```

### Configuración de Firebase

1. **Firestore Database**
   - Crear base de datos
   - Configurar reglas de seguridad
   - Crear índices necesarios

2. **Authentication**
   - Habilitar Email/Password
   - Configurar dominios autorizados

3. **Storage**
   - Configurar bucket de almacenamiento
   - Establecer reglas de acceso

## 🛠 Desarrollo

### Iniciar en modo desarrollo

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
npm run dev
```

### Estructura del proyecto

```
sensus/
├── src/                    # Frontend (Astro)
│   ├── components/         # Componentes reutilizables
│   ├── layouts/           # Layouts de página
│   ├── pages/             # Páginas de la aplicación
│   ├── styles/            # Estilos CSS
│   └── utils/             # Utilidades
├── backend/               # Backend (Node.js)
│   ├── src/
│   │   ├── controllers/   # Controladores de API
│   │   ├── middleware/     # Middleware personalizado
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas de API
│   │   ├── services/       # Servicios de negocio
│   │   └── utils/          # Utilidades
│   └── dist/              # Código compilado
├── config/                # Configuraciones
│   ├── docker/           # Docker y Docker Compose
│   ├── k8s/              # Kubernetes
│   ├── nginx/            # Configuración Nginx
│   └── monitoring/       # Prometheus y Grafana
└── tests/                # Tests
```

### Scripts disponibles

```bash
# Frontend
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa de producción
npm run test         # Ejecutar tests

# Backend
cd backend
npm run dev          # Servidor de desarrollo
npm run build        # Compilar TypeScript
npm run start        # Iniciar en producción
npm run test         # Ejecutar tests
```

## 🐳 Despliegue

### Docker

```bash
# Desarrollo
docker-compose -f config/docker/docker-compose.dev.yml up

# Producción
docker-compose -f config/docker/docker-compose.prod.yml up -d
```

### Kubernetes

```bash
# Aplicar configuraciones
kubectl apply -f config/k8s/

# Verificar despliegue
kubectl get pods
kubectl get services
```

### Variables de entorno para producción

```env
NODE_ENV=production
PORT=3000
FIREBASE_PROJECT_ID=tu-proyecto-prod
JWT_SECRET=secreto-super-seguro-produccion
CORS_ORIGIN=https://sensus.app
```

## 📚 API

### Endpoints principales

#### Autenticación
- `POST /api/v1/users/register` - Registrar usuario
- `POST /api/v1/users/login` - Iniciar sesión
- `GET /api/v1/users/profile` - Obtener perfil

#### Diario
- `POST /api/v1/diary` - Crear entrada
- `GET /api/v1/diary` - Obtener entradas
- `GET /api/v1/diary/stats` - Estadísticas

#### Evaluaciones
- `POST /api/v1/evaluations` - Crear evaluación GAD-7
- `GET /api/v1/evaluations` - Obtener evaluaciones
- `GET /api/v1/evaluations/stats` - Estadísticas

### Ejemplo de uso

```javascript
// Crear entrada del diario
const response = await fetch('/api/v1/diary', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer tu-jwt-token'
  },
  body: JSON.stringify({
    content: 'Me siento ansioso hoy',
    mood: 3,
    tags: ['ansiedad', 'trabajo']
  })
});
```

## 🧪 Testing

### Ejecutar tests

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Tests de integración
npm run test:integration
```

### Cobertura de tests

```bash
npm run test:coverage
```

## 📊 Monitoreo

### Prometheus
- URL: http://localhost:9090
- Métricas de aplicación y sistema

### Grafana
- URL: http://localhost:3001
- Dashboards de monitoreo
- Usuario: admin
- Contraseña: configurada en GRAFANA_PASSWORD

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Guías de contribución

- Seguir convenciones de código
- Escribir tests para nuevas funcionalidades
- Actualizar documentación
- Respetar el código de conducta

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

- 📧 Email: soporte@sensus.app
- 💬 Discord: [Servidor de Sensus](https://discord.gg/sensus)
- 📖 Documentación: [docs.sensus.app](https://docs.sensus.app)
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/sensus/issues)

## 🙏 Agradecimientos

- Universidad de Warwick (validación GAD-7)
- Mayo Clinic (implementación clínica)
- NHS UK (protocolo de salud mental)
- NIMH (investigación en ansiedad)

---

**Hecho con ❤️ para mejorar la salud mental de todos**
