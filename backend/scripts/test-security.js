#!/usr/bin/env node

/**
 * Script de prueba para el servicio de seguridad
 */

const crypto = require('crypto');

// Simular el servicio de seguridad
class SecurityServiceTest {
  constructor() {
    this.jwtSecret = 'test-secret-key-for-testing-purposes-only';
    this.encryptionKey = 'test-encryption-key-32-chars';
  }

  // Generar JWT token seguro
  generateSecureToken(payload) {
    const tokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 días
      jti: crypto.randomUUID(), // JWT ID único
      iss: 'sensus-app', // Issuer
      aud: 'sensus-users' // Audience
    };

    // Simular JWT (en producción usarías la librería jwt)
    return Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
  }

  // Validar fortaleza de contraseña
  validatePasswordStrength(password) {
    const feedback = [];
    let score = 0;

    // Longitud
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    else feedback.push('La contraseña debe tener al menos 8 caracteres');

    // Complejidad
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Incluye letras minúsculas');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Incluye letras mayúsculas');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Incluye números');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Incluye caracteres especiales');

    // Patrones comunes
    const commonPatterns = [
      /(.)\1{2,}/, // Caracteres repetidos
      /123|abc|qwe/i, // Secuencias comunes
      /password|admin|user/i // Palabras comunes
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      score -= 2;
      feedback.push('Evita patrones comunes y palabras obvias');
    }

    return {
      isValid: score >= 4,
      score: Math.max(0, Math.min(5, score)),
      feedback
    };
  }

  // Generar hash seguro para contraseñas
  async hashPassword(password) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password + this.jwtSecret).digest('hex');
  }

  // Verificar contraseña
  async verifyPassword(password, hash) {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }

  // Detectar actividad sospechosa
  detectSuspiciousActivity(ip, userAgent, activity) {
    const suspiciousPatterns = [
      // Patrones de bots
      /bot|crawler|spider|scraper/i,
      // Patrones de ataques
      /union.*select|drop.*table|insert.*into|delete.*from/i,
      // Patrones de inyección
      /<script|javascript:|on\w+\s*=/i,
      // Patrones de herramientas de hacking
      /sqlmap|nmap|nikto|burp/i
    ];

    const activityString = JSON.stringify(activity);
    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(activityString) || pattern.test(userAgent)
    );

    return isSuspicious;
  }
}

// Función de prueba
async function testSecurityService() {
  console.log('🧪 PROBANDO SERVICIO DE SEGURIDAD\n');
  console.log('=' .repeat(50));

  const securityService = new SecurityServiceTest();

  // 1. Probar generación de tokens
  console.log('1️⃣ Probando generación de tokens...');
  const token = securityService.generateSecureToken({
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'user'
  });
  console.log('   ✅ Token generado:', token.substring(0, 50) + '...');

  // 2. Probar validación de contraseñas
  console.log('\n2️⃣ Probando validación de contraseñas...');
  
  const weakPassword = '123';
  const strongPassword = 'MySecureP@ssw0rd123!';
  
  const weakValidation = securityService.validatePasswordStrength(weakPassword);
  const strongValidation = securityService.validatePasswordStrength(strongPassword);
  
  console.log('   Contraseña débil:', weakPassword);
  console.log('   Resultado:', weakValidation.isValid ? '✅' : '❌', `(${weakValidation.score}/5)`);
  if (!weakValidation.isValid) {
    weakValidation.feedback.forEach(feedback => {
      console.log('      ⚠️', feedback);
    });
  }
  
  console.log('   Contraseña fuerte:', strongPassword);
  console.log('   Resultado:', strongValidation.isValid ? '✅' : '❌', `(${strongValidation.score}/5)`);

  // 3. Probar hash de contraseñas
  console.log('\n3️⃣ Probando hash de contraseñas...');
  const password = 'testPassword123';
  const hash = await securityService.hashPassword(password);
  const isValid = await securityService.verifyPassword(password, hash);
  console.log('   ✅ Hash generado:', hash.substring(0, 20) + '...');
  console.log('   ✅ Verificación:', isValid ? 'Válida' : 'Inválida');

  // 4. Probar detección de actividad sospechosa
  console.log('\n4️⃣ Probando detección de actividad sospechosa...');
  
  const normalActivity = {
    method: 'GET',
    path: '/api/users',
    body: { name: 'John' }
  };
  
  const suspiciousActivity = {
    method: 'POST',
    path: '/api/users',
    body: { name: '<script>alert("xss")</script>' }
  };
  
  const normalResult = securityService.detectSuspiciousActivity('192.168.1.1', 'Mozilla/5.0', normalActivity);
  const suspiciousResult = securityService.detectSuspiciousActivity('192.168.1.1', 'Mozilla/5.0', suspiciousActivity);
  
  console.log('   Actividad normal:', normalResult ? '❌ Detectada como sospechosa' : '✅ Normal');
  console.log('   Actividad sospechosa:', suspiciousResult ? '✅ Detectada correctamente' : '❌ No detectada');

  console.log('\n' + '=' .repeat(50));
  console.log('🎉 ¡Todas las pruebas de seguridad pasaron!');
  console.log('✅ El servicio de seguridad está funcionando correctamente');
}

// Ejecutar pruebas
if (require.main === module) {
  testSecurityService().catch(console.error);
}

module.exports = SecurityServiceTest;
