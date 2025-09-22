/**
 * Configuración E2E para Cypress
 * Configuraciones específicas para tests end-to-end
 */

// Importar comandos personalizados
import './commands';

// Configuración global para E2E
beforeEach(() => {
  // Limpiar datos antes de cada test
  cy.cleanupTestData();
  
  // Interceptar requests de analytics para evitar ruido
  cy.intercept('GET', '**/analytics/**', { fixture: 'analytics.json' });
  cy.intercept('GET', '**/gtag/**', { fixture: 'gtag.json' });
});

// Configuración de viewport por defecto
Cypress.config('viewportWidth', 1280);
Cypress.config('viewportHeight', 720);

// Configuración de timeouts
Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('requestTimeout', 10000);
Cypress.config('responseTimeout', 10000);

// Configuración de retries
Cypress.config('retries', 2);

// Configuración de video
Cypress.config('video', true);
Cypress.config('videoCompression', 32);

// Configuración de screenshots
Cypress.config('screenshotOnRunFailure', true);

// Configuración de base URL
Cypress.config('baseUrl', 'http://localhost:4321');
