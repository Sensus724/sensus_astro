/**
 * Tests de rendimiento para páginas de Sensus
 */

import { PerformanceTestRunner } from '../../src/utils/performanceTestRunner.js';

// Configurar test runner de rendimiento
const performanceTestRunner = new PerformanceTestRunner({
  timeout: 300000,
  verbose: true,
  headless: true,
  browser: 'chrome',
  viewport: { width: 1280, height: 720 },
  baseURL: 'http://localhost:3000',
  networkConditions: 'fast3G',
  cpuThrottling: 1,
  memoryThrottling: 1,
});

// Tests de rendimiento para página principal
describePerformance('Homepage Performance', () => {
  beforeAllPerformance(async () => {
    console.log('Setting up homepage performance tests...');
  });

  afterAllPerformance(async () => {
    console.log('Cleaning up homepage performance tests...');
  });

  itPerformance('should load homepage within performance budget', async () => {
    const url = '/';
    const metrics = await loadTest(url, 10);
    
    // Verificar Core Web Vitals
    const avgLCP = metrics.reduce((sum, m) => sum + m.lcp, 0) / metrics.length;
    const avgFID = metrics.reduce((sum, m) => sum + m.fid, 0) / metrics.length;
    const avgCLS = metrics.reduce((sum, m) => sum + m.cls, 0) / metrics.length;
    const avgFCP = metrics.reduce((sum, m) => sum + m.fcp, 0) / metrics.length;
    const avgTTFB = metrics.reduce((sum, m) => sum + m.ttfb, 0) / metrics.length;
    
    // Umbrales de rendimiento
    expect(avgLCP).toBeLessThan(2500); // LCP < 2.5s
    expect(avgFID).toBeLessThan(100);  // FID < 100ms
    expect(avgCLS).toBeLessThan(0.1);  // CLS < 0.1
    expect(avgFCP).toBeLessThan(1800); // FCP < 1.8s
    expect(avgTTFB).toBeLessThan(800); // TTFB < 800ms
    
    console.log(`Homepage Performance Metrics:`);
    console.log(`  LCP: ${avgLCP.toFixed(2)}ms`);
    console.log(`  FID: ${avgFID.toFixed(2)}ms`);
    console.log(`  CLS: ${avgCLS.toFixed(3)}`);
    console.log(`  FCP: ${avgFCP.toFixed(2)}ms`);
    console.log(`  TTFB: ${avgTTFB.toFixed(2)}ms`);
  }, {
    type: 'load',
    iterations: 10,
    concurrency: 1,
  });

  itPerformance('should handle concurrent users on homepage', async () => {
    const url = '/';
    const metrics = await stressTest(url, 5, 30000); // 5 usuarios concurrentes por 30 segundos
    
    // Verificar que el rendimiento se mantiene bajo carga
    const avgLCP = metrics.reduce((sum, m) => sum + m.lcp, 0) / metrics.length;
    const avgFID = metrics.reduce((sum, m) => sum + m.fid, 0) / metrics.length;
    const avgCLS = metrics.reduce((sum, m) => sum + m.cls, 0) / metrics.length;
    
    expect(avgLCP).toBeLessThan(3000); // LCP < 3s bajo carga
    expect(avgFID).toBeLessThan(150);  // FID < 150ms bajo carga
    expect(avgCLS).toBeLessThan(0.15); // CLS < 0.15 bajo carga
    
    console.log(`Homepage Stress Test Metrics:`);
    console.log(`  LCP: ${avgLCP.toFixed(2)}ms`);
    console.log(`  FID: ${avgFID.toFixed(2)}ms`);
    console.log(`  CLS: ${avgCLS.toFixed(3)}`);
  }, {
    type: 'stress',
    concurrency: 5,
    duration: 30000,
  });

  itPerformance('should recover from traffic spikes', async () => {
    const url = '/';
    const metrics = await spikeTest(url, 20, 5); // Pico de 20 usuarios, normal de 5
    
    // Verificar que la aplicación se recupera del pico
    const normalMetrics = metrics.slice(0, 5); // Primeras 5 iteraciones (normal)
    const spikeMetrics = metrics.slice(5, 25);  // Siguientes 20 iteraciones (pico)
    const recoveryMetrics = metrics.slice(25);  // Resto (recuperación)
    
    const normalLCP = normalMetrics.reduce((sum, m) => sum + m.lcp, 0) / normalMetrics.length;
    const spikeLCP = spikeMetrics.reduce((sum, m) => sum + m.lcp, 0) / spikeMetrics.length;
    const recoveryLCP = recoveryMetrics.reduce((sum, m) => sum + m.lcp, 0) / recoveryMetrics.length;
    
    // Verificar que el pico no degrada demasiado el rendimiento
    expect(spikeLCP).toBeLessThan(normalLCP * 2); // Pico no más del doble del normal
    
    // Verificar que se recupera
    expect(recoveryLCP).toBeLessThan(normalLCP * 1.5); // Recuperación dentro del 150% del normal
    
    console.log(`Homepage Spike Test Metrics:`);
    console.log(`  Normal LCP: ${normalLCP.toFixed(2)}ms`);
    console.log(`  Spike LCP: ${spikeLCP.toFixed(2)}ms`);
    console.log(`  Recovery LCP: ${recoveryLCP.toFixed(2)}ms`);
  }, {
    type: 'spike',
    concurrency: 20,
  });
});

