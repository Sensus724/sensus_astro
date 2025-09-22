/**
 * Tests end-to-end para flujos de usuario de Sensus
 */

import { E2ETestRunner } from '../../src/utils/e2eTestRunner.js';

// Configurar test runner E2E
const e2eTestRunner = new E2ETestRunner({
  timeout: 60000,
  verbose: true,
  headless: false,
  browser: 'chrome',
  viewport: { width: 1280, height: 720 },
  baseURL: 'http://localhost:3000',
  screenshot: true,
  video: false,
  slowMo: 100,
});

// Tests E2E para flujo de registro
describeE2E('User Registration Flow', () => {
  beforeAllE2E(async () => {
    // Configurar datos de prueba
    console.log('Setting up registration flow tests...');
  });

  afterAllE2E(async () => {
    // Limpiar datos de prueba
    console.log('Cleaning up registration flow tests...');
  });

  beforeEachE2E(async () => {
    // Limpiar estado antes de cada test
    await visit('/');
  });

  itE2E('should complete user registration successfully', async () => {
    // Paso 1: Navegar a la página de registro
    await visit('/');
    await screenshot('homepage');
    
    // Paso 2: Hacer clic en el botón de registro
    await click('[data-testid="register-button"]');
    await screenshot('registration-modal-opened');
    
    // Paso 3: Llenar el formulario de registro
    await type('[data-testid="register-first-name"]', 'Juan');
    await type('[data-testid="register-last-name"]', 'Pérez');
    await type('[data-testid="register-email"]', 'juan.perez@example.com');
    await type('[data-testid="register-birth-date"]', '1990-01-01');
    await type('[data-testid="register-password"]', 'Password123!');
    await type('[data-testid="register-confirm-password"]', 'Password123!');
    
    // Paso 4: Aceptar términos y condiciones
    await click('[data-testid="accept-terms"]');
    
    // Paso 5: Suscribirse al newsletter (opcional)
    await click('[data-testid="newsletter"]');
    
    await screenshot('registration-form-filled');
    
    // Paso 6: Enviar formulario
    await click('[data-testid="register-submit"]');
    
    // Paso 7: Verificar éxito del registro
    await wait(2000);
    await screenshot('registration-success');
    
    // Verificar que se muestra mensaje de éxito
    const successMessage = await expect('[data-testid="registration-success"]').toBeVisible();
    expect(successMessage).toContainText('¡Registro exitoso!');
  });

  itE2E('should show validation errors for invalid data', async () => {
    // Paso 1: Abrir modal de registro
    await visit('/');
    await click('[data-testid="register-button"]');
    
    // Paso 2: Intentar enviar formulario vacío
    await click('[data-testid="register-submit"]');
    
    // Paso 3: Verificar errores de validación
    await expect('[data-testid="first-name-error"]').toBeVisible();
    await expect('[data-testid="last-name-error"]').toBeVisible();
    await expect('[data-testid="email-error"]').toBeVisible();
    await expect('[data-testid="password-error"]').toBeVisible();
    
    await screenshot('validation-errors');
    
    // Paso 4: Probar email inválido
    await type('[data-testid="register-email"]', 'email-invalido');
    await click('[data-testid="register-submit"]');
    
    await expect('[data-testid="email-error"]').toContainText('Formato de email inválido');
    
    // Paso 5: Probar contraseña débil
    await type('[data-testid="register-email"]', 'test@example.com');
    await type('[data-testid="register-password"]', '123');
    await click('[data-testid="register-submit"]');
    
    await expect('[data-testid="password-error"]').toContainText('Contraseña demasiado débil');
  });

  itE2E('should handle email already exists error', async () => {
    // Paso 1: Abrir modal de registro
    await visit('/');
    await click('[data-testid="register-button"]');
    
    // Paso 2: Llenar formulario con email existente
    await type('[data-testid="register-first-name"]', 'Juan');
    await type('[data-testid="register-last-name"]', 'Pérez');
    await type('[data-testid="register-email"]', 'existing@example.com');
    await type('[data-testid="register-birth-date"]', '1990-01-01');
    await type('[data-testid="register-password"]', 'Password123!');
    await type('[data-testid="register-confirm-password"]', 'Password123!');
    await click('[data-testid="accept-terms"]');
    
    // Paso 3: Enviar formulario
    await click('[data-testid="register-submit"]');
    
    // Paso 4: Verificar error de email existente
    await wait(2000);
    await expect('[data-testid="registration-error"]').toBeVisible();
    await expect('[data-testid="registration-error"]').toContainText('El correo electrónico ya está en uso');
    
    await screenshot('email-exists-error');
  });
});

