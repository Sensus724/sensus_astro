/**
 * Configuración de reglas de calidad para el proyecto Sensus
 * Define las reglas y umbrales para diferentes aspectos de calidad
 */

export interface QualityRule {
  id: string;
  name: string;
  description: string;
  category: 'code' | 'security' | 'performance' | 'accessibility' | 'seo' | 'tests';
  severity: 'critical' | 'high' | 'medium' | 'low';
  threshold: number;
  enabled: boolean;
  tool: string;
  rule: string;
  message: string;
}

export interface QualityRulesConfig {
  code: QualityRule[];
  security: QualityRule[];
  performance: QualityRule[];
  accessibility: QualityRule[];
  seo: QualityRule[];
  tests: QualityRule[];
}

export const QUALITY_RULES: QualityRulesConfig = {
  code: [
    {
      id: 'no-console',
      name: 'No Console Statements',
      description: 'Prohibir el uso de console.log en producción',
      category: 'code',
      severity: 'medium',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-console',
      message: 'Console statements should not be used in production code'
    },
    {
      id: 'no-debugger',
      name: 'No Debugger Statements',
      description: 'Prohibir el uso de debugger en producción',
      category: 'code',
      severity: 'high',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-debugger',
      message: 'Debugger statements should not be used in production code'
    },
    {
      id: 'no-unused-vars',
      name: 'No Unused Variables',
      description: 'Prohibir variables no utilizadas',
      category: 'code',
      severity: 'medium',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-unused-vars',
      message: 'Unused variables should be removed'
    },
    {
      id: 'no-unreachable',
      name: 'No Unreachable Code',
      description: 'Prohibir código inalcanzable',
      category: 'code',
      severity: 'medium',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-unreachable',
      message: 'Unreachable code should be removed'
    },
    {
      id: 'no-duplicate-imports',
      name: 'No Duplicate Imports',
      description: 'Prohibir imports duplicados',
      category: 'code',
      severity: 'low',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-duplicate-imports',
      message: 'Duplicate imports should be consolidated'
    },
    {
      id: 'prefer-const',
      name: 'Prefer Const',
      description: 'Preferir const sobre let cuando sea posible',
      category: 'code',
      severity: 'low',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'prefer-const',
      message: 'Use const for variables that are never reassigned'
    },
    {
      id: 'no-var',
      name: 'No Var',
      description: 'Prohibir el uso de var',
      category: 'code',
      severity: 'medium',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-var',
      message: 'Use let or const instead of var'
    },
    {
      id: 'eqeqeq',
      name: 'Require === and !==',
      description: 'Requerir uso de === y !== en lugar de == y !=',
      category: 'code',
      severity: 'medium',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'eqeqeq',
      message: 'Use === and !== instead of == and !='
    }
  ],

  security: [
    {
      id: 'no-eval',
      name: 'No Eval',
      description: 'Prohibir el uso de eval()',
      category: 'security',
      severity: 'critical',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-eval',
      message: 'eval() is dangerous and should not be used'
    },
    {
      id: 'no-implied-eval',
      name: 'No Implied Eval',
      description: 'Prohibir eval implícito',
      category: 'security',
      severity: 'high',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-implied-eval',
      message: 'Implied eval should not be used'
    },
    {
      id: 'no-new-func',
      name: 'No New Function',
      description: 'Prohibir new Function()',
      category: 'security',
      severity: 'high',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-new-func',
      message: 'new Function() should not be used'
    },
    {
      id: 'no-script-url',
      name: 'No Script URL',
      description: 'Prohibir javascript: URLs',
      category: 'security',
      severity: 'high',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-script-url',
      message: 'javascript: URLs should not be used'
    },
    {
      id: 'no-innerhtml',
      name: 'No InnerHTML',
      description: 'Prohibir innerHTML sin sanitización',
      category: 'security',
      severity: 'high',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-innerhtml',
      message: 'innerHTML should be avoided or properly sanitized'
    },
    {
      id: 'no-document-write',
      name: 'No Document Write',
      description: 'Prohibir document.write()',
      category: 'security',
      severity: 'medium',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-document-write',
      message: 'document.write() should not be used'
    }
  ],

  performance: [
    {
      id: 'no-loop-func',
      name: 'No Loop Functions',
      description: 'Prohibir funciones en loops',
      category: 'performance',
      severity: 'medium',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-loop-func',
      message: 'Functions should not be created in loops'
    },
    {
      id: 'no-await-in-loop',
      name: 'No Await in Loop',
      description: 'Prohibir await en loops',
      category: 'performance',
      severity: 'medium',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-await-in-loop',
      message: 'await should not be used in loops'
    },
    {
      id: 'no-nested-ternary',
      name: 'No Nested Ternary',
      description: 'Prohibir ternarios anidados',
      category: 'performance',
      severity: 'low',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-nested-ternary',
      message: 'Nested ternary operators should be avoided'
    },
    {
      id: 'no-regex-spaces',
      name: 'No Regex Spaces',
      description: 'Prohibir espacios en regex',
      category: 'performance',
      severity: 'low',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-regex-spaces',
      message: 'Spaces in regex should be avoided'
    },
    {
      id: 'no-useless-concat',
      name: 'No Useless Concat',
      description: 'Prohibir concatenación innecesaria',
      category: 'performance',
      severity: 'low',
      threshold: 0,
      enabled: true,
      tool: 'eslint',
      rule: 'no-useless-concat',
      message: 'Useless string concatenation should be avoided'
    }
  ],

  accessibility: [
    {
      id: 'alt-text',
      name: 'Alt Text Required',
      description: 'Requerir texto alternativo en imágenes',
      category: 'accessibility',
      severity: 'high',
      threshold: 100,
      enabled: true,
      tool: 'axe',
      rule: 'image-alt',
      message: 'Images must have alt text'
    },
    {
      id: 'heading-order',
      name: 'Heading Order',
      description: 'Requerir orden correcto de encabezados',
      category: 'accessibility',
      severity: 'medium',
      threshold: 100,
      enabled: true,
      tool: 'axe',
      rule: 'heading-order',
      message: 'Headings must be in correct order'
    },
    {
      id: 'color-contrast',
      name: 'Color Contrast',
      description: 'Requerir contraste de color adecuado',
      category: 'accessibility',
      severity: 'high',
      threshold: 100,
      enabled: true,
      tool: 'axe',
      rule: 'color-contrast',
      message: 'Color contrast must meet WCAG standards'
    },
    {
      id: 'focus-visible',
      name: 'Focus Visible',
      description: 'Requerir indicadores de foco visibles',
      category: 'accessibility',
      severity: 'medium',
      threshold: 100,
      enabled: true,
      tool: 'axe',
      rule: 'focus-visible',
      message: 'Focus indicators must be visible'
    },
    {
      id: 'keyboard-navigation',
      name: 'Keyboard Navigation',
      description: 'Requerir navegación por teclado',
      category: 'accessibility',
      severity: 'high',
      threshold: 100,
      enabled: true,
      tool: 'axe',
      rule: 'keyboard-navigation',
      message: 'All interactive elements must be keyboard accessible'
    },
    {
      id: 'aria-labels',
      name: 'ARIA Labels',
      description: 'Requerir etiquetas ARIA apropiadas',
      category: 'accessibility',
      severity: 'medium',
      threshold: 100,
      enabled: true,
      tool: 'axe',
      rule: 'aria-labels',
      message: 'ARIA labels must be provided for interactive elements'
    }
  ],

  seo: [
    {
      id: 'meta-title',
      name: 'Meta Title',
      description: 'Requerir título meta único',
      category: 'seo',
      severity: 'high',
      threshold: 100,
      enabled: true,
      tool: 'lighthouse',
      rule: 'meta-title',
      message: 'Each page must have a unique meta title'
    },
    {
      id: 'meta-description',
      name: 'Meta Description',
      description: 'Requerir descripción meta',
      category: 'seo',
      severity: 'medium',
      threshold: 100,
      enabled: true,
      tool: 'lighthouse',
      rule: 'meta-description',
      message: 'Each page must have a meta description'
    },
    {
      id: 'heading-structure',
      name: 'Heading Structure',
      description: 'Requerir estructura de encabezados',
      category: 'seo',
      severity: 'medium',
      threshold: 100,
      enabled: true,
      tool: 'lighthouse',
      rule: 'heading-structure',
      message: 'Pages must have proper heading structure'
    },
    {
      id: 'alt-text-seo',
      name: 'Alt Text for SEO',
      description: 'Requerir texto alternativo para SEO',
      category: 'seo',
      severity: 'medium',
      threshold: 100,
      enabled: true,
      tool: 'lighthouse',
      rule: 'alt-text-seo',
      message: 'Images must have descriptive alt text for SEO'
    },
    {
      id: 'canonical-url',
      name: 'Canonical URL',
      description: 'Requerir URL canónica',
      category: 'seo',
      severity: 'medium',
      threshold: 100,
      enabled: true,
      tool: 'lighthouse',
      rule: 'canonical-url',
      message: 'Pages must have canonical URLs'
    },
    {
      id: 'schema-markup',
      name: 'Schema Markup',
      description: 'Requerir marcado de esquema',
      category: 'seo',
      severity: 'low',
      threshold: 100,
      enabled: true,
      tool: 'lighthouse',
      rule: 'schema-markup',
      message: 'Pages should have structured data markup'
    }
  ],

  tests: [
    {
      id: 'test-coverage',
      name: 'Test Coverage',
      description: 'Requerir cobertura de tests mínima',
      category: 'tests',
      severity: 'high',
      threshold: 80,
      enabled: true,
      tool: 'jest',
      rule: 'coverage',
      message: 'Test coverage must be at least 80%'
    },
    {
      id: 'test-naming',
      name: 'Test Naming',
      description: 'Requerir nombres descriptivos en tests',
      category: 'tests',
      severity: 'medium',
      threshold: 100,
      enabled: true,
      tool: 'eslint',
      rule: 'test-naming',
      message: 'Test names must be descriptive'
    },
    {
      id: 'test-structure',
      name: 'Test Structure',
      description: 'Requerir estructura AAA en tests',
      category: 'tests',
      severity: 'medium',
      threshold: 100,
      enabled: true,
      tool: 'eslint',
      rule: 'test-structure',
      message: 'Tests must follow Arrange-Act-Assert structure'
    },
    {
      id: 'test-isolation',
      name: 'Test Isolation',
      description: 'Requerir aislamiento de tests',
      category: 'tests',
      severity: 'high',
      threshold: 100,
      enabled: true,
      tool: 'jest',
      rule: 'test-isolation',
      message: 'Tests must be isolated and independent'
    },
    {
      id: 'test-assertions',
      name: 'Test Assertions',
      description: 'Requerir aserciones en tests',
      category: 'tests',
      severity: 'high',
      threshold: 100,
      enabled: true,
      tool: 'jest',
      rule: 'test-assertions',
      message: 'Tests must have meaningful assertions'
    },
    {
      id: 'test-cleanup',
      name: 'Test Cleanup',
      description: 'Requerir limpieza en tests',
      category: 'tests',
      severity: 'medium',
      threshold: 100,
      enabled: true,
      tool: 'jest',
      rule: 'test-cleanup',
      message: 'Tests must clean up after themselves'
    }
  ]
};

