/**
 * Tests unitarios para el sistema de diseño
 * Verifica que los tokens CSS funcionen correctamente
 */

describe('Sistema de Diseño - Tests Unitarios', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Tokens de Colores', () => {
    it('debe tener variables CSS de colores definidas', () => {
      cy.window().then((win) => {
        const computedStyle = win.getComputedStyle(win.document.documentElement);
        
        // Verificar colores primarios
        expect(computedStyle.getPropertyValue('--color-primary-500')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--color-primary-600')).to.not.be.empty;
        
        // Verificar colores secundarios
        expect(computedStyle.getPropertyValue('--color-secondary-500')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--color-secondary-600')).to.not.be.empty;
        
        // Verificar colores semánticos
        expect(computedStyle.getPropertyValue('--color-success-500')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--color-warning-500')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--color-error-500')).to.not.be.empty;
      });
    });

    it('debe aplicar colores correctamente a elementos', () => {
      cy.get('.text-primary').should('have.css', 'color');
      cy.get('.text-secondary').should('have.css', 'color');
      cy.get('.bg-primary').should('have.css', 'background-color');
      cy.get('.bg-secondary').should('have.css', 'background-color');
    });
  });

  describe('Tokens de Tipografía', () => {
    it('debe tener variables CSS de tipografía definidas', () => {
      cy.window().then((win) => {
        const computedStyle = win.getComputedStyle(win.document.documentElement);
        
        // Verificar tamaños de fuente
        expect(computedStyle.getPropertyValue('--font-size-base')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--font-size-lg')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--font-size-xl')).to.not.be.empty;
        
        // Verificar pesos de fuente
        expect(computedStyle.getPropertyValue('--font-weight-normal')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--font-weight-semibold')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--font-weight-bold')).to.not.be.empty;
      });
    });

    it('debe aplicar tipografía correctamente', () => {
      cy.get('.text-base').should('have.css', 'font-size');
      cy.get('.text-lg').should('have.css', 'font-size');
      cy.get('.font-normal').should('have.css', 'font-weight');
      cy.get('.font-semibold').should('have.css', 'font-weight');
    });
  });

  describe('Tokens de Espaciado', () => {
    it('debe tener variables CSS de espaciado definidas', () => {
      cy.window().then((win) => {
        const computedStyle = win.getComputedStyle(win.document.documentElement);
        
        // Verificar espaciado base
        expect(computedStyle.getPropertyValue('--space-1')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--space-2')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--space-4')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--space-8')).to.not.be.empty;
        
        // Verificar espaciado semántico
        expect(computedStyle.getPropertyValue('--space-xs')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--space-sm')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--space-md')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--space-lg')).to.not.be.empty;
      });
    });

    it('debe aplicar espaciado correctamente', () => {
      cy.get('.p-1').should('have.css', 'padding');
      cy.get('.p-2').should('have.css', 'padding');
      cy.get('.m-1').should('have.css', 'margin');
      cy.get('.m-2').should('have.css', 'margin');
    });
  });

  describe('Tokens de Breakpoints', () => {
    it('debe tener variables CSS de breakpoints definidas', () => {
      cy.window().then((win) => {
        const computedStyle = win.getComputedStyle(win.document.documentElement);
        
        // Verificar breakpoints
        expect(computedStyle.getPropertyValue('--breakpoint-sm')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--breakpoint-md')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--breakpoint-lg')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--breakpoint-xl')).to.not.be.empty;
      });
    });

    it('debe aplicar breakpoints correctamente', () => {
      // Verificar que el contenedor se adapta a diferentes tamaños
      cy.viewport(375, 667); // Mobile
      cy.get('.container').should('be.visible');
      
      cy.viewport(768, 1024); // Tablet
      cy.get('.container').should('be.visible');
      
      cy.viewport(1920, 1080); // Desktop
      cy.get('.container').should('be.visible');
    });
  });

  describe('Transiciones y Animaciones', () => {
    it('debe tener variables CSS de transiciones definidas', () => {
      cy.window().then((win) => {
        const computedStyle = win.getComputedStyle(win.document.documentElement);
        
        expect(computedStyle.getPropertyValue('--transition-fast')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--transition-normal')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--transition-slow')).to.not.be.empty;
      });
    });

    it('debe aplicar transiciones correctamente', () => {
      cy.get('.transition-fast').should('have.css', 'transition');
      cy.get('.transition-normal').should('have.css', 'transition');
      cy.get('.transition-slow').should('have.css', 'transition');
    });
  });

  describe('Sombras', () => {
    it('debe tener variables CSS de sombras definidas', () => {
      cy.window().then((win) => {
        const computedStyle = win.getComputedStyle(win.document.documentElement);
        
        expect(computedStyle.getPropertyValue('--shadow-sm')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--shadow-md')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--shadow-lg')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--shadow-xl')).to.not.be.empty;
      });
    });

    it('debe aplicar sombras correctamente', () => {
      cy.get('.shadow-sm').should('have.css', 'box-shadow');
      cy.get('.shadow-md').should('have.css', 'box-shadow');
      cy.get('.shadow-lg').should('have.css', 'box-shadow');
      cy.get('.shadow-xl').should('have.css', 'box-shadow');
    });
  });

  describe('Z-Index', () => {
    it('debe tener variables CSS de z-index definidas', () => {
      cy.window().then((win) => {
        const computedStyle = win.getComputedStyle(win.document.documentElement);
        
        expect(computedStyle.getPropertyValue('--z-dropdown')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--z-modal')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--z-tooltip')).to.not.be.empty;
      });
    });

    it('debe aplicar z-index correctamente', () => {
      cy.get('.z-dropdown').should('have.css', 'z-index');
      cy.get('.z-modal').should('have.css', 'z-index');
      cy.get('.z-tooltip').should('have.css', 'z-index');
    });
  });

  describe('Gradientes', () => {
    it('debe tener variables CSS de gradientes definidas', () => {
      cy.window().then((win) => {
        const computedStyle = win.getComputedStyle(win.document.documentElement);
        
        expect(computedStyle.getPropertyValue('--gradient-primary')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--gradient-secondary')).to.not.be.empty;
      });
    });

    it('debe aplicar gradientes correctamente', () => {
      cy.get('.gradient-primary').should('have.css', 'background');
      cy.get('.gradient-secondary').should('have.css', 'background');
    });
  });

  describe('Estados de Focus', () => {
    it('debe tener variables CSS de focus definidas', () => {
      cy.window().then((win) => {
        const computedStyle = win.getComputedStyle(win.document.documentElement);
        
        expect(computedStyle.getPropertyValue('--focus-ring')).to.not.be.empty;
        expect(computedStyle.getPropertyValue('--color-focus')).to.not.be.empty;
      });
    });

    it('debe aplicar estados de focus correctamente', () => {
      cy.get('.focus-ring').should('have.css', 'box-shadow');
      cy.get('button').first().focus().should('have.focus');
    });
  });
});
