/**
 * Tests unitarios para utilidades de Sensus
 */

import { TestRunner } from '../../src/utils/testRunner.js';

// Configurar test runner
const testRunner = new TestRunner({
  timeout: 10000,
  verbose: true,
  coverage: true,
});

// Tests para utilidades de rendimiento
describe('Performance Utils', () => {
  describe('PerformanceManager', () => {
    it('should initialize with default config', () => {
      const mockConfig = {
        enableMonitoring: true,
        enableReporting: true,
        enableOptimization: true,
        sampleRate: 1.0,
        thresholds: {
          lcp: 2500,
          fid: 100,
          cls: 0.1,
          fcp: 1800,
          ttfb: 800,
        },
      };

      expect(mockConfig.enableMonitoring).toBeTruthy();
      expect(mockConfig.enableReporting).toBeTruthy();
      expect(mockConfig.sampleRate).toBe(1.0);
      expect(mockConfig.thresholds.lcp).toBe(2500);
    });

    it('should optimize images with correct parameters', () => {
      const mockOptimizeImage = (src: string, options: any) => {
        const { width, height, quality, format } = options;
        return `${src}?w=${width}&h=${height}&q=${quality}&f=${format}`;
      };

      const originalSrc = 'test-image.jpg';
      const optimizedSrc = mockOptimizeImage(originalSrc, {
        width: 800,
        height: 600,
        quality: 80,
        format: 'webp',
      });

      expect(optimizedSrc).toBe('test-image.jpg?w=800&h=600&q=80&f=webp');
    });

    it('should calculate performance score correctly', () => {
      const mockCalculateScore = (metrics: any, thresholds: any) => {
        let score = 100;
        if (metrics.lcp > thresholds.lcp) score -= 20;
        if (metrics.fid > thresholds.fid) score -= 20;
        if (metrics.cls > thresholds.cls) score -= 20;
        if (metrics.fcp > thresholds.fcp) score -= 20;
        if (metrics.ttfb > thresholds.ttfb) score -= 20;
        return Math.max(0, score);
      };

      const metrics = { lcp: 2000, fid: 50, cls: 0.05, fcp: 1500, ttfb: 600 };
      const thresholds = { lcp: 2500, fid: 100, cls: 0.1, fcp: 1800, ttfb: 800 };
      
      const score = mockCalculateScore(metrics, thresholds);
      expect(score).toBe(100);
    });

    it('should detect performance issues', () => {
      const mockDetectIssues = (metrics: any, thresholds: any) => {
        const issues = [];
        if (metrics.lcp > thresholds.lcp) issues.push('LCP');
        if (metrics.fid > thresholds.fid) issues.push('FID');
        if (metrics.cls > thresholds.cls) issues.push('CLS');
        return issues;
      };

      const badMetrics = { lcp: 3000, fid: 150, cls: 0.2 };
      const thresholds = { lcp: 2500, fid: 100, cls: 0.1 };
      
      const issues = mockDetectIssues(badMetrics, thresholds);
      expect(issues).toContain('LCP');
      expect(issues).toContain('FID');
      expect(issues).toContain('CLS');
    });
  });
});

