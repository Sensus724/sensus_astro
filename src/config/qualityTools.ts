/**
 * Configuración de herramientas de calidad para el proyecto Sensus
 * Define las herramientas y sus configuraciones específicas
 */

export interface QualityTool {
  id: string;
  name: string;
  description: string;
  category: 'linting' | 'formatting' | 'testing' | 'security' | 'performance' | 'accessibility' | 'seo';
  enabled: boolean;
  config: Record<string, any>;
  dependencies: string[];
  scripts: Record<string, string>;
  thresholds: Record<string, number>;
}

export interface QualityToolsConfig {
  eslint: QualityTool;
  prettier: QualityTool;
  typescript: QualityTool;
  jest: QualityTool;
  lighthouse: QualityTool;
  axe: QualityTool;
  husky: QualityTool;
  lintStaged: QualityTool;
  commitlint: QualityTool;
  semanticRelease: QualityTool;
}

export const QUALITY_TOOLS: QualityToolsConfig = {
  eslint: {
    id: 'eslint',
    name: 'ESLint',
    description: 'Linter de JavaScript/TypeScript',
    category: 'linting',
    enabled: true,
    config: {
      extends: [
        '@astrojs/eslint-config-astro',
        'eslint:recommended',
        '@typescript-eslint/recommended'
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      plugins: ['@typescript-eslint', 'astro'],
      rules: {
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-unused-vars': 'error',
        'no-unreachable': 'error',
        'no-duplicate-imports': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        'eqeqeq': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-script-url': 'error',
        'no-loop-func': 'warn',
        'no-await-in-loop': 'warn',
        'no-nested-ternary': 'warn',
        'no-regex-spaces': 'warn',
        'no-useless-concat': 'warn'
      },
      env: {
        browser: true,
        node: true,
        es2022: true
      },
      ignorePatterns: [
        'dist/',
        'node_modules/',
        '*.min.js',
        'public/'
      ]
    },
    dependencies: [
      'eslint',
      '@astrojs/eslint-config-astro',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser'
    ],
    scripts: {
      'lint': 'eslint . --ext .js,.ts,.astro',
      'lint:fix': 'eslint . --ext .js,.ts,.astro --fix',
      'lint:report': 'eslint . --ext .js,.ts,.astro --format json --output-file eslint-report.json'
    },
    thresholds: {
      errors: 0,
      warnings: 10,
      maxWarnings: 20
    }
  },

  prettier: {
    id: 'prettier',
    name: 'Prettier',
    description: 'Formateador de código',
    category: 'formatting',
    enabled: true,
    config: {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      bracketSpacing: true,
      arrowParens: 'avoid',
      endOfLine: 'lf',
      plugins: ['prettier-plugin-astro']
    },
    dependencies: [
      'prettier',
      'prettier-plugin-astro'
    ],
    scripts: {
      'format': 'prettier --write .',
      'format:check': 'prettier --check .',
      'format:report': 'prettier --write . --log-level debug'
    },
    thresholds: {
      formatted: 100,
      unformatted: 0
    }
  },

  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    description: 'Verificador de tipos',
    category: 'linting',
    enabled: true,
    config: {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'preserve',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        noImplicitReturns: true,
        noImplicitOverride: true,
        noPropertyAccessFromIndexSignature: true,
        noUncheckedIndexedAccess: true,
        exactOptionalPropertyTypes: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: [
        'src/**/*',
        'tests/**/*'
      ],
      exclude: [
        'node_modules',
        'dist',
        'public'
      ]
    },
    dependencies: [
      'typescript',
      '@types/node'
    ],
    scripts: {
      'type-check': 'tsc --noEmit',
      'type-check:watch': 'tsc --noEmit --watch',
      'type-check:report': 'tsc --noEmit --listFiles'
    },
    thresholds: {
      errors: 0,
      warnings: 5,
      maxWarnings: 10
    }
  },

  jest: {
    id: 'jest',
    name: 'Jest',
    description: 'Framework de testing',
    category: 'testing',
    enabled: true,
    config: {
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      testMatch: [
        '<rootDir>/tests/**/*.test.{js,ts}',
        '<rootDir>/src/**/*.test.{js,ts}'
      ],
      collectCoverageFrom: [
        'src/**/*.{js,ts,astro}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{js,ts}',
        '!src/**/*.test.{js,ts}'
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      coverageReporters: ['text', 'lcov', 'html', 'json'],
      coverageDirectory: 'coverage',
      testTimeout: 10000,
      verbose: true
    },
    dependencies: [
      'jest',
      'ts-jest',
      '@types/jest',
      'jest-environment-jsdom'
    ],
    scripts: {
      'test': 'jest',
      'test:watch': 'jest --watch',
      'test:coverage': 'jest --coverage',
      'test:ci': 'jest --ci --coverage --watchAll=false'
    },
    thresholds: {
      coverage: 80,
      passRate: 100,
      maxFailures: 0
    }
  },

  lighthouse: {
    id: 'lighthouse',
    name: 'Lighthouse',
    description: 'Auditor de rendimiento y SEO',
    category: 'performance',
    enabled: true,
    config: {
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        }
      },
      thresholds: {
        performance: 80,
        accessibility: 95,
        'best-practices': 80,
        seo: 85
      }
    },
    dependencies: [
      'lighthouse',
      'lighthouse-ci'
    ],
    scripts: {
      'lighthouse': 'lighthouse http://localhost:4321 --output html --output-path lighthouse-report.html',
      'lighthouse:ci': 'lighthouse-ci autorun',
      'lighthouse:mobile': 'lighthouse http://localhost:4321 --output html --output-path lighthouse-mobile-report.html --emulated-form-factor mobile'
    },
    thresholds: {
      performance: 80,
      accessibility: 95,
      'best-practices': 80,
      seo: 85
    }
  },

  axe: {
    id: 'axe',
    name: 'Axe',
    description: 'Auditor de accesibilidad',
    category: 'accessibility',
    enabled: true,
    config: {
      rules: {
        'color-contrast': { enabled: true },
        'image-alt': { enabled: true },
        'heading-order': { enabled: true },
        'focus-visible': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true }
      },
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      exclude: ['#skip-a11y-test']
    },
    dependencies: [
      'axe-core',
      '@axe-core/playwright'
    ],
    scripts: {
      'a11y': 'axe http://localhost:4321 --output a11y-report.json',
      'a11y:html': 'axe http://localhost:4321 --output a11y-report.html',
      'a11y:ci': 'axe http://localhost:4321 --output a11y-report.json --exit'
    },
    thresholds: {
      violations: 0,
      passes: 100,
      incomplete: 0
    }
  },

  husky: {
    id: 'husky',
    name: 'Husky',
    description: 'Git hooks',
    category: 'linting',
    enabled: true,
    config: {
      hooks: {
        'pre-commit': 'lint-staged',
        'pre-push': 'npm run test:ci',
        'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS'
      }
    },
    dependencies: [
      'husky',
      'lint-staged',
      '@commitlint/cli',
      '@commitlint/config-conventional'
    ],
    scripts: {
      'prepare': 'husky install',
      'pre-commit': 'lint-staged',
      'pre-push': 'npm run test:ci'
    },
    thresholds: {
      hookFailures: 0,
      hookSuccess: 100
    }
  },

  lintStaged: {
    id: 'lint-staged',
    name: 'Lint Staged',
    description: 'Linter para archivos staged',
    category: 'linting',
    enabled: true,
    config: {
      '*.{js,ts,astro}': [
        'eslint --fix',
        'prettier --write'
      ],
      '*.{json,md,yml,yaml}': [
        'prettier --write'
      ]
    },
    dependencies: [
      'lint-staged'
    ],
    scripts: {
      'lint-staged': 'lint-staged'
    },
    thresholds: {
      stagedFiles: 100,
      lintedFiles: 100
    }
  },

  commitlint: {
    id: 'commitlint',
    name: 'Commitlint',
    description: 'Linter de mensajes de commit',
    category: 'linting',
    enabled: true,
    config: {
      extends: ['@commitlint/config-conventional'],
      rules: {
        'type-enum': [
          2,
          'always',
          [
            'feat',
            'fix',
            'docs',
            'style',
            'refactor',
            'perf',
            'test',
            'build',
            'ci',
            'chore',
            'revert'
          ]
        ],
        'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never']
      }
    },
    dependencies: [
      '@commitlint/cli',
      '@commitlint/config-conventional'
    ],
    scripts: {
      'commitlint': 'commitlint --edit',
      'commitlint:check': 'commitlint --from HEAD~1 --to HEAD --verbose'
    },
    thresholds: {
      validCommits: 100,
      invalidCommits: 0
    }
  },

  semanticRelease: {
    id: 'semantic-release',
    name: 'Semantic Release',
    description: 'Lanzamiento semántico automático',
    category: 'testing',
    enabled: true,
    config: {
      branches: [
        'main',
        {
          name: 'beta',
          prerelease: true
        }
      ],
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/npm',
        '@semantic-release/github',
        '@semantic-release/git'
      ],
      repositoryUrl: 'https://github.com/username/sensus-astro',
      tagFormat: 'v${version}'
    },
    dependencies: [
      'semantic-release',
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      '@semantic-release/changelog',
      '@semantic-release/npm',
      '@semantic-release/github',
      '@semantic-release/git'
    ],
    scripts: {
      'semantic-release': 'semantic-release',
      'semantic-release:dry-run': 'semantic-release --dry-run'
    },
    thresholds: {
      releaseSuccess: 100,
      releaseFailures: 0
    }
  }
};

