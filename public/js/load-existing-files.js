/*
 * Sensus - Cargador de Archivos JavaScript Organizados
 * Sistema de carga optimizado por páginas y componentes
 */

// Lista de archivos JavaScript organizados por funcionalidad
const organizedFiles = {
    // === ARCHIVOS BASE ===
    base: [
        '/js/base/core.js'
    ],
    
    // === COMPONENTES ===
    components: [
        '/js/components/header-interactions.js'
    ],
    
    // === MÓDULOS ===
    modules: [
        '/js/modules/auth-enhanced.js',
        '/js/modules/firebase-config.js'
    ],
    
    // === PÁGINAS ESPECÍFICAS ===
    pages: [
        '/js/pages/homepage.js',           // Página de inicio
        '/js/pages/diary-wellness.js',     // Diario de bienestar
        '/js/pages/evaluacion.js',         // Evaluación de ansiedad
        '/js/pages/planes.js',             // Página de planes
        '/js/pages/contacto.js',           // Página de contacto
        '/js/pages/equipo.js',             // Página de equipo
        '/js/pages/test.js',               // Página de tests
        '/js/pages/ansiedad.js',           // Página de ansiedad
        '/js/pages/secondary-pages.js'     // Páginas secundarias (política, términos, etc.)
    ]
};

// Función para cargar archivos por categoría
function loadFilesByCategory(category) {
    const files = organizedFiles[category] || [];
    
    files.forEach(filePath => {
        const script = document.createElement('script');
        script.src = filePath;
        script.async = true;
        script.onload = () => {
            console.log(`✅ Cargado: ${filePath}`);
        };
        script.onerror = () => {
            console.error(`❌ Error cargando: ${filePath}`);
        };
        document.head.appendChild(script);
    });
}

// Función para cargar archivos específicos de una página
function loadPageSpecificFiles(pageName) {
    const pageFiles = {
        'homepage': ['/js/pages/homepage.js'],
        'diario': ['/js/pages/diary-wellness.js'],
        'evaluacion': ['/js/pages/evaluacion.js'],
        'planes': ['/js/pages/planes.js'],
        'contacto': ['/js/pages/contacto.js'],
        'equipo': ['/js/pages/equipo.js'],
        'test': ['/js/pages/test.js'],
        'ansiedad': ['/js/pages/ansiedad.js'],
        'politica-privacidad': ['/js/pages/secondary-pages.js'],
        'terminos-uso': ['/js/pages/secondary-pages.js']
    };

    const files = pageFiles[pageName] || [];
    
    files.forEach(filePath => {
        const script = document.createElement('script');
        script.src = filePath;
        script.async = true;
        script.onload = () => {
            console.log(`✅ Cargado específico de página: ${filePath}`);
        };
        script.onerror = () => {
            console.error(`❌ Error cargando específico de página: ${filePath}`);
        };
        document.head.appendChild(script);
    });
}

// Función principal de carga
function loadExistingFiles() {
    console.log('📦 Iniciando carga de archivos JavaScript organizados...');
    
    // Cargar archivos base siempre
    loadFilesByCategory('base');
    
    // Cargar componentes siempre
    loadFilesByCategory('components');
    
    // Cargar módulos siempre
    loadFilesByCategory('modules');
    
    // Cargar archivos específicos de la página actual
    const currentPage = getCurrentPageName();
    if (currentPage) {
        console.log(`🎯 Cargando archivos para página: ${currentPage}`);
        loadPageSpecificFiles(currentPage);
    } else {
        // Si no se puede determinar la página, cargar archivos comunes
        console.log('📄 Cargando archivos comunes...');
        loadPageSpecificFiles('homepage');
    }
}

// Función para determinar la página actual
function getCurrentPageName() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index') return 'homepage';
    if (path.includes('/diario')) return 'diario';
    if (path.includes('/evaluacion')) return 'evaluacion';
    if (path.includes('/planes')) return 'planes';
    if (path.includes('/contacto')) return 'contacto';
    if (path.includes('/equipo')) return 'equipo';
    if (path.includes('/test')) return 'test';
    if (path.includes('/ansiedad')) return 'ansiedad';
    if (path.includes('/politica-privacidad')) return 'politica-privacidad';
    if (path.includes('/terminos-uso')) return 'terminos-uso';
    
    return null;
}

// Función para cargar archivos adicionales bajo demanda
function loadAdditionalFiles(fileList) {
    fileList.forEach(filePath => {
        const script = document.createElement('script');
        script.src = filePath;
        script.async = true;
        script.onload = () => {
            console.log(`✅ Cargado adicional: ${filePath}`);
        };
        script.onerror = () => {
            console.error(`❌ Error cargando adicional: ${filePath}`);
        };
        document.head.appendChild(script);
    });
}

// Función para verificar si un archivo ya está cargado
function isFileLoaded(filePath) {
    const scripts = document.querySelectorAll('script[src]');
    return Array.from(scripts).some(script => script.src.includes(filePath));
}

// Función para recargar archivos de una página específica
function reloadPageFiles(pageName) {
    console.log(`🔄 Recargando archivos para página: ${pageName}`);
    
    // Remover scripts existentes de la página
    const existingScripts = document.querySelectorAll('script[src*="/js/pages/"]');
    existingScripts.forEach(script => {
        if (script.src.includes(pageName) || script.src.includes('secondary-pages')) {
            script.remove();
        }
    });
    
    // Cargar archivos de la página
    loadPageSpecificFiles(pageName);
}

// Cargar archivos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadExistingFiles);

// Exportar funciones para uso global
window.loadExistingFiles = loadExistingFiles;
window.loadPageSpecificFiles = loadPageSpecificFiles;
window.loadAdditionalFiles = loadAdditionalFiles;
window.reloadPageFiles = reloadPageFiles;
window.isFileLoaded = isFileLoaded;

// Cargar archivos adicionales si se especifican en el HTML
document.addEventListener('DOMContentLoaded', () => {
    const additionalFiles = document.querySelectorAll('script[data-additional-files]');
    additionalFiles.forEach(script => {
        const files = script.dataset.additionalFiles.split(',');
        loadAdditionalFiles(files);
    });
});

console.log('📋 Sistema de carga de archivos JavaScript inicializado');