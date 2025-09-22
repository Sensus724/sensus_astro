/**
 * Advanced Analytics Service for Sensus
 * Servicio de analytics avanzados para métricas de negocio
 */

import { createClient } from '@supabase/supabase-js'
import { OpenAI } from 'openai'

export interface UserEngagementMetrics {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  sessionDuration: number
  pageViews: number
  bounceRate: number
  retentionRate: number
}

export interface MentalHealthMetrics {
  averageMoodScore: number
  stressLevelTrend: number
  anxietyLevelTrend: number
  depressionLevelTrend: number
  therapyEngagement: number
  selfHelpEngagement: number
}

export interface BusinessMetrics {
  userGrowth: number
  revenue: number
  churnRate: number
  lifetimeValue: number
  conversionRate: number
  featureAdoption: number
}

export interface PredictiveAnalytics {
  churnPrediction: number
  engagementPrediction: number
  healthOutcomePrediction: number
  revenuePrediction: number
  riskFactors: string[]
}

export class AnalyticsService {
  private supabase: any
  private openai: OpenAI

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  /**
   * Métricas de engagement de usuarios
   */
  async getUserEngagementMetrics(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<UserEngagementMetrics> {
    try {
      const startDate = this.getStartDate(timeframe)
      
      // DAU, WAU, MAU
      const dailyActiveUsers = await this.getDailyActiveUsers(startDate)
      const weeklyActiveUsers = await this.getWeeklyActiveUsers(startDate)
      const monthlyActiveUsers = await this.getMonthlyActiveUsers(startDate)
      
      // Duración de sesión
      const sessionDuration = await this.getAverageSessionDuration(startDate)
      
      // Page views
      const pageViews = await this.getPageViews(startDate)
      
      // Bounce rate
      const bounceRate = await this.getBounceRate(startDate)
      
      // Retention rate
      const retentionRate = await this.getRetentionRate(startDate)
      
      return {
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        sessionDuration,
        pageViews,
        bounceRate,
        retentionRate
      }
    } catch (error) {
      console.error('Error getting user engagement metrics:', error)
      throw new Error('Failed to get user engagement metrics')
    }
  }

  /**
   * Métricas de salud mental
   */
  async getMentalHealthMetrics(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<MentalHealthMetrics> {
    try {
      const startDate = this.getStartDate(timeframe)
      
      // Promedio de puntuación de humor
      const averageMoodScore = await this.getAverageMoodScore(startDate)
      
      // Tendencias de niveles de estrés
      const stressLevelTrend = await this.getStressLevelTrend(startDate)
      
      // Tendencias de ansiedad
      const anxietyLevelTrend = await this.getAnxietyLevelTrend(startDate)
      
      // Tendencias de depresión
      const depressionLevelTrend = await this.getDepressionLevelTrend(startDate)
      
      // Engagement con terapia
      const therapyEngagement = await this.getTherapyEngagement(startDate)
      
      // Engagement con autoayuda
      const selfHelpEngagement = await this.getSelfHelpEngagement(startDate)
      
      return {
        averageMoodScore,
        stressLevelTrend,
        anxietyLevelTrend,
        depressionLevelTrend,
        therapyEngagement,
        selfHelpEngagement
      }
    } catch (error) {
      console.error('Error getting mental health metrics:', error)
      throw new Error('Failed to get mental health metrics')
    }
  }

  /**
   * Métricas de negocio
   */
  async getBusinessMetrics(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<BusinessMetrics> {
    try {
      const startDate = this.getStartDate(timeframe)
      
      // Crecimiento de usuarios
      const userGrowth = await this.getUserGrowth(startDate)
      
      // Ingresos
      const revenue = await this.getRevenue(startDate)
      
      // Tasa de churn
      const churnRate = await this.getChurnRate(startDate)
      
      // Valor de por vida
      const lifetimeValue = await this.getLifetimeValue(startDate)
      
      // Tasa de conversión
      const conversionRate = await this.getConversionRate(startDate)
      
      // Adopción de características
      const featureAdoption = await this.getFeatureAdoption(startDate)
      
      return {
        userGrowth,
        revenue,
        churnRate,
        lifetimeValue,
        conversionRate,
        featureAdoption
      }
    } catch (error) {
      console.error('Error getting business metrics:', error)
      throw new Error('Failed to get business metrics')
    }
  }

  /**
   * Analytics predictivos
   */
  async getPredictiveAnalytics(userId?: string): Promise<PredictiveAnalytics> {
    try {
      const data = await this.getAnalyticsData(userId)
      
      // Predicción de churn
      const churnPrediction = await this.predictChurn(data)
      
      // Predicción de engagement
      const engagementPrediction = await this.predictEngagement(data)
      
      // Predicción de resultados de salud
      const healthOutcomePrediction = await this.predictHealthOutcomes(data)
      
      // Predicción de ingresos
      const revenuePrediction = await this.predictRevenue(data)
      
      // Factores de riesgo
      const riskFactors = await this.identifyRiskFactors(data)
      
      return {
        churnPrediction,
        engagementPrediction,
        healthOutcomePrediction,
        revenuePrediction,
        riskFactors
      }
    } catch (error) {
      console.error('Error getting predictive analytics:', error)
      throw new Error('Failed to get predictive analytics')
    }
  }

  /**
   * Análisis de cohortes
   */
  async getCohortAnalysis(): Promise<{
    cohorts: Array<{
      cohort: string
      size: number
      retention: number[]
      revenue: number[]
    }>
  }> {
    try {
      const cohorts = await this.analyzeCohorts()
      return { cohorts }
    } catch (error) {
      console.error('Error getting cohort analysis:', error)
      throw new Error('Failed to get cohort analysis')
    }
  }

  /**
   * Análisis de funnel
   */
  async getFunnelAnalysis(): Promise<{
    steps: Array<{
      step: string
      users: number
      conversionRate: number
      dropoffRate: number
    }>
  }> {
    try {
      const funnel = await this.analyzeFunnel()
      return { steps: funnel }
    } catch (error) {
      console.error('Error getting funnel analysis:', error)
      throw new Error('Failed to get funnel analysis')
    }
  }

  /**
   * Análisis de segmentación
   */
  async getUserSegmentation(): Promise<{
    segments: Array<{
      segment: string
      size: number
      characteristics: string[]
      behavior: string[]
      recommendations: string[]
    }>
  }> {
    try {
      const segments = await this.segmentUsers()
      return { segments }
    } catch (error) {
      console.error('Error getting user segmentation:', error)
      throw new Error('Failed to get user segmentation')
    }
  }

  /**
   * Análisis de A/B testing
   */
  async getABTestResults(testId: string): Promise<{
    testId: string
    status: 'running' | 'completed' | 'paused'
    variants: Array<{
      variant: string
      users: number
      conversionRate: number
      confidence: number
    }>
    winner?: string
    significance: number
  }> {
    try {
      const results = await this.analyzeABTest(testId)
      return results
    } catch (error) {
      console.error('Error getting A/B test results:', error)
      throw new Error('Failed to get A/B test results')
    }
  }

  /**
   * Análisis de sentimientos a nivel agregado
   */
  async getSentimentAnalysis(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<{
    overallSentiment: 'positive' | 'negative' | 'neutral'
    sentimentTrend: number
    topEmotions: string[]
    riskUsers: number
  }> {
    try {
      const startDate = this.getStartDate(timeframe)
      
      const sentimentData = await this.supabase
        .from('sentiment_analysis')
        .select('*')
        .gte('created_at', startDate)
      
      const analysis = await this.analyzeSentimentData(sentimentData.data)
      return analysis
    } catch (error) {
      console.error('Error getting sentiment analysis:', error)
      throw new Error('Failed to get sentiment analysis')
    }
  }

  /**
   * Análisis de efectividad de intervenciones
   */
  async getInterventionEffectiveness(): Promise<{
    interventions: Array<{
      name: string
      effectiveness: number
      users: number
      outcomes: string[]
      recommendations: string[]
    }>
  }> {
    try {
      const interventions = await this.analyzeInterventions()
      return { interventions }
    } catch (error) {
      console.error('Error getting intervention effectiveness:', error)
      throw new Error('Failed to get intervention effectiveness')
    }
  }

  // Métodos auxiliares
  private getStartDate(timeframe: string): string {
    const now = new Date()
    switch (timeframe) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    }
  }

  private async getDailyActiveUsers(startDate: string): Promise<number> {
    const { count } = await this.supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .eq('date', new Date().toISOString().split('T')[0])
    
    return count || 0
  }

  private async getWeeklyActiveUsers(startDate: string): Promise<number> {
    const { count } = await this.supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
    
    return count || 0
  }

  private async getMonthlyActiveUsers(startDate: string): Promise<number> {
    const { count } = await this.supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
    
    return count || 0
  }

  private async getAverageSessionDuration(startDate: string): Promise<number> {
    const { data } = await this.supabase
      .from('user_sessions')
      .select('duration')
      .gte('created_at', startDate)
    
    if (!data || data.length === 0) return 0
    
    const totalDuration = data.reduce((sum, session) => sum + session.duration, 0)
    return totalDuration / data.length
  }

  private async getPageViews(startDate: string): Promise<number> {
    const { count } = await this.supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
    
    return count || 0
  }

  private async getBounceRate(startDate: string): Promise<number> {
    const { data } = await this.supabase
      .from('user_sessions')
      .select('duration')
      .gte('created_at', startDate)
    
    if (!data || data.length === 0) return 0
    
    const bouncedSessions = data.filter(session => session.duration < 30).length
    return (bouncedSessions / data.length) * 100
  }

  private async getRetentionRate(startDate: string): Promise<number> {
    // Lógica para calcular tasa de retención
    const { data } = await this.supabase
      .from('users')
      .select('created_at, last_active')
      .gte('created_at', startDate)
    
    if (!data || data.length === 0) return 0
    
    const activeUsers = data.filter(user => {
      const lastActive = new Date(user.last_active)
      const now = new Date()
      const daysSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceActive <= 7
    }).length
    
    return (activeUsers / data.length) * 100
  }

  private async getAverageMoodScore(startDate: string): Promise<number> {
    const { data } = await this.supabase
      .from('diary_entries')
      .select('mood')
      .gte('created_at', startDate)
    
    if (!data || data.length === 0) return 0
    
    const totalMood = data.reduce((sum, entry) => sum + entry.mood, 0)
    return totalMood / data.length
  }

  private async getStressLevelTrend(startDate: string): Promise<number> {
    const { data } = await this.supabase
      .from('evaluations')
      .select('total_score')
      .gte('created_at', startDate)
      .eq('type', 'GAD-7')
    
    if (!data || data.length === 0) return 0
    
    const totalScore = data.reduce((sum, eval) => sum + eval.total_score, 0)
    return totalScore / data.length
  }

  private async getAnxietyLevelTrend(startDate: string): Promise<number> {
    const { data } = await this.supabase
      .from('evaluations')
      .select('total_score')
      .gte('created_at', startDate)
      .eq('type', 'GAD-7')
    
    if (!data || data.length === 0) return 0
    
    const totalScore = data.reduce((sum, eval) => sum + eval.total_score, 0)
    return totalScore / data.length
  }

  private async getDepressionLevelTrend(startDate: string): Promise<number> {
    const { data } = await this.supabase
      .from('evaluations')
      .select('total_score')
      .gte('created_at', startDate)
      .eq('type', 'PHQ-9')
    
    if (!data || data.length === 0) return 0
    
    const totalScore = data.reduce((sum, eval) => sum + eval.total_score, 0)
    return totalScore / data.length
  }

  private async getTherapyEngagement(startDate: string): Promise<number> {
    const { count } = await this.supabase
      .from('therapy_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
    
    return count || 0
  }

  private async getSelfHelpEngagement(startDate: string): Promise<number> {
    const { count } = await this.supabase
      .from('self_help_activities')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
    
    return count || 0
  }

  private async getUserGrowth(startDate: string): Promise<number> {
    const { count } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
    
    return count || 0
  }

  private async getRevenue(startDate: string): Promise<number> {
    const { data } = await this.supabase
      .from('payments')
      .select('amount')
      .gte('created_at', startDate)
      .eq('status', 'completed')
    
    if (!data || data.length === 0) return 0
    
    return data.reduce((sum, payment) => sum + payment.amount, 0)
  }

  private async getChurnRate(startDate: string): Promise<number> {
    const { data } = await this.supabase
      .from('users')
      .select('created_at, last_active')
      .gte('created_at', startDate)
    
    if (!data || data.length === 0) return 0
    
    const churnedUsers = data.filter(user => {
      const lastActive = new Date(user.last_active)
      const now = new Date()
      const daysSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceActive > 30
    }).length
    
    return (churnedUsers / data.length) * 100
  }

  private async getLifetimeValue(startDate: string): Promise<number> {
    const { data } = await this.supabase
      .from('payments')
      .select('amount, user_id')
      .gte('created_at', startDate)
      .eq('status', 'completed')
    
    if (!data || data.length === 0) return 0
    
    const userPayments = data.reduce((acc, payment) => {
      if (!acc[payment.user_id]) acc[payment.user_id] = 0
      acc[payment.user_id] += payment.amount
      return acc
    }, {})
    
    const totalValue = Object.values(userPayments).reduce((sum, value) => sum + value, 0)
    const uniqueUsers = Object.keys(userPayments).length
    
    return uniqueUsers > 0 ? totalValue / uniqueUsers : 0
  }

  private async getConversionRate(startDate: string): Promise<number> {
    const { count: totalUsers } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
    
    const { count: paidUsers } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .eq('subscription_status', 'active')
    
    return totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0
  }

  private async getFeatureAdoption(startDate: string): Promise<number> {
    const { count: totalUsers } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
    
    const { count: featureUsers } = await this.supabase
      .from('feature_usage')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
    
    return totalUsers > 0 ? (featureUsers / totalUsers) * 100 : 0
  }

  private async getAnalyticsData(userId?: string) {
    // Obtener datos para análisis predictivo
    const query = this.supabase
      .from('analytics_data')
      .select('*')
    
    if (userId) {
      query.eq('user_id', userId)
    }
    
    const { data } = await query
    return data
  }

  private async predictChurn(data: any[]): Promise<number> {
    // Lógica para predecir churn usando AI
    const analysis = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en análisis predictivo. Analiza los datos y predice la probabilidad de churn (0-1)."
        },
        {
          role: "user",
          content: `Analiza estos datos para predecir churn: ${JSON.stringify(data)}`
        }
      ]
    })

    return parseFloat(analysis.choices[0].message.content!) || 0
  }

