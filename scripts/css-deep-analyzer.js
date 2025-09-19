#!/usr/bin/env node
/**
 * CSS Deep Analyzer - Análisis profundo de conflictos específicos
 * Uso: node scripts/css-deep-analyzer.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio de estilos
const stylesDir = path.join(__dirname, '..', 'src', 'styles');

// Conflictos más críticos identificados
const criticalSelectors = [
  '.hero-title',
  '.hero-subtitle', 
  '.section-title',
  '.section-description',
  '.progress-bar',
  '.progress-fill',
  '.btn-cta',
  '.modal-content',
  '.card-peace',
  '.testimonial-card'
];

// Función para leer archivo CSS
function readCSSFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Función para extraer regla CSS específica
function extractSpecificRule(content, selector) {
  const rules = [];
  
  // Buscar todas las ocurrencias del selector
  const regex = new RegExp(`(${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*\\{([^}]+)\\}`, 'g');
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const fullMatch = match[0];
    const selectorText = match[1];
    const properties = match[2];
    
    // Extraer propiedades individuales
    const propRegex = /([a-zA-Z-]+)\s*:\s*([^;]+);/g;
    const props = {};
    let propMatch;
    
    while ((propMatch = propRegex.exec(properties)) !== null) {
      const propName = propMatch[1].trim();
      const propValue = propMatch[2].trim();
      props[propName] = propValue;
    }
    
    // Encontrar línea
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    rules.push({
      selector: selectorText,
      properties: props,
      fullRule: fullMatch,
      lineNumber: lineNumber,
      context: getContext(content, match.index, 3)
    });
  }
  
  return rules;
}

// Función para obtener contexto alrededor de una regla
function getContext(content, position, lines) {
  const linesArray = content.split('\n');
  const lineNumber = content.substring(0, position).split('\n').length;
  const start = Math.max(0, lineNumber - lines - 1);
  const end = Math.min(linesArray.length, lineNumber + lines);
  
  return linesArray.slice(start, end).map((line, index) => ({
    number: start + index + 1,
    content: line,
    isTarget: start + index + 1 === lineNumber
  }));
}

// Función para analizar especificidad CSS
function calculateSpecificity(selector) {
  let specificity = 0;
  
  // IDs
  const idMatches = selector.match(/#[a-zA-Z][\w-]*/g);
  if (idMatches) specificity += idMatches.length * 1000;
  
  // Clases y atributos
  const classMatches = selector.match(/\\.[a-zA-Z][\w-]*/g);
  if (classMatches) specificity += classMatches.length * 100;
  
  // Elementos
  const elementMatches = selector.match(/^[a-zA-Z][\w-]*$/g);
  if (elementMatches) specificity += elementMatches.length * 1;
  
  return specificity;
}

// Función para determinar orden de cascada
function getCascadeOrder(filePath) {
  const fileName = path.basename(filePath);
  const order = {
    'variables.css': 1,
    'base.css': 2,
    'peace-palette.css': 3,
    'animations.css': 4,
    'responsive.css': 5,
    'spacing-system.css': 6,
    'layout.css': 7,
    'buttons.css': 8,
    'cards.css': 9,
    'forms.css': 10,
    'auth-forms.css': 11,
    'header-fix.css': 12,
    'main.css': 13,
    'homepage-enhanced.css': 14,
    'evaluation-enhanced.css': 15,
    'diary-wellness.css': 16,
    'test-page.css': 17,
    'anxiety-symptoms.css': 18
  };
  
  return order[fileName] || 999;
}

