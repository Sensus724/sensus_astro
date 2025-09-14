# 📁 Estructura del Proyecto Sensus

## 🎯 Organización Profesional del Proyecto

Este documento describe la estructura de carpetas y archivos del proyecto Sensus, una aplicación web de salud mental con credibilidad científica.

---

## 📂 Estructura de Carpetas

### 🏠 **Raíz del Proyecto**
```
sensus-app/
├── 📄 index.html                    # Página principal
├── 📄 manifest.json                 # PWA Manifest
├── 📄 sw.js                        # Service Worker
├── 📄 firebase.json                # Configuración Firebase
├── 📄 firestore.rules              # Reglas Firestore
├── 📄 firestore.indexes.json       # Índices Firestore
├── 📄 storage.rules                # Reglas Storage
├── 📄 README.md                    # Documentación principal
├── 📄 ESTRUCTURA_PROYECTO.md       # Este archivo
└── 📄 DEPLOYMENT.md                # Guía de despliegue
```

### 🌐 **Páginas Web** (`/pages/`)
```
pages/
├── 📄 ansiedad.html                # Síntomas y tipos de ansiedad
├── 📄 app.html                     # Aplicación principal
├── 📄 contacto.html                # Página de contacto
├── 📄 diario.html                  # Diario emocional
├── 📄 equipo.html                  # Equipo y comité científico
├── 📄 evaluacion.html              # Evaluaciones psicológicas
├── 📄 perfil.html                  # Perfil de usuario
├── 📄 planes.html                  # Planes de suscripción
├── 📄 politica-privacidad.html     # Política de privacidad
├── 📄 terminos-uso.html            # Términos de uso
├── 📄 test.html                    # Test GAD-7
├── 📄 test-responsive.html         # Test de responsive
├── 📄 index-optimized.html         # Versión optimizada del index
└── 📄 setup-database.html          # Configuración de base de datos
```

### 🎨 **Estilos CSS** (`/css/`)
```
css/
├── 📄 styles.css                   # Estilos principales
├── 📄 styles.min.css               # Estilos minificados
├── 📄 app.css                      # Estilos de la aplicación
├── 📄 responsive.css               # Estilos responsivos
├── 📄 responsive.min.css           # Responsive minificado
├── 📄 responsive-optimized.css     # Responsive optimizado
├── 📄 credibility-improvements.css # Mejoras de credibilidad
├── 📄 mobile-professional.css      # Estilos móviles profesionales
├── 📄 image-optimizations.css      # Optimizaciones de imágenes
└── 📄 touch-interactions.css       # Interacciones táctiles
```

### ⚡ **JavaScript** (`/js/`)
```
js/
├── 📄 script.js                    # Script principal
├── 📄 script.min.js                # Script minificado
├── 📁 modules/                     # Módulos JavaScript
│   ├── 📄 firebase-config.js       # Configuración Firebase
│   ├── 📄 auth.js                  # Autenticación
│   ├── 📄 auth-simple.js           # Autenticación simple
│   ├── 📄 database-setup.js        # Configuración BD
│   ├── 📄 storage.js               # Gestión de almacenamiento
│   ├── 📄 encryption.js            # Encriptación
│   ├── 📄 analytics.js             # Analytics
│   ├── 📄 notifications.js         # Notificaciones
│   ├── 📄 visitor-counter.js       # Contador de visitas
│   ├── 📄 responsive.js            # Responsive
│   ├── 📄 responsive-optimizer.js  # Optimizador responsive
│   ├── 📄 cross-browser-compatibility.js # Compatibilidad
│   ├── 📄 touch-interactions.js    # Interacciones táctiles
│   ├── 📄 image-optimizer.js       # Optimizador de imágenes
│   ├── 📄 test.js                  # Tests
│   ├── 📄 test-modal.js            # Modal de tests
│   ├── 📄 test-questions.js        # Preguntas de tests
│   ├── 📄 gad7-test.js             # Test GAD-7
│   ├── 📄 diario.js                # Diario emocional
│   ├── 📄 journal.js               # Journal
│   └── 📄 user-profile.js          # Perfil de usuario
├── 📁 pages/                       # Scripts específicos de páginas
└── 📁 utils/                       # Utilidades JavaScript
```