// Tests E2E para flujo de login
describeE2E('User Login Flow', () => {
  beforeEachE2E(async () => {
    await visit('/');
  });

  itE2E('should login successfully with valid credentials', async () => {
    // Paso 1: Hacer clic en el botón de login
    await click('[data-testid="login-button"]');
    await screenshot('login-modal-opened');
    
    // Paso 2: Llenar credenciales válidas
    await type('[data-testid="login-email"]', 'test@example.com');
    await type('[data-testid="login-password"]', 'Password123!');
    
    // Paso 3: Marcar "Recordarme"
    await click('[data-testid="remember-me"]');
    
    await screenshot('login-form-filled');
    
    // Paso 4: Enviar formulario
    await click('[data-testid="login-submit"]');
    
    // Paso 5: Verificar login exitoso
    await wait(2000);
    await screenshot('login-success');
    
    // Verificar que se muestra el dashboard
    await expect('[data-testid="user-dashboard"]').toBeVisible();
    await expect('[data-testid="user-menu"]').toBeVisible();
  });

  itE2E('should show error for invalid credentials', async () => {
    // Paso 1: Abrir modal de login
    await click('[data-testid="login-button"]');
    
    // Paso 2: Llenar credenciales inválidas
    await type('[data-testid="login-email"]', 'nonexistent@example.com');
    await type('[data-testid="login-password"]', 'WrongPassword');
    
    // Paso 3: Enviar formulario
    await click('[data-testid="login-submit"]');
    
    // Paso 4: Verificar error
    await wait(2000);
    await expect('[data-testid="login-error"]').toBeVisible();
    await expect('[data-testid="login-error"]').toContainText('Credenciales incorrectas');
    
    await screenshot('login-error');
  });

  itE2E('should handle password reset flow', async () => {
    // Paso 1: Abrir modal de login
    await click('[data-testid="login-button"]');
    
    // Paso 2: Hacer clic en "¿Olvidaste tu contraseña?"
    await click('[data-testid="forgot-password"]');
    await screenshot('password-reset-modal');
    
    // Paso 3: Ingresar email
    await type('[data-testid="reset-email"]', 'test@example.com');
    
    // Paso 4: Enviar solicitud de reset
    await click('[data-testid="reset-submit"]');
    
    // Paso 5: Verificar mensaje de confirmación
    await wait(2000);
    await expect('[data-testid="reset-success"]').toBeVisible();
    await expect('[data-testid="reset-success"]').toContainText('Se ha enviado un email de recuperación');
    
    await screenshot('password-reset-success');
  });
});

// Tests E2E para flujo de evaluación
describeE2E('Evaluation Flow', () => {
  beforeEachE2E(async () => {
    // Simular usuario logueado
    await visit('/');
    await click('[data-testid="login-button"]');
    await type('[data-testid="login-email"]', 'test@example.com');
    await type('[data-testid="login-password"]', 'Password123!');
    await click('[data-testid="login-submit"]');
    await wait(2000);
  });

  itE2E('should complete GAD-7 evaluation successfully', async () => {
    // Paso 1: Navegar a la evaluación
    await click('[data-testid="evaluation-nav"]');
    await screenshot('evaluation-page');
    
    // Paso 2: Comenzar evaluación
    await click('[data-testid="start-evaluation"]');
    await screenshot('evaluation-started');
    
    // Paso 3: Responder preguntas
    const questions = [
      { selector: '[data-testid="q1-option-2"]', value: 2 },
      { selector: '[data-testid="q2-option-1"]', value: 1 },
      { selector: '[data-testid="q3-option-3"]', value: 3 },
      { selector: '[data-testid="q4-option-0"]', value: 0 },
      { selector: '[data-testid="q5-option-2"]', value: 2 },
      { selector: '[data-testid="q6-option-1"]', value: 1 },
      { selector: '[data-testid="q7-option-1"]', value: 1 },
    ];
    
    for (let i = 0; i < questions.length; i++) {
      await click(questions[i].selector);
      await wait(500);
      await screenshot(`evaluation-question-${i + 1}`);
    }
    
    // Paso 4: Enviar evaluación
    await click('[data-testid="submit-evaluation"]');
    
    // Paso 5: Verificar resultados
    await wait(2000);
    await screenshot('evaluation-results');
    
    await expect('[data-testid="evaluation-score"]').toBeVisible();
    await expect('[data-testid="evaluation-level"]').toBeVisible();
    await expect('[data-testid="evaluation-recommendations"]').toBeVisible();
    
    // Verificar que el score es correcto (suma de respuestas)
    const expectedScore = questions.reduce((sum, q) => sum + q.value, 0);
    await expect('[data-testid="evaluation-score"]').toContainText(expectedScore.toString());
  });

  itE2E('should save evaluation results', async () => {
    // Completar evaluación
    await click('[data-testid="evaluation-nav"]');
    await click('[data-testid="start-evaluation"]');
    
    // Responder todas las preguntas
    const questionSelectors = [
      '[data-testid="q1-option-1"]',
      '[data-testid="q2-option-2"]',
      '[data-testid="q3-option-0"]',
      '[data-testid="q4-option-1"]',
      '[data-testid="q5-option-2"]',
      '[data-testid="q6-option-0"]',
      '[data-testid="q7-option-1"]',
    ];
    
    for (const selector of questionSelectors) {
      await click(selector);
      await wait(500);
    }
    
    await click('[data-testid="submit-evaluation"]');
    await wait(2000);
    
    // Guardar resultados
    await click('[data-testid="save-evaluation"]');
    await wait(1000);
    
    // Verificar que se guardó
    await expect('[data-testid="save-success"]').toBeVisible();
    await expect('[data-testid="save-success"]').toContainText('Evaluación guardada exitosamente');
    
    await screenshot('evaluation-saved');
  });
});

