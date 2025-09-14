// Sensus - Módulo de compatibilidad cross-browser

document.addEventListener('DOMContentLoaded', function() {
    initCrossBrowserCompatibility();
});

function initCrossBrowserCompatibility() {
    // Detectar navegador y versión
    detectBrowser();
    
    // Aplicar polyfills necesarios
    applyPolyfills();
    
    // Configurar prefijos CSS automáticamente
    setupCSSPrefixes();
    
    // Manejar diferencias entre navegadores
    handleBrowserDifferences();
    
    // Configurar fallbacks
    setupFallbacks();
}

// Detectar navegador y versión
function detectBrowser() {
    const userAgent = navigator.userAgent;
    const browserInfo = {
        name: 'unknown',
        version: 'unknown',
        isIE: false,
        isEdge: false,
        isChrome: false,
        isFirefox: false,
        isSafari: false,
        isMobile: false
    };
    
    // Detectar Internet Explorer
    if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident/') !== -1) {
        browserInfo.name = 'ie';
        browserInfo.isIE = true;
        const match = userAgent.match(/(?:MSIE |rv:)(\d+(?:\.\d+)?)/);
        if (match) browserInfo.version = match[1];
    }
    // Detectar Edge
    else if (userAgent.indexOf('Edg/') !== -1) {
        browserInfo.name = 'edge';
        browserInfo.isEdge = true;
        const match = userAgent.match(/Edg\/(\d+(?:\.\d+)?)/);
        if (match) browserInfo.version = match[1];
    }
    // Detectar Chrome
    else if (userAgent.indexOf('Chrome/') !== -1) {
        browserInfo.name = 'chrome';
        browserInfo.isChrome = true;
        const match = userAgent.match(/Chrome\/(\d+(?:\.\d+)?)/);
        if (match) browserInfo.version = match[1];
    }
    // Detectar Firefox
    else if (userAgent.indexOf('Firefox/') !== -1) {
        browserInfo.name = 'firefox';
        browserInfo.isFirefox = true;
        const match = userAgent.match(/Firefox\/(\d+(?:\.\d+)?)/);
        if (match) browserInfo.version = match[1];
    }
    // Detectar Safari
    else if (userAgent.indexOf('Safari/') !== -1) {
        browserInfo.name = 'safari';
        browserInfo.isSafari = true;
        const match = userAgent.match(/Version\/(\d+(?:\.\d+)?)/);
        if (match) browserInfo.version = match[1];
    }
    
    // Detectar móvil
    browserInfo.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Guardar información del navegador
    window.browserInfo = browserInfo;
    
    // Añadir clases CSS al HTML
    const html = document.documentElement;
    html.classList.add(`browser-${browserInfo.name}`);
    if (browserInfo.isMobile) html.classList.add('browser-mobile');
    if (browserInfo.isIE) html.classList.add('browser-ie');
    if (browserInfo.isEdge) html.classList.add('browser-edge');
    if (browserInfo.isChrome) html.classList.add('browser-chrome');
    if (browserInfo.isFirefox) html.classList.add('browser-firefox');
    if (browserInfo.isSafari) html.classList.add('browser-safari');
}

// Aplicar polyfills necesarios
function applyPolyfills() {
    // Polyfill para IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        loadScript('https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver', function() {
            console.log('IntersectionObserver polyfill loaded');
        });
    }
    
    // Polyfill para CSS Custom Properties (CSS Variables)
    if (!supportsCSSVariables()) {
        loadScript('https://cdn.jsdelivr.net/npm/css-vars-ponyfill@2/dist/css-vars-ponyfill.min.js', function() {
            cssVars({
                onlyVars: true,
                preserveStatic: true,
                preserveVars: true
            });
        });
    }
    
    // Polyfill para fetch
    if (!('fetch' in window)) {
        loadScript('https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.js');
    }
    
    // Polyfill para Promise
    if (!('Promise' in window)) {
        loadScript('https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js');
    }
}

// Verificar soporte para CSS Variables
function supportsCSSVariables() {
    return window.CSS && window.CSS.supports && window.CSS.supports('color', 'var(--test)');
}

// Cargar script dinámicamente
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = function() {
        console.warn('Failed to load polyfill:', src);
    };
    document.head.appendChild(script);
}

// Configurar prefijos CSS automáticamente
function setupCSSPrefixes() {
    const style = document.createElement('style');
    style.textContent = `
        /* Prefijos automáticos para compatibilidad */
        .btn {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        
        .form-group input,
        .form-group textarea {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        
        .card,
        .feature-card,
        .step-card {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
        }
        
        .hero-image img,
        .gallery-image {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
        }
    `;
    document.head.appendChild(style);
}

// Manejar diferencias entre navegadores
function handleBrowserDifferences() {
    const browserInfo = window.browserInfo;
    
    // Ajustes específicos para Internet Explorer
    if (browserInfo.isIE) {
        handleIEOptions();
    }
    
    // Ajustes específicos para Safari
    if (browserInfo.isSafari) {
        handleSafariOptions();
    }
    
    // Ajustes específicos para Firefox
    if (browserInfo.isFirefox) {
        handleFirefoxOptions();
    }
    
    // Ajustes específicos para Edge
    if (browserInfo.isEdge) {
        handleEdgeOptions();
    }
}

