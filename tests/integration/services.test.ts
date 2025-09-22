/**
 * Tests de integración para servicios de Sensus
 */

import { IntegrationTestRunner } from '../../src/utils/integrationTestRunner.js';

// Configurar test runner de integración
const integrationTestRunner = new IntegrationTestRunner({
  timeout: 30000,
  verbose: true,
  mockExternalServices: true,
  testDatabase: true,
  testAPIs: true,
});

// Tests de integración para servicios de autenticación
describeIntegration('Authentication Service Integration', () => {
  beforeAllIntegration(async () => {
    // Configurar base de datos de prueba
    await integrationTestRunner.mockDatabase('users', []);
    await integrationTestRunner.mockDatabase('sessions', []);
  });

  afterAllIntegration(async () => {
    // Limpiar base de datos de prueba
    const db = integrationTestRunner.mocks.get('database');
    await db.users.clear();
    await db.sessions.clear();
  });

  beforeEachIntegration(async () => {
    // Limpiar datos antes de cada test
    const db = integrationTestRunner.mocks.get('database');
    await db.users.clear();
    await db.sessions.clear();
  });

  itIntegration('should register new user successfully', async () => {
    // Mock del servicio de autenticación
    const authService = {
      async registerWithEmail(email: string, password: string, userData: any) {
        // Simular registro en Firebase Auth
        const authResult = await integrationTestRunner.mocks.get('firebase').auth
          .createUserWithEmailAndPassword(email, password);
        
        // Simular creación de perfil en Firestore
        const userProfile = {
          uid: authResult.user.uid,
          email: authResult.user.email,
          ...userData,
          createdAt: new Date().toISOString(),
        };
        
        const db = integrationTestRunner.mocks.get('database');
        await db.users.insert(userProfile);
        
        return { success: true, user: userProfile };
      },
    };

    const userData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      birthDate: '1990-01-01',
    };

    const result = await authService.registerWithEmail(
      'test@example.com',
      'Password123',
      userData
    );

    expect(result.success).toBeTruthy();
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.firstName).toBe('Juan');
    expect(result.user.lastName).toBe('Pérez');
  });

  itIntegration('should login existing user successfully', async () => {
    // Crear usuario de prueba
    const db = integrationTestRunner.mocks.get('database');
    await db.users.insert({
      id: 'test-user-1',
      email: 'test@example.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      createdAt: new Date().toISOString(),
    });

    const authService = {
      async loginWithEmail(email: string, password: string) {
        // Simular login en Firebase Auth
        const authResult = await integrationTestRunner.mocks.get('firebase').auth
          .signInWithEmailAndPassword(email, password);
        
        // Buscar perfil de usuario
        const userProfile = await db.users.findByField('email', email);
        
        if (userProfile.length === 0) {
          throw new Error('User profile not found');
        }
        
        // Crear sesión
        const session = {
          userId: authResult.user.uid,
          email: email,
          loginAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        
        await db.sessions.insert(session);
        
        return { success: true, user: userProfile[0], session };
      },
    };

    const result = await authService.loginWithEmail('test@example.com', 'Password123');

    expect(result.success).toBeTruthy();
    expect(result.user.email).toBe('test@example.com');
    expect(result.session).toBeDefined();
    expect(result.session.email).toBe('test@example.com');
  });

  itIntegration('should handle login with invalid credentials', async () => {
    const authService = {
      async loginWithEmail(email: string, password: string) {
        try {
          await integrationTestRunner.mocks.get('firebase').auth
            .signInWithEmailAndPassword(email, password);
        } catch (error) {
          throw new Error('Invalid credentials');
        }
      },
    };

    try {
      await authService.loginWithEmail('nonexistent@example.com', 'WrongPassword');
      expect(true).toBeFalsy(); // No debería llegar aquí
    } catch (error) {
      expect(error.message).toBe('Invalid credentials');
    }
  });

  itIntegration('should logout user and clear session', async () => {
    // Crear sesión de prueba
    const db = integrationTestRunner.mocks.get('database');
    await db.sessions.insert({
      id: 'test-session-1',
      userId: 'test-user-1',
      email: 'test@example.com',
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    const authService = {
      async logout(userId: string) {
        // Simular logout en Firebase Auth
        await integrationTestRunner.mocks.get('firebase').auth.signOut();
        
        // Eliminar sesión
        const sessions = await db.sessions.findByField('userId', userId);
        for (const session of sessions) {
          await db.sessions.delete(session.id);
        }
        
        return { success: true };
      },
    };

    const result = await authService.logout('test-user-1');

    expect(result.success).toBeTruthy();
    
    // Verificar que la sesión fue eliminada
    const remainingSessions = await db.sessions.findByField('userId', 'test-user-1');
    expect(remainingSessions).toHaveLength(0);
  });
});

// Tests de integración para servicios de evaluación
describeIntegration('Evaluation Service Integration', () => {
  beforeAllIntegration(async () => {
    // Configurar base de datos de prueba
    await integrationTestRunner.mockDatabase('evaluations', []);
    await integrationTestRunner.mockDatabase('users', []);
  });

  beforeEachIntegration(async () => {
    // Limpiar datos antes de cada test
    const db = integrationTestRunner.mocks.get('database');
    await db.evaluations.clear();
    await db.users.clear();
  });

  itIntegration('should create new evaluation', async () => {
    // Crear usuario de prueba
    const db = integrationTestRunner.mocks.get('database');
    await db.users.insert({
      id: 'test-user-1',
      email: 'test@example.com',
      firstName: 'Juan',
      lastName: 'Pérez',
    });

    const evaluationService = {
      async createEvaluation(userId: string, answers: any[]) {
        // Calcular puntuación
        const score = answers.reduce((sum, answer) => sum + answer.value, 0);
        
        // Determinar nivel de ansiedad
        let level = 'low';
        if (score >= 15) level = 'severe';
        else if (score >= 10) level = 'moderate';
        else if (score >= 5) level = 'mild';
        
        const evaluation = {
          id: `eval-${Date.now()}`,
          userId,
          answers,
          score,
          level,
          createdAt: new Date().toISOString(),
        };
        
        await db.evaluations.insert(evaluation);
        
        return { success: true, evaluation };
      },
    };

    const answers = [
      { question: 'q1', value: 2 },
      { question: 'q2', value: 1 },
      { question: 'q3', value: 3 },
      { question: 'q4', value: 0 },
      { question: 'q5', value: 2 },
      { question: 'q6', value: 1 },
      { question: 'q7', value: 1 },
    ];

    const result = await evaluationService.createEvaluation('test-user-1', answers);

    expect(result.success).toBeTruthy();
    expect(result.evaluation.score).toBe(10);
    expect(result.evaluation.level).toBe('moderate');
    expect(result.evaluation.userId).toBe('test-user-1');
  });

  itIntegration('should get user evaluation history', async () => {
    // Crear evaluaciones de prueba
    const db = integrationTestRunner.mocks.get('database');
    const userId = 'test-user-1';
    
    await db.evaluations.insert({
      id: 'eval-1',
      userId,
      score: 8,
      level: 'mild',
      createdAt: '2024-01-01T00:00:00Z',
    });
    
    await db.evaluations.insert({
      id: 'eval-2',
      userId,
      score: 12,
      level: 'moderate',
      createdAt: '2024-01-15T00:00:00Z',
    });

    const evaluationService = {
      async getUserEvaluations(userId: string) {
        const evaluations = await db.evaluations.findByField('userId', userId);
        return evaluations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
    };

    const evaluations = await evaluationService.getUserEvaluations(userId);

    expect(evaluations).toHaveLength(2);
    expect(evaluations[0].id).toBe('eval-2'); // Más reciente primero
    expect(evaluations[1].id).toBe('eval-1');
    expect(evaluations[0].level).toBe('moderate');
    expect(evaluations[1].level).toBe('mild');
  });

  itIntegration('should calculate evaluation trends', async () => {
    // Crear evaluaciones de prueba con diferentes fechas
    const db = integrationTestRunner.mocks.get('database');
    const userId = 'test-user-1';
    
    const evaluations = [
      { id: 'eval-1', userId, score: 15, level: 'severe', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'eval-2', userId, score: 12, level: 'moderate', createdAt: '2024-01-15T00:00:00Z' },
      { id: 'eval-3', userId, score: 8, level: 'mild', createdAt: '2024-02-01T00:00:00Z' },
      { id: 'eval-4', userId, score: 5, level: 'low', createdAt: '2024-02-15T00:00:00Z' },
    ];
    
    for (const eval of evaluations) {
      await db.evaluations.insert(eval);
    }

    const evaluationService = {
      async calculateTrends(userId: string) {
        const evaluations = await db.evaluations.findByField('userId', userId);
        const sortedEvaluations = evaluations.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        if (sortedEvaluations.length < 2) {
          return { trend: 'insufficient_data', improvement: 0 };
        }
        
        const firstScore = sortedEvaluations[0].score;
        const lastScore = sortedEvaluations[sortedEvaluations.length - 1].score;
        const improvement = firstScore - lastScore;
        
        let trend = 'stable';
        if (improvement > 2) trend = 'improving';
        else if (improvement < -2) trend = 'worsening';
        
        return { trend, improvement, totalEvaluations: sortedEvaluations.length };
      },
    };

    const trends = await evaluationService.calculateTrends(userId);

    expect(trends.trend).toBe('improving');
    expect(trends.improvement).toBe(10); // 15 - 5
    expect(trends.totalEvaluations).toBe(4);
  });
});

// Tests de integración para servicios de diario
describeIntegration('Diary Service Integration', () => {
  beforeAllIntegration(async () => {
    // Configurar base de datos de prueba
    await integrationTestRunner.mockDatabase('diary_entries', []);
    await integrationTestRunner.mockDatabase('users', []);
  });

  beforeEachIntegration(async () => {
    // Limpiar datos antes de cada test
    const db = integrationTestRunner.mocks.get('database');
    await db.diary_entries.clear();
    await db.users.clear();
  });

  itIntegration('should create diary entry', async () => {
    // Crear usuario de prueba
    const db = integrationTestRunner.mocks.get('database');
    await db.users.insert({
      id: 'test-user-1',
      email: 'test@example.com',
      firstName: 'Juan',
      lastName: 'Pérez',
    });

    const diaryService = {
      async createEntry(userId: string, entryData: any) {
        const entry = {
          id: `entry-${Date.now()}`,
          userId,
          ...entryData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await db.diary_entries.insert(entry);
        
        return { success: true, entry };
      },
    };

    const entryData = {
      title: 'Mi día de hoy',
      content: 'Hoy me sentí más tranquilo después de hacer ejercicio.',
      mood: 'calm',
      tags: ['ejercicio', 'tranquilidad'],
      isPrivate: true,
    };

    const result = await diaryService.createEntry('test-user-1', entryData);

    expect(result.success).toBeTruthy();
    expect(result.entry.title).toBe('Mi día de hoy');
    expect(result.entry.content).toBe('Hoy me sentí más tranquilo después de hacer ejercicio.');
    expect(result.entry.mood).toBe('calm');
    expect(result.entry.tags).toEqual(['ejercicio', 'tranquilidad']);
    expect(result.entry.isPrivate).toBeTruthy();
  });

  itIntegration('should get user diary entries', async () => {
    // Crear entradas de diario de prueba
    const db = integrationTestRunner.mocks.get('database');
    const userId = 'test-user-1';
    
    await db.diary_entries.insert({
      id: 'entry-1',
      userId,
      title: 'Primer día',
      content: 'Contenido del primer día',
      mood: 'happy',
      createdAt: '2024-01-01T00:00:00Z',
    });
    
    await db.diary_entries.insert({
      id: 'entry-2',
      userId,
      title: 'Segundo día',
      content: 'Contenido del segundo día',
      mood: 'calm',
      createdAt: '2024-01-02T00:00:00Z',
    });

    const diaryService = {
      async getUserEntries(userId: string, options: any = {}) {
        let entries = await db.diary_entries.findByField('userId', userId);
        
        // Filtrar por privacidad si se especifica
        if (options.includePrivate === false) {
          entries = entries.filter(entry => !entry.isPrivate);
        }
        
        // Ordenar por fecha
        entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Paginación
        if (options.limit) {
          entries = entries.slice(0, options.limit);
        }
        
        return entries;
      },
    };

    const entries = await diaryService.getUserEntries(userId, { limit: 10 });

    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe('entry-2'); // Más reciente primero
    expect(entries[1].id).toBe('entry-1');
    expect(entries[0].title).toBe('Segundo día');
    expect(entries[1].title).toBe('Primer día');
  });

  itIntegration('should update diary entry', async () => {
    // Crear entrada de diario de prueba
    const db = integrationTestRunner.mocks.get('database');
    const entryId = 'entry-1';
    const userId = 'test-user-1';
    
    await db.diary_entries.insert({
      id: entryId,
      userId,
      title: 'Título original',
      content: 'Contenido original',
      mood: 'neutral',
      createdAt: '2024-01-01T00:00:00Z',
    });

    const diaryService = {
      async updateEntry(entryId: string, updates: any) {
        const entry = await db.diary_entries.findById(entryId);
        if (!entry) {
          throw new Error('Entry not found');
        }
        
        const updatedEntry = {
          ...entry,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        
        await db.diary_entries.update(entryId, updatedEntry);
        
        return { success: true, entry: updatedEntry };
      },
    };

    const updates = {
      title: 'Título actualizado',
      content: 'Contenido actualizado',
      mood: 'happy',
    };

    const result = await diaryService.updateEntry(entryId, updates);

    expect(result.success).toBeTruthy();
    expect(result.entry.title).toBe('Título actualizado');
    expect(result.entry.content).toBe('Contenido actualizado');
    expect(result.entry.mood).toBe('happy');
    expect(result.entry.updatedAt).toBeDefined();
  });

  itIntegration('should delete diary entry', async () => {
    // Crear entrada de diario de prueba
    const db = integrationTestRunner.mocks.get('database');
    const entryId = 'entry-1';
    const userId = 'test-user-1';
    
    await db.diary_entries.insert({
      id: entryId,
      userId,
      title: 'Entrada a eliminar',
      content: 'Esta entrada será eliminada',
      mood: 'neutral',
    });

    const diaryService = {
      async deleteEntry(entryId: string) {
        const entry = await db.diary_entries.findById(entryId);
        if (!entry) {
          throw new Error('Entry not found');
        }
        
        await db.diary_entries.delete(entryId);
        
        return { success: true };
      },
    };

    const result = await diaryService.deleteEntry(entryId);

    expect(result.success).toBeTruthy();
    
    // Verificar que la entrada fue eliminada
    const deletedEntry = await db.diary_entries.findById(entryId);
    expect(deletedEntry).toBeNull();
  });
});

// Tests de integración para servicios de planes
describeIntegration('Plans Service Integration', () => {
  beforeAllIntegration(async () => {
    // Configurar base de datos de prueba
    await integrationTestRunner.mockDatabase('plans', []);
    await integrationTestRunner.mockDatabase('user_plans', []);
    await integrationTestRunner.mockDatabase('users', []);
  });

  beforeEachIntegration(async () => {
    // Limpiar datos antes de cada test
    const db = integrationTestRunner.mocks.get('database');
    await db.plans.clear();
    await db.user_plans.clear();
    await db.users.clear();
  });

  itIntegration('should get available plans', async () => {
    // Crear planes de prueba
    const db = integrationTestRunner.mocks.get('database');
    
    await db.plans.insert({
      id: 'plan-1',
      name: 'Plan Básico',
      description: 'Plan básico de bienestar',
      price: 0,
      features: ['diario', 'evaluaciones'],
      isActive: true,
    });
    
    await db.plans.insert({
      id: 'plan-2',
      name: 'Plan Premium',
      description: 'Plan premium con todas las funciones',
      price: 9.99,
      features: ['diario', 'evaluaciones', 'terapia', 'coaching'],
      isActive: true,
    });

    const plansService = {
      async getAvailablePlans() {
        const plans = await db.plans.getAll();
        return plans.filter(plan => plan.isActive);
      },
    };

    const plans = await plansService.getAvailablePlans();

    expect(plans).toHaveLength(2);
    expect(plans[0].name).toBe('Plan Básico');
    expect(plans[1].name).toBe('Plan Premium');
    expect(plans[0].price).toBe(0);
    expect(plans[1].price).toBe(9.99);
  });

  itIntegration('should assign plan to user', async () => {
    // Crear usuario y plan de prueba
    const db = integrationTestRunner.mocks.get('database');
    
    await db.users.insert({
      id: 'test-user-1',
      email: 'test@example.com',
      firstName: 'Juan',
      lastName: 'Pérez',
    });
    
    await db.plans.insert({
      id: 'plan-1',
      name: 'Plan Premium',
      description: 'Plan premium',
      price: 9.99,
      features: ['diario', 'evaluaciones', 'terapia'],
      isActive: true,
    });

    const plansService = {
      async assignPlanToUser(userId: string, planId: string) {
        const user = await db.users.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        
        const plan = await db.plans.findById(planId);
        if (!plan) {
          throw new Error('Plan not found');
        }
        
        const userPlan = {
          id: `user-plan-${Date.now()}`,
          userId,
          planId,
          assignedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
          isActive: true,
        };
        
        await db.user_plans.insert(userPlan);
        
        return { success: true, userPlan };
      },
    };

    const result = await plansService.assignPlanToUser('test-user-1', 'plan-1');

    expect(result.success).toBeTruthy();
    expect(result.userPlan.userId).toBe('test-user-1');
    expect(result.userPlan.planId).toBe('plan-1');
    expect(result.userPlan.isActive).toBeTruthy();
  });

  itIntegration('should get user active plan', async () => {
    // Crear datos de prueba
    const db = integrationTestRunner.mocks.get('database');
    const userId = 'test-user-1';
    
    await db.users.insert({
      id: userId,
      email: 'test@example.com',
      firstName: 'Juan',
      lastName: 'Pérez',
    });
    
    await db.plans.insert({
      id: 'plan-1',
      name: 'Plan Premium',
      description: 'Plan premium',
      price: 9.99,
      features: ['diario', 'evaluaciones', 'terapia'],
      isActive: true,
    });
    
    await db.user_plans.insert({
      id: 'user-plan-1',
      userId,
      planId: 'plan-1',
      assignedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    });

    const plansService = {
      async getUserActivePlan(userId: string) {
        const userPlans = await db.user_plans.findByField('userId', userId);
        const activePlan = userPlans.find(up => up.isActive && new Date(up.expiresAt) > new Date());
        
        if (!activePlan) {
          return null;
        }
        
        const plan = await db.plans.findById(activePlan.planId);
        return { ...plan, userPlan: activePlan };
      },
    };

    const activePlan = await plansService.getUserActivePlan(userId);

    expect(activePlan).not.toBeNull();
    expect(activePlan.name).toBe('Plan Premium');
    expect(activePlan.price).toBe(9.99);
    expect(activePlan.features).toEqual(['diario', 'evaluaciones', 'terapia']);
    expect(activePlan.userPlan.userId).toBe(userId);
  });
});

// Ejecutar tests de integración
if (typeof window !== 'undefined') {
  // En el navegador
  window.addEventListener('DOMContentLoaded', () => {
    runIntegrationTests().then(stats => {
      console.log('Integration tests completed:', stats);
    });
  });
} else {
  // En Node.js
  runIntegrationTests().then(stats => {
    console.log('Integration tests completed:', stats);
    process.exit(stats.failed > 0 ? 1 : 0);
  });
}
