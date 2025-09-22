/**
 * Tests de integración para APIs
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../backend/src/app'

describe('API Integration Tests', () => {
  let authToken: string
  let userId: string

  beforeAll(async () => {
    // Configurar base de datos de prueba
    process.env.NODE_ENV = 'test'
    process.env.FIREBASE_PROJECT_ID = 'test-project'
  })

  afterAll(async () => {
    // Limpiar base de datos de prueba
    console.log('🧹 Limpiando base de datos de prueba...')
  })

  beforeEach(async () => {
    // Limpiar estado antes de cada test
    authToken = ''
    userId = ''
  })

  describe('Health Check', () => {
    it('debe responder con estado saludable', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('funcionando correctamente')
    })

    it('debe proporcionar información de la API', async () => {
      const response = await request(app)
        .get('/api/info')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('Sensus Backend API')
      expect(response.body.data.endpoints).toBeDefined()
    })
  })

  describe('Autenticación', () => {
    it('debe registrar un nuevo usuario', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        password: 'password123',
        birthDate: '1990-01-01'
      }

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.token).toBeDefined()

      authToken = response.body.data.token
      userId = response.body.data.user.id
    })

    it('debe hacer login con credenciales válidas', async () => {
      const loginData = {
        email: 'john.doe@test.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(loginData.email)
      expect(response.body.data.token).toBeDefined()

      authToken = response.body.data.token
    })

    it('debe rechazar login con credenciales inválidas', async () => {
      const loginData = {
        email: 'john.doe@test.com',
        password: 'wrong-password'
      }

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Credenciales inválidas')
    })

    it('debe obtener perfil del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.email).toBe('john.doe@test.com')
    })
  })

  describe('Diario', () => {
    beforeEach(async () => {
      // Asegurar que tenemos un token válido
      if (!authToken) {
        const loginResponse = await request(app)
          .post('/api/v1/users/login')
          .send({
            email: 'john.doe@test.com',
            password: 'password123'
          })
        authToken = loginResponse.body.data.token
      }
    })

    it('debe crear una entrada del diario', async () => {
      const diaryEntry = {
        content: 'Me siento bien hoy',
        mood: 3,
        tags: ['feliz', 'trabajo']
      }

      const response = await request(app)
        .post('/api/v1/diary')
        .set('Authorization', `Bearer ${authToken}`)
        .send(diaryEntry)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.content).toBe(diaryEntry.content)
      expect(response.body.data.mood).toBe(diaryEntry.mood)
    })

    it('debe obtener entradas del diario', async () => {
      const response = await request(app)
        .get('/api/v1/diary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('debe obtener estadísticas del diario', async () => {
      const response = await request(app)
        .get('/api/v1/diary/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.totalEntries).toBeDefined()
      expect(response.body.data.avgMood).toBeDefined()
    })

    it('debe buscar en el diario', async () => {
      const response = await request(app)
        .get('/api/v1/diary/search?q=bien')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('Evaluaciones', () => {
    beforeEach(async () => {
      // Asegurar que tenemos un token válido
      if (!authToken) {
        const loginResponse = await request(app)
          .post('/api/v1/users/login')
          .send({
            email: 'john.doe@test.com',
            password: 'password123'
          })
        authToken = loginResponse.body.data.token
      }
    })

    it('debe crear una evaluación GAD-7', async () => {
      const evaluation = {
        answers: [1, 2, 0, 1, 2, 1, 0],
        totalScore: 7
      }

      const response = await request(app)
        .post('/api/v1/evaluations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(evaluation)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.totalScore).toBe(7)
      expect(response.body.data.anxietyLevel).toBeDefined()
      expect(response.body.data.recommendation).toBeDefined()
    })

    it('debe validar respuestas GAD-7', async () => {
      const invalidEvaluation = {
        answers: [1, 2, 0], // Solo 3 respuestas en lugar de 7
        totalScore: 3
      }

      const response = await request(app)
        .post('/api/v1/evaluations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidEvaluation)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Respuestas inválidas')
    })

    it('debe obtener evaluaciones del usuario', async () => {
      const response = await request(app)
        .get('/api/v1/evaluations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('debe obtener estadísticas de evaluaciones', async () => {
      const response = await request(app)
        .get('/api/v1/evaluations/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.totalEvaluations).toBeDefined()
      expect(response.body.data.avgScore).toBeDefined()
    })
  })

  describe('Seguridad', () => {
    it('debe rechazar requests sin token de autenticación', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Token requerido')
    })

    it('debe rechazar requests con token inválido', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Token inválido')
    })

    it('debe aplicar rate limiting', async () => {
      // Hacer múltiples requests rápidos
      const promises = Array(10).fill(0).map(() =>
        request(app)
          .post('/api/v1/users/login')
          .send({
            email: 'test@test.com',
            password: 'wrong-password'
          })
      )

      const responses = await Promise.all(promises)
      const rateLimitedResponses = responses.filter(r => r.status === 429)
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })

    it('debe validar CORS', async () => {
      const response = await request(app)
        .options('/api/v1/users/profile')
        .set('Origin', 'https://sensus.app')
        .expect(200)

      expect(response.headers['access-control-allow-origin']).toBeDefined()
    })
  })

  describe('Manejo de errores', () => {
    it('debe manejar errores 404', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Endpoint no encontrado')
    })

    it('debe manejar errores 500', async () => {
      // Simular error interno
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({}) // Datos inválidos para forzar error
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('debe validar datos de entrada', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123' // Muy corta
      }

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Campos requeridos')
    })
  })

  describe('Performance', () => {
    it('debe responder en menos de 100ms para endpoints simples', async () => {
      const start = Date.now()
      
      await request(app)
        .get('/health')
        .expect(200)
      
      const duration = Date.now() - start
      expect(duration).toBeLessThan(100)
    })

    it('debe manejar múltiples requests concurrentes', async () => {
      const promises = Array(10).fill(0).map(() =>
        request(app).get('/health')
      )

      const responses = await Promise.all(promises)
      const successfulResponses = responses.filter(r => r.status === 200)
      
      expect(successfulResponses.length).toBe(10)
    })
  })
})