export interface QualityToolsManager {
  getTool(id: string): QualityTool | undefined;
  getToolsByCategory(category: string): QualityTool[];
  enableTool(id: string): void;
  disableTool(id: string): void;
  updateToolConfig(id: string, config: Record<string, any>): void;
  getToolScripts(id: string): Record<string, string>;
  getToolThresholds(id: string): Record<string, number>;
  validateToolConfig(id: string): { valid: boolean; errors: string[] };
  exportToolConfig(id: string): string;
  importToolConfig(id: string, configJson: string): void;
}

export class QualityToolsManagerImpl implements QualityToolsManager {
  private tools: QualityToolsConfig;

  constructor(tools: QualityToolsConfig = QUALITY_TOOLS) {
    this.tools = tools;
  }

  getTool(id: string): QualityTool | undefined {
    return this.tools[id as keyof QualityToolsConfig];
  }

  getToolsByCategory(category: string): QualityTool[] {
    return Object.values(this.tools).filter(tool => tool.category === category);
  }

  enableTool(id: string): void {
    const tool = this.getTool(id);
    if (tool) {
      tool.enabled = true;
    }
  }

  disableTool(id: string): void {
    const tool = this.getTool(id);
    if (tool) {
      tool.enabled = false;
    }
  }

  updateToolConfig(id: string, config: Record<string, any>): void {
    const tool = this.getTool(id);
    if (tool) {
      tool.config = { ...tool.config, ...config };
    }
  }

