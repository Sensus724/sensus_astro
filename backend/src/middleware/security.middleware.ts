/**
 * Middleware de seguridad avanzada
 */

import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Configuración de rate limiting
const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      })
    }
  })
}

// Rate limits específicos
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  5, // 5 intentos
  'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.'
)

export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  100, // 100 requests
  'Demasiadas peticiones. Intenta de nuevo en 15 minutos.'
)

export const strictRateLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutos
  10, // 10 intentos
  'Demasiadas peticiones. Intenta de nuevo en 5 minutos.'
)

// Configuración de Helmet
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
})

// Validación de entrada
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: errors.array()
    })
  }
  next()
}

// Validaciones específicas
export const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
  
  body('birthDate')
    .isISO8601()
    .withMessage('Fecha de nacimiento inválida')
    .custom((value) => {
      const birthDate = new Date(value)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 13 || age > 120) {
        throw new Error('La edad debe estar entre 13 y 120 años')
      }
      return true
    })
]

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('password')
    .notEmpty()
    .withMessage('Contraseña requerida')
]

// Sanitización de entrada
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitizar strings
  const sanitizeString = (str: string): string => {
    return str
      .trim()
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
  }

  // Sanitizar body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key])
      }
    }
  }

  // Sanitizar query params
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string)
      }
    }
  }

  next()
}

// Detección de ataques
export const detectAttacks = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+set/i,
    /exec\s*\(/i,
    /eval\s*\(/i,
    /alert\s*\(/i,
    /document\.cookie/i,
    /window\.location/i
  ]

  const checkString = (str: string): boolean => {
    return suspiciousPatterns.some(pattern => pattern.test(str))
  }

  // Verificar body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string' && checkString(req.body[key])) {
        return res.status(400).json({
          success: false,
          error: 'Contenido sospechoso detectado'
        })
      }
    }
  }

  // Verificar query params
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string' && checkString(req.query[key] as string)) {
        return res.status(400).json({
          success: false,
          error: 'Contenido sospechoso detectado'
        })
      }
    }
  }

  next()
}

// Validación de JWT
export const validateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación requerido'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado'
    })
  }
}

// Verificación de permisos
export const checkPermissions = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      })
    }

    const userPermissions = req.user.permissions || []
    const hasPermission = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    )

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Permisos insuficientes'
      })
    }

    next()
  }
}

// Validación de CSRF
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next()
  }

  const csrfToken = req.header('X-CSRF-Token')
  const sessionToken = req.session?.csrfToken

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({
      success: false,
      error: 'Token CSRF inválido'
    })
  }

  next()
}

// Generar token CSRF
export const generateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    req.session = {} as any
  }

  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex')
  }

  res.locals.csrfToken = req.session.csrfToken
  next()
}

// Validación de tamaño de archivo
export const validateFileSize = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.file && req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: `El archivo es demasiado grande. Tamaño máximo: ${maxSize / 1024 / 1024}MB`
      })
    }
    next()
  }
}

// Validación de tipo de archivo
export const validateFileType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.file && !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
      })
    }
    next()
  }
}

// Logging de seguridad
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id
    }

    // Log eventos de seguridad
    if (res.statusCode >= 400) {
      console.warn('🚨 Security Event:', logData)
    }

    // Log intentos de autenticación
    if (req.url.includes('/login') || req.url.includes('/register')) {
      console.log('🔐 Auth Attempt:', logData)
    }
  })

  next()
}

// Detección de bots
export const detectBots = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || ''
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /php/i
  ]

  const isBot = botPatterns.some(pattern => pattern.test(userAgent))
  
  if (isBot) {
    req.isBot = true
    // Aplicar rate limiting más estricto para bots
    return strictRateLimit(req, res, next)
  }

  next()
}

// Validación de IP
export const validateIP = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip
  const blockedIPs = process.env.BLOCKED_IPS?.split(',') || []
  
  if (blockedIPs.includes(ip)) {
    return res.status(403).json({
      success: false,
      error: 'IP bloqueada'
    })
  }

  next()
}

// Headers de seguridad
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Habilitar XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  next()
}

// Validación de contraseña
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula')
  }
  
  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número')
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial')
  }
  
  // Verificar contraseñas comunes
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('La contraseña es demasiado común')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Hash de contraseña
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verificación de contraseña
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

// Generar token seguro
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex')
}

// Validación de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Sanitización de HTML
export const sanitizeHTML = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
}

export default {
  authRateLimit,
  apiRateLimit,
  strictRateLimit,
  helmetConfig,
  validateInput,
  validateRegistration,
  validateLogin,
  sanitizeInput,
  detectAttacks,
  validateJWT,
  checkPermissions,
  csrfProtection,
  generateCSRFToken,
  validateFileSize,
  validateFileType,
  securityLogger,
  detectBots,
  validateIP,
  securityHeaders,
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  validateEmail,
  sanitizeHTML
}