export interface QualityThresholds {
  overall: number;
  code: number;
  security: number;
  performance: number;
  accessibility: number;
  seo: number;
  tests: number;
}

export const QUALITY_THRESHOLDS: QualityThresholds = {
  overall: 80,
  code: 85,
  security: 90,
  accessibility: 95,
  performance: 80,
  seo: 85,
  tests: 80
};

export interface QualityConfig {
  rules: QualityRulesConfig;
  thresholds: QualityThresholds;
  tools: {
    eslint: boolean;
    prettier: boolean;
    typescript: boolean;
    jest: boolean;
    lighthouse: boolean;
    axe: boolean;
  };
  notifications: {
    enabled: boolean;
    channels: string[];
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  };
  reporting: {
    enabled: boolean;
    format: 'json' | 'html' | 'pdf' | 'csv';
    destination: 'local' | 'email' | 'slack' | 'webhook';
    schedule: 'daily' | 'weekly' | 'monthly';
  };
}

export const DEFAULT_QUALITY_CONFIG: QualityConfig = {
  rules: QUALITY_RULES,
  thresholds: QUALITY_THRESHOLDS,
  tools: {
    eslint: true,
    prettier: true,
    typescript: true,
    jest: true,
    lighthouse: true,
    axe: true
  },
  notifications: {
    enabled: true,
    channels: ['browser'],
    frequency: 'daily'
  },
  reporting: {
    enabled: true,
    format: 'html',
    destination: 'local',
    schedule: 'weekly'
  }
};