  getToolScripts(id: string): Record<string, string> {
    const tool = this.getTool(id);
    return tool?.scripts || {};
  }

  getToolThresholds(id: string): Record<string, number> {
    const tool = this.getTool(id);
    return tool?.thresholds || {};
  }

  validateToolConfig(id: string): { valid: boolean; errors: string[] } {
    const tool = this.getTool(id);
    const errors: string[] = [];

    if (!tool) {
      errors.push(`Tool ${id} not found`);
      return { valid: false, errors };
    }

    // Validar umbrales
    Object.entries(tool.thresholds).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0 || value > 100) {
        errors.push(`Threshold ${key} for tool ${id} must be a number between 0 and 100`);
      }
    });

    // Validar configuración específica por herramienta
    switch (id) {
      case 'eslint':
        if (!tool.config.extends || !Array.isArray(tool.config.extends)) {
          errors.push('ESLint config must have extends array');
        }
        break;
      case 'prettier':
        if (typeof tool.config.printWidth !== 'number' || tool.config.printWidth < 1) {
          errors.push('Prettier printWidth must be a positive number');
        }
        break;
      case 'jest':
        if (!tool.config.testMatch || !Array.isArray(tool.config.testMatch)) {
          errors.push('Jest config must have testMatch array');
        }
        break;
      case 'lighthouse':
        if (!tool.config.thresholds || typeof tool.config.thresholds !== 'object') {
          errors.push('Lighthouse config must have thresholds object');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  exportToolConfig(id: string): string {
    const tool = this.getTool(id);
    return tool ? JSON.stringify(tool, null, 2) : '';
  }

  importToolConfig(id: string, configJson: string): void {
    try {
      const importedConfig = JSON.parse(configJson);
      const tool = this.getTool(id);
      if (tool) {
        Object.assign(tool, importedConfig);
      }
    } catch (error) {
      console.error(`Error importing config for tool ${id}:`, error);
    }
  }

  getAllTools(): QualityTool[] {
    return Object.values(this.tools);
  }

  getEnabledTools(): QualityTool[] {
    return Object.values(this.tools).filter(tool => tool.enabled);
  }

  getDisabledTools(): QualityTool[] {
    return Object.values(this.tools).filter(tool => !tool.enabled);
  }

  exportAllConfigs(): string {
    return JSON.stringify(this.tools, null, 2);
  }

  importAllConfigs(configsJson: string): void {
    try {
      const importedConfigs = JSON.parse(configsJson);
      this.tools = { ...this.tools, ...importedConfigs };
    } catch (error) {
      console.error('Error importing all tool configs:', error);
    }
  }
}

export default QualityToolsManagerImpl;
