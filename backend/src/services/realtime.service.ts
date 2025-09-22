/**
 * Real-time Service for Sensus
 * Servicio de tiempo real para notificaciones y colaboración
 */

import { Server as SocketIOServer } from 'socket.io'
import { createClient } from '@supabase/supabase-js'
import { Redis } from 'ioredis'

export interface RealtimeNotification {
  id: string
  userId: string
  type: 'mood_reminder' | 'therapy_session' | 'crisis_alert' | 'achievement' | 'social'
  title: string
  message: string
  data?: any
  priority: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  read: boolean
}

export interface RealtimeConnection {
  userId: string
  socketId: string
  connectedAt: Date
  lastSeen: Date
  device: string
  location?: string
}

export interface RealtimeMetrics {
  connectedUsers: number
  activeConnections: number
  messagesPerSecond: number
  averageLatency: number
}

export class RealtimeService {
  private io: SocketIOServer
  private supabase: any
  private redis: Redis
  private connections: Map<string, RealtimeConnection> = new Map()

  constructor(io: SocketIOServer) {
    this.io = io
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )
    
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    })

    this.setupEventHandlers()
    this.setupPeriodicTasks()
  }

  /**
   * Configurar manejadores de eventos
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Usuario conectado: ${socket.id}`)

      // Autenticación
      socket.on('authenticate', async (data) => {
        try {
          const { token, userId } = data
          const isValid = await this.validateToken(token)
          
          if (isValid) {
            socket.join(`user:${userId}`)
            socket.userId = userId
            
            // Registrar conexión
            await this.registerConnection(userId, socket.id)
            
            socket.emit('authenticated', { success: true })
            console.log(`✅ Usuario autenticado: ${userId}`)
          } else {
            socket.emit('authentication_failed', { error: 'Token inválido' })
            socket.disconnect()
          }
        } catch (error) {
          console.error('Error en autenticación:', error)
          socket.emit('authentication_failed', { error: 'Error de autenticación' })
          socket.disconnect()
        }
      })

      // Unirse a canales
      socket.on('join_channel', (channel) => {
        socket.join(channel)
        console.log(`📺 Usuario ${socket.userId} se unió al canal: ${channel}`)
      })

      // Salir de canales
      socket.on('leave_channel', (channel) => {
        socket.leave(channel)
        console.log(`📺 Usuario ${socket.userId} salió del canal: ${channel}`)
      })

      // Mensajes privados
      socket.on('private_message', async (data) => {
        try {
          const { to, message, type = 'text' } = data
          
          // Validar permisos
          const canSend = await this.canSendMessage(socket.userId, to)
          if (!canSend) {
            socket.emit('error', { message: 'No tienes permisos para enviar este mensaje' })
            return
          }

          // Guardar mensaje
          const messageId = await this.saveMessage({
            from: socket.userId,
            to,
            message,
            type,
            timestamp: new Date()
          })

          // Enviar a destinatario
          this.io.to(`user:${to}`).emit('private_message', {
            id: messageId,
            from: socket.userId,
            message,
            type,
            timestamp: new Date()
          })

          // Confirmar envío
          socket.emit('message_sent', { id: messageId })
        } catch (error) {
          console.error('Error enviando mensaje privado:', error)
          socket.emit('error', { message: 'Error enviando mensaje' })
        }
      })

      // Notificaciones en tiempo real
      socket.on('subscribe_notifications', async (data) => {
        try {
          const { types = [] } = data
          socket.join(`notifications:${socket.userId}`)
          
          // Enviar notificaciones pendientes
          const pendingNotifications = await this.getPendingNotifications(socket.userId)
          socket.emit('notifications', pendingNotifications)
          
          console.log(`🔔 Usuario ${socket.userId} suscrito a notificaciones`)
        } catch (error) {
          console.error('Error suscribiendo a notificaciones:', error)
        }
      })

      // Colaboración en tiempo real
      socket.on('collaboration_start', async (data) => {
        try {
          const { documentId, type } = data
          const room = `collaboration:${documentId}`
          
          socket.join(room)
          socket.emit('collaboration_joined', { documentId, participants: await this.getRoomParticipants(room) })
          
          // Notificar a otros participantes
          socket.to(room).emit('participant_joined', {
            userId: socket.userId,
            documentId,
            type
          })
        } catch (error) {
          console.error('Error iniciando colaboración:', error)
        }
      })

      // Cambios en documentos
      socket.on('document_change', async (data) => {
        try {
          const { documentId, changes, version } = data
          const room = `collaboration:${documentId}`
          
          // Validar versión
          const isValidVersion = await this.validateDocumentVersion(documentId, version)
          if (!isValidVersion) {
            socket.emit('version_conflict', { message: 'Conflicto de versión' })
            return
          }

          // Aplicar cambios
          await this.applyDocumentChanges(documentId, changes, version)
          
          // Broadcast a otros participantes
          socket.to(room).emit('document_updated', {
            documentId,
            changes,
            version: version + 1,
            userId: socket.userId
          })
        } catch (error) {
          console.error('Error aplicando cambios:', error)
        }
      })

      // Desconexión
      socket.on('disconnect', async () => {
        console.log(`🔌 Usuario desconectado: ${socket.id}`)
        await this.unregisterConnection(socket.id)
      })
    })
  }

  /**
   * Enviar notificación en tiempo real
   */
  async sendRealtimeNotification(notification: Omit<RealtimeNotification, 'id' | 'timestamp'>) {
    try {
      const notificationId = await this.saveNotification({
        ...notification,
        id: this.generateId(),
        timestamp: new Date()
      })

      // Enviar a usuario específico
      this.io.to(`user:${notification.userId}`).emit('notification', {
        ...notification,
        id: notificationId,
        timestamp: new Date()
      })

      // Enviar a canal de notificaciones
      this.io.to(`notifications:${notification.userId}`).emit('notification', {
        ...notification,
        id: notificationId,
        timestamp: new Date()
      })

      console.log(`📨 Notificación enviada a usuario ${notification.userId}`)
    } catch (error) {
      console.error('Error enviando notificación:', error)
    }
  }

  /**
   * Broadcast a todos los usuarios
   */
  async broadcastToAll(event: string, data: any) {
    this.io.emit(event, data)
    console.log(`📢 Broadcast enviado: ${event}`)
  }

  /**
   * Broadcast a usuarios específicos
   */
  async broadcastToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach(userId => {
      this.io.to(`user:${userId}`).emit(event, data)
    })
    console.log(`📢 Broadcast enviado a ${userIds.length} usuarios: ${event}`)
  }

  /**
   * Broadcast a canal específico
   */
  async broadcastToChannel(channel: string, event: string, data: any) {
    this.io.to(channel).emit(event, data)
    console.log(`📢 Broadcast enviado al canal ${channel}: ${event}`)
  }

  /**
   * Obtener métricas en tiempo real
   */
  async getRealtimeMetrics(): Promise<RealtimeMetrics> {
    const connectedUsers = await this.getConnectedUsersCount()
    const activeConnections = this.connections.size
    const messagesPerSecond = await this.getMessagesPerSecond()
    const averageLatency = await this.getAverageLatency()

    return {
      connectedUsers,
      activeConnections,
      messagesPerSecond,
      averageLatency
    }
  }

  /**
   * Configurar tareas periódicas
   */
  private setupPeriodicTasks() {
    // Limpiar conexiones inactivas cada 5 minutos
    setInterval(async () => {
      await this.cleanupInactiveConnections()
    }, 5 * 60 * 1000)

    // Enviar heartbeat cada 30 segundos
    setInterval(async () => {
      await this.sendHeartbeat()
    }, 30 * 1000)

    // Limpiar notificaciones antiguas cada hora
    setInterval(async () => {
      await this.cleanupOldNotifications()
    }, 60 * 60 * 1000)
  }

  // Métodos auxiliares
  private async validateToken(token: string): Promise<boolean> {
    try {
      // Validar token JWT
      const { data, error } = await this.supabase.auth.getUser(token)
      return !error && data.user
    } catch (error) {
      return false
    }
  }

  private async registerConnection(userId: string, socketId: string) {
    const connection: RealtimeConnection = {
      userId,
      socketId,
      connectedAt: new Date(),
      lastSeen: new Date(),
      device: 'web' // Detectar dispositivo
    }

    this.connections.set(socketId, connection)
    await this.redis.setex(`connection:${socketId}`, 3600, JSON.stringify(connection))
  }

  private async unregisterConnection(socketId: string) {
    this.connections.delete(socketId)
    await this.redis.del(`connection:${socketId}`)
  }

  private async canSendMessage(from: string, to: string): Promise<boolean> {
    // Verificar si el usuario puede enviar mensajes al destinatario
    // Implementar lógica de permisos
    return true
  }

  private async saveMessage(message: any): Promise<string> {
    const messageId = this.generateId()
    
    await this.supabase
      .from('messages')
      .insert({
        id: messageId,
        ...message
      })

    return messageId
  }

  private async saveNotification(notification: RealtimeNotification) {
    await this.supabase
      .from('notifications')
      .insert(notification)
  }

  private async getPendingNotifications(userId: string): Promise<RealtimeNotification[]> {
    const { data } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('timestamp', { ascending: false })
      .limit(10)

    return data || []
  }

  private async getRoomParticipants(room: string): Promise<string[]> {
    const sockets = await this.io.in(room).fetchSockets()
    return sockets.map(socket => socket.userId).filter(Boolean)
  }

  private async validateDocumentVersion(documentId: string, version: number): Promise<boolean> {
    // Implementar validación de versión de documento
    return true
  }

  private async applyDocumentChanges(documentId: string, changes: any, version: number) {
    // Implementar aplicación de cambios de documento
  }

  private async getConnectedUsersCount(): Promise<number> {
    const sockets = await this.io.fetchSockets()
    return new Set(sockets.map(socket => socket.userId)).size
  }

  private async getMessagesPerSecond(): Promise<number> {
    // Implementar cálculo de mensajes por segundo
    return 0
  }

  private async getAverageLatency(): Promise<number> {
    // Implementar cálculo de latencia promedio
    return 0
  }

  private async cleanupInactiveConnections() {
    const now = new Date()
    const inactiveThreshold = 5 * 60 * 1000 // 5 minutos

    for (const [socketId, connection] of this.connections) {
      const timeSinceLastSeen = now.getTime() - connection.lastSeen.getTime()
      if (timeSinceLastSeen > inactiveThreshold) {
        this.connections.delete(socketId)
        await this.redis.del(`connection:${socketId}`)
      }
    }
  }

  private async sendHeartbeat() {
    this.io.emit('heartbeat', { timestamp: new Date() })
  }

  private async cleanupOldNotifications() {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días
    
    await this.supabase
      .from('notifications')
      .delete()
      .lt('timestamp', cutoffDate.toISOString())
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

export default RealtimeService
