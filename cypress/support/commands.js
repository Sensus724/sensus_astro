/**
 * Comandos personalizados de Cypress para Sensus
 * Comandos reutilizables para tests más eficientes
 */

// Comando para login de usuario
Cypress.Commands.add('loginUser', (email = 'test@sensus.app', password = 'test123') => {
  cy.visit('/login');
  cy.get('[data-cy="email-input"]').type(email);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="login-button"]').click();
  cy.url().should('not.include', '/login');
});

// Comando para logout de usuario
Cypress.Commands.add('logoutUser', () => {
  cy.get('[data-cy="user-menu"]').click();
  cy.get('[data-cy="logout-button"]').click();
  cy.url().should('include', '/');
});

// Comando para completar evaluación GAD-7
Cypress.Commands.add('completeGAD7', (answers = [0, 1, 2, 1, 0, 2, 1]) => {
  cy.visit('/evaluacion');
  
  // Completar cada pregunta
  answers.forEach((answer, index) => {
    cy.get(`[data-cy="question-${index + 1}"]`)
      .find(`[data-cy="answer-${answer}"]`)
      .click();
  });
  
  // Enviar evaluación
  cy.get('[data-cy="submit-evaluation"]').click();
  
  // Verificar que se muestran los resultados
  cy.get('[data-cy="evaluation-results"]').should('be.visible');
});

// Comando para crear entrada de diario
Cypress.Commands.add('createDiaryEntry', (content = 'Test diary entry') => {
  cy.visit('/diario');
  cy.get('[data-cy="new-entry-button"]').click();
  cy.get('[data-cy="diary-content"]').type(content);
  cy.get('[data-cy="mood-selector"]').click();
  cy.get('[data-cy="mood-3"]').click(); // Mood neutral
  cy.get('[data-cy="save-entry"]').click();
  cy.get('[data-cy="entry-saved"]').should('be.visible');
});

// Comando para verificar accesibilidad básica
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y();
});

// Comando para verificar performance
Cypress.Commands.add('checkPerformance', () => {
  cy.window().then((win) => {
    const performance = win.performance;
    const navigation = performance.getEntriesByType('navigation')[0];
    
    // Verificar que la página carga en menos de 3 segundos
    expect(navigation.loadEventEnd - navigation.loadEventStart).to.be.lessThan(3000);
  });
});

// Comando para verificar responsive design
Cypress.Commands.add('checkResponsive', () => {
  const viewports = [
    { width: 320, height: 568, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1920, height: 1080, name: 'desktop' }
  ];
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    cy.get('body').should('be.visible');
    cy.get('.container').should('be.visible');
  });
});

// Comando para verificar SEO básico
Cypress.Commands.add('checkSEO', () => {
  cy.get('title').should('not.be.empty');
  cy.get('meta[name="description"]').should('have.attr', 'content');
  cy.get('meta[name="keywords"]').should('have.attr', 'content');
  cy.get('h1').should('exist');
});

// Comando para verificar PWA
Cypress.Commands.add('checkPWA', () => {
  cy.get('link[rel="manifest"]').should('exist');
  cy.get('meta[name="theme-color"]').should('exist');
  cy.get('meta[name="apple-mobile-web-app-capable"]').should('exist');
});

// Comando para simular conexión lenta
Cypress.Commands.add('simulateSlowConnection', () => {
  cy.intercept('**/*', (req) => {
    req.reply((res) => {
      res.delay(2000); // 2 segundos de delay
      return res;
    });
  });
});

// Comando para verificar errores de consola
Cypress.Commands.add('checkConsoleErrors', () => {
  cy.window().then((win) => {
    const errors = [];
    const originalError = win.console.error;
    
    win.console.error = (...args) => {
      errors.push(args.join(' '));
      originalError.apply(win.console, args);
    };
    
    cy.then(() => {
      expect(errors).to.have.length(0);
    });
  });
});

// Comando para verificar formularios
Cypress.Commands.add('checkFormValidation', (formSelector) => {
  cy.get(formSelector).within(() => {
    // Verificar que los campos requeridos están marcados
    cy.get('[required]').should('exist');
    
    // Verificar que los tipos de input son correctos
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    
    // Verificar que hay mensajes de error
    cy.get('[data-cy="submit-button"]').click();
    cy.get('.error-message').should('be.visible');
  });
});

// Comando para verificar navegación
Cypress.Commands.add('checkNavigation', () => {
  const navLinks = [
    { href: '/', text: 'Inicio' },
    { href: '/evaluacion', text: 'Evaluación' },
    { href: '/diario', text: 'Diario' },
    { href: '/planes', text: 'Planes' },
    { href: '/equipo', text: 'Equipo' },
    { href: '/contacto', text: 'Contacto' }
  ];
  
  navLinks.forEach(link => {
    cy.get(`a[href="${link.href}"]`).should('contain', link.text);
    cy.get(`a[href="${link.href}"]`).click();
    cy.url().should('include', link.href);
    cy.get('body').should('be.visible');
  });
});

// Comando para verificar componentes UI
Cypress.Commands.add('checkUIComponents', () => {
  // Verificar que los botones tienen estados hover
  cy.get('.btn').first().trigger('mouseover');
  cy.get('.btn').first().should('have.css', 'transform');
  
  // Verificar que las tarjetas tienen sombras
  cy.get('.card').should('have.css', 'box-shadow');
  
  // Verificar que los formularios tienen focus states
  cy.get('input').first().focus();
  cy.get('input').first().should('have.focus');
});

// Comando para limpiar datos de test
Cypress.Commands.add('cleanupTestData', () => {
  // Limpiar localStorage
  cy.clearLocalStorage();
  
  // Limpiar cookies
  cy.clearCookies();
  
  // Limpiar sessionStorage
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// Comando para verificar modo oscuro
Cypress.Commands.add('checkDarkMode', () => {
  cy.get('[data-cy="theme-toggle"]').click();
  cy.get('body').should('have.class', 'dark-mode');
  cy.get('[data-cy="theme-toggle"]').click();
  cy.get('body').should('not.have.class', 'dark-mode');
});

// Comando para verificar notificaciones
Cypress.Commands.add('checkNotifications', () => {
  cy.get('[data-cy="notification-button"]').click();
  cy.get('[data-cy="notification-center"]').should('be.visible');
  cy.get('[data-cy="notification-center"]').should('contain', 'No hay notificaciones');
});