// Tests E2E para flujo de diario
describeE2E('Diary Flow', () => {
  beforeEachE2E(async () => {
    // Simular usuario logueado
    await visit('/');
    await click('[data-testid="login-button"]');
    await type('[data-testid="login-email"]', 'test@example.com');
    await type('[data-testid="login-password"]', 'Password123!');
    await click('[data-testid="login-submit"]');
    await wait(2000);
  });

  itE2E('should create new diary entry', async () => {
    // Paso 1: Navegar al diario
    await click('[data-testid="diary-nav"]');
    await screenshot('diary-page');
    
    // Paso 2: Crear nueva entrada
    await click('[data-testid="new-entry"]');
    await screenshot('new-entry-form');
    
    // Paso 3: Llenar entrada
    await type('[data-testid="entry-title"]', 'Mi día de hoy');
    await type('[data-testid="entry-content"]', 'Hoy me sentí más tranquilo después de hacer ejercicio. El yoga me ayudó mucho a relajarme.');
    
    // Paso 4: Seleccionar estado de ánimo
    await click('[data-testid="mood-calm"]');
    
    // Paso 5: Agregar tags
    await type('[data-testid="entry-tags"]', 'ejercicio, yoga, tranquilidad');
    
    // Paso 6: Marcar como privado
    await click('[data-testid="entry-private"]');
    
    await screenshot('entry-form-filled');
    
    // Paso 7: Guardar entrada
    await click('[data-testid="save-entry"]');
    
    // Paso 8: Verificar que se guardó
    await wait(2000);
    await screenshot('entry-saved');
    
    await expect('[data-testid="entry-saved-success"]').toBeVisible();
    await expect('[data-testid="entry-saved-success"]').toContainText('Entrada guardada exitosamente');
    
    // Verificar que aparece en la lista
    await expect('[data-testid="entry-list"]').toBeVisible();
    await expect('[data-testid="entry-item-0"]').toBeVisible();
    await expect('[data-testid="entry-item-0"]').toContainText('Mi día de hoy');
  });

  itE2E('should edit existing diary entry', async () => {
    // Crear entrada de prueba
    await click('[data-testid="diary-nav"]');
    await click('[data-testid="new-entry"]');
    await type('[data-testid="entry-title"]', 'Entrada original');
    await type('[data-testid="entry-content"]', 'Contenido original');
    await click('[data-testid="save-entry"]');
    await wait(2000);
    
    // Editar entrada
    await click('[data-testid="entry-item-0"]');
    await click('[data-testid="edit-entry"]');
    await screenshot('entry-edit-form');
    
    // Modificar contenido
    await type('[data-testid="entry-title"]', 'Entrada editada');
    await type('[data-testid="entry-content"]', 'Contenido editado con más detalles');
    
    // Cambiar estado de ánimo
    await click('[data-testid="mood-happy"]');
    
    await screenshot('entry-edit-filled');
    
    // Guardar cambios
    await click('[data-testid="save-entry"]');
    await wait(2000);
    
    // Verificar cambios
    await expect('[data-testid="entry-saved-success"]').toBeVisible();
    await expect('[data-testid="entry-item-0"]').toContainText('Entrada editada');
    
    await screenshot('entry-edited');
  });

  itE2E('should delete diary entry', async () => {
    // Crear entrada de prueba
    await click('[data-testid="diary-nav"]');
    await click('[data-testid="new-entry"]');
    await type('[data-testid="entry-title"]', 'Entrada a eliminar');
    await type('[data-testid="entry-content"]', 'Esta entrada será eliminada');
    await click('[data-testid="save-entry"]');
    await wait(2000);
    
    // Eliminar entrada
    await click('[data-testid="entry-item-0"]');
    await click('[data-testid="delete-entry"]');
    
    // Confirmar eliminación
    await click('[data-testid="confirm-delete"]');
    await wait(1000);
    
    // Verificar que se eliminó
    await expect('[data-testid="entry-deleted-success"]').toBeVisible();
    await expect('[data-testid="entry-list"]').notToExist();
    
    await screenshot('entry-deleted');
  });
});

