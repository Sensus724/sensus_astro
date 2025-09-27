/**
 * Utilidades de optimización de imágenes para Sensus
 * Sistema completo de optimización, compresión y entrega de imágenes
 */

export interface ImageOptions {
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  blur?: number;
  sharpen?: number;
  grayscale?: boolean;
  sepia?: boolean;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
}

export interface ResponsiveImageConfig {
  breakpoints: number[];
  sizes: string;
  quality: number;
  formats: string[];
}

export interface ImageMetadata {
  src: string;
  width: number;
  height: number;
  format: string;
  size: number;
  alt: string;
  loading: 'lazy' | 'eager';
  priority: boolean;
}

class ImageOptimizer {
  private config: ResponsiveImageConfig;
  private imageCache: Map<string, ImageMetadata> = new Map();
  private loadingImages: Set<string> = new Set();

  constructor(config: Partial<ResponsiveImageConfig> = {}) {
    this.config = {
      breakpoints: [320, 640, 768, 1024, 1280, 1536, 1920],
      sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
      quality: 80,
      formats: ['avif', 'webp', 'jpeg'],
      ...config,
    };

    this.init();
  }

  private init() {
    // Verificar soporte de formatos modernos
    this.checkFormatSupport();
    
    // Configurar lazy loading
    this.setupLazyLoading();
    
    // Configurar preloading de imágenes críticas
    this.setupCriticalImagePreloading();
  }

  private checkFormatSupport() {
    // Verificar soporte de AVIF
    const avifSupported = this.checkAVIFSupport();
    
    // Verificar soporte de WebP
    const webpSupported = this.checkWebPSupport();
    
    // Actualizar formatos soportados
    if (!avifSupported) {
      this.config.formats = this.config.formats.filter(f => f !== 'avif');
    }
    if (!webpSupported) {
      this.config.formats = this.config.formats.filter(f => f !== 'webp');
    }
  }

  private checkAVIFSupport(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  private checkWebPSupport(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadOptimizedImage(img);
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px',
      });

