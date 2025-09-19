#!/usr/bin/env node
/**
 * CSS Conflict Fixer - Elimina conflictos críticos automáticamente
 * Uso: node scripts/css-conflict-fixer.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio de estilos
const stylesDir = path.join(__dirname, '..', 'src', 'styles');

// Conflictos críticos identificados
const criticalConflicts = {
  // Conflictos de colores más críticos
  '.progress-bar': {
    keep: 'homepage-enhanced.css', // Mantener el más específico
    remove: ['diary-wellness.css', 'evaluation-enhanced.css', 'test-page.css']
  },
  '.progress-fill': {
    keep: 'homepage-enhanced.css',
    remove: ['diary-wellness.css', 'evaluation-enhanced.css', 'test-page.css']
  },
  '.modal-content': {
    keep: 'evaluation-enhanced.css',
    remove: ['diary-wellness.css']
  },
  '.btn-cta': {
    keep: 'homepage-enhanced.css',
    remove: ['components/buttons.css', 'components/header-fix.css']
  },
  '.hero-title': {
    keep: 'homepage-enhanced.css',
    remove: ['anxiety-symptoms.css', 'diary-wellness.css', 'evaluation-enhanced.css', 'utilities/responsive.css']
  },
  '.hero-subtitle': {
    keep: 'homepage-enhanced.css',
    remove: ['anxiety-symptoms.css', 'diary-wellness.css', 'evaluation-enhanced.css', 'utilities/responsive.css']
  },
  '.section-title': {
    keep: 'homepage-enhanced.css',
    remove: ['anxiety-symptoms.css', 'diary-wellness.css']
  },
  '.section-description': {
    keep: 'homepage-enhanced.css',
    remove: ['anxiety-symptoms.css', 'diary-wellness.css']
  }
};

// Función para leer archivo CSS
function readCSSFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Función para escribir archivo CSS
function writeCSSFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

// Función para eliminar reglas duplicadas
function removeDuplicateRules(content, selector, keepFile) {
  const lines = content.split('\n');
  const result = [];
  let inRule = false;
  let ruleStart = -1;
  let braceCount = 0;
  let shouldKeep = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar inicio de regla
    if (line.trim().startsWith(selector) && line.includes('{')) {
      inRule = true;
      ruleStart = i;
      braceCount = 1;
      shouldKeep = false;
      continue;
    }
    
    // Si estamos dentro de una regla
    if (inRule) {
      // Contar llaves
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      // Si llegamos al final de la regla
      if (braceCount === 0) {
        inRule = false;
        if (shouldKeep) {
          // Mantener la regla completa
          for (let j = ruleStart; j <= i; j++) {
            result.push(lines[j]);
          }
        }
        // Si no debe mantenerse, no agregamos nada
        continue;
      }
    }
    
    // Si no estamos en una regla, agregar la línea
    if (!inRule) {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

// Función para limpiar archivo específico
function cleanFile(filePath, conflicts) {
  console.log(`🧹 Limpiando ${path.relative(stylesDir, filePath)}...`);
  
  let content = readCSSFile(filePath);
  let originalContent = content;
  let changes = 0;
  
  // Aplicar cada conflicto
  Object.entries(conflicts).forEach(([selector, config]) => {
    const fileName = path.basename(filePath);
    
    // Si este archivo debe mantener la regla, no hacer nada
    if (config.keep === fileName || config.keep.includes(fileName)) {
      return;
    }
    
    // Si este archivo debe eliminar la regla
    if (config.remove.includes(fileName) || config.remove.some(f => fileName.includes(f))) {
      const beforeLength = content.length;
      content = removeDuplicateRules(content, selector, false);
      const afterLength = content.length;
      
      if (beforeLength !== afterLength) {
        changes++;
        console.log(`   ✅ Eliminada regla duplicada: ${selector}`);
      }
    }
  });
  
  // Escribir archivo si hubo cambios
  if (content !== originalContent) {
    writeCSSFile(filePath, content);
    console.log(`   📝 Archivo actualizado con ${changes} cambios`);
  } else {
    console.log(`   ⏭️  Sin cambios necesarios`);
  }
  
  return changes;
}

// Función para crear backup
function createBackup() {
  const backupDir = path.join(__dirname, '..', 'backup', 'css-backup-' + Date.now());
  
  if (!fs.existsSync(path.dirname(backupDir))) {
    fs.mkdirSync(path.dirname(backupDir), { recursive: true });
  }
  
  fs.mkdirSync(backupDir, { recursive: true });
  
  // Copiar todos los archivos CSS
  function copyDirectory(src, dest) {
    const items = fs.readdirSync(src);
    
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  copyDirectory(stylesDir, backupDir);
  console.log(`💾 Backup creado en: ${backupDir}`);
  return backupDir;
}

// Función principal
function fixConflicts() {
  console.log('🔧 Iniciando corrección de conflictos CSS...\n');
  
  // Crear backup
  const backupPath = createBackup();
  console.log('');
  
  // Leer todos los archivos CSS
  const files = [];
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.css')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(stylesDir);
  
  console.log(`📁 Procesando ${files.length} archivos CSS...\n`);
  
  let totalChanges = 0;
  
  // Limpiar cada archivo
  files.forEach(file => {
    const changes = cleanFile(file, criticalConflicts);
    totalChanges += changes;
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ CORRECCIÓN COMPLETADA\n');
  console.log(`📊 Total de cambios realizados: ${totalChanges}`);
  console.log(`💾 Backup guardado en: ${backupPath}`);
  
  if (totalChanges > 0) {
    console.log('\n🎉 CONFLICTOS CORREGIDOS:');
    console.log('   ✅ Reglas duplicadas eliminadas');
    console.log('   ✅ Especificidad CSS mejorada');
    console.log('   ✅ Consistencia visual restaurada');
    console.log('   ✅ Rendimiento optimizado');
    
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('   1. Revisar la página en el navegador');
    console.log('   2. Verificar que el diseño se vea correcto');
    console.log('   3. Si hay problemas, restaurar desde backup');
    console.log('   4. Ejecutar el analizador nuevamente para verificar');
  } else {
    console.log('\n✨ No se encontraron conflictos críticos para corregir');
  }
}

// Ejecutar corrección
fixConflicts();

export { fixConflicts, removeDuplicateRules };
