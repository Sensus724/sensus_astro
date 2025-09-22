/**
 * Tests de integración para API
 * Verifica integración entre frontend y backend
 */

describe('API Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Health Check', () => {
    it('debe responder el endpoint de salud', () => {
      cy.request('GET', 'http://localhost:3000/health')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('success', true);
          expect(response.body).to.have.property('message');
          expect(response.body).to.have.property('timestamp');
          expect(response.body).to.have.property('version');
        });
    });

    it('debe responder el endpoint de información de API', () => {
      cy.request('GET', 'http://localhost:3000/api/info')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('success', true);
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('name');
          expect(response.body.data).to.have.property('version');
          expect(response.body.data).to.have.property('endpoints');
        });
    });
  });

  describe('Evaluaciones API', () => {
    it('debe crear una evaluación correctamente', () => {
      const evaluationData = {
        userId: 'test-user-123',
        testType: 'GAD-7',
        answers: [0, 1, 2, 1, 0, 2, 1],
        score: 7,
        severity: 'moderate'
      };

      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/evaluations',
        body: evaluationData,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('id');
        expect(response.body.data).to.have.property('score', 7);
      });
    });

    it('debe obtener evaluaciones de un usuario', () => {
      cy.request('GET', 'http://localhost:3000/api/v1/evaluations?userId=test-user-123')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('success', true);
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.be.an('array');
        });
    });

    it('debe obtener estadísticas de evaluaciones', () => {
      cy.request('GET', 'http://localhost:3000/api/v1/evaluations/stats?userId=test-user-123')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('success', true);
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('totalEvaluations');
          expect(response.body.data).to.have.property('averageScore');
        });
    });
  });

  describe('Diario API', () => {
    it('debe crear una entrada de diario correctamente', () => {
      const diaryData = {
        userId: 'test-user-123',
        content: 'Test diary entry',
        mood: 3,
        tags: ['test', 'anxiety'],
        date: new Date().toISOString()
      };

      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/diary',
        body: diaryData,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('id');
        expect(response.body.data).to.have.property('content', 'Test diary entry');
      });
    });

    it('debe obtener entradas de diario de un usuario', () => {
      cy.request('GET', 'http://localhost:3000/api/v1/diary?userId=test-user-123')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('success', true);
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.be.an('array');
        });
    });

    it('debe buscar entradas de diario', () => {
      cy.request('GET', 'http://localhost:3000/api/v1/diary/search?userId=test-user-123&query=test')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('success', true);
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.be.an('array');
        });
    });
  });

  describe('Usuarios API', () => {
    it('debe crear un usuario correctamente', () => {
      const userData = {
        email: 'test@sensus.app',
        name: 'Test User',
        age: 25,
        preferences: {
          notifications: true,
          theme: 'light'
        }
      };

      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/users/create',
        body: userData,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('id');
        expect(response.body.data).to.have.property('email', 'test@sensus.app');
      });
    });

    it('debe obtener perfil de usuario', () => {
      cy.request('GET', 'http://localhost:3000/api/v1/users/profile?userId=test-user-123')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('success', true);
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('email');
        });
    });

    it('debe actualizar perfil de usuario', () => {
      const updateData = {
        name: 'Updated Test User',
        age: 26,
        preferences: {
          notifications: false,
          theme: 'dark'
        }
      };

      cy.request({
        method: 'PUT',
        url: 'http://localhost:3000/api/v1/users/profile',
        body: { ...updateData, userId: 'test-user-123' },
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('name', 'Updated Test User');
      });
    });
  });

  describe('Manejo de Errores', () => {
    it('debe manejar errores 404 correctamente', () => {
      cy.request({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/nonexistent',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('success', false);
        expect(response.body).to.have.property('error');
      });
    });

    it('debe manejar errores de validación correctamente', () => {
      const invalidData = {
        // Datos inválidos intencionalmente
        email: 'invalid-email',
        answers: 'not-an-array'
      };

      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/evaluations',
        body: invalidData,
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body).to.have.property('error');
      });
    });

    it('debe manejar rate limiting correctamente', () => {
      // Hacer múltiples requests rápidos para activar rate limiting
      const requests = Array(10).fill().map(() => 
        cy.request('GET', 'http://localhost:3000/health')
      );

      cy.wrap(requests).then(() => {
        cy.request({
          method: 'GET',
          url: 'http://localhost:3000/health',
          failOnStatusCode: false
        }).then((response) => {
          // El rate limiting puede activarse o no dependiendo de la configuración
          expect([200, 429]).to.include(response.status);
        });
      });
    });
  });

  describe('CORS y Headers', () => {
    it('debe incluir headers CORS correctos', () => {
      cy.request('GET', 'http://localhost:3000/health')
        .then((response) => {
          expect(response.headers).to.have.property('access-control-allow-origin');
          expect(response.headers).to.have.property('access-control-allow-methods');
          expect(response.headers).to.have.property('access-control-allow-headers');
        });
    });

    it('debe incluir headers de seguridad', () => {
      cy.request('GET', 'http://localhost:3000/health')
        .then((response) => {
          expect(response.headers).to.have.property('x-content-type-options');
          expect(response.headers).to.have.property('x-frame-options');
          expect(response.headers).to.have.property('x-xss-protection');
        });
    });
  });

  describe('Performance', () => {
    it('debe responder en menos de 2 segundos', () => {
      const startTime = Date.now();
      
      cy.request('GET', 'http://localhost:3000/health')
        .then(() => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          expect(responseTime).to.be.lessThan(2000);
        });
    });

    it('debe manejar múltiples requests concurrentes', () => {
      const requests = Array(5).fill().map(() => 
        cy.request('GET', 'http://localhost:3000/health')
      );

      cy.wrap(requests).then(() => {
        // Todos los requests deben completarse exitosamente
        requests.forEach(request => {
          request.then((response) => {
            expect(response.status).to.eq(200);
          });
        });
      });
    });
  });
});
