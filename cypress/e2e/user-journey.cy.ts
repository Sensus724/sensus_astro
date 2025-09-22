/**
 * Tests E2E para flujos completos de usuario
 */

describe('Sensus User Journey', () => {
  beforeEach(() => {
    // Visitar la página principal
    cy.visit('/')
    
    // Limpiar localStorage
    cy.clearLocalStorage()
  })

  describe('Registro y Login', () => {
    it('debe permitir registro completo de nuevo usuario', () => {
      // Ir a página de registro
      cy.get('[data-testid="register-link"]').click()
      cy.url().should('include', '/register')

      // Llenar formulario de registro
      cy.get('[data-testid="firstName"]').type('Juan')
      cy.get('[data-testid="lastName"]').type('Pérez')
      cy.get('[data-testid="email"]').type('juan.perez@test.com')
      cy.get('[data-testid="password"]').type('password123')
      cy.get('[data-testid="confirmPassword"]').type('password123')
      cy.get('[data-testid="birthDate"]').type('1990-01-01')
      cy.get('[data-testid="terms"]').check()

      // Enviar formulario
      cy.get('[data-testid="register-submit"]').click()

      // Verificar redirección y mensaje de éxito
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="success-message"]').should('contain', 'Cuenta creada exitosamente')
      cy.get('[data-testid="user-menu"]').should('contain', 'Juan')
    })

    it('debe permitir login con credenciales válidas', () => {
      // Ir a página de login
      cy.get('[data-testid="login-link"]').click()
      cy.url().should('include', '/login')

      // Llenar formulario de login
      cy.get('[data-testid="email"]').type('juan.perez@test.com')
      cy.get('[data-testid="password"]').type('password123')

      // Enviar formulario
      cy.get('[data-testid="login-submit"]').click()

      // Verificar redirección y estado autenticado
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="user-menu"]').should('contain', 'Juan')
      cy.get('[data-testid="logout-btn"]').should('be.visible')
    })

    it('debe manejar errores de autenticación', () => {
      // Intentar login con credenciales incorrectas
      cy.get('[data-testid="login-link"]').click()
      cy.get('[data-testid="email"]').type('juan.perez@test.com')
      cy.get('[data-testid="password"]').type('wrong-password')
      cy.get('[data-testid="login-submit"]').click()

      // Verificar mensaje de error
      cy.get('[data-testid="error-message"]').should('contain', 'Credenciales inválidas')
      cy.url().should('include', '/login')
    })
  })

  describe('Diario Personal', () => {
    beforeEach(() => {
      // Login antes de cada test
      cy.login('juan.perez@test.com', 'password123')
      cy.visit('/dashboard')
    })

    it('debe permitir crear entrada del diario', () => {
      // Ir a sección de diario
      cy.get('[data-testid="diary-nav"]').click()
      cy.url().should('include', '/diary')

      // Crear nueva entrada
      cy.get('[data-testid="new-entry-btn"]').click()
      cy.get('[data-testid="entry-content"]').type('Hoy me siento muy bien, tuve un día productivo')
      cy.get('[data-testid="mood-selector"]').click()
      cy.get('[data-testid="mood-4"]').click() // Muy bien
      cy.get('[data-testid="tags-input"]').type('trabajo,productivo')
      cy.get('[data-testid="save-entry"]').click()

      // Verificar que la entrada se guardó
      cy.get('[data-testid="entry-list"]').should('contain', 'Hoy me siento muy bien')
      cy.get('[data-testid="success-message"]').should('contain', 'Entrada guardada')
    })

    it('debe permitir editar entrada existente', () => {
      // Crear entrada primero
      cy.createDiaryEntry('Entrada de prueba', 3, ['test'])

      // Editar la entrada
      cy.get('[data-testid="entry-item"]').first().click()
      cy.get('[data-testid="edit-entry"]').click()
      cy.get('[data-testid="entry-content"]').clear().type('Entrada editada')
      cy.get('[data-testid="save-entry"]').click()

      // Verificar cambios
      cy.get('[data-testid="entry-list"]').should('contain', 'Entrada editada')
      cy.get('[data-testid="success-message"]').should('contain', 'Entrada actualizada')
    })

    it('debe permitir eliminar entrada', () => {
      // Crear entrada primero
      cy.createDiaryEntry('Entrada para eliminar', 2, ['test'])

      // Eliminar la entrada
      cy.get('[data-testid="entry-item"]').first().click()
      cy.get('[data-testid="delete-entry"]').click()
      cy.get('[data-testid="confirm-delete"]').click()

      // Verificar eliminación
      cy.get('[data-testid="entry-list"]').should('not.contain', 'Entrada para eliminar')
      cy.get('[data-testid="success-message"]').should('contain', 'Entrada eliminada')
    })

    it('debe mostrar estadísticas del diario', () => {
      // Crear varias entradas
      cy.createDiaryEntry('Entrada 1', 4, ['feliz'])
      cy.createDiaryEntry('Entrada 2', 2, ['triste'])
      cy.createDiaryEntry('Entrada 3', 3, ['neutral'])

      // Ver estadísticas
      cy.get('[data-testid="diary-stats"]').click()
      cy.get('[data-testid="total-entries"]').should('contain', '3')
      cy.get('[data-testid="avg-mood"]').should('contain', '3.0')
      cy.get('[data-testid="mood-chart"]').should('be.visible')
    })

    it('debe permitir buscar en el diario', () => {
      // Crear entradas con contenido específico
      cy.createDiaryEntry('Me siento feliz hoy', 4, ['feliz'])
      cy.createDiaryEntry('Trabajo fue estresante', 2, ['trabajo', 'estrés'])

      // Buscar por contenido
      cy.get('[data-testid="search-input"]').type('feliz')
      cy.get('[data-testid="search-btn"]').click()

      // Verificar resultados
      cy.get('[data-testid="search-results"]').should('contain', 'Me siento feliz hoy')
      cy.get('[data-testid="search-results"]').should('not.contain', 'Trabajo fue estresante')
    })
  })

  describe('Evaluaciones de Salud Mental', () => {
    beforeEach(() => {
      cy.login('juan.perez@test.com', 'password123')
      cy.visit('/dashboard')
    })

    it('debe completar evaluación GAD-7', () => {
      // Ir a evaluaciones
      cy.get('[data-testid="evaluations-nav"]').click()
      cy.url().should('include', '/evaluations')

      // Iniciar evaluación GAD-7
      cy.get('[data-testid="start-gad7"]').click()
      cy.url().should('include', '/evaluations/gad7')

      // Completar todas las preguntas
      cy.get('[data-testid="question-1"]').within(() => {
        cy.get('[data-testid="option-1"]').click()
      })
      cy.get('[data-testid="question-2"]').within(() => {
        cy.get('[data-testid="option-2"]').click()
      })
      cy.get('[data-testid="question-3"]').within(() => {
        cy.get('[data-testid="option-0"]').click()
      })
      cy.get('[data-testid="question-4"]').within(() => {
        cy.get('[data-testid="option-1"]').click()
      })
      cy.get('[data-testid="question-5"]').within(() => {
        cy.get('[data-testid="option-2"]').click()
      })
      cy.get('[data-testid="question-6"]').within(() => {
        cy.get('[data-testid="option-1"]').click()
      })
      cy.get('[data-testid="question-7"]').within(() => {
        cy.get('[data-testid="option-0"]').click()
      })

      // Enviar evaluación
      cy.get('[data-testid="submit-evaluation"]').click()

      // Verificar resultados
      cy.get('[data-testid="total-score"]').should('contain', '7')
      cy.get('[data-testid="anxiety-level"]').should('contain', 'Leve')
      cy.get('[data-testid="recommendation"]').should('be.visible')
      cy.get('[data-testid="save-evaluation"]').click()

      // Verificar que se guardó
      cy.url().should('include', '/evaluations')
      cy.get('[data-testid="evaluation-list"]').should('contain', 'GAD-7')
    })

    it('debe mostrar historial de evaluaciones', () => {
      // Completar evaluación primero
      cy.completeGAD7Evaluation([1, 2, 0, 1, 2, 1, 0])

      // Ver historial
      cy.get('[data-testid="evaluation-history"]').click()
      cy.get('[data-testid="evaluation-item"]').should('have.length.at.least', 1)
      cy.get('[data-testid="evaluation-item"]').first().should('contain', 'GAD-7')
    })

    it('debe mostrar estadísticas de evaluaciones', () => {
      // Completar múltiples evaluaciones
      cy.completeGAD7Evaluation([1, 2, 0, 1, 2, 1, 0])
      cy.completeGAD7Evaluation([0, 1, 0, 0, 1, 0, 0])

      // Ver estadísticas
      cy.get('[data-testid="evaluation-stats"]').click()
      cy.get('[data-testid="total-evaluations"]').should('contain', '2')
      cy.get('[data-testid="avg-score"]').should('be.visible')
      cy.get('[data-testid="score-trend"]').should('be.visible')
    })
  })

  describe('Configuración de Usuario', () => {
    beforeEach(() => {
      cy.login('juan.perez@test.com', 'password123')
      cy.visit('/dashboard')
    })

    it('debe permitir actualizar perfil', () => {
      // Ir a configuración
      cy.get('[data-testid="settings-nav"]').click()
      cy.url().should('include', '/settings')

      // Actualizar información
      cy.get('[data-testid="profile-tab"]').click()
      cy.get('[data-testid="firstName"]').clear().type('Juan Carlos')
      cy.get('[data-testid="lastName"]').clear().type('Pérez García')
      cy.get('[data-testid="bio"]').type('Desarrollador de software apasionado por la salud mental')
      cy.get('[data-testid="save-profile"]').click()

      // Verificar cambios
      cy.get('[data-testid="success-message"]').should('contain', 'Perfil actualizado')
      cy.get('[data-testid="user-menu"]').should('contain', 'Juan Carlos')
    })

    it('debe permitir cambiar contraseña', () => {
      // Ir a configuración de seguridad
      cy.get('[data-testid="settings-nav"]').click()
      cy.get('[data-testid="security-tab"]').click()

      // Cambiar contraseña
      cy.get('[data-testid="current-password"]').type('password123')
      cy.get('[data-testid="new-password"]').type('newpassword123')
      cy.get('[data-testid="confirm-password"]').type('newpassword123')
      cy.get('[data-testid="change-password"]').click()

      // Verificar cambio
      cy.get('[data-testid="success-message"]').should('contain', 'Contraseña actualizada')

      // Logout y login con nueva contraseña
      cy.get('[data-testid="logout-btn"]').click()
      cy.login('juan.perez@test.com', 'newpassword123')
      cy.url().should('include', '/dashboard')
    })

    it('debe permitir configurar notificaciones', () => {
      // Ir a configuración de notificaciones
      cy.get('[data-testid="settings-nav"]').click()
      cy.get('[data-testid="notifications-tab"]').click()

      // Configurar notificaciones
      cy.get('[data-testid="daily-reminder"]').check()
      cy.get('[data-testid="reminder-time"]').select('20:00')
      cy.get('[data-testid="weekly-summary"]').check()
      cy.get('[data-testid="save-notifications"]').click()

      // Verificar configuración
      cy.get('[data-testid="success-message"]').should('contain', 'Notificaciones actualizadas')
    })
  })

  describe('Funcionalidades PWA', () => {
    it('debe permitir instalar la app', () => {
      // Simular evento de instalación
      cy.window().then((win) => {
        const event = new Event('beforeinstallprompt')
        win.dispatchEvent(event)
      })

      // Verificar que aparece el botón de instalación
      cy.get('[data-testid="install-prompt"]').should('be.visible')
      cy.get('[data-testid="install-btn"]').click()

      // Verificar que se oculta el prompt
      cy.get('[data-testid="install-prompt"]').should('not.be.visible')
    })

    it('debe funcionar offline', () => {
      // Login primero
      cy.login('juan.perez@test.com', 'password123')
      cy.visit('/dashboard')

      // Simular modo offline
      cy.window().then((win) => {
        Object.defineProperty(win.navigator, 'onLine', {
          writable: true,
          value: false
        })
        win.dispatchEvent(new Event('offline'))
      })

      // Verificar que aparece indicador offline
      cy.get('[data-testid="offline-indicator"]').should('be.visible')

      // Verificar que se puede crear entrada offline
      cy.get('[data-testid="diary-nav"]').click()
      cy.get('[data-testid="new-entry-btn"]').click()
      cy.get('[data-testid="entry-content"]').type('Entrada offline')
      cy.get('[data-testid="save-entry"]').click()

      // Verificar que se guarda localmente
      cy.get('[data-testid="offline-saved"]').should('contain', 'Guardado localmente')
    })
  })

  describe('Tema y Accesibilidad', () => {
    it('debe permitir cambiar tema', () => {
      // Verificar tema por defecto
      cy.get('body').should('have.class', 'light-theme')

      // Cambiar a tema oscuro
      cy.get('[data-testid="theme-toggle"]').click()
      cy.get('body').should('have.class', 'dark-theme')

      // Cambiar de vuelta a tema claro
      cy.get('[data-testid="theme-toggle"]').click()
      cy.get('body').should('have.class', 'light-theme')
    })

    it('debe soportar navegación por teclado', () => {
      // Navegar con Tab
      cy.get('body').tab()
      cy.focused().should('have.attr', 'data-testid', 'login-link')

      cy.tab()
      cy.focused().should('have.attr', 'data-testid', 'register-link')

      // Activar con Enter
      cy.focused().type('{enter}')
      cy.url().should('include', '/register')
    })

    it('debe soportar lectores de pantalla', () => {
      // Verificar que los elementos tienen etiquetas ARIA
      cy.get('[data-testid="login-link"]').should('have.attr', 'aria-label')
      cy.get('[data-testid="theme-toggle"]').should('have.attr', 'aria-label')
      cy.get('[data-testid="main-content"]').should('have.attr', 'role', 'main')
    })
  })
})