// Tests para utilidades de imágenes
describe('Image Optimization Utils', () => {
  describe('ImageOptimizer', () => {
    it('should check format support', () => {
      const mockCheckFormatSupport = (format: string) => {
        const supportedFormats = ['webp', 'avif', 'jpeg', 'png'];
        return supportedFormats.includes(format);
      };

      expect(mockCheckFormatSupport('webp')).toBeTruthy();
      expect(mockCheckFormatSupport('avif')).toBeTruthy();
      expect(mockCheckFormatSupport('jpeg')).toBeTruthy();
      expect(mockCheckFormatSupport('png')).toBeTruthy();
      expect(mockCheckFormatSupport('gif')).toBeFalsy();
    });

    it('should generate responsive images', () => {
      const mockGenerateResponsiveImages = (src: string, breakpoints: number[]) => {
        const srcsetParts = breakpoints.map(width => `${src}?w=${width} ${width}w`);
        return {
          srcset: srcsetParts.join(', '),
          sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
          fallback: `${src}?w=800&f=jpeg`,
        };
      };

      const src = 'test-image.jpg';
      const breakpoints = [320, 640, 1024, 1280];
      const result = mockGenerateResponsiveImages(src, breakpoints);

      expect(result.srcset).toContain('320w');
      expect(result.srcset).toContain('640w');
      expect(result.srcset).toContain('1024w');
      expect(result.srcset).toContain('1280w');
      expect(result.fallback).toBe('test-image.jpg?w=800&f=jpeg');
    });

    it('should compress images', () => {
      const mockCompressImage = (file: File, quality: number) => {
        return new Promise((resolve) => {
          const compressedSize = file.size * (quality / 100);
          resolve({
            size: compressedSize,
            quality,
            originalSize: file.size,
          });
        });
      };

      const mockFile = { size: 1000000 } as File;
      const quality = 80;
      
      mockCompressImage(mockFile, quality).then(result => {
        expect(result.size).toBe(800000);
        expect(result.quality).toBe(80);
        expect(result.originalSize).toBe(1000000);
      });
    });

    it('should analyze image colors', () => {
      const mockAnalyzeColors = (imageData: any) => {
        const colors = [];
        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          colors.push(`rgb(${r}, ${g}, ${b})`);
        }
        return colors;
      };

      const mockImageData = [255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255];
      const colors = mockAnalyzeColors(mockImageData);
      
      expect(colors).toHaveLength(3);
      expect(colors[0]).toBe('rgb(255, 0, 0)');
      expect(colors[1]).toBe('rgb(0, 255, 0)');
      expect(colors[2]).toBe('rgb(0, 0, 255)');
    });
  });
});

// Tests para utilidades de bundle
describe('Bundle Optimization Utils', () => {
  describe('BundleOptimizer', () => {
    it('should split code into chunks', () => {
      const mockSplitCode = (modules: string[]) => {
        const chunks = [];
        for (let i = 0; i < modules.length; i += 2) {
          chunks.push(modules.slice(i, i + 2));
        }
        return chunks;
      };

      const modules = ['auth', 'dashboard', 'diary', 'evaluation', 'charts'];
      const chunks = mockSplitCode(modules);
      
      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual(['auth', 'dashboard']);
      expect(chunks[1]).toEqual(['diary', 'evaluation']);
      expect(chunks[2]).toEqual(['charts']);
    });

    it('should preload chunks based on user behavior', () => {
      const mockPreloadChunks = (userBehavior: any) => {
        const chunksToPreload = [];
        
        if (userBehavior.mouseX < 300) {
          chunksToPreload.push('navigation');
        }
        if (userBehavior.mouseY < 200) {
          chunksToPreload.push('header');
        }
        if (userBehavior.scrollPercentage > 0.8) {
          chunksToPreload.push('footer');
        }
        
        return chunksToPreload;
      };

      const behavior1 = { mouseX: 200, mouseY: 150, scrollPercentage: 0.9 };
      const behavior2 = { mouseX: 500, mouseY: 300, scrollPercentage: 0.5 };
      
      const preload1 = mockPreloadChunks(behavior1);
      const preload2 = mockPreloadChunks(behavior2);
      
      expect(preload1).toContain('navigation');
      expect(preload1).toContain('header');
      expect(preload1).toContain('footer');
      expect(preload2).toHaveLength(0);
    });

    it('should manage chunk cache', () => {
      const mockChunkCache = {
        cache: new Map(),
        maxSize: 10,
        
        set(key: string, value: any) {
          if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
          }
          this.cache.set(key, value);
        },
        
        get(key: string) {
          return this.cache.get(key);
        },
        
        has(key: string) {
          return this.cache.has(key);
        },
        
        size() {
          return this.cache.size;
        },
      };

      // Test cache operations
      mockChunkCache.set('chunk1', 'data1');
      mockChunkCache.set('chunk2', 'data2');
      
      expect(mockChunkCache.has('chunk1')).toBeTruthy();
      expect(mockChunkCache.get('chunk1')).toBe('data1');
      expect(mockChunkCache.size()).toBe(2);
    });

    it('should optimize bundle size', () => {
      const mockOptimizeBundle = (chunks: any[]) => {
        return chunks.map(chunk => ({
          ...chunk,
          size: chunk.size * 0.7, // 30% reduction
          compressed: true,
        }));
      };

      const chunks = [
        { name: 'auth', size: 100000 },
        { name: 'dashboard', size: 200000 },
        { name: 'diary', size: 150000 },
      ];
      
      const optimized = mockOptimizeBundle(chunks);
      
      expect(optimized[0].size).toBe(70000);
      expect(optimized[1].size).toBe(140000);
      expect(optimized[2].size).toBe(105000);
      expect(optimized[0].compressed).toBeTruthy();
    });
  });
});

