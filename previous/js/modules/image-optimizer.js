// Sensus - Módulo de optimización de imágenes

document.addEventListener('DOMContentLoaded', function() {
    initImageOptimizer();
});

function initImageOptimizer() {
    // Optimizar todas las imágenes existentes
    optimizeExistingImages();
    
    // Configurar lazy loading
    setupLazyLoading();
    
    // Optimizar imágenes según el dispositivo
    optimizeImagesForDevice();
    
    // Escuchar cambios de orientación para reoptimizar
    window.addEventListener('orientationchange', function() {
        setTimeout(optimizeImagesForDevice, 100);
    });
    
    // Escuchar cambios de tamaño de ventana
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(optimizeImagesForDevice, 150);
    });
}

// Optimizar imágenes existentes
function optimizeExistingImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Añadir atributos para mejor performance
        img.loading = 'lazy';
        img.decoding = 'async';
        
        // Añadir clases para transiciones suaves
        img.classList.add('img-responsive');
        
        // Configurar fallback para imágenes que no cargan
        img.addEventListener('error', function() {
            this.classList.add('img-error');
            this.alt = 'Imagen no disponible';
        });
        
        // Añadir efecto de carga
        img.addEventListener('load', function() {
            this.classList.add('img-loaded');
        });
    });
}

// Configurar lazy loading avanzado
function setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
        // Fallback para navegadores que no soportan IntersectionObserver
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
        return;
    }
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadImage(img);
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });
    
    // Observar imágenes con data-src
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
    });
}

// Cargar imagen con optimizaciones
function loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;
    
    // Crear nueva imagen para precargar
    const newImg = new Image();
    
    newImg.onload = function() {
        img.src = src;
        img.classList.remove('lazy');
        img.classList.add('loaded');
        
        // Añadir efecto de fade-in
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        requestAnimationFrame(() => {
            img.style.opacity = '1';
        });
    };
    
    newImg.onerror = function() {
        img.classList.add('img-error');
        img.alt = 'Imagen no disponible';
    };
    
    newImg.src = src;
}

// Optimizar imágenes según el dispositivo
function optimizeImagesForDevice() {
    const deviceInfo = window.deviceInfo;
    if (!deviceInfo) return;
    
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Ajustar calidad según el dispositivo
        if (deviceInfo.isHighDensity) {
            img.style.imageRendering = 'crisp-edges';
        } else {
            img.style.imageRendering = 'auto';
        }
        
        // Ajustar object-fit según el tamaño de pantalla
        if (deviceInfo.isMobile) {
            img.style.objectFit = 'cover';
            img.style.objectPosition = 'center';
        }
        
        // Optimizar para pantallas pequeñas
        if (deviceInfo.breakpoint === 'xs' || deviceInfo.breakpoint === 'sm') {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        }
    });
}

// Función para generar srcset responsive
function generateResponsiveSrcSet(baseSrc, sizes = [320, 640, 1024, 1280, 1920]) {
    const srcset = sizes.map(size => {
        const filename = baseSrc.replace(/(\.[^.]+)$/, `_${size}w$1`);
        return `${filename} ${size}w`;
    }).join(', ');
    
    return srcset;
}

// Función para crear imagen responsive con srcset
function createResponsiveImage(src, alt, className = '') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.className = `img-responsive ${className}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    
    // Añadir srcset si es posible
    if (src.includes('.')) {
        const srcset = generateResponsiveSrcSet(src);
        img.srcset = srcset;
        img.sizes = '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 1024px) 1024px, 1280px';
    }
    
    return img;
}

// Función para optimizar imágenes de fondo
function optimizeBackgroundImages() {
    const elements = document.querySelectorAll('[style*="background-image"]');
    
    elements.forEach(element => {
        const style = element.style.backgroundImage;
        const urlMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
        
        if (urlMatch) {
            const imageUrl = urlMatch[1];
            
            // Añadir optimizaciones CSS
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
            element.style.backgroundRepeat = 'no-repeat';
            
            // Añadir clase para lazy loading de fondos
            element.classList.add('bg-lazy');
        }
    });
}

// Función para comprimir imágenes en el cliente (para casos específicos)
function compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // Calcular nuevas dimensiones
            let { width, height } = img;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir a blob
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// Función para detectar soporte de formatos modernos
function getOptimalImageFormat() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Detectar soporte para WebP
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
        return 'webp';
    }
    
    // Detectar soporte para AVIF
    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
        return 'avif';
    }
    
    return 'jpeg';
}

// Función para generar URLs optimizadas según el formato soportado
function getOptimizedImageUrl(originalUrl, format = null) {
    if (!format) {
        format = getOptimalImageFormat();
    }
    
    // Si ya es un formato optimizado, devolver tal como está
    if (originalUrl.includes('.webp') || originalUrl.includes('.avif')) {
        return originalUrl;
    }
    
    // Reemplazar extensión por formato optimizado
    const baseUrl = originalUrl.replace(/\.[^.]+$/, '');
    return `${baseUrl}.${format}`;
}

// Exportar funciones para uso global
window.ImageOptimizer = {
    createResponsiveImage,
    generateResponsiveSrcSet,
    optimizeBackgroundImages,
    compressImage,
    getOptimalImageFormat,
    getOptimizedImageUrl
};