// Tests de rendimiento para página de evaluación
describePerformance('Evaluation Page Performance', () => {
  beforeEachPerformance(async () => {
    // Simular usuario logueado
    console.log('Setting up evaluation page test...');
  });

  itPerformance('should load evaluation page efficiently', async () => {
    const url = '/evaluacion';
    const metrics = await loadTest(url, 5);
    
    const avgLCP = metrics.reduce((sum, m) => sum + m.lcp, 0) / metrics.length;
    const avgFCP = metrics.reduce((sum, m) => sum + m.fcp, 0) / metrics.length;
    const avgTTFB = metrics.reduce((sum, m) => sum + m.ttfb, 0) / metrics.length;
    
    expect(avgLCP).toBeLessThan(2000); // LCP < 2s
    expect(avgFCP).toBeLessThan(1500); // FCP < 1.5s
    expect(avgTTFB).toBeLessThan(600); // TTFB < 600ms
    
    console.log(`Evaluation Page Performance Metrics:`);
    console.log(`  LCP: ${avgLCP.toFixed(2)}ms`);
    console.log(`  FCP: ${avgFCP.toFixed(2)}ms`);
    console.log(`  TTFB: ${avgTTFB.toFixed(2)}ms`);
  }, {
    type: 'load',
    iterations: 5,
  });

  itPerformance('should handle evaluation form interactions smoothly', async () => {
    const url = '/evaluacion';
    const metrics = await loadTest(url, 3);
    
    // Verificar métricas de interacción
    const avgFID = metrics.reduce((sum, m) => sum + m.fid, 0) / metrics.length;
    const avgInteractionTime = metrics.reduce((sum, m) => sum + m.interactionTime, 0) / metrics.length;
    
    expect(avgFID).toBeLessThan(100); // FID < 100ms
    expect(avgInteractionTime).toBeLessThan(200); // Interacción < 200ms
    
    console.log(`Evaluation Form Interaction Metrics:`);
    console.log(`  FID: ${avgFID.toFixed(2)}ms`);
    console.log(`  Interaction Time: ${avgInteractionTime.toFixed(2)}ms`);
  }, {
    type: 'load',
    iterations: 3,
  });
});