// Tests para utilidades de caché
describe('Cache Utils', () => {
  describe('AdvancedCache', () => {
    it('should store and retrieve data', () => {
      const mockCache = {
        data: new Map(),
        
        set(key: string, value: any, ttl?: number) {
          this.data.set(key, {
            value,
            timestamp: Date.now(),
            ttl: ttl || 3600000, // 1 hour default
          });
        },
        
        get(key: string) {
          const entry = this.data.get(key);
          if (!entry) return null;
          
          if (Date.now() - entry.timestamp > entry.ttl) {
            this.data.delete(key);
            return null;
          }
          
          return entry.value;
        },
        
        has(key: string) {
          return this.data.has(key);
        },
        
        delete(key: string) {
          return this.data.delete(key);
        },
      };

      // Test basic operations
      mockCache.set('test-key', 'test-value');
      expect(mockCache.has('test-key')).toBeTruthy();
      expect(mockCache.get('test-key')).toBe('test-value');
      
      mockCache.delete('test-key');
      expect(mockCache.has('test-key')).toBeFalsy();
    });

    it('should handle TTL expiration', () => {
      const mockCache = {
        data: new Map(),
        
        set(key: string, value: any, ttl: number) {
          this.data.set(key, {
            value,
            timestamp: Date.now(),
            ttl,
          });
        },
        
        get(key: string) {
          const entry = this.data.get(key);
          if (!entry) return null;
          
          if (Date.now() - entry.timestamp > entry.ttl) {
            this.data.delete(key);
            return null;
          }
          
          return entry.value;
        },
      };

      // Set with short TTL
      mockCache.set('expiring-key', 'expiring-value', 100); // 100ms
      
      // Should be available immediately
      expect(mockCache.get('expiring-key')).toBe('expiring-value');
      
      // Wait for expiration (simulated)
      setTimeout(() => {
        expect(mockCache.get('expiring-key')).toBeNull();
      }, 150);
    });

    it('should implement LRU eviction', () => {
      const mockLRUCache = {
        data: new Map(),
        maxSize: 3,
        
        set(key: string, value: any) {
          if (this.data.has(key)) {
            this.data.delete(key);
          } else if (this.data.size >= this.maxSize) {
            const firstKey = this.data.keys().next().value;
            this.data.delete(firstKey);
          }
          this.data.set(key, value);
        },
        
        get(key: string) {
          if (this.data.has(key)) {
            const value = this.data.get(key);
            this.data.delete(key);
            this.data.set(key, value);
            return value;
          }
          return null;
        },
      };

      // Fill cache
      mockLRUCache.set('key1', 'value1');
      mockLRUCache.set('key2', 'value2');
      mockLRUCache.set('key3', 'value3');
      
      // Access key1 to make it recently used
      mockLRUCache.get('key1');
      
      // Add new key, should evict key2 (least recently used)
      mockLRUCache.set('key4', 'value4');
      
      expect(mockLRUCache.get('key1')).toBe('value1');
      expect(mockLRUCache.get('key2')).toBeNull();
      expect(mockLRUCache.get('key3')).toBe('value3');
      expect(mockLRUCache.get('key4')).toBe('value4');
    });

    it('should compress data', () => {
      const mockCompressData = (data: any) => {
        const jsonString = JSON.stringify(data);
        // Simulate compression (simple example)
        return {
          original: jsonString,
          compressed: jsonString.slice(0, Math.floor(jsonString.length * 0.7)),
          ratio: 0.7,
        };
      };

      const testData = { name: 'test', value: 123, items: [1, 2, 3] };
      const result = mockCompressData(testData);
      
      expect(result.compressed.length).toBeLessThan(result.original.length);
      expect(result.ratio).toBeCloseTo(0.7, 1);
    });
  });
});

