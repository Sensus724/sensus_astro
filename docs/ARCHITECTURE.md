# 🏗️ Arquitectura de Sensus

## 📁 Estructura del Proyecto

```
sensus/
├── 📁 src/                          # Frontend (Astro)
│   ├── 📁 components/               # Componentes reutilizables
│   │   ├── 📁 auth/                 # Componentes de autenticación
│   │   ├── 📁 dashboard/            # Componentes del dashboard
│   │   ├── 📁 features/             # Componentes de funcionalidades
│   │   ├── 📁 layout/               # Componentes de layout
│   │   ├── 📁 scalability/          # Componentes de escalabilidad
│   │   ├── 📁 security/             # Componentes de seguridad
│   │   ├── 📁 ui/                   # Componentes de interfaz
│   │   ├── AuthModal.astro          # Modal de autenticación
│   │   ├── ImageGallery.astro       # Galería de imágenes
│   │   ├── LazyLoad.astro           # Carga perezosa
│   │   ├── MonitoringDashboard.astro # Dashboard de monitoreo
│   │   ├── OfflineHandler.astro     # Manejo offline
│   │   ├── OptimizedImage.astro     # Imagen optimizada
│   │   ├── PerformanceDashboard.astro # Dashboard de performance
│   │   ├── PWAInstaller.astro       # Instalador PWA
│   │   ├── PWAStatus.astro          # Estado PWA
│   │   ├── QualityAlerts.astro      # Alertas de calidad
│   │   ├── QualityConfig.astro      # Configuración de calidad
│   │   ├── QualityDashboard.astro   # Dashboard de calidad
│   │   ├── QualityReports.astro     # Reportes de calidad
│   │   ├── SmartCache.astro         # Caché inteligente
│   │   └── ThemeToggle.astro        # Toggle de tema
│   ├── 📁 config/                   # Configuraciones del frontend
│   │   ├── monitoring.ts            # Configuración de monitoreo
│   │   ├── production.ts            # Configuración de producción
│   │   ├── pwa.ts                   # Configuración PWA
│   │   ├── qualityRules.ts          # Reglas de calidad
│   │   └── qualityTools.ts          # Herramientas de calidad
│   ├── 📁 hooks/                     # Hooks personalizados
│   │   └── useAuth.ts               # Hook de autenticación
│   ├── 📁 layouts/                   # Layouts de página
│   │   └── BaseLayout.astro         # Layout base
│   ├── 📁 pages/                     # Páginas de la aplicación
│   │   ├── 📁 api/                   # API routes del frontend
│   │   ├── analytics.astro          # Página de analytics
│   │   ├── ansiedad.astro           # Página de ansiedad
│   │   ├── contacto.astro           # Página de contacto
│   │   ├── dashboard.astro          # Dashboard principal
│   │   ├── diario.astro             # Página del diario
│   │   ├── equipo.astro             # Página del equipo
│   │   ├── evaluacion.astro         # Página de evaluación
│   │   ├── index.astro              # Página principal
│   │   ├── monitoring.astro         # Página de monitoreo
│   │   ├── planes.astro             # Página de planes
│   │   ├── politica-privacidad.astro # Política de privacidad
│   │   ├── scalability.astro        # Página de escalabilidad
│   │   ├── security.astro           # Página de seguridad
│   │   ├── terminos-uso.astro       # Términos de uso
│   │   └── test.astro               # Página de pruebas
│   ├── 📁 services/                  # Servicios del frontend
│   │   └── auth.ts                  # Servicio de autenticación
│   ├── 📁 styles/                    # Estilos CSS
│   │   ├── 📁 components/            # Estilos de componentes
│   │   ├── 📁 layout/                # Estilos de layout
│   │   ├── 📁 pages/                 # Estilos de páginas
│   │   ├── 📁 themes/                # Temas (claro/oscuro)
│   │   ├── 📁 tokens/                # Tokens de diseño
│   │   ├── 📁 utilities/             # Utilidades CSS
│   │   └── main.css                  # CSS principal
│   └── 📁 utils/                     # Utilidades del frontend
├── 📁 backend/                       # Backend (Node.js + Express)
│   ├── 📁 src/                       # Código fuente del backend
│   │   ├── 📁 controllers/           # Controladores de API
│   │   │   ├── diary.controller.ts   # Controlador del diario
│   │   │   ├── evaluation.controller.ts # Controlador de evaluaciones
│   │   │   └── user.controller.ts    # Controlador de usuarios
│   │   ├── 📁 middleware/             # Middleware personalizado
│   │   │   └── auth.middleware.ts    # Middleware de autenticación
│   │   ├── 📁 models/                # Modelos de datos
│   │   ├── 📁 routes/                # Rutas de API
│   │   │   ├── diary.routes.ts       # Rutas del diario
│   │   │   ├── evaluation.routes.ts  # Rutas de evaluaciones
│   │   │   └── user.routes.ts        # Rutas de usuarios
│   │   ├── 📁 services/              # Servicios de negocio
│   │   │   └── firebase.service.ts   # Servicio de Firebase
│   │   ├── 📁 utils/                 # Utilidades del backend
│   │   │   └── logger.util.ts        # Utilidad de logging
│   │   ├── app.ts                    # Aplicación principal
│   │   └── index.ts                  # Punto de entrada
│   ├── 📁 firebase/                  # Configuración de Firebase
│   │   ├── firestore.indexes.json    # Índices de Firestore
│   │   └── firestore.rules           # Reglas de Firestore
│   ├── 📁 logs/                      # Logs del backend
│   ├── package.json                  # Dependencias del backend
│   ├── tsconfig.json                 # Configuración TypeScript
│   └── env.example                   # Variables de entorno ejemplo
├── 📁 config/                        # Configuraciones del proyecto
│   ├── 📁 docker/                    # Configuración Docker
│   │   ├── Dockerfile.backend        # Dockerfile del backend
│   │   ├── Dockerfile.frontend       # Dockerfile del frontend
│   │   ├── docker-compose.dev.yml    # Docker Compose desarrollo
│   │   └── docker-compose.prod.yml  # Docker Compose producción
│   ├── 📁 k8s/                       # Configuración Kubernetes
│   │   ├── configmap.yaml            # ConfigMap
│   │   ├── deployment.yaml           # Deployment
│   │   ├── hpa.yaml                  # Horizontal Pod Autoscaler
│   │   ├── ingress.yaml              # Ingress
│   │   ├── namespace.yaml            # Namespace
│   │   ├── secret.yaml               # Secret
│   │   └── service.yaml              # Service
│   ├── 📁 nginx/                     # Configuración Nginx
│   │   └── nginx.conf                # Configuración Nginx
│   ├── 📁 monitoring/                # Configuración de monitoreo
│   │   ├── 📁 grafana/               # Configuración Grafana
│   │   └── prometheus.yml            # Configuración Prometheus
│   └── env.example                   # Variables de entorno ejemplo
├── 📁 docs/                          # Documentación
│   └── ARCHITECTURE.md               # Este archivo
├── 📁 tests/                         # Tests
│   ├── 📁 e2e/                       # Tests end-to-end
│   ├── 📁 integration/               # Tests de integración
│   ├── 📁 performance/               # Tests de performance
│   ├── 📁 unit/                      # Tests unitarios
│   ├── contact.test.js               # Test de contacto
│   ├── diary.test.js                 # Test del diario
│   ├── evaluation.test.js            # Test de evaluaciones
│   ├── homepage.test.js              # Test de página principal
│   ├── plans.test.js                 # Test de planes
│   ├── team.test.js                  # Test del equipo
│   └── test-page.test.js             # Test de página de pruebas
├── 📁 scripts/                       # Scripts de automatización
│   ├── deploy.ps1                    # Script de despliegue PowerShell
│   ├── deploy.sh                     # Script de despliegue Bash
│   └── k8s-deploy.sh                 # Script de despliegue K8s
├── 📁 public/                        # Archivos estáticos
│   ├── 📁 assets/                    # Assets estáticos
│   ├── 📁 js/                        # JavaScript del frontend
│   ├── favicon.svg                   # Favicon
│   ├── manifest.json                 # Manifest PWA
│   ├── robots.txt                    # Robots.txt
│   ├── sitemap.xml                   # Sitemap
│   └── sw.js                         # Service Worker
├── 📁 cypress/                       # Configuración Cypress
│   ├── 📁 support/                   # Soporte de Cypress
│   └── cypress.config.js             # Configuración Cypress
├── 📁 dist/                          # Build de producción (generado)
├── 📁 node_modules/                  # Dependencias (generado)
├── 📁 .gitignore                     # Archivos ignorados por Git
├── 📁 .env                           # Variables de entorno (no versionado)
├── 📁 .env.local                     # Variables de entorno locales
├── 📁 app.json                       # Configuración de aplicación
├── 📁 astro.config.mjs               # Configuración Astro
├── 📁 axe.config.js                  # Configuración Axe (accesibilidad)
├── 📁 commitlint.config.js           # Configuración Commitlint
├── 📁 cypress.config.js              # Configuración Cypress
├── 📁 firebase.json                  # Configuración Firebase
├── 📁 firestore.indexes.json         # Índices de Firestore
├── 📁 firestore.rules                # Reglas de Firestore
├── 📁 jest.config.js                 # Configuración Jest
├── 📁 lighthouse.config.js           # Configuración Lighthouse
├── 📁 nginx.conf                     # Configuración Nginx
├── 📁 package.json                   # Dependencias del proyecto
├── 📁 package-lock.json              # Lock de dependencias
├── 📁 Procfile                       # Configuración Heroku
├── 📁 production.env                 # Variables de entorno producción
├── 📁 prometheus.yml                 # Configuración Prometheus
├── 📁 README.md                      # Documentación principal
├── 📁 redis.conf                     # Configuración Redis
├── 📁 renovate.json                  # Configuración Renovate
├── 📁 sonar-project.properties       # Configuración SonarQube
├── 📁 storage.rules                  # Reglas de Firebase Storage
└── 📁 tsconfig.json                  # Configuración TypeScript
```

