# 🎨 **Sensus - Sistema CSS Profesional Completo**

## 📁 Estructura de Archivos

El sistema CSS ha sido completamente reorganizado y optimizado para crear un diseño minimalista, profesional y de nivel enterprise.

### **Archivos Principales**

- **`main.css`** - Archivo principal que importa todos los componentes
- **`variables.css`** - Variables CSS globales y sistema de diseño
- **`base.css`** - Reset, estilos base y utilidades
- **`header.css`** - Header y navegación
- **`buttons.css`** - Sistema de botones y CTAs
- **`cards.css`** - Tarjetas y contenedores
- **`forms.css`** - Formularios e inputs
- **`layout.css`** - Sistema de layout y grid
- **`responsive.css`** - Media queries y utilidades responsivas
- **`animations.css`** - Animaciones y transiciones

### **Archivos Avanzados**

- **`micro-interactions.css`** - Micro-interacciones avanzadas
- **`spacing-system.css`** - Sistema de espaciado profesional
- **`advanced-layout.css`** - Layouts avanzados con CSS Grid
- **`advanced-interactions.css`** - Interacciones complejas
- **`responsive-advanced.css`** - Responsive design optimizado
- **`performance-optimizations.css`** - Optimizaciones de rendimiento
- **`best-practices.css`** - Mejores prácticas y estándares

## 🎨 Sistema de Diseño

### Variables CSS
- **Colores**: Sistema de colores semánticos con variantes
- **Tipografía**: Fuentes Inter y Poppins con escalas responsivas
- **Espaciado**: Sistema de espaciado consistente (4px base)
- **Bordes**: Radios de borde escalables
- **Sombras**: Sistema de sombras en capas
- **Transiciones**: Transiciones consistentes y suaves

### Componentes

#### Botones
- `.btn` - Botón base
- `.btn-primary` - Botón primario
- `.btn-secondary` - Botón secundario
- `.btn-soft` - Botón suave
- `.btn-ghost` - Botón fantasma
- `.btn-cta` - Botón CTA especial

#### Tarjetas
- `.card` - Tarjeta base
- `.card-elevated` - Tarjeta elevada
- `.card-soft` - Tarjeta suave
- `.card-featured` - Tarjeta destacada
- `.test-card` - Tarjeta de test específica

#### Formularios
- `.form-input` - Input base
- `.form-textarea` - Textarea
- `.form-select` - Select
- `.form-checkbox` - Checkbox
- `.form-radio` - Radio button
- `.mood-selector` - Selector de estado de ánimo

## 📱 Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Utilidades Responsivas
- `.d-sm-none` - Ocultar en móvil
- `.flex-sm-column` - Columna en móvil
- `.text-sm-center` - Centrar texto en móvil
- `.hide-mobile` - Ocultar solo en móvil

## 🎭 Animaciones

### Entrada
- `.fade-in` - Fade in básico
- `.fade-in-up` - Fade in desde abajo
- `.scale-in` - Escala in
- `.slide-in-up` - Deslizar desde abajo

### Hover
- `.pulse` - Pulso continuo
- `.gentle-pulse` - Pulso suave
- `.bounce` - Rebote
- `.shake` - Sacudida

### Estados
- `.success-animation` - Animación de éxito
- `.error-animation` - Animación de error
- `.warning-animation` - Animación de advertencia

## 🚀 Uso

### Importación
```css
@import '/src/styles/main.css';
```

### Clases de Utilidad
```html
<!-- Espaciado -->
<div class="p-4 m-2 mb-6">

<!-- Flexbox -->
<div class="d-flex justify-center align-center">

<!-- Texto -->
<h1 class="text-center text-lg font-semibold">

<!-- Responsive -->
<div class="hide-mobile d-md-flex">
```

## 🎯 Beneficios

1. **Eliminación de Duplicación**: Código CSS unificado sin repeticiones
2. **Diseño Consistente**: Sistema de diseño coherente en toda la aplicación
3. **Mantenibilidad**: Estructura modular fácil de mantener
4. **Performance**: Menos archivos CSS = carga más rápida
5. **Escalabilidad**: Fácil agregar nuevos componentes
6. **Accesibilidad**: Mejores prácticas de accesibilidad integradas

## 🔧 Personalización

### Variables CSS
Modifica las variables en `variables.css` para personalizar:
- Colores de marca
- Tipografía
- Espaciado
- Bordes y sombras
- Transiciones

### Tema Oscuro
El tema oscuro se activa con `data-theme="dark"` y todas las variables se adaptan automáticamente.

## 📋 Checklist de Migración

- ✅ Eliminados archivos CSS duplicados
- ✅ Creado sistema unificado por componentes
- ✅ Actualizado BaseLayout.astro
- ✅ Actualizadas páginas específicas
- ✅ Verificados errores de linting
- ✅ Documentación creada

## 🎨 Ejemplos de Uso

### Botón CTA
```html
<a href="/evaluacion" class="btn-cta">
    <i class="fas fa-heart"></i>
    Descubrir mi Ansiedad Gratis
</a>
```

### Tarjeta de Test
```html
<article class="test-card">
    <div class="test-icon">
        <i class="fas fa-brain"></i>
    </div>
    <h3 class="test-title">Test de Ansiedad (GAD-7)</h3>
    <p class="test-description">Evaluación rápida...</p>
</article>
```

### Formulario
```html
<div class="form-group">
    <label class="form-label">Email</label>
    <input type="email" class="form-input" placeholder="tu@email.com">
</div>
```