// Tests de rendimiento para página de diario
describePerformance('Diary Page Performance', () => {
  beforeEachPerformance(async () => {
    // Simular usuario logueado
    console.log('Setting up diary page test...');
  });

  itPerformance('should load diary page with good performance', async () => {
    const url = '/diario';
    const metrics = await loadTest(url, 5);
    
    const avgLCP = metrics.reduce((sum, m) => sum + m.lcp, 0) / metrics.length;
    const avgFCP = metrics.reduce((sum, m) => sum + m.fcp, 0) / metrics.length;
    const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
    
    expect(avgLCP).toBeLessThan(2500); // LCP < 2.5s
    expect(avgFCP).toBeLessThan(1800); // FCP < 1.8s
    expect(avgMemoryUsage).toBeLessThan(0.7); // Memoria < 70%
    
    console.log(`Diary Page Performance Metrics:`);
    console.log(`  LCP: ${avgLCP.toFixed(2)}ms`);
    console.log(`  FCP: ${avgFCP.toFixed(2)}ms`);
    console.log(`  Memory Usage: ${(avgMemoryUsage * 100).toFixed(2)}%`);
  }, {
    type: 'load',
    iterations: 5,
  });

  itPerformance('should handle diary entry creation efficiently', async () => {
    const url = '/diario';
    const metrics = await loadTest(url, 3);
    
    // Verificar métricas de creación de entrada
    const avgFID = metrics.reduce((sum, m) => sum + m.fid, 0) / metrics.length;
    const avgInteractionTime = metrics.reduce((sum, m) => sum + m.interactionTime, 0) / metrics.length;
    
    expect(avgFID).toBeLessThan(100); // FID < 100ms
    expect(avgInteractionTime).toBeLessThan(300); // Interacción < 300ms
    
    console.log(`Diary Entry Creation Metrics:`);
    console.log(`  FID: ${avgFID.toFixed(2)}ms`);
    console.log(`  Interaction Time: ${avgInteractionTime.toFixed(2)}ms`);
  }, {
    type: 'load',
    iterations: 3,
  });
});

// Tests de rendimiento para página de planes
describePerformance('Plans Page Performance', () => {
  beforeEachPerformance(async () => {
    // Simular usuario logueado
    console.log('Setting up plans page test...');
  });

  itPerformance('should load plans page quickly', async () => {
    const url = '/planes';
    const metrics = await loadTest(url, 5);
    
    const avgLCP = metrics.reduce((sum, m) => sum + m.lcp, 0) / metrics.length;
    const avgFCP = metrics.reduce((sum, m) => sum + m.fcp, 0) / metrics.length;
    const avgTTFB = metrics.reduce((sum, m) => sum + m.ttfb, 0) / metrics.length;
    
    expect(avgLCP).toBeLessThan(2000); // LCP < 2s
    expect(avgFCP).toBeLessThan(1500); // FCP < 1.5s
    expect(avgTTFB).toBeLessThan(600); // TTFB < 600ms
    
    console.log(`Plans Page Performance Metrics:`);
    console.log(`  LCP: ${avgLCP.toFixed(2)}ms`);
    console.log(`  FCP: ${avgFCP.toFixed(2)}ms`);
    console.log(`  TTFB: ${avgTTFB.toFixed(2)}ms`);
  }, {
    type: 'load',
    iterations: 5,
  });

  itPerformance('should handle plan selection smoothly', async () => {
    const url = '/planes';
    const metrics = await loadTest(url, 3);
    
    const avgFID = metrics.reduce((sum, m) => sum + m.fid, 0) / metrics.length;
    const avgInteractionTime = metrics.reduce((sum, m) => sum + m.interactionTime, 0) / metrics.length;
    
    expect(avgFID).toBeLessThan(100); // FID < 100ms
    expect(avgInteractionTime).toBeLessThan(250); // Interacción < 250ms
    
    console.log(`Plan Selection Metrics:`);
    console.log(`  FID: ${avgFID.toFixed(2)}ms`);
    console.log(`  Interaction Time: ${avgInteractionTime.toFixed(2)}ms`);
  }, {
    type: 'load',
    iterations: 3,
  });
});

