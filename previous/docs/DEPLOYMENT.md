# 🚀 Guía de Despliegue - Sensus

## 📋 Requisitos Previos

1. **Node.js** (versión 18 o superior)
2. **Firebase CLI** instalado globalmente
3. **Cuenta de Firebase** con proyecto creado
4. **Git** para control de versiones

## 🔧 Configuración Inicial

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Iniciar sesión en Firebase
```bash
firebase login
```

### 3. Inicializar proyecto Firebase
```bash
firebase init
```

Selecciona las siguientes opciones:
- ✅ Firestore
- ✅ Functions
- ✅ Hosting
- ✅ Storage

### 4. Configurar proyecto
```bash
firebase use --add
# Selecciona tu proyecto: sensus-version-pro
```

## 🔐 Configuración de Seguridad

### 1. Configurar App Check
1. Ve a Firebase Console > App Check
2. Registra tu app web
3. Configura reCAPTCHA v3
4. Obtén la clave del sitio

### 2. Configurar VAPID Key para FCM
1. Ve a Firebase Console > Project Settings > Cloud Messaging
2. Genera una nueva clave VAPID
3. Actualiza la clave en `js/modules/notifications.js`

### 3. Configurar región de Europa
1. Ve a Firebase Console > Functions
2. Configura la región como `europe-west1`

## 📦 Instalación de Dependencias

### 1. Instalar dependencias de Cloud Functions
```bash
cd functions
npm install
cd ..
```

### 2. Instalar dependencias del proyecto (si usas npm)
```bash
npm install
```

## 🚀 Despliegue

### 1. Desplegar reglas de seguridad
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 2. Desplegar Cloud Functions
```bash
firebase deploy --only functions
```

### 3. Desplegar hosting
```bash
firebase deploy --only hosting
```

### 4. Desplegar todo
```bash
firebase deploy
```

## 🔧 Configuración Post-Despliegue

### 1. Configurar índices de Firestore
```bash
firebase deploy --only firestore:indexes
```

### 2. Verificar configuración
1. Ve a Firebase Console > Authentication
2. Habilita Email/Password y Google Sign-In
3. Configura dominios autorizados

### 3. Configurar Analytics
1. Ve a Firebase Console > Analytics
2. Habilita Google Analytics
3. Configura eventos personalizados

## 📱 Configuración de PWA

### 1. Actualizar manifest.json
```json
{
  "name": "Sensus - Tu Compañero para la Calma",
  "short_name": "Sensus",
  "description": "Tu compañero inteligente para la calma",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#d7cdf2",
  "icons": [
    {
      "src": "assets/images/Logo.jpeg",
      "sizes": "192x192",
      "type": "image/jpeg"
    }
  ]
}
```

### 2. Configurar Service Worker
El service worker ya está configurado en `sw.js`

## 🔍 Verificación

### 1. Verificar autenticación
- [ ] Registro con email funciona
- [ ] Login con Google funciona
- [ ] Login anónimo funciona
- [ ] Redirección a app.html funciona

### 2. Verificar test GAD-7
- [ ] Test se renderiza correctamente
- [ ] Puntuación se calcula correctamente
- [ ] Resultados se guardan en Firestore
- [ ] Interpretación personalizada se muestra

### 3. Verificar diario
- [ ] Diario se renderiza correctamente
- [ ] Selección de emociones funciona
- [ ] Encriptación AES-256 funciona
- [ ] Entradas se guardan en Firestore

### 4. Verificar notificaciones
- [ ] Permisos se solicitan correctamente
- [ ] Token FCM se genera
- [ ] Notificaciones se envían

### 5. Verificar responsive
- [ ] Funciona en móvil (iPhone 14, Pixel 7)
- [ ] Funciona en tablet (iPad)
- [ ] Funciona en escritorio
- [ ] Botones tienen mínimo 48px de alto

## 🛡️ Seguridad

### 1. Verificar reglas de Firestore
```bash
firebase firestore:rules:test
```

### 2. Verificar reglas de Storage
```bash
firebase storage:rules:test
```

### 3. Verificar App Check
- [ ] reCAPTCHA v3 configurado
- [ ] App Check habilitado en producción

## 📊 Monitoreo

### 1. Verificar logs
```bash
firebase functions:log
```

### 2. Verificar métricas
- Firebase Console > Analytics
- Firebase Console > Performance
- Firebase Console > Crashlytics

## 🔄 Actualizaciones

### 1. Actualizar Cloud Functions
```bash
cd functions
npm update
firebase deploy --only functions
```

### 2. Actualizar hosting
```bash
firebase deploy --only hosting
```

### 3. Actualizar reglas
```bash
firebase deploy --only firestore:rules,storage:rules
```

## 🚨 Solución de Problemas

### 1. Error de CORS
- Verificar configuración de dominios autorizados
- Verificar headers de seguridad

### 2. Error de autenticación
- Verificar configuración de Firebase
- Verificar reglas de Firestore

### 3. Error de notificaciones
- Verificar VAPID key
- Verificar permisos del navegador

### 4. Error de encriptación
- Verificar que el navegador soporte Web Crypto API
- Verificar que se use HTTPS en producción

## 📞 Soporte

Para problemas técnicos:
1. Revisar logs de Firebase Console
2. Verificar configuración de seguridad
3. Consultar documentación de Firebase

## 🎯 Checklist Final

- [ ] Firebase configurado correctamente
- [ ] Reglas de seguridad implementadas
- [ ] Cloud Functions desplegadas
- [ ] Hosting configurado
- [ ] PWA funcionando
- [ ] Responsive design verificado
- [ ] Seguridad implementada
- [ ] Analytics configurado
- [ ] Notificaciones funcionando
- [ ] Encriptación funcionando

¡Tu app Sensus está lista para salvar vidas! 🎉