// Tests E2E para flujo de planes
describeE2E('Plans Flow', () => {
  beforeEachE2E(async () => {
    // Simular usuario logueado
    await visit('/');
    await click('[data-testid="login-button"]');
    await type('[data-testid="login-email"]', 'test@example.com');
    await type('[data-testid="login-password"]', 'Password123!');
    await click('[data-testid="login-submit"]');
    await wait(2000);
  });

  itE2E('should view available plans', async () => {
    // Paso 1: Navegar a planes
    await click('[data-testid="plans-nav"]');
    await screenshot('plans-page');
    
    // Paso 2: Verificar que se muestran los planes
    await expect('[data-testid="plan-basic"]').toBeVisible();
    await expect('[data-testid="plan-premium"]').toBeVisible();
    await expect('[data-testid="plan-therapy"]').toBeVisible();
    
    // Paso 3: Verificar detalles del plan básico
    await expect('[data-testid="plan-basic-price"]').toContainText('Gratuito');
    await expect('[data-testid="plan-basic-features"]').toBeVisible();
    
    // Paso 4: Verificar detalles del plan premium
    await expect('[data-testid="plan-premium-price"]').toContainText('€9.99');
    await expect('[data-testid="plan-premium-features"]').toBeVisible();
  });

  itE2E('should upgrade to premium plan', async () => {
    // Paso 1: Navegar a planes
    await click('[data-testid="plans-nav"]');
    
    // Paso 2: Seleccionar plan premium
    await click('[data-testid="plan-premium"]');
    await click('[data-testid="upgrade-premium"]');
    await screenshot('upgrade-modal');
    
    // Paso 3: Llenar información de pago
    await type('[data-testid="card-number"]', '4242424242424242');
    await type('[data-testid="card-expiry"]', '12/25');
    await type('[data-testid="card-cvc"]', '123');
    await type('[data-testid="card-name"]', 'Juan Pérez');
    
    // Paso 4: Confirmar pago
    await click('[data-testid="confirm-payment"]');
    await wait(3000);
    
    // Paso 5: Verificar upgrade exitoso
    await screenshot('upgrade-success');
    await expect('[data-testid="upgrade-success"]').toBeVisible();
    await expect('[data-testid="upgrade-success"]').toContainText('¡Upgrade exitoso!');
    
    // Verificar que el plan se actualizó
    await expect('[data-testid="current-plan"]').toContainText('Premium');
  });

  itE2E('should cancel subscription', async () => {
    // Simular usuario con plan premium
    await click('[data-testid="plans-nav"]');
    await expect('[data-testid="current-plan"]').toContainText('Premium');
    
    // Paso 1: Ir a configuración de cuenta
    await click('[data-testid="user-menu"]');
    await click('[data-testid="account-settings"]');
    await screenshot('account-settings');
    
    // Paso 2: Ir a suscripción
    await click('[data-testid="subscription-tab"]');
    
    // Paso 3: Cancelar suscripción
    await click('[data-testid="cancel-subscription"]');
    await screenshot('cancel-subscription-modal');
    
    // Paso 4: Confirmar cancelación
    await click('[data-testid="confirm-cancel"]');
    await wait(2000);
    
    // Paso 5: Verificar cancelación
    await expect('[data-testid="subscription-cancelled"]').toBeVisible();
    await expect('[data-testid="subscription-cancelled"]').toContainText('Suscripción cancelada');
    
    await screenshot('subscription-cancelled');
  });
});