// Tests de rendimiento para página de perfil
describePerformance('Profile Page Performance', () => {
  beforeEachPerformance(async () => {
    // Simular usuario logueado
    console.log('Setting up profile page test...');
  });

  itPerformance('should load profile page efficiently', async () => {
    const url = '/perfil';
    const metrics = await loadTest(url, 5);
    
    const avgLCP = metrics.reduce((sum, m) => sum + m.lcp, 0) / metrics.length;
    const avgFCP = metrics.reduce((sum, m) => sum + m.fcp, 0) / metrics.length;
    const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
    
    expect(avgLCP).toBeLessThan(2500); // LCP < 2.5s
    expect(avgFCP).toBeLessThan(1800); // FCP < 1.8s
    expect(avgMemoryUsage).toBeLessThan(0.7); // Memoria < 70%
    
    console.log(`Profile Page Performance Metrics:`);
    console.log(`  LCP: ${avgLCP.toFixed(2)}ms`);
    console.log(`  FCP: ${avgFCP.toFixed(2)}ms`);
    console.log(`  Memory Usage: ${(avgMemoryUsage * 100).toFixed(2)}%`);
  }, {
    type: 'load',
    iterations: 5,
  });

  itPerformance('should handle profile updates smoothly', async () => {
    const url = '/perfil';
    const metrics = await loadTest(url, 3);
    
    const avgFID = metrics.reduce((sum, m) => sum + m.fid, 0) / metrics.length;
    const avgInteractionTime = metrics.reduce((sum, m) => sum + m.interactionTime, 0) / metrics.length;
    
    expect(avgFID).toBeLessThan(100); // FID < 100ms
    expect(avgInteractionTime).toBeLessThan(300); // Interacción < 300ms
    
    console.log(`Profile Update Metrics:`);
    console.log(`  FID: ${avgFID.toFixed(2)}ms`);
    console.log(`  Interaction Time: ${avgInteractionTime.toFixed(2)}ms`);
  }, {
    type: 'load',
    iterations: 3,
  });
});

// Tests de rendimiento para página de dashboard
describePerformance('Dashboard Performance', () => {
  beforeEachPerformance(async () => {
    // Simular usuario logueado
    console.log('Setting up dashboard test...');
  });

  itPerformance('should load dashboard with good performance', async () => {
    const url = '/dashboard';
    const metrics = await loadTest(url, 5);
    
    const avgLCP = metrics.reduce((sum, m) => sum + m.lcp, 0) / metrics.length;
    const avgFCP = metrics.reduce((sum, m) => sum + m.fcp, 0) / metrics.length;
    const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
    
    expect(avgLCP).toBeLessThan(3000); // LCP < 3s (dashboard puede ser más complejo)
    expect(avgFCP).toBeLessThan(2000); // FCP < 2s
    expect(avgMemoryUsage).toBeLessThan(0.8); // Memoria < 80%
    
    console.log(`Dashboard Performance Metrics:`);
    console.log(`  LCP: ${avgLCP.toFixed(2)}ms`);
    console.log(`  FCP: ${avgFCP.toFixed(2)}ms`);
    console.log(`  Memory Usage: ${(avgMemoryUsage * 100).toFixed(2)}%`);
  }, {
    type: 'load',
    iterations: 5,
  });

  itPerformance('should handle dashboard interactions smoothly', async () => {
    const url = '/dashboard';
    const metrics = await loadTest(url, 3);
    
    const avgFID = metrics.reduce((sum, m) => sum + m.fid, 0) / metrics.length;
    const avgInteractionTime = metrics.reduce((sum, m) => sum + m.interactionTime, 0) / metrics.length;
    const avgAnimationFrameRate = metrics.reduce((sum, m) => sum + m.animationFrameRate, 0) / metrics.length;
    
    expect(avgFID).toBeLessThan(100); // FID < 100ms
    expect(avgInteractionTime).toBeLessThan(300); // Interacción < 300ms
    expect(avgAnimationFrameRate).toBeGreaterThan(50); // FPS > 50
    
    console.log(`Dashboard Interaction Metrics:`);
    console.log(`  FID: ${avgFID.toFixed(2)}ms`);
    console.log(`  Interaction Time: ${avgInteractionTime.toFixed(2)}ms`);
    console.log(`  Animation Frame Rate: ${avgAnimationFrameRate.toFixed(2)} FPS`);
  }, {
    type: 'load',
    iterations: 3,
  });
});