export class QualityRulesManager {
  private config: QualityConfig;

  constructor(config: QualityConfig = DEFAULT_QUALITY_CONFIG) {
    this.config = config;
  }

  getRules(category?: string): QualityRule[] {
    if (category) {
      return this.config.rules[category as keyof QualityRulesConfig] || [];
    }
    
    return Object.values(this.config.rules).flat();
  }

  getRule(id: string): QualityRule | undefined {
    return this.getRules().find(rule => rule.id === id);
  }

  updateRule(id: string, updates: Partial<QualityRule>): void {
    const rule = this.getRule(id);
    if (rule) {
      Object.assign(rule, updates);
    }
  }

  enableRule(id: string): void {
    this.updateRule(id, { enabled: true });
  }

  disableRule(id: string): void {
    this.updateRule(id, { enabled: false });
  }

  getThresholds(): QualityThresholds {
    return this.config.thresholds;
  }

  updateThreshold(category: keyof QualityThresholds, value: number): void {
    this.config.thresholds[category] = value;
  }

  getConfig(): QualityConfig {
    return this.config;
  }

  updateConfig(updates: Partial<QualityConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configJson: string): void {
    try {
      const importedConfig = JSON.parse(configJson);
      this.config = { ...DEFAULT_QUALITY_CONFIG, ...importedConfig };
    } catch (error) {
      console.error('Error importing quality config:', error);
    }
  }

  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar umbrales
    Object.entries(this.config.thresholds).forEach(([category, threshold]) => {
      if (threshold < 0 || threshold > 100) {
        errors.push(`Threshold for ${category} must be between 0 and 100`);
      }
    });

    // Validar reglas
    Object.values(this.config.rules).flat().forEach(rule => {
      if (rule.threshold < 0 || rule.threshold > 100) {
        errors.push(`Threshold for rule ${rule.id} must be between 0 and 100`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default QualityRulesManager;