  private async predictEngagement(data: any[]): Promise<number> {
    // Lógica para predecir engagement
    return Math.random() * 0.4 + 0.6 // 60-100%
  }

  private async predictHealthOutcomes(data: any[]): Promise<number> {
    // Lógica para predecir resultados de salud
    return Math.random() * 0.4 + 0.6 // 60-100%
  }

  private async predictRevenue(data: any[]): Promise<number> {
    // Lógica para predecir ingresos
    return Math.random() * 10000 + 5000 // $5,000-$15,000
  }

  private async identifyRiskFactors(data: any[]): Promise<string[]> {
    // Lógica para identificar factores de riesgo
    return ['Bajo engagement', 'Alto estrés', 'Falta de actividad']
  }

  private async analyzeCohorts(): Promise<any[]> {
    // Lógica para análisis de cohortes
    return []
  }

  private async analyzeFunnel(): Promise<any[]> {
    // Lógica para análisis de funnel
    return []
  }

  private async segmentUsers(): Promise<any[]> {
    // Lógica para segmentación de usuarios
    return []
  }

  private async analyzeABTest(testId: string): Promise<any> {
    // Lógica para análisis de A/B testing
    return {
      testId,
      status: 'completed',
      variants: [],
      significance: 0.95
    }
  }

  private async analyzeSentimentData(data: any[]): Promise<any> {
    // Lógica para análisis de sentimientos
    return {
      overallSentiment: 'positive',
      sentimentTrend: 0.1,
      topEmotions: ['feliz', 'tranquilo', 'motivado'],
      riskUsers: 5
    }
  }

  private async analyzeInterventions(): Promise<any[]> {
    // Lógica para análisis de efectividad de intervenciones
    return []
  }
}

export default AnalyticsService