// Tests de rendimiento para volumen alto
describePerformance('High Volume Performance', () => {
  itPerformance('should handle high volume of requests', async () => {
    const url = '/';
    const metrics = await volumeTest(url, 100); // 100 requests
    
    const avgLCP = metrics.reduce((sum, m) => sum + m.lcp, 0) / metrics.length;
    const avgFID = metrics.reduce((sum, m) => sum + m.fid, 0) / metrics.length;
    const avgTTFB = metrics.reduce((sum, m) => sum + m.ttfb, 0) / metrics.length;
    const failedRequests = metrics.reduce((sum, m) => sum + m.failedRequests, 0);
    
    expect(avgLCP).toBeLessThan(4000); // LCP < 4s bajo volumen alto
    expect(avgFID).toBeLessThan(200);  // FID < 200ms bajo volumen alto
    expect(avgTTFB).toBeLessThan(1200); // TTFB < 1.2s bajo volumen alto
    expect(failedRequests).toBeLessThan(5); // Menos de 5 requests fallidos
    
    console.log(`High Volume Performance Metrics:`);
    console.log(`  LCP: ${avgLCP.toFixed(2)}ms`);
    console.log(`  FID: ${avgFID.toFixed(2)}ms`);
    console.log(`  TTFB: ${avgTTFB.toFixed(2)}ms`);
    console.log(`  Failed Requests: ${failedRequests}`);
  }, {
    type: 'volume',
    iterations: 100,
  });
});

// Tests de rendimiento de resistencia
describePerformance('Endurance Performance', () => {
  itPerformance('should maintain performance over time', async () => {
    const url = '/';
    const metrics = await enduranceTest(url, 120000); // 2 minutos
    
    const avgLCP = metrics.reduce((sum, m) => sum + m.lcp, 0) / metrics.length;
    const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
    const maxMemoryUsage = Math.max(...metrics.map(m => m.memoryUsage));
    const memoryLeaks = metrics.reduce((sum, m) => sum + m.memoryLeaks, 0);
    
    expect(avgLCP).toBeLessThan(3000); // LCP < 3s promedio
    expect(avgMemoryUsage).toBeLessThan(0.8); // Memoria < 80% promedio
    expect(maxMemoryUsage).toBeLessThan(0.9); // Memoria < 90% máximo
    expect(memoryLeaks).toBeLessThan(10); // Menos de 10 memory leaks
    
    console.log(`Endurance Performance Metrics:`);
    console.log(`  Average LCP: ${avgLCP.toFixed(2)}ms`);
    console.log(`  Average Memory Usage: ${(avgMemoryUsage * 100).toFixed(2)}%`);
    console.log(`  Max Memory Usage: ${(maxMemoryUsage * 100).toFixed(2)}%`);
    console.log(`  Memory Leaks: ${memoryLeaks}`);
  }, {
    type: 'endurance',
    duration: 120000,
  });
});

// Ejecutar tests de rendimiento
if (typeof window !== 'undefined') {
  // En el navegador
  window.addEventListener('DOMContentLoaded', () => {
    runPerformanceTests().then(stats => {
      console.log('Performance tests completed:', stats);
    });
  });
} else {
  // En Node.js
  runPerformanceTests().then(stats => {
    console.log('Performance tests completed:', stats);
    process.exit(stats.failed > 0 ? 1 : 0);
  });
}