// Tests E2E para flujo de perfil
describeE2E('Profile Flow', () => {
  beforeEachE2E(async () => {
    // Simular usuario logueado
    await visit('/');
    await click('[data-testid="login-button"]');
    await type('[data-testid="login-email"]', 'test@example.com');
    await type('[data-testid="login-password"]', 'Password123!');
    await click('[data-testid="login-submit"]');
    await wait(2000);
  });

  itE2E('should update user profile', async () => {
    // Paso 1: Abrir menú de usuario
    await click('[data-testid="user-menu"]');
    await click('[data-testid="profile"]');
    await screenshot('profile-page');
    
    // Paso 2: Editar perfil
    await click('[data-testid="edit-profile"]');
    await screenshot('profile-edit-form');
    
    // Paso 3: Actualizar información
    await type('[data-testid="profile-first-name"]', 'Juan Carlos');
    await type('[data-testid="profile-last-name"]', 'Pérez García');
    await type('[data-testid="profile-bio"]', 'Me gusta practicar yoga y meditación para mantener mi bienestar mental.');
    
    // Paso 4: Cambiar avatar
    await click('[data-testid="change-avatar"]');
    await screenshot('avatar-selection');
    await click('[data-testid="avatar-3"]');
    
    // Paso 5: Guardar cambios
    await click('[data-testid="save-profile"]');
    await wait(2000);
    
    // Paso 6: Verificar actualización
    await expect('[data-testid="profile-updated"]').toBeVisible();
    await expect('[data-testid="profile-updated"]').toContainText('Perfil actualizado exitosamente');
    
    await screenshot('profile-updated');
  });

  itE2E('should change password', async () => {
    // Paso 1: Ir a configuración de seguridad
    await click('[data-testid="user-menu"]');
    await click('[data-testid="security-settings"]');
    await screenshot('security-settings');
    
    // Paso 2: Cambiar contraseña
    await click('[data-testid="change-password"]');
    await screenshot('change-password-form');
    
    // Paso 3: Llenar formulario de cambio de contraseña
    await type('[data-testid="current-password"]', 'Password123!');
    await type('[data-testid="new-password"]', 'NewPassword123!');
    await type('[data-testid="confirm-new-password"]', 'NewPassword123!');
    
    // Paso 4: Confirmar cambio
    await click('[data-testid="confirm-password-change"]');
    await wait(2000);
    
    // Paso 5: Verificar cambio exitoso
    await expect('[data-testid="password-changed"]').toBeVisible();
    await expect('[data-testid="password-changed"]').toContainText('Contraseña cambiada exitosamente');
    
    await screenshot('password-changed');
  });

  itE2E('should export user data', async () => {
    // Paso 1: Ir a configuración de privacidad
    await click('[data-testid="user-menu"]');
    await click('[data-testid="privacy-settings"]');
    await screenshot('privacy-settings');
    
    // Paso 2: Solicitar exportación de datos
    await click('[data-testid="export-data"]');
    await screenshot('export-data-modal');
    
    // Paso 3: Confirmar exportación
    await click('[data-testid="confirm-export"]');
    await wait(3000);
    
    // Paso 4: Verificar que se inició la exportación
    await expect('[data-testid="export-started"]').toBeVisible();
    await expect('[data-testid="export-started"]').toContainText('Exportación iniciada');
    
    await screenshot('export-started');
  });
});

// Tests E2E para flujo de logout
describeE2E('Logout Flow', () => {
  beforeEachE2E(async () => {
    // Simular usuario logueado
    await visit('/');
    await click('[data-testid="login-button"]');
    await type('[data-testid="login-email"]', 'test@example.com');
    await type('[data-testid="login-password"]', 'Password123!');
    await click('[data-testid="login-submit"]');
    await wait(2000);
  });

  itE2E('should logout successfully', async () => {
    // Paso 1: Verificar que el usuario está logueado
    await expect('[data-testid="user-menu"]').toBeVisible();
    await expect('[data-testid="user-dashboard"]').toBeVisible();
    
    // Paso 2: Abrir menú de usuario
    await click('[data-testid="user-menu"]');
    await screenshot('user-menu-opened');
    
    // Paso 3: Hacer logout
    await click('[data-testid="logout"]');
    await wait(2000);
    
    // Paso 4: Verificar que se cerró la sesión
    await screenshot('logout-success');
    await expect('[data-testid="user-menu"]').notToExist();
    await expect('[data-testid="login-button"]').toBeVisible();
    await expect('[data-testid="register-button"]').toBeVisible();
    
    // Verificar que se muestra mensaje de logout
    await expect('[data-testid="logout-success"]').toBeVisible();
    await expect('[data-testid="logout-success"]').toContainText('Sesión cerrada exitosamente');
  });
});

// Ejecutar tests E2E
if (typeof window !== 'undefined') {
  // En el navegador
  window.addEventListener('DOMContentLoaded', () => {
    runE2ETests().then(stats => {
      console.log('E2E tests completed:', stats);
    });
  });
} else {
  // En Node.js
  runE2ETests().then(stats => {
    console.log('E2E tests completed:', stats);
    process.exit(stats.failed > 0 ? 1 : 0);
  });
}