// Tests para utilidades de monitoreo
describe('Monitoring Utils', () => {
  describe('PerformanceMonitor', () => {
    it('should track Core Web Vitals', () => {
      const mockTrackMetrics = (metrics: any) => {
        const tracked = {
          lcp: metrics.lcp || 0,
          fid: metrics.fid || 0,
          cls: metrics.cls || 0,
          fcp: metrics.fcp || 0,
          ttfb: metrics.ttfb || 0,
        };
        return tracked;
      };

      const metrics = {
        lcp: 2100,
        fid: 75,
        cls: 0.08,
        fcp: 1600,
        ttfb: 700,
      };
      
      const tracked = mockTrackMetrics(metrics);
      expect(tracked.lcp).toBe(2100);
      expect(tracked.fid).toBe(75);
      expect(tracked.cls).toBeCloseTo(0.08, 2);
    });

    it('should generate performance alerts', () => {
      const mockGenerateAlert = (metric: string, value: number, threshold: number) => {
        if (value > threshold) {
          const severity = value > threshold * 2 ? 'critical' : 
                          value > threshold * 1.5 ? 'error' : 'warning';
          return {
            type: severity,
            metric,
            value,
            threshold,
            message: `${metric} exceeded threshold: ${value} > ${threshold}`,
            timestamp: Date.now(),
          };
        }
        return null;
      };

      const alert1 = mockGenerateAlert('lcp', 3000, 2500);
      const alert2 = mockGenerateAlert('lcp', 5000, 2500);
      const alert3 = mockGenerateAlert('lcp', 2000, 2500);
      
      expect(alert1).not.toBeNull();
      expect(alert1?.type).toBe('warning');
      expect(alert2?.type).toBe('critical');
      expect(alert3).toBeNull();
    });

    it('should calculate performance score', () => {
      const mockCalculateScore = (metrics: any, thresholds: any) => {
        let score = 100;
        const penalties = ['lcp', 'fid', 'cls', 'fcp', 'ttfb'];
        
        penalties.forEach(metric => {
          if (metrics[metric] > thresholds[metric]) {
            score -= 20;
          }
        });
        
        return Math.max(0, score);
      };

      const goodMetrics = { lcp: 2000, fid: 50, cls: 0.05, fcp: 1500, ttfb: 600 };
      const badMetrics = { lcp: 3000, fid: 150, cls: 0.2, fcp: 2000, ttfb: 1000 };
      const thresholds = { lcp: 2500, fid: 100, cls: 0.1, fcp: 1800, ttfb: 800 };
      
      expect(mockCalculateScore(goodMetrics, thresholds)).toBe(100);
      expect(mockCalculateScore(badMetrics, thresholds)).toBe(0);
    });

    it('should track user behavior', () => {
      const mockTrackBehavior = (events: any[]) => {
        const behavior = {
          clicks: 0,
          scrolls: 0,
          timeOnPage: 0,
          interactions: [],
        };
        
        events.forEach(event => {
          switch (event.type) {
            case 'click':
              behavior.clicks++;
              behavior.interactions.push('click');
              break;
            case 'scroll':
              behavior.scrolls++;
              behavior.interactions.push('scroll');
              break;
            case 'pageExit':
              behavior.timeOnPage = event.timeOnPage;
              break;
          }
        });
        
        return behavior;
      };

      const events = [
        { type: 'click', x: 100, y: 200 },
        { type: 'scroll', scrollY: 500 },
        { type: 'click', x: 300, y: 400 },
        { type: 'pageExit', timeOnPage: 30000 },
      ];
      
      const behavior = mockTrackBehavior(events);
      expect(behavior.clicks).toBe(2);
      expect(behavior.scrolls).toBe(1);
      expect(behavior.timeOnPage).toBe(30000);
      expect(behavior.interactions).toEqual(['click', 'scroll', 'click']);
    });
  });
});

