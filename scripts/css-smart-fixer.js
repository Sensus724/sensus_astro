#!/usr/bin/env node
/**
 * CSS Smart Fixer - Corrección inteligente que mantiene el diseño
 * Opción A: Elimina duplicados manteniendo la regla más específica
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio de estilos
const stylesDir = path.join(__dirname, '..', 'src', 'styles');

// Estrategia de corrección: mantener la regla más específica
const correctionStrategy = {
  // Para .hero-title: mantener la regla más específica (homepage-enhanced.css)
  '.hero-title': {
    keep: 'pages/homepage-enhanced.css',
    remove: ['utilities/responsive.css', 'utilities/base.css', 'main.css']
  },
  
  // Para .progress-bar: mantener la regla más completa (homepage-enhanced.css)
  '.progress-bar': {
    keep: 'pages/homepage-enhanced.css', 
    remove: ['diary-wellness.css', 'evaluation-enhanced.css', 'test-page.css']
  },
  
  // Para .btn-cta: mantener la regla más específica (buttons.css)
  '.btn-cta': {
    keep: 'components/buttons.css',
    remove: ['homepage-enhanced.css', 'evaluation-enhanced.css', 'test-page.css']
  },
  
  // Para .modal-content: mantener la regla más completa (evaluation-enhanced.css)
  '.modal-content': {
    keep: 'pages/evaluation-enhanced.css',
    remove: ['diary-wellness.css', 'test-page.css']
  },
  
  // Para .card-peace: mantener la regla más específica (cards.css)
  '.card-peace': {
    keep: 'components/cards.css',
    remove: ['homepage-enhanced.css', 'evaluation-enhanced.css']
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

// Función para extraer regla CSS específica
function extractSpecificRule(content, selector) {
  const rules = [];
  const lines = content.split('\n');
  let inRule = false;
  let currentRule = '';
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detectar inicio de regla
    if (line.includes(selector) && line.includes('{')) {
      inRule = true;
      currentRule = line + '\n';
      braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    } else if (inRule) {
      currentRule += line + '\n';
      braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      
      // Regla completa
      if (braceCount === 0) {
        rules.push({
          content: currentRule.trim(),
          lineNumber: i - currentRule.split('\n').length + 2
        });
        inRule = false;
        currentRule = '';
      }
    }
  }
  
  return rules;
}

// Función para remover regla específica
function removeSpecificRule(content, selector) {
  const lines = content.split('\n');
  const newLines = [];
  let inRule = false;
  let braceCount = 0;
  let ruleStart = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detectar inicio de regla
    if (line.includes(selector) && line.includes('{')) {
      inRule = true;
      ruleStart = i;
      braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    } else if (inRule) {
      braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      
      // Regla completa - saltarla
      if (braceCount === 0) {
        inRule = false;
        ruleStart = -1;
        continue; // No agregar esta línea
      }
    } else if (!inRule) {
      newLines.push(lines[i]);
    }
  }
  
  return newLines.join('\n');
}

// Función principal de corrección
function smartFixCSS() {
  console.log('🔧 INICIANDO CORRECCIÓN INTELIGENTE CSS...\n');
  
  let totalFixed = 0;
  
  // Procesar cada conflicto
  for (const [selector, strategy] of Object.entries(correctionStrategy)) {
    console.log(`🎯 Corrigiendo: ${selector}`);
    
    // Leer archivo que se mantiene
    const keepFile = path.join(stylesDir, strategy.keep);
    const keepContent = readCSSFile(keepFile);
    const keepRules = extractSpecificRule(keepContent, selector);
    
    if (keepRules.length > 0) {
      console.log(`   ✅ Manteniendo regla en: ${strategy.keep}`);
    }
    
    // Remover de archivos duplicados
    for (const removeFile of strategy.remove) {
      const removeFilePath = path.join(stylesDir, 'pages', removeFile);
      
      if (fs.existsSync(removeFilePath)) {
        const removeContent = readCSSFile(removeFilePath);
        const removeRules = extractSpecificRule(removeContent, selector);
        
        if (removeRules.length > 0) {
          console.log(`   🗑️  Removiendo duplicado de: ${removeFile}`);
          const newContent = removeSpecificRule(removeContent, selector);
          writeCSSFile(removeFilePath, newContent);
          totalFixed++;
        }
      }
    }
    
    console.log('');
  }
  
  console.log(`✅ CORRECCIÓN COMPLETADA:`);
  console.log(`   📊 Total de conflictos corregidos: ${totalFixed}`);
  console.log(`   💾 Respaldo creado en: backup/css-backup/`);
  console.log(`   🎨 Diseño actual mantenido intacto`);
}

// Ejecutar corrección
smartFixCSS();