### 🖼️ **Recursos** (`/assets/`)
```
assets/
├── 📁 images/                      # Imágenes del proyecto
│   ├── 🖼️ Logo.jpeg                # Logo principal
│   ├── 🖼️ Calma.jpeg               # Imagen de calma
│   ├── 🖼️ calma 2.jpeg             # Imagen de calma 2
│   ├── 🖼️ calma 3.jpeg             # Imagen de calma 3
│   ├── 🖼️ Calma 4.jpeg             # Imagen de calma 4
│   ├── 🖼️ calma 5.jpeg             # Imagen de calma 5
│   └── 🖼️ calma 6.jpeg             # Imagen de calma 6
├── 📁 icons/                       # Iconos
│   └── 🖼️ favicon.ico              # Favicon
└── 📁 fonts/                       # Fuentes personalizadas
```

### 📊 **Datos** (`/data/`)
```
data/
├── 📄 stats.json                   # Estadísticas del proyecto
└── 📄 test-users.json              # Datos de usuarios de prueba
```

### 🔧 **Funciones Firebase** (`/functions/`)
```
functions/
├── 📄 index.js                     # Funciones principales
├── 📄 package.json                 # Dependencias
├── 📄 package-lock.json            # Lock de dependencias
└── 📁 node_modules/                # Módulos Node.js
```

### 📚 **Documentación** (`/docs/`)
```
docs/
├── 📄 OPTIMIZACION_RESPONSIVE.md   # Guía de optimización responsive
└── 📄 [otros documentos técnicos]  # Documentación adicional
```

### 🗂️ **Módulos** (`/modules/`)
```
modules/
└── 📁 [módulos adicionales]        # Módulos del proyecto
```

---

## 🎯 **Principios de Organización**

### 1. **Separación por Funcionalidad**
- **Páginas HTML** → `/pages/`
- **Estilos CSS** → `/css/`
- **Scripts JS** → `/js/`
- **Recursos** → `/assets/`

### 2. **Jerarquía Clara**
- **Archivos principales** en la raíz
- **Configuración** en la raíz
- **Contenido** en carpetas específicas

### 3. **Nomenclatura Consistente**
- **Archivos minificados** → `.min.js`, `.min.css`
- **Archivos optimizados** → `-optimized`
- **Archivos de credibilidad** → `credibility-`

### 4. **Documentación Integrada**
- **README.md** → Información general
- **ESTRUCTURA_PROYECTO.md** → Este archivo
- **DEPLOYMENT.md** → Guía de despliegue

---

## 🚀 **Beneficios de esta Estructura**

### ✅ **Mantenibilidad**
- Fácil localización de archivos
- Separación clara de responsabilidades
- Estructura escalable

### ✅ **Colaboración**
- Estructura estándar de la industria
- Fácil onboarding de nuevos desarrolladores
- Documentación clara

### ✅ **Despliegue**
- Configuración Firebase clara
- Archivos de configuración en raíz
- Estructura compatible con hosting

### ✅ **Desarrollo**
- Módulos JavaScript organizados
- Estilos CSS categorizados
- Recursos bien estructurados

---

## 📋 **Checklist de Migración**

### ✅ **Archivos a Mover**
- [ ] Mover páginas HTML a `/pages/`
- [ ] Organizar CSS por funcionalidad
- [ ] Estructurar módulos JavaScript
- [ ] Categorizar recursos en `/assets/`

### ✅ **Actualizar Referencias**
- [ ] Actualizar rutas en HTML
- [ ] Corregir imports en CSS
- [ ] Ajustar rutas en JavaScript
- [ ] Verificar configuración Firebase

### ✅ **Documentación**
- [ ] Crear este archivo de estructura
- [ ] Actualizar README.md
- [ ] Documentar cambios de rutas

---

## 🔧 **Comandos de Migración**

```bash
# Crear estructura de carpetas
mkdir pages css js assets data docs modules

# Mover archivos (ejemplos)
mv *.html pages/
mv css/* css/
mv js/* js/
mv assets/* assets/
```

---

## 📞 **Soporte**

Para cualquier duda sobre la estructura del proyecto, consultar:
- **README.md** - Información general
- **DEPLOYMENT.md** - Guía de despliegue
- **Este archivo** - Estructura detallada

---

*Última actualización: Enero 2025*
*Versión: 1.0*