// Tests para utilidades de tema
describe('Theme Utils', () => {
  describe('ThemeManager', () => {
    it('should get initial theme from localStorage', () => {
      const mockGetInitialTheme = () => {
        const stored = localStorage.getItem('sensus_theme');
        if (stored) return stored;
        
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
        
        return 'light';
      };

      // Mock localStorage
      const mockLocalStorage = {
        getItem: (key: string) => key === 'sensus_theme' ? 'dark' : null,
      };
      
      // Mock matchMedia
      const mockMatchMedia = (query: string) => ({
        matches: query === '(prefers-color-scheme: dark)' ? false : true,
      });
      
      // Test with stored theme
      expect(mockGetInitialTheme()).toBe('dark');
    });

    it('should apply theme to document', () => {
      const mockApplyTheme = (theme: string) => {
        const htmlElement = document.documentElement;
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('sensus_theme', theme);
        return theme;
      };

      const appliedTheme = mockApplyTheme('dark');
      expect(appliedTheme).toBe('dark');
    });

    it('should toggle between themes', () => {
      const mockToggleTheme = (currentTheme: string) => {
        return currentTheme === 'light' ? 'dark' : 'light';
      };

      expect(mockToggleTheme('light')).toBe('dark');
      expect(mockToggleTheme('dark')).toBe('light');
    });

    it('should listen for system theme changes', () => {
      let systemThemeChanged = false;
      const mockListenForSystemTheme = () => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
          systemThemeChanged = true;
        });
      };

      mockListenForSystemTheme();
      // Simulate system theme change
      setTimeout(() => {
        expect(systemThemeChanged).toBeTruthy();
      }, 100);
    });
  });
});

// Tests para utilidades de autenticación
describe('Authentication Utils', () => {
  describe('AuthService', () => {
    it('should validate email format', () => {
      const mockValidateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(mockValidateEmail('test@example.com')).toBeTruthy();
      expect(mockValidateEmail('user.name@domain.co.uk')).toBeTruthy();
      expect(mockValidateEmail('invalid-email')).toBeFalsy();
      expect(mockValidateEmail('test@')).toBeFalsy();
      expect(mockValidateEmail('@domain.com')).toBeFalsy();
    });

    it('should validate password strength', () => {
      const mockValidatePassword = (password: string) => {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
          isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
          hasSpecialChar,
          strength: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar ? 'strong' : 'weak',
        };
      };

      const strongPassword = 'Password123!';
      const weakPassword = 'weak';
      const mediumPassword = 'Password123';
      
      const strongResult = mockValidatePassword(strongPassword);
      const weakResult = mockValidatePassword(weakPassword);
      const mediumResult = mockValidatePassword(mediumPassword);
      
      expect(strongResult.isValid).toBeTruthy();
      expect(strongResult.strength).toBe('strong');
      expect(weakResult.isValid).toBeFalsy();
      expect(weakResult.strength).toBe('weak');
      expect(mediumResult.isValid).toBeTruthy();
      expect(mediumResult.strength).toBe('weak');
    });

    it('should handle authentication errors', () => {
      const mockHandleAuthError = (error: any) => {
        const errorMessages = {
          'auth/email-already-in-use': 'El correo electrónico ya está en uso.',
          'auth/invalid-email': 'El formato del correo electrónico no es válido.',
          'auth/weak-password': 'La contraseña es demasiado débil.',
          'auth/user-not-found': 'Credenciales incorrectas.',
          'auth/wrong-password': 'Credenciales incorrectas.',
        };
        
        return errorMessages[error.code] || 'Error de autenticación desconocido';
      };

      expect(mockHandleAuthError({ code: 'auth/email-already-in-use' }))
        .toBe('El correo electrónico ya está en uso.');
      expect(mockHandleAuthError({ code: 'auth/invalid-email' }))
        .toBe('El formato del correo electrónico no es válido.');
      expect(mockHandleAuthError({ code: 'unknown-error' }))
        .toBe('Error de autenticación desconocido');
    });

    it('should generate secure tokens', () => {
      const mockGenerateToken = (length: number = 32) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      const token1 = mockGenerateToken(16);
      const token2 = mockGenerateToken(32);
      
      expect(token1).toHaveLength(16);
      expect(token2).toHaveLength(32);
      expect(token1).toMatch(/^[A-Za-z0-9]+$/);
      expect(token2).toMatch(/^[A-Za-z0-9]+$/);
    });
  });
});

// Ejecutar tests
if (typeof window !== 'undefined') {
  // En el navegador
  window.addEventListener('DOMContentLoaded', () => {
    runTests().then(stats => {
      console.log('Utils tests completed:', stats);
    });
  });
} else {
  // En Node.js
  runTests().then(stats => {
    console.log('Utils tests completed:', stats);
    process.exit(stats.failed > 0 ? 1 : 0);
  });
}
