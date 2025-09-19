#!/usr/bin/env node
/**
 * CSS Conflict Detector - Detecta conflictos específicos que afectan el diseño
 * Uso: node scripts/css-conflict-detector.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio de estilos
const stylesDir = path.join(__dirname, '..', 'src', 'styles');

// Función para leer archivos CSS
function readCSSFiles(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.css')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

// Función para extraer reglas CSS con propiedades específicas
function extractCSSRulesWithProperties(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rules = [];
  
  // Buscar selectores CSS con sus propiedades
  const ruleRegex = /([.#]?[a-zA-Z][\w-]*(?:[.#][\w-]*)*)\s*\{([^}]+)\}/g;
  let match;
  
  while ((match = ruleRegex.exec(content)) !== null) {
    const selector = match[1].trim();
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
    
    if (Object.keys(props).length > 0) {
      rules.push({
        selector,
        properties: props,
        file: path.relative(stylesDir, filePath),
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  return rules;
}

// Función para detectar conflictos específicos
function detectConflicts() {
  console.log('🔍 Analizando conflictos CSS que afectan el diseño...\n');
  
  const files = readCSSFiles(stylesDir);
  const allRules = [];
  
  // Extraer todas las reglas
  files.forEach(file => {
    const rules = extractCSSRulesWithProperties(file);
    allRules.push(...rules);
  });
  
  console.log(`📁 Analizando ${files.length} archivos CSS...\n`);
  
  // Agrupar por selector
  const rulesBySelector = {};
  allRules.forEach(rule => {
    if (!rulesBySelector[rule.selector]) {
      rulesBySelector[rule.selector] = [];
    }
    rulesBySelector[rule.selector].push(rule);
  });
  
  // Detectar conflictos específicos
  const conflicts = [];
  
  Object.entries(rulesBySelector).forEach(([selector, rules]) => {
    if (rules.length > 1) {
      // Verificar conflictos de propiedades específicas
      const propertyConflicts = {};
      
      rules.forEach(rule => {
        Object.entries(rule.properties).forEach(([prop, value]) => {
          if (!propertyConflicts[prop]) {
            propertyConflicts[prop] = [];
          }
          propertyConflicts[prop].push({
            value,
            file: rule.file,
            line: rule.line
          });
        });
      });
      
      // Identificar propiedades con valores diferentes
      Object.entries(propertyConflicts).forEach(([prop, values]) => {
        const uniqueValues = [...new Set(values.map(v => v.value))];
        if (uniqueValues.length > 1) {
          conflicts.push({
            selector,
            property: prop,
            values: values,
            severity: getConflictSeverity(prop, uniqueValues)
          });
        }
      });
    }
  });
  
  // Ordenar por severidad
  conflicts.sort((a, b) => b.severity - a.severity);
  
  // Mostrar conflictos críticos
  console.log('🚨 CONFLICTOS CRÍTICOS QUE AFECTAN EL DISEÑO:\n');
  
  const criticalConflicts = conflicts.filter(c => c.severity >= 8);
  if (criticalConflicts.length > 0) {
    criticalConflicts.forEach(conflict => {
      console.log(`🔥 ${conflict.selector} - ${conflict.property}:`);
      conflict.values.forEach(value => {
        console.log(`   📍 ${value.file}:${value.line} = ${value.value}`);
      });
      console.log(`   ⚠️  Severidad: ${conflict.severity}/10\n`);
    });
  } else {
    console.log('✅ No se encontraron conflictos críticos');
  }
  
  // Mostrar conflictos de layout
  console.log('\n' + '='.repeat(60));
  console.log('📐 CONFLICTOS DE LAYOUT:\n');
  
  const layoutConflicts = conflicts.filter(c => 
    ['display', 'position', 'width', 'height', 'margin', 'padding', 'flex', 'grid'].includes(c.property)
  );
  
  if (layoutConflicts.length > 0) {
    layoutConflicts.forEach(conflict => {
      console.log(`📐 ${conflict.selector} - ${conflict.property}:`);
      conflict.values.forEach(value => {
        console.log(`   📍 ${value.file}:${value.line} = ${value.value}`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No se encontraron conflictos de layout');
  }
  
  // Mostrar conflictos de colores
  console.log('\n' + '='.repeat(60));
  console.log('🎨 CONFLICTOS DE COLORES:\n');
  
  const colorConflicts = conflicts.filter(c => 
    ['color', 'background-color', 'background', 'border-color'].includes(c.property)
  );
  
  if (colorConflicts.length > 0) {
    colorConflicts.forEach(conflict => {
      console.log(`🎨 ${conflict.selector} - ${conflict.property}:`);
      conflict.values.forEach(value => {
        console.log(`   📍 ${value.file}:${value.line} = ${value.value}`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No se encontraron conflictos de colores');
  }
  
  // Mostrar conflictos de tipografía
  console.log('\n' + '='.repeat(60));
  console.log('📝 CONFLICTOS DE TIPOGRAFÍA:\n');
  
  const typographyConflicts = conflicts.filter(c => 
    ['font-size', 'font-weight', 'font-family', 'line-height'].includes(c.property)
  );
  
  if (typographyConflicts.length > 0) {
    typographyConflicts.forEach(conflict => {
      console.log(`📝 ${conflict.selector} - ${conflict.property}:`);
      conflict.values.forEach(value => {
        console.log(`   📍 ${value.file}:${value.line} = ${value.value}`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No se encontraron conflictos de tipografía');
  }
  
  // Mostrar reglas que podrían estar rotas
  console.log('\n' + '='.repeat(60));
  console.log('💥 REGLAS POTENCIALMENTE ROTAS:\n');
  
  const brokenRules = detectBrokenRules(allRules);
  if (brokenRules.length > 0) {
    brokenRules.forEach(rule => {
      console.log(`💥 ${rule.selector} en ${rule.file}:${rule.line}`);
      console.log(`   Problema: ${rule.issue}`);
      console.log('');
    });
  } else {
    console.log('✅ No se encontraron reglas rotas obvias');
  }
  
  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE CONFLICTOS:\n');
  console.log(`  🔥 Conflictos críticos: ${criticalConflicts.length}`);
  console.log(`  📐 Conflictos de layout: ${layoutConflicts.length}`);
  console.log(`  🎨 Conflictos de colores: ${colorConflicts.length}`);
  console.log(`  📝 Conflictos de tipografía: ${typographyConflicts.length}`);
  console.log(`  💥 Reglas rotas: ${brokenRules.length}`);
  console.log(`  📊 Total de conflictos: ${conflicts.length}`);
  
  if (conflicts.length > 0) {
    console.log('\n💡 RECOMENDACIONES:');
    console.log('  1. Revisar conflictos críticos primero');
    console.log('  2. Consolidar reglas duplicadas');
    console.log('  3. Usar especificidad CSS apropiada');
    console.log('  4. Organizar CSS por cascada lógica');
  }
}

// Función para determinar severidad del conflicto
function getConflictSeverity(property, values) {
  const criticalProps = ['display', 'position', 'width', 'height'];
  const importantProps = ['margin', 'padding', 'color', 'background-color'];
  const moderateProps = ['font-size', 'font-weight', 'border-radius'];
  
  if (criticalProps.includes(property)) return 10;
  if (importantProps.includes(property)) return 8;
  if (moderateProps.includes(property)) return 6;
  return 4;
}

// Función para detectar reglas rotas
function detectBrokenRules(allRules) {
  const broken = [];
  
  allRules.forEach(rule => {
    // Detectar propiedades con valores inválidos
    Object.entries(rule.properties).forEach(([prop, value]) => {
      if (isInvalidValue(prop, value)) {
        broken.push({
          selector: rule.selector,
          file: rule.file,
          line: rule.line,
          issue: `Valor inválido para ${prop}: ${value}`
        });
      }
    });
    
    // Detectar reglas con sintaxis incorrecta
    if (rule.selector.includes('{') || rule.selector.includes('}')) {
      broken.push({
        selector: rule.selector,
        file: rule.file,
        line: rule.line,
        issue: 'Sintaxis de selector incorrecta'
      });
    }
  });
  
  return broken;
}

// Función para validar valores CSS
function isInvalidValue(property, value) {
  // Validaciones básicas
  if (value.includes('undefined') || value.includes('null')) return true;
  if (value.includes('NaN')) return true;
  
  // Validaciones específicas por propiedad
  if (property === 'display' && !['block', 'inline', 'flex', 'grid', 'none', 'inline-block'].some(v => value.includes(v))) {
    return false; // Puede ser válido
  }
  
  if (property === 'position' && !['static', 'relative', 'absolute', 'fixed', 'sticky'].some(v => value.includes(v))) {
    return false; // Puede ser válido
  }
  
  return false;
}

// Ejecutar análisis
detectConflicts();

export { detectConflicts, extractCSSRulesWithProperties };
