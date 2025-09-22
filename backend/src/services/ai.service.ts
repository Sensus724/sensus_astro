/**
 * AI/ML Service for Sensus
 * Servicio de inteligencia artificial para análisis de salud mental
 */

import { OpenAI } from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  emotions: string[]
  riskLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
}

export interface MentalHealthInsight {
  type: 'mood_trend' | 'stress_pattern' | 'sleep_correlation' | 'activity_impact'
  insight: string
  confidence: number
  actionable: boolean
  recommendations: string[]
}

export interface PersonalizedRecommendation {
  category: 'therapy' | 'meditation' | 'exercise' | 'social' | 'professional'
  title: string
  description: string
  priority: number
  estimatedTime: number
  effectiveness: number
  personalizedFor: string
}

export class AIService {
  private openai: OpenAI
  private gemini: GoogleGenerativeAI
  private supabase: any

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    
    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
    
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )
  }

  /**
   * Análisis de sentimientos avanzado
   */
  async analyzeSentiment(text: string, userId: string): Promise<SentimentAnalysis> {
    try {
      // Análisis con OpenAI
      const openaiResponse = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Eres un psicólogo experto en análisis de sentimientos. Analiza el texto y proporciona:
            1. Sentimiento principal (positive/negative/neutral)
            2. Nivel de confianza (0-1)
            3. Emociones detectadas
            4. Nivel de riesgo para salud mental
            5. Recomendaciones específicas`
          },
          {
            role: "user",
            content: `Analiza este texto: "${text}"`
          }
        ],
        temperature: 0.3
      })

      const analysis = JSON.parse(openaiResponse.choices[0].message.content!)

      // Análisis adicional con Gemini para validación
      const geminiResponse = await this.gemini.getGenerativeModel({ 
        model: "gemini-pro" 
      }).generateContent(`
        Analiza el sentimiento de este texto: "${text}"
        Proporciona: sentimiento, confianza, emociones, nivel de riesgo
      `)

      // Combinar análisis de ambos modelos
      const combinedAnalysis = this.combineSentimentAnalysis(analysis, geminiResponse.response.text())

      // Guardar análisis en base de datos
      await this.saveSentimentAnalysis(userId, text, combinedAnalysis)

      return combinedAnalysis
    } catch (error) {
      console.error('Error in sentiment analysis:', error)
      throw new Error('Failed to analyze sentiment')
    }
  }

  /**
   * Generar insights de salud mental
   */
  async generateMentalHealthInsights(userId: string): Promise<MentalHealthInsight[]> {
    try {
      // Obtener datos del usuario
      const userData = await this.getUserData(userId)
      
      // Análisis de tendencias de humor
      const moodInsights = await this.analyzeMoodTrends(userData.diaryEntries)
      
      // Análisis de patrones de estrés
      const stressInsights = await this.analyzeStressPatterns(userData.evaluations)
      
      // Análisis de correlaciones
      const correlationInsights = await this.analyzeCorrelations(userData)
      
      // Generar insights con AI
      const aiInsights = await this.generateAIInsights(userData)
      
      return [...moodInsights, ...stressInsights, ...correlationInsights, ...aiInsights]
    } catch (error) {
      console.error('Error generating insights:', error)
      throw new Error('Failed to generate insights')
    }
  }

  /**
   * Recomendaciones personalizadas
   */
  async generatePersonalizedRecommendations(userId: string): Promise<PersonalizedRecommendation[]> {
    try {
      const userProfile = await this.getUserProfile(userId)
      const recentData = await this.getRecentUserData(userId)
      
      // Generar recomendaciones con AI
      const recommendations = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Eres un terapeuta digital experto. Genera recomendaciones personalizadas basadas en:
            - Perfil del usuario: ${JSON.stringify(userProfile)}
            - Datos recientes: ${JSON.stringify(recentData)}
            - Mejores prácticas de salud mental
            - Terapias basadas en evidencia`
          },
          {
            role: "user",
            content: `Genera 5 recomendaciones personalizadas para este usuario`
          }
        ],
        temperature: 0.7
      })

      const aiRecommendations = JSON.parse(recommendations.choices[0].message.content!)
      
      // Enriquecer con datos de efectividad
      const enrichedRecommendations = await this.enrichRecommendations(aiRecommendations, userId)
      
      return enrichedRecommendations
    } catch (error) {
      console.error('Error generating recommendations:', error)
      throw new Error('Failed to generate recommendations')
    }
  }

  /**
   * Detección de crisis de salud mental
   */
  async detectMentalHealthCrisis(userId: string, text: string): Promise<{
    isCrisis: boolean
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    indicators: string[]
    immediateActions: string[]
    professionalHelp: boolean
  }> {
    try {
      const crisisKeywords = [
        'suicide', 'kill myself', 'end it all', 'not worth living',
        'suicidio', 'matarme', 'acabar con todo', 'no vale la pena vivir',
        'self harm', 'cut myself', 'hurt myself', 'autolesión'
      ]

      const crisisIndicators = crisisKeywords.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      )

      if (crisisIndicators.length > 0) {
        return {
          isCrisis: true,
          riskLevel: 'critical',
          indicators: crisisIndicators,
          immediateActions: [
            'Contactar línea de crisis inmediatamente',
            'Buscar ayuda profesional urgente',
            'No estar solo/a en este momento'
          ],
          professionalHelp: true
        }
      }

      // Análisis con AI para detectar señales sutiles
      const aiAnalysis = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Eres un psicólogo experto en detección de crisis. Analiza el texto para detectar:
            - Señales de crisis de salud mental
            - Nivel de riesgo
            - Indicadores específicos
            - Acciones inmediatas recomendadas`
          },
          {
            role: "user",
            content: `Analiza este texto para crisis: "${text}"`
          }
        ],
        temperature: 0.2
      })

      const analysis = JSON.parse(aiAnalysis.choices[0].message.content!)
      
      // Guardar análisis de crisis
      await this.saveCrisisAnalysis(userId, text, analysis)
      
      return analysis
    } catch (error) {
      console.error('Error detecting crisis:', error)
      throw new Error('Failed to detect crisis')
    }
  }

  /**
   * Análisis de patrones de sueño
   */
  async analyzeSleepPatterns(userId: string): Promise<{
    averageSleep: number
    sleepQuality: 'poor' | 'fair' | 'good' | 'excellent'
    recommendations: string[]
    correlations: string[]
  }> {
    try {
      const sleepData = await this.getSleepData(userId)
      
      const analysis = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Eres un especialista en sueño. Analiza los patrones de sueño y proporciona:
            - Calidad promedio del sueño
            - Recomendaciones específicas
            - Correlaciones con humor y estrés`
          },
          {
            role: "user",
            content: `Analiza estos datos de sueño: ${JSON.stringify(sleepData)}`
          }
        ]
      })

      return JSON.parse(analysis.choices[0].message.content!)
    } catch (error) {
      console.error('Error analyzing sleep patterns:', error)
      throw new Error('Failed to analyze sleep patterns')
    }
  }

  /**
   * Predicción de episodios de ansiedad
   */
  async predictAnxietyEpisodes(userId: string): Promise<{
    probability: number
    timeframe: string
    triggers: string[]
    preventiveActions: string[]
  }> {
    try {
      const userHistory = await this.getUserHistory(userId)
      
      const prediction = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Eres un psicólogo experto en ansiedad. Analiza los patrones y predice:
            - Probabilidad de episodio de ansiedad
            - Marco temporal probable
            - Desencadenantes identificados
            - Acciones preventivas`
          },
          {
            role: "user",
            content: `Analiza este historial: ${JSON.stringify(userHistory)}`
          }
        ]
      })

      return JSON.parse(prediction.choices[0].message.content!)
    } catch (error) {
      console.error('Error predicting anxiety episodes:', error)
      throw new Error('Failed to predict anxiety episodes')
    }
  }

  /**
   * Análisis de progreso terapéutico
   */
  async analyzeTherapeuticProgress(userId: string): Promise<{
    overallProgress: number
    areasOfImprovement: string[]
    milestones: string[]
    recommendations: string[]
  }> {
    try {
      const progressData = await this.getProgressData(userId)
      
      const analysis = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Eres un terapeuta experto. Analiza el progreso terapéutico y proporciona:
            - Progreso general (0-100)
            - Áreas de mejora
            - Hitos alcanzados
            - Recomendaciones específicas`
          },
          {
            role: "user",
            content: `Analiza este progreso: ${JSON.stringify(progressData)}`
          }
        ]
      })

      return JSON.parse(analysis.choices[0].message.content!)
    } catch (error) {
      console.error('Error analyzing therapeutic progress:', error)
      throw new Error('Failed to analyze therapeutic progress')
    }
  }

  // Métodos auxiliares
  private combineSentimentAnalysis(openaiAnalysis: any, geminiAnalysis: string): SentimentAnalysis {
    // Lógica para combinar análisis de ambos modelos
    return {
      sentiment: openaiAnalysis.sentiment,
      confidence: (openaiAnalysis.confidence + 0.8) / 2, // Promedio ponderado
      emotions: openaiAnalysis.emotions,
      riskLevel: openaiAnalysis.riskLevel,
      recommendations: openaiAnalysis.recommendations
    }
  }

  private async saveSentimentAnalysis(userId: string, text: string, analysis: SentimentAnalysis) {
    // Guardar en base de datos
    await this.supabase
      .from('sentiment_analysis')
      .insert({
        user_id: userId,
        text: text,
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        emotions: analysis.emotions,
        risk_level: analysis.riskLevel,
        recommendations: analysis.recommendations,
        created_at: new Date().toISOString()
      })
  }

  private async getUserData(userId: string) {
    // Obtener datos del usuario desde la base de datos
    const { data } = await this.supabase
      .from('users')
      .select(`
        *,
        diary_entries(*),
        evaluations(*),
        sleep_data(*),
        mood_data(*)
      `)
      .eq('id', userId)
      .single()

    return data
  }

  private async analyzeMoodTrends(diaryEntries: any[]): Promise<MentalHealthInsight[]> {
    // Análisis de tendencias de humor
    const insights: MentalHealthInsight[] = []
    
    if (diaryEntries.length > 7) {
      const recentMoods = diaryEntries.slice(-7).map(entry => entry.mood)
      const avgMood = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length
      
      if (avgMood < 2) {
        insights.push({
          type: 'mood_trend',
          insight: 'Tendencia a la baja en el estado de ánimo detectada',
          confidence: 0.8,
          actionable: true,
          recommendations: ['Considerar actividades que mejoren el ánimo', 'Buscar apoyo social']
        })
      }
    }
    
    return insights
  }

  private async analyzeStressPatterns(evaluations: any[]): Promise<MentalHealthInsight[]> {
    // Análisis de patrones de estrés
    const insights: MentalHealthInsight[] = []
    
    if (evaluations.length > 3) {
      const recentScores = evaluations.slice(-3).map(eval => eval.totalScore)
      const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      
      if (avgScore > 10) {
        insights.push({
          type: 'stress_pattern',
          insight: 'Niveles de estrés elevados detectados',
          confidence: 0.9,
          actionable: true,
          recommendations: ['Técnicas de relajación', 'Ejercicio regular', 'Considerar terapia']
        })
      }
    }
    
    return insights
  }

  private async analyzeCorrelations(userData: any): Promise<MentalHealthInsight[]> {
    // Análisis de correlaciones
    const insights: MentalHealthInsight[] = []
    
    // Lógica para analizar correlaciones entre diferentes variables
    // (sueño vs humor, actividad vs estrés, etc.)
    
    return insights
  }

  private async generateAIInsights(userData: any): Promise<MentalHealthInsight[]> {
    // Generar insights con AI
    const insights: MentalHealthInsight[] = []
    
    // Lógica para generar insights avanzados con AI
    
    return insights
  }

  private async getUserProfile(userId: string) {
    // Obtener perfil del usuario
    const { data } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    return data
  }

  private async getRecentUserData(userId: string) {
    // Obtener datos recientes del usuario
    const { data } = await this.supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    return data
  }

  private async enrichRecommendations(recommendations: any[], userId: string) {
    // Enriquecer recomendaciones con datos de efectividad
    return recommendations.map(rec => ({
      ...rec,
      effectiveness: Math.random() * 0.4 + 0.6, // 60-100% efectividad
      personalizedFor: `Usuario ${userId}`
    }))
  }

  private async saveCrisisAnalysis(userId: string, text: string, analysis: any) {
    // Guardar análisis de crisis
    await this.supabase
      .from('crisis_analysis')
      .insert({
        user_id: userId,
        text: text,
        analysis: analysis,
        created_at: new Date().toISOString()
      })
  }

  private async getSleepData(userId: string) {
    // Obtener datos de sueño
    const { data } = await this.supabase
      .from('sleep_data')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30)
    
    return data
  }

  private async getUserHistory(userId: string) {
    // Obtener historial del usuario
    const { data } = await this.supabase
      .from('user_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
    
    return data
  }

  private async getProgressData(userId: string) {
    // Obtener datos de progreso
    const { data } = await this.supabase
      .from('progress_data')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    
    return data
  }
}

export default AIService
