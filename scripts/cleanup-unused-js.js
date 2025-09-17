#!/usr/bin/env node

/*
 * Script para limpiar archivos JavaScript no utilizados
 * Sensus - Limpieza Automática de Archivos
 */

import fs from 'fs';
import path from 'path';

// Archivos que se pueden eliminar de forma segura
const filesToDelete = [
    // Archivos en raíz
    'public/js/script.js',
    'public/js/theme-toggle.js',
    
    // Archivos no utilizados en pages/
    'public/js/pages/diary-advanced.js',
    'public/js/pages/diary-enhanced.js',
    'public/js/pages/evaluation-debug.js',
    
    // Archivos no utilizados en modules/
    'public/js/modules/analytics.js',
    'public/js/modules/auth-simple.js',
    'public/js/modules/cross-browser-compatibility.js',
    'public/js/modules/database-setup.js',
    'public/js/modules/diario.js',
    'public/js/modules/diary-enhanced-features.js',
    'public/js/modules/diary-experimental.js',
    'public/js/modules/encryption.js',
    'public/js/modules/image-optimizer.js',
    'public/js/modules/journal.js',
    'public/js/modules/notifications.js',
    'public/js/modules/responsive-optimizer.js',
    'public/js/modules/responsive.js',
    'public/js/modules/storage.js',
    'public/js/modules/touch-interactions.js',
    'public/js/modules/user-profile.js',
    'public/js/modules/visitor-counter.js',
    
    // Archivos de tests no utilizados
    'public/js/test-page.js',
    'public/js/tests-additional.js',
    'public/js/tests-complete.js',
    
    // Archivos en utils/
    'public/js/utils/theme-toggle.js'
];

// Archivos duplicados (eliminar de pages/, mantener en raíz)
const duplicateFilesToDelete = [
    'public/js/pages/homepage-interactions.js',
    'public/js/pages/plans-interactions.js',
    'public/js/pages/evaluation-interactions.js'
];

// Función para eliminar archivo
function deleteFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Eliminado: ${filePath}`);
            return true;
        } else {
            console.log(`⚠️  No existe: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error eliminando ${filePath}:`, error.message);
        return false;
    }
}

// Función para eliminar directorio vacío
function deleteEmptyDirectory(dirPath) {
    try {
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            if (files.length === 0) {
                fs.rmdirSync(dirPath);
                console.log(`📁 Directorio vacío eliminado: ${dirPath}`);
            }
        }
    } catch (error) {
        console.error(`❌ Error eliminando directorio ${dirPath}:`, error.message);
    }
}

// Función principal
function cleanupUnusedFiles() {
    console.log('🧹 Iniciando limpieza de archivos JavaScript no utilizados...\n');
    
    let deletedCount = 0;
    let totalCount = filesToDelete.length + duplicateFilesToDelete.length;
    
    // Eliminar archivos no utilizados
    console.log('📋 Eliminando archivos no utilizados:');
    filesToDelete.forEach(filePath => {
        if (deleteFile(filePath)) {
            deletedCount++;
        }
    });
    
    console.log('\n🔄 Eliminando archivos duplicados:');
    duplicateFilesToDelete.forEach(filePath => {
        if (deleteFile(filePath)) {
            deletedCount++;
        }
    });
    
    // Eliminar directorios vacíos
    console.log('\n📁 Verificando directorios vacíos:');
    deleteEmptyDirectory('public/js/pages');
    deleteEmptyDirectory('public/js/utils');
    deleteEmptyDirectory('public/js/components');
    
    // Resumen
    console.log('\n📊 Resumen de limpieza:');
    console.log(`✅ Archivos eliminados: ${deletedCount}/${totalCount}`);
    console.log(`💾 Espacio liberado: ~${Math.round(deletedCount * 15)}KB estimado`);
    
    if (deletedCount === totalCount) {
        console.log('\n🎉 ¡Limpieza completada exitosamente!');
    } else {
        console.log('\n⚠️  Algunos archivos no pudieron ser eliminados.');
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    cleanupUnusedFiles();
}

export { cleanupUnusedFiles, filesToDelete, duplicateFilesToDelete };