      // Observar todas las imágenes con data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  private setupCriticalImagePreloading() {
    // Preload imágenes críticas (above the fold)
    const criticalImages = document.querySelectorAll('img[data-priority="true"]');
    criticalImages.forEach(img => {
      this.preloadImage(img as HTMLImageElement);
    });
  }

  // Métodos públicos
  public optimizeImage(src: string, options: ImageOptions = {}): string {
    const {
      width,
      height,
      quality = this.config.quality,
      format = 'auto',
      fit = 'cover',
      position = 'center',
      blur,
      sharpen,
      grayscale,
      sepia,
      brightness,
      contrast,
      saturation,
      hue,
    } = options;

    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    
    if (format !== 'auto') {
      params.set('f', format);
    } else {
      // Usar el mejor formato soportado
      params.set('f', this.config.formats[0]);
    }
    
    params.set('fit', fit);
    params.set('pos', position);
    
    if (blur) params.set('blur', blur.toString());
    if (sharpen) params.set('sharpen', sharpen.toString());
    if (grayscale) params.set('grayscale', 'true');
    if (sepia) params.set('sepia', 'true');
    if (brightness) params.set('brightness', brightness.toString());
    if (contrast) params.set('contrast', contrast.toString());
    if (saturation) params.set('saturation', saturation.toString());
    if (hue) params.set('hue', hue.toString());

    return `${src}?${params.toString()}`;
  }

  public generateResponsiveImages(src: string, options: ImageOptions = {}): {
    srcset: string;
    sizes: string;
    fallback: string;
  } {
    const srcsetParts: string[] = [];
    
    this.config.breakpoints.forEach(width => {
      const optimizedSrc = this.optimizeImage(src, {
        ...options,
        width,
      });
      srcsetParts.push(`${optimizedSrc} ${width}w`);
    });

    return {
      srcset: srcsetParts.join(', '),
      sizes: this.config.sizes,
      fallback: this.optimizeImage(src, {
        ...options,
        width: 800,
        format: 'jpeg',
      }),
    };
  }

  public async loadOptimizedImage(img: HTMLImageElement): Promise<void> {
    const src = img.dataset.src;
    if (!src) return;

    // Evitar cargar la misma imagen múltiples veces
    if (this.loadingImages.has(src)) return;
    this.loadingImages.add(src);

    try {
      // Generar imágenes responsivas
      const responsiveImages = this.generateResponsiveImages(src);
      
      // Configurar imagen
      img.srcset = responsiveImages.srcset;
      img.sizes = responsiveImages.sizes;
      img.src = responsiveImages.fallback;
      
      // Remover atributos de carga diferida
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
      
      // Agregar clase de carga
      img.classList.add('loading');
      
      // Esperar a que la imagen se cargue
      await new Promise((resolve, reject) => {
        img.onload = () => {
          img.classList.remove('loading');
          img.classList.add('loaded');
          resolve(void 0);
        };
        img.onerror = reject;
      });

      // Cachear metadatos
      this.cacheImageMetadata(img);

    } catch (error) {
      console.error('Error loading optimized image:', error);
      img.classList.add('error');
    } finally {
      this.loadingImages.delete(src);
    }
  }

  public async preloadImage(img: HTMLImageElement): Promise<void> {
    const src = img.src || img.dataset.src;
    if (!src) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = this.optimizeImage(src, { quality: 90 });
    
    document.head.appendChild(link);
  }

  public generatePlaceholder(src: string, options: ImageOptions = {}): string {
    const {
      width = 200,
      height = 200,
      blur = 10,
      quality = 20,
    } = options;

    return this.optimizeImage(src, {
      width,
      height,
      blur,
      quality,
      format: 'jpeg',
    });
  }

  public async compressImage(file: File, options: ImageOptions = {}): Promise<Blob> {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Comprimir
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  public getImageMetadata(img: HTMLImageElement): ImageMetadata {
    return {
      src: img.src,
      width: img.naturalWidth,
      height: img.naturalHeight,
      format: this.getImageFormat(img.src),
      size: this.getImageSize(img.src),
      alt: img.alt,
      loading: img.loading as 'lazy' | 'eager',
      priority: img.dataset.priority === 'true',
    };
  }

  public cacheImageMetadata(img: HTMLImageElement): void {
    const metadata = this.getImageMetadata(img);
    this.imageCache.set(img.src, metadata);
  }

  public getCachedMetadata(src: string): ImageMetadata | undefined {
    return this.imageCache.get(src);
  }

  public clearCache(): void {
    this.imageCache.clear();
  }

  public getCacheSize(): number {
    return this.imageCache.size;
  }

  public getCacheStats(): { size: number; entries: ImageMetadata[] } {
    return {
      size: this.imageCache.size,
      entries: Array.from(this.imageCache.values()),
    };
  }

  // Métodos de utilidad
  private getImageFormat(src: string): string {
    const match = src.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  private getImageSize(src: string): number {
    // Esto sería implementado con una llamada al servidor
    // Por ahora retornamos 0
    return 0;
  }

  public async analyzeImage(src: string): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
    colors: string[];
    dominantColor: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          reject(new Error('Failed to analyze image'));
          return;
        }

        // Análisis básico de colores
        const colors = this.extractColors(imageData);
        const dominantColor = this.getDominantColor(imageData);

        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: this.getImageFormat(src),
          size: 0, // Se implementaría con una llamada al servidor
          colors,
          dominantColor,
        });
      };

      img.onerror = () => reject(new Error('Failed to load image for analysis'));
      img.src = src;
    });
  }

  private extractColors(imageData: ImageData): string[] {
    const colors: string[] = [];
    const data = imageData.data;
    
    // Muestrear cada 100 píxeles para performance
    for (let i = 0; i < data.length; i += 400) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      if (a > 0) {
        colors.push(`rgb(${r}, ${g}, ${b})`);
      }
    }
    
    return colors;
  }

  private getDominantColor(imageData: ImageData): string {
    const data = imageData.data;
    const colorCounts: { [key: string]: number } = {};
    
    // Muestrear píxeles para encontrar el color dominante
    for (let i = 0; i < data.length; i += 400) {
      const r = Math.floor(data[i] / 32) * 32;
      const g = Math.floor(data[i + 1] / 32) * 32;
      const b = Math.floor(data[i + 2] / 32) * 32;
      const a = data[i + 3];
      
      if (a > 0) {
        const color = `rgb(${r}, ${g}, ${b})`;
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      }
    }
    
    // Encontrar el color más común
    let dominantColor = 'rgb(0, 0, 0)';
    let maxCount = 0;
    
    Object.entries(colorCounts).forEach(([color, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantColor = color;
      }
    });
    
    return dominantColor;
  }
}

// Instancia singleton
let imageOptimizerInstance: ImageOptimizer | null = null;

export function getImageOptimizer(): ImageOptimizer {
  if (!imageOptimizerInstance) {
    imageOptimizerInstance = new ImageOptimizer();
  }
  return imageOptimizerInstance;
}

// Funciones de conveniencia
export const optimizeImage = (src: string, options?: ImageOptions) => 
  getImageOptimizer().optimizeImage(src, options);
export const generateResponsiveImages = (src: string, options?: ImageOptions) => 
  getImageOptimizer().generateResponsiveImages(src, options);
export const loadOptimizedImage = (img: HTMLImageElement) => 
  getImageOptimizer().loadOptimizedImage(img);
export const preloadImage = (img: HTMLImageElement) => 
  getImageOptimizer().preloadImage(img);
export const compressImage = (file: File, options?: ImageOptions) => 
  getImageOptimizer().compressImage(file, options);
export const analyzeImage = (src: string) => 
  getImageOptimizer().analyzeImage(src);

export default ImageOptimizer;