## 🎯 **Propósito de cada archivo/carpeta**

### 📁 **Frontend (src/)**
- **components/**: Componentes reutilizables de Astro
- **config/**: Configuraciones específicas del frontend
- **hooks/**: Hooks personalizados de React/Vue
- **layouts/**: Layouts base para las páginas
- **pages/**: Páginas de la aplicación (routing automático)
- **services/**: Servicios del frontend (API calls, etc.)
- **styles/**: Estilos CSS organizados por categorías
- **utils/**: Utilidades y helpers del frontend

### 📁 **Backend (backend/)**
- **src/controllers/**: Lógica de negocio para cada endpoint
- **src/middleware/**: Middleware personalizado (auth, validation, etc.)
- **src/models/**: Modelos de datos y esquemas
- **src/routes/**: Definición de rutas de API
- **src/services/**: Servicios de negocio (Firebase, email, etc.)
- **src/utils/**: Utilidades del backend (logger, helpers, etc.)
- **firebase/**: Configuración específica de Firebase

### 📁 **Configuración (config/)**
- **docker/**: Configuración de contenedores
- **k8s/**: Configuración de Kubernetes
- **nginx/**: Configuración del proxy reverso
- **monitoring/**: Configuración de monitoreo

### 📁 **Tests (tests/)**
- **e2e/**: Tests end-to-end con Cypress
- **integration/**: Tests de integración
- **performance/**: Tests de rendimiento
- **unit/**: Tests unitarios

### 📁 **Scripts (scripts/)**
- Scripts de automatización para despliegue
- Scripts de desarrollo y mantenimiento

### 📁 **Documentación (docs/)**
- Documentación técnica del proyecto
- Guías de desarrollo y despliegue

## 🔧 **Archivos de configuración principales**

| Archivo | Propósito |
|---------|-----------|
| `package.json` | Dependencias y scripts del proyecto |
| `astro.config.mjs` | Configuración de Astro |
| `tsconfig.json` | Configuración de TypeScript |
| `firebase.json` | Configuración de Firebase |
| `docker-compose.yml` | Configuración de Docker |
| `nginx.conf` | Configuración del proxy reverso |
| `prometheus.yml` | Configuración de monitoreo |
| `.env` | Variables de entorno |

## 🚀 **Flujo de desarrollo**

1. **Frontend**: `src/` → Build → `dist/`
2. **Backend**: `backend/src/` → Build → `backend/dist/`
3. **Docker**: `config/docker/` → Imágenes → Contenedores
4. **K8s**: `config/k8s/` → Despliegue → Cluster
5. **Tests**: `tests/` → Ejecución → Reportes

## 📊 **Métricas y monitoreo**

- **Prometheus**: Métricas de aplicación y sistema
- **Grafana**: Dashboards y visualización
- **Lighthouse**: Métricas de performance web
- **Axe**: Métricas de accesibilidad
- **SonarQube**: Métricas de calidad de código