// Función principal de análisis
function deepAnalyze() {
  console.log('🔍 ANÁLISIS PROFUNDO DE CONFLICTOS CSS\n');
  console.log('='.repeat(80));
  
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
  
  // Analizar cada selector crítico
  criticalSelectors.forEach(selector => {
    console.log(`\n🎯 ANALIZANDO: ${selector}`);
    console.log('='.repeat(60));
    
    const allRules = [];
    
    // Extraer reglas de todos los archivos
    files.forEach(file => {
      const content = readCSSFile(file);
      const rules = extractSpecificRule(content, selector);
      
      rules.forEach(rule => {
        allRules.push({
          ...rule,
          file: path.relative(stylesDir, file),
          cascadeOrder: getCascadeOrder(file),
          specificity: calculateSpecificity(rule.selector)
        });
      });
    });
    
    if (allRules.length === 0) {
      console.log('   ✅ No se encontraron reglas para este selector');
      return;
    }
    
    if (allRules.length === 1) {
      console.log('   ✅ Solo una regla encontrada - Sin conflictos');
      return;
    }
    
    // Ordenar por especificidad y cascada
    allRules.sort((a, b) => {
      if (a.specificity !== b.specificity) {
        return b.specificity - a.specificity; // Mayor especificidad primero
      }
      return a.cascadeOrder - b.cascadeOrder; // Menor orden de cascada primero
    });
    
    console.log(`   📊 ${allRules.length} reglas encontradas:`);
    console.log('');
    
    // Mostrar cada regla
    allRules.forEach((rule, index) => {
      const isWinning = index === 0;
      const status = isWinning ? '🏆 GANADORA' : '❌ SOBRESCRITA';
      
      console.log(`   ${status} - ${rule.file}:${rule.lineNumber}`);
      console.log(`   📍 Especificidad: ${rule.specificity}, Orden: ${rule.cascadeOrder}`);
      
      // Mostrar propiedades más importantes
      const importantProps = ['background', 'color', 'font-size', 'font-weight', 'display', 'position', 'width', 'height'];
      const relevantProps = importantProps.filter(prop => rule.properties[prop]);
      
      if (relevantProps.length > 0) {
        console.log(`   🎨 Propiedades clave:`);
        relevantProps.forEach(prop => {
          console.log(`      ${prop}: ${rule.properties[prop]}`);
        });
      }
      
      // Mostrar contexto si hay conflictos
      if (!isWinning && rule.context) {
        console.log(`   📝 Contexto:`);
        rule.context.forEach(line => {
          const marker = line.isTarget ? '>>> ' : '    ';
          console.log(`   ${marker}${line.number.toString().padStart(3)}: ${line.content}`);
        });
      }
      
      console.log('');
    });
    
    // Identificar conflictos específicos
    const conflicts = identifyConflicts(allRules);
    if (conflicts.length > 0) {
      console.log('   ⚠️  CONFLICTOS DETECTADOS:');
      conflicts.forEach(conflict => {
        console.log(`      • ${conflict.property}: ${conflict.values.length} valores diferentes`);
        conflict.values.forEach(value => {
          console.log(`        - ${value.file}:${value.lineNumber} = ${value.value}`);
        });
      });
    }
    
    console.log('\n' + '─'.repeat(60));
  });
  
  console.log('\n🎯 RESUMEN DE ANÁLISIS:');
  console.log('   • Se analizaron los selectores más críticos');
  console.log('   • Se identificaron reglas ganadoras y sobrescritas');
  console.log('   • Se detectaron conflictos de propiedades específicas');
  console.log('   • Se calculó especificidad y orden de cascada');
}

// Función para identificar conflictos específicos
function identifyConflicts(rules) {
  const conflicts = [];
  const propertyMap = {};
  
  // Agrupar por propiedad
  rules.forEach(rule => {
    Object.entries(rule.properties).forEach(([prop, value]) => {
      if (!propertyMap[prop]) {
        propertyMap[prop] = [];
      }
      propertyMap[prop].push({
        value,
        file: rule.file,
        lineNumber: rule.lineNumber
      });
    });
  });
  
  // Identificar propiedades con valores diferentes
  Object.entries(propertyMap).forEach(([prop, values]) => {
    const uniqueValues = [...new Set(values.map(v => v.value))];
    if (uniqueValues.length > 1) {
      conflicts.push({
        property: prop,
        values: values
      });
    }
  });
  
  return conflicts;
}

// Ejecutar análisis
deepAnalyze();

export { deepAnalyze, extractSpecificRule, calculateSpecificity };
