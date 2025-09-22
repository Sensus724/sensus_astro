/**
 * Tests unitarios para módulo de autenticación
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import AuthModule from '../../public/js/modules/auth.js'

// Mock de fetch
global.fetch = vi.fn()

describe('AuthModule', () => {
  let authModule: AuthModule

  beforeEach(() => {
    // Limpiar localStorage
    localStorage.clear()
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Crear nueva instancia
    authModule = new AuthModule()
  })

  afterEach(() => {
    // Limpiar después de cada test
    localStorage.clear()
  })

  describe('Inicialización', () => {
    it('debe inicializar correctamente', () => {
      expect(authModule).toBeDefined()
      expect(authModule.isLoggedIn()).toBe(false)
    })

    it('debe cargar autenticación guardada si existe', () => {
      const mockUser = { id: '1', email: 'test@test.com' }
      const mockToken = 'mock-token'
      
      localStorage.setItem('sensus-user', JSON.stringify(mockUser))
      localStorage.setItem('sensus-token', mockToken)
      
      const newAuthModule = new AuthModule()
      expect(newAuthModule.isLoggedIn()).toBe(true)
      expect(newAuthModule.getCurrentUser()).toEqual(mockUser)
    })
  })

  describe('Login', () => {
    it('debe hacer login exitosamente con credenciales válidas', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'mock-token',
          user: { id: '1', email: 'test@test.com' }
        }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const form = document.createElement('form')
      form.innerHTML = `
        <input name="email" value="test@test.com" />
        <input name="password" value="password123" />
      `

      await authModule.handleLogin(form)

      expect(authModule.isLoggedIn()).toBe(true)
      expect(authModule.getCurrentUser()).toEqual(mockResponse.data.user)
    })

    it('debe manejar error de login con credenciales inválidas', async () => {
      const mockResponse = {
        success: false,
        message: 'Credenciales inválidas'
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const form = document.createElement('form')
      form.innerHTML = `
        <input name="email" value="test@test.com" />
        <input name="password" value="wrong-password" />
      `

      await authModule.handleLogin(form)

      expect(authModule.isLoggedIn()).toBe(false)
    })

    it('debe validar campos requeridos', async () => {
      const form = document.createElement('form')
      form.innerHTML = `
        <input name="email" value="" />
        <input name="password" value="" />
      `

      await authModule.handleLogin(form)

      expect(authModule.isLoggedIn()).toBe(false)
    })
  })

  describe('Registro', () => {
    it('debe registrar usuario exitosamente', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'mock-token',
          user: { id: '1', email: 'new@test.com' }
        }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const form = document.createElement('form')
      form.innerHTML = `
        <input name="firstName" value="John" />
        <input name="lastName" value="Doe" />
        <input name="email" value="new@test.com" />
        <input name="password" value="password123" />
        <input name="confirmPassword" value="password123" />
      `

      await authModule.handleRegister(form)

      expect(authModule.isLoggedIn()).toBe(true)
    })

    it('debe validar que las contraseñas coincidan', async () => {
      const form = document.createElement('form')
      form.innerHTML = `
        <input name="firstName" value="John" />
        <input name="lastName" value="Doe" />
        <input name="email" value="new@test.com" />
        <input name="password" value="password123" />
        <input name="confirmPassword" value="different-password" />
      `

      await authModule.handleRegister(form)

      expect(authModule.isLoggedIn()).toBe(false)
    })

    it('debe validar longitud mínima de contraseña', async () => {
      const form = document.createElement('form')
      form.innerHTML = `
        <input name="firstName" value="John" />
        <input name="lastName" value="Doe" />
        <input name="email" value="new@test.com" />
        <input name="password" value="123" />
        <input name="confirmPassword" value="123" />
      `

      await authModule.handleRegister(form)

      expect(authModule.isLoggedIn()).toBe(false)
    })
  })

  describe('Logout', () => {
    it('debe hacer logout correctamente', () => {
      // Simular usuario logueado
      authModule.setAuth('mock-token', { id: '1', email: 'test@test.com' })
      expect(authModule.isLoggedIn()).toBe(true)

      authModule.logout()

      expect(authModule.isLoggedIn()).toBe(false)
      expect(authModule.getCurrentUser()).toBeNull()
    })
  })

  describe('Validación de token', () => {
    it('debe validar token válido', async () => {
      const mockUser = { id: '1', email: 'test@test.com' }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockUser })
      })

      authModule.setAuth('valid-token', mockUser)
      const isValid = await authModule.validateToken()

      expect(isValid).toBe(true)
    })

    it('debe manejar token inválido', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      authModule.setAuth('invalid-token', { id: '1', email: 'test@test.com' })
      const isValid = await authModule.validateToken()

      expect(isValid).toBe(false)
      expect(authModule.isLoggedIn()).toBe(false)
    })
  })

  describe('UI Updates', () => {
    it('debe actualizar UI cuando usuario se loguea', () => {
      // Crear elementos de UI mock
      document.body.innerHTML = `
        <button data-auth="login">Login</button>
        <button data-auth="logout" style="display: none;">Logout</button>
        <span data-user style="display: none;"></span>
      `

      const mockUser = { id: '1', email: 'test@test.com', firstName: 'John' }
      authModule.setAuth('mock-token', mockUser)
      authModule.updateAuthUI()

      const loginBtn = document.querySelector('[data-auth="login"]')
      const logoutBtn = document.querySelector('[data-auth="logout"]')
      const userSpan = document.querySelector('[data-user]')

      expect(loginBtn?.style.display).toBe('none')
      expect(logoutBtn?.style.display).toBe('block')
      expect(userSpan?.style.display).toBe('block')
      expect(userSpan?.textContent).toBe('John')
    })

    it('debe actualizar UI cuando usuario se desloguea', () => {
      // Crear elementos de UI mock
      document.body.innerHTML = `
        <button data-auth="login" style="display: none;">Login</button>
        <button data-auth="logout">Logout</button>
        <span data-user>John</span>
      `

      authModule.setAuth('mock-token', { id: '1', email: 'test@test.com' })
      authModule.logout()
      authModule.updateAuthUI()

      const loginBtn = document.querySelector('[data-auth="login"]')
      const logoutBtn = document.querySelector('[data-auth="logout"]')
      const userSpan = document.querySelector('[data-user]')

      expect(loginBtn?.style.display).toBe('block')
      expect(logoutBtn?.style.display).toBe('none')
      expect(userSpan?.style.display).toBe('none')
    })
  })
})
