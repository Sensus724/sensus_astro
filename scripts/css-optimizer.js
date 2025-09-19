#!/usr/bin/env node
/**
 * CSS Optimizer - Detecta duplicados y conflictos en CSS
 * Uso: node scripts/css-optimizer.js
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

// Función para extraer reglas CSS
function extractCSSRules(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rules = [];
  
  // Buscar selectores CSS
  const selectorRegex = /([.#]?[a-zA-Z][\w-]*)\s*\{/g;
  let match;
  
  while ((match = selectorRegex.exec(content)) !== null) {
    const selector = match[1];
    const startPos = match.index;
    
    // Encontrar el final del bloque
    let braceCount = 0;
    let endPos = startPos;
    
    for (let i = startPos; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') braceCount--;
      if (braceCount === 0) {
        endPos = i;
        break;
      }
    }
    
    rules.push({
      selector,
      file: path.relative(stylesDir, filePath),
      startLine: content.substring(0, startPos).split('\n').length,
      content: content.substring(startPos, endPos + 1)
    });
  }
  
  return rules;
}

// Función para extraer variables CSS
function extractCSSVariables(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const variables = [];
  
  // Buscar variables en :root
  const rootRegex = /:root\s*\{([^}]+)\}/g;
  let match;
  
  while ((match = rootRegex.exec(content)) !== null) {
    const rootContent = match[1];
    const varRegex = /--([a-zA-Z][\w-]*)\s*:\s*([^;]+);/g;
    let varMatch;
    
    while ((varMatch = varRegex.exec(rootContent)) !== null) {
      variables.push({
        name: varMatch[1],
        value: varMatch[2].trim(),
        file: path.relative(stylesDir, filePath),
        line: content.substring(0, match.index).split('\n').length + 
              rootContent.substring(0, varMatch.index).split('\n').length
      });
    }
  }
  
  return variables;
}

// Función principal
function analyzeCSS() {
  console.log('🔍 Analizando archivos CSS...\n');
  
  const files = readCSSFiles(stylesDir);
  console.log(`📁 Encontrados ${files.length} archivos CSS:\n`);
  
  files.forEach(file => {
    console.log(`  - ${path.relative(stylesDir, file)}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 ANÁLISIS DE DUPLICADOS\n');
  
  // Analizar reglas duplicadas
  const allRules = [];
  files.forEach(file => {
    const rules = extractCSSRules(file);
    allRules.push(...rules);
  });
  
  // Agrupar por selector
  const rulesBySelector = {};
  allRules.forEach(rule => {
    if (!rulesBySelector[rule.selector]) {
      rulesBySelector[rule.selector] = [];
    }
    rulesBySelector[rule.selector].push(rule);
  });
  
  // Mostrar duplicados
  const duplicates = Object.entries(rulesBySelector).filter(([_, rules]) => rules.length > 1);
  
  if (duplicates.length > 0) {
    console.log('🚨 REGLAS DUPLICADAS ENCONTRADAS:\n');
    duplicates.forEach(([selector, rules]) => {
      console.log(`  📌 ${selector}:`);
      rules.forEach(rule => {
        console.log(`    - ${rule.file}:${rule.startLine}`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No se encontraron reglas duplicadas');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎨 ANÁLISIS DE VARIABLES CSS\n');
  
  // Analizar variables duplicadas
  const allVariables = [];
  files.forEach(file => {
    const variables = extractCSSVariables(file);
    allVariables.push(...variables);
  });
  
  // Agrupar por nombre de variable
  const variablesByName = {};
  allVariables.forEach(variable => {
    if (!variablesByName[variable.name]) {
      variablesByName[variable.name] = [];
    }
    variablesByName[variable.name].push(variable);
  });
  
  // Mostrar variables duplicadas
  const duplicateVariables = Object.entries(variablesByName).filter(([_, vars]) => vars.length > 1);
  
  if (duplicateVariables.length > 0) {
    console.log('🚨 VARIABLES DUPLICADAS ENCONTRADAS:\n');
    duplicateVariables.forEach(([name, vars]) => {
      console.log(`  📌 --${name}:`);
      vars.forEach(variable => {
        console.log(`    - ${variable.file}:${variable.line} = ${variable.value}`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No se encontraron variables duplicadas');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📈 RESUMEN:\n');
  console.log(`  📁 Archivos analizados: ${files.length}`);
  console.log(`  📌 Reglas duplicadas: ${duplicates.length}`);
  console.log(`  🎨 Variables duplicadas: ${duplicateVariables.length}`);
  console.log(`  📊 Total de reglas: ${allRules.length}`);
  console.log(`  🎯 Total de variables: ${allVariables.length}`);
  
  if (duplicates.length > 0 || duplicateVariables.length > 0) {
    console.log('\n💡 RECOMENDACIONES:');
    console.log('  1. Consolidar reglas duplicadas en un solo archivo');
    console.log('  2. Usar variables CSS para valores repetidos');
    console.log('  3. Organizar CSS por funcionalidad (layout, components, utilities)');
    console.log('  4. Usar herramientas como PurgeCSS para eliminar CSS no utilizado');
  }
}

// Ejecutar análisis
analyzeCSS();

export { analyzeCSS, extractCSSRules, extractCSSVariables };