// Opciones específicas para IE
function handleIEOptions() {
    // Añadir clases específicas para IE
    document.documentElement.classList.add('ie-fallback');
    
    // Simplificar animaciones en IE
    const style = document.createElement('style');
    style.textContent = `
        .ie-fallback * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
        
        .ie-fallback .card:hover,
        .ie-fallback .feature-card:hover {
            transform: none;
        }
    `;
    document.head.appendChild(style);
    
    // Fallback para flexbox en IE
    const flexElements = document.querySelectorAll('.hero-container, .nav-links, .auth-buttons');
    flexElements.forEach(element => {
        element.style.display = 'block';
    });
}

// Opciones específicas para Safari
function handleSafariOptions() {
    // Mejorar scroll en Safari
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Ajustar viewport para Safari
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
    
    // Añadir soporte para safe-area
    const style = document.createElement('style');
    style.textContent = `
        .container {
            padding-left: max(1rem, env(safe-area-inset-left));
            padding-right: max(1rem, env(safe-area-inset-right));
        }
        
        .header {
            padding-top: max(1rem, env(safe-area-inset-top));
        }
    `;
    document.head.appendChild(style);
}

// Opciones específicas para Firefox
function handleFirefoxOptions() {
    // Mejorar renderizado de fuentes en Firefox
    const style = document.createElement('style');
    style.textContent = `
        body {
            -moz-osx-font-smoothing: grayscale;
        }
        
        .btn {
            -moz-appearance: none;
        }
    `;
    document.head.appendChild(style);
}

// Opciones específicas para Edge
function handleEdgeOptions() {
    // Ajustes específicos para Edge
    const style = document.createElement('style');
    style.textContent = `
        .btn {
            -ms-appearance: none;
        }
    `;
    document.head.appendChild(style);
}

// Configurar fallbacks
function setupFallbacks() {
    // Fallback para imágenes que no cargan
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = 'img-fallback';
            fallback.textContent = 'Imagen no disponible';
            this.parentNode.insertBefore(fallback, this);
        });
    });
    
    // Fallback para JavaScript deshabilitado
    const noScript = document.createElement('noscript');
    noScript.innerHTML = `
        <div style="text-align: center; padding: 2rem; background: #f8f9fa; border: 1px solid #dee2e6; margin: 1rem;">
            <h3>JavaScript requerido</h3>
            <p>Esta aplicación requiere JavaScript para funcionar correctamente. Por favor, habilita JavaScript en tu navegador.</p>
        </div>
    `;
    document.body.insertBefore(noScript, document.body.firstChild);
    
    // Fallback para CSS Grid
    if (!supportsCSSGrid()) {
        const grids = document.querySelectorAll('.feature-cards, .steps-container, .testimonials-grid');
        grids.forEach(grid => {
            grid.style.display = 'block';
            const items = grid.querySelectorAll('.feature-card, .step-card, .testimonial-card');
            items.forEach(item => {
                item.style.display = 'block';
                item.style.marginBottom = '1rem';
            });
        });
    }
    
    // Fallback para CSS Flexbox
    if (!supportsFlexbox()) {
        const flexContainers = document.querySelectorAll('.hero-container, .nav-links, .auth-buttons');
        flexContainers.forEach(container => {
            container.style.display = 'block';
        });
    }
}

// Verificar soporte para CSS Grid
function supportsCSSGrid() {
    return window.CSS && window.CSS.supports && window.CSS.supports('display', 'grid');
}

// Verificar soporte para Flexbox
function supportsFlexbox() {
    return window.CSS && window.CSS.supports && window.CSS.supports('display', 'flex');
}

// Función para detectar capacidades del navegador
function detectCapabilities() {
    const capabilities = {
        cssVariables: supportsCSSVariables(),
        cssGrid: supportsCSSGrid(),
        flexbox: supportsFlexbox(),
        intersectionObserver: 'IntersectionObserver' in window,
        fetch: 'fetch' in window,
        promises: 'Promise' in window,
        webp: supportsWebP(),
        touch: 'ontouchstart' in window,
        serviceWorker: 'serviceWorker' in navigator
    };
    
    window.browserCapabilities = capabilities;
    return capabilities;
}

// Verificar soporte para WebP
function supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Función para aplicar estilos específicos según capacidades
function applyCapabilityStyles() {
    const capabilities = detectCapabilities();
    const html = document.documentElement;
    
    // Añadir clases según capacidades
    if (capabilities.cssVariables) html.classList.add('supports-css-variables');
    if (capabilities.cssGrid) html.classList.add('supports-css-grid');
    if (capabilities.flexbox) html.classList.add('supports-flexbox');
    if (capabilities.intersectionObserver) html.classList.add('supports-intersection-observer');
    if (capabilities.webp) html.classList.add('supports-webp');
    if (capabilities.touch) html.classList.add('supports-touch');
    if (capabilities.serviceWorker) html.classList.add('supports-service-worker');
}

// Inicializar detección de capacidades
detectCapabilities();
applyCapabilityStyles();

// Exportar funciones para uso global
window.CrossBrowserCompatibility = {
    detectBrowser,
    detectCapabilities,
    supportsCSSVariables,
    supportsCSSGrid,
    supportsFlexbox,
    supportsWebP
};
