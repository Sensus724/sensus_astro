/**
 * Sensus Accessibility Utilities
 * Herramientas para mejorar la accesibilidad
 */

export interface AccessibilityConfig {
  enableKeyboardNavigation: boolean
  enableScreenReader: boolean
  enableHighContrast: boolean
  enableReducedMotion: boolean
  enableFocusIndicators: boolean
  enableSkipLinks: boolean
  enableARIALabels: boolean
}

export class AccessibilityManager {
  private config: AccessibilityConfig
  private focusableElements: string[]
  private currentFocusIndex: number
  private isKeyboardNavigation: boolean

  constructor() {
    this.config = {
      enableKeyboardNavigation: true,
      enableScreenReader: true,
      enableHighContrast: false,
      enableReducedMotion: false,
      enableFocusIndicators: true,
      enableSkipLinks: true,
      enableARIALabels: true
    }

    this.focusableElements = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ]

    this.currentFocusIndex = 0
    this.isKeyboardNavigation = false

    this.init()
  }

  /**
   * Inicializar gestor de accesibilidad
   */
  init() {
    console.log('♿ Inicializando gestor de accesibilidad...')
    
    this.setupKeyboardNavigation()
    this.setupScreenReaderSupport()
    this.setupFocusManagement()
    this.setupARIALabels()
    this.setupSkipLinks()
    this.setupHighContrast()
    this.setupReducedMotion()
    
    console.log('✅ Gestor de accesibilidad inicializado')
  }

  /**
   * Configurar navegación por teclado
   */
  setupKeyboardNavigation() {
    if (!this.config.enableKeyboardNavigation) return

    document.addEventListener('keydown', (event) => {
      this.handleKeyboardNavigation(event)
    })

    // Detectar navegación por teclado
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        this.isKeyboardNavigation = true
        document.body.classList.add('keyboard-navigation')
      }
    })

    document.addEventListener('mousedown', () => {
      this.isKeyboardNavigation = false
      document.body.classList.remove('keyboard-navigation')
    })
  }

  /**
   * Manejar navegación por teclado
   */
  handleKeyboardNavigation(event: KeyboardEvent) {
    const { key, ctrlKey, altKey, shiftKey } = event

    // Navegación con Tab
    if (key === 'Tab') {
      event.preventDefault()
      this.navigateFocus(shiftKey ? -1 : 1)
      return
    }

    // Atajos de teclado
    if (ctrlKey || altKey) {
      this.handleKeyboardShortcuts(event)
      return
    }

    // Navegación con flechas
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault()
      this.navigateWithArrows(key)
    }

    // Escape para cerrar modales
    if (key === 'Escape') {
      this.handleEscapeKey()
    }

    // Enter y Space para activar elementos
    if (key === 'Enter' || key === ' ') {
      this.handleActivation(event)
    }
  }

  /**
   * Navegar foco
   */
  navigateFocus(direction: number) {
    const focusableElements = this.getFocusableElements()
    
    if (focusableElements.length === 0) return

    this.currentFocusIndex += direction

    if (this.currentFocusIndex < 0) {
      this.currentFocusIndex = focusableElements.length - 1
    } else if (this.currentFocusIndex >= focusableElements.length) {
      this.currentFocusIndex = 0
    }

    const targetElement = focusableElements[this.currentFocusIndex]
    targetElement.focus()
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  /**
   * Obtener elementos enfocables
   */
  getFocusableElements(): HTMLElement[] {
    const elements: HTMLElement[] = []
    
    this.focusableElements.forEach(selector => {
      const found = document.querySelectorAll(selector)
      found.forEach(element => {
        if (element instanceof HTMLElement && this.isElementVisible(element)) {
          elements.push(element)
        }
      })
    })

    return elements
  }

  /**
   * Verificar si elemento es visible
   */
  isElementVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element)
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null
  }

  /**
   * Navegar con flechas
   */
  navigateWithArrows(direction: string) {
    const focusableElements = this.getFocusableElements()
    const currentElement = document.activeElement as HTMLElement
    
    if (!currentElement || !focusableElements.includes(currentElement)) {
      return
    }

    const currentIndex = focusableElements.indexOf(currentElement)
    let targetIndex = currentIndex

    switch (direction) {
      case 'ArrowUp':
        targetIndex = Math.max(0, currentIndex - 1)
        break
      case 'ArrowDown':
        targetIndex = Math.min(focusableElements.length - 1, currentIndex + 1)
        break
      case 'ArrowLeft':
        targetIndex = Math.max(0, currentIndex - 1)
        break
      case 'ArrowRight':
        targetIndex = Math.min(focusableElements.length - 1, currentIndex + 1)
        break
    }

    if (targetIndex !== currentIndex) {
      focusableElements[targetIndex].focus()
    }
  }

  /**
   * Manejar atajos de teclado
   */
  handleKeyboardShortcuts(event: KeyboardEvent) {
    const { key, ctrlKey, altKey } = event

    // Ctrl + T: Cambiar tema
    if (ctrlKey && key === 't') {
      event.preventDefault()
      this.toggleTheme()
    }

    // Alt + M: Abrir menú
    if (altKey && key === 'm') {
      event.preventDefault()
      this.openMenu()
    }

    // Alt + S: Ir a búsqueda
    if (altKey && key === 's') {
      event.preventDefault()
      this.focusSearch()
    }

    // Alt + H: Ir a inicio
    if (altKey && key === 'h') {
      event.preventDefault()
      this.goToHome()
    }
  }

  /**
   * Manejar tecla Escape
   */
  handleEscapeKey() {
    // Cerrar modales abiertos
    const modals = document.querySelectorAll('.modal.active, .overlay.active')
    modals.forEach(modal => {
      modal.classList.remove('active')
    })

    // Cerrar menús desplegables
    const dropdowns = document.querySelectorAll('.dropdown.active')
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('active')
    })
  }

  /**
   * Manejar activación de elementos
   */
  handleActivation(event: KeyboardEvent) {
    const target = event.target as HTMLElement

    if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
      target.click()
    } else if (target.tagName === 'A') {
      target.click()
    }
  }

  /**
   * Configurar soporte para lectores de pantalla
   */
  setupScreenReaderSupport() {
    if (!this.config.enableScreenReader) return

    // Anunciar cambios dinámicos
    this.setupLiveRegions()
    
    // Mejorar navegación por landmarks
    this.setupLandmarks()
    
    // Configurar roles ARIA
    this.setupARIARoles()
  }

  /**
   * Configurar regiones en vivo
   */
  setupLiveRegions() {
    // Crear región para anuncios
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.id = 'live-region'
    document.body.appendChild(liveRegion)
  }

  /**
   * Anunciar mensaje a lectores de pantalla
   */
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const liveRegion = document.getElementById('live-region')
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.textContent = message
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 1000)
    }
  }

  /**
   * Configurar landmarks
   */
  setupLandmarks() {
    // Asegurar que haya un main
    if (!document.querySelector('main')) {
      const main = document.createElement('main')
      document.body.appendChild(main)
    }

    // Asegurar que haya un header
    if (!document.querySelector('header')) {
      const header = document.createElement('header')
      document.body.insertBefore(header, document.body.firstChild)
    }

    // Asegurar que haya un footer
    if (!document.querySelector('footer')) {
      const footer = document.createElement('footer')
      document.body.appendChild(footer)
    }
  }

  /**
   * Configurar roles ARIA
   */
  setupARIARoles() {
    // Configurar roles para elementos interactivos
    const buttons = document.querySelectorAll('button, [role="button"]')
    buttons.forEach(button => {
      if (!button.getAttribute('aria-label') && !button.textContent?.trim()) {
        button.setAttribute('aria-label', 'Botón')
      }
    })

    // Configurar roles para formularios
    const forms = document.querySelectorAll('form')
    forms.forEach(form => {
      if (!form.getAttribute('aria-label') && !form.getAttribute('aria-labelledby')) {
        const legend = form.querySelector('legend')
        if (legend) {
          form.setAttribute('aria-labelledby', legend.id || 'form-legend')
        }
      }
    })
  }

  /**
   * Configurar gestión de foco
   */
  setupFocusManagement() {
    if (!this.config.enableFocusIndicators) return

    // Agregar estilos de foco
    const style = document.createElement('style')
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid var(--color-primary, #2563eb) !important;
        outline-offset: 2px !important;
      }
      
      .keyboard-navigation button:focus,
      .keyboard-navigation a:focus,
      .keyboard-navigation input:focus,
      .keyboard-navigation select:focus,
      .keyboard-navigation textarea:focus {
        box-shadow: 0 0 0 3px rgba(37, 98, 235, 0.3) !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Configurar etiquetas ARIA
   */
  setupARIALabels() {
    if (!this.config.enableARIALabels) return

    // Agregar etiquetas a imágenes sin alt
    const images = document.querySelectorAll('img:not([alt])')
    images.forEach(img => {
      img.setAttribute('alt', 'Imagen')
    })

    // Agregar etiquetas a enlaces sin texto
    const links = document.querySelectorAll('a:not([aria-label])')
    links.forEach(link => {
      if (!link.textContent?.trim() && !link.getAttribute('aria-label')) {
        link.setAttribute('aria-label', 'Enlace')
      }
    })
  }

  /**
   * Configurar enlaces de salto
   */
  setupSkipLinks() {
    if (!this.config.enableSkipLinks) return

    const skipLinks = document.createElement('div')
    skipLinks.className = 'skip-links'
    skipLinks.innerHTML = `
      <a href="#main" class="skip-link">Saltar al contenido principal</a>
      <a href="#navigation" class="skip-link">Saltar a la navegación</a>
      <a href="#search" class="skip-link">Saltar a la búsqueda</a>
    `
    document.body.insertBefore(skipLinks, document.body.firstChild)

    // Estilos para enlaces de salto
    const style = document.createElement('style')
    style.textContent = `
      .skip-links {
        position: absolute;
        top: -100px;
        left: 0;
        z-index: 1000;
      }
      
      .skip-link {
        position: absolute;
        top: 0;
        left: 0;
        background: var(--color-primary, #2563eb);
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 0 0 4px 0;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      }
      
      .skip-link:focus {
        transform: translateY(0);
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Configurar alto contraste
   */
  setupHighContrast() {
    // Detectar preferencia de alto contraste
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.enableHighContrast()
    }

    // Escuchar cambios en preferencia
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      if (e.matches) {
        this.enableHighContrast()
      } else {
        this.disableHighContrast()
      }
    })
  }

  /**
   * Habilitar alto contraste
   */
  enableHighContrast() {
    document.body.classList.add('high-contrast')
    this.announceToScreenReader('Modo de alto contraste activado')
  }

  /**
   * Deshabilitar alto contraste
   */
  disableHighContrast() {
    document.body.classList.remove('high-contrast')
  }

  /**
   * Configurar movimiento reducido
   */
  setupReducedMotion() {
    // Detectar preferencia de movimiento reducido
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.enableReducedMotion()
    }

    // Escuchar cambios en preferencia
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches) {
        this.enableReducedMotion()
      } else {
        this.disableReducedMotion()
      }
    })
  }

  /**
   * Habilitar movimiento reducido
   */
  enableReducedMotion() {
    document.body.classList.add('reduced-motion')
    this.announceToScreenReader('Animaciones reducidas activadas')
  }

  /**
   * Deshabilitar movimiento reducido
   */
  disableReducedMotion() {
    document.body.classList.remove('reduced-motion')
  }

  /**
   * Métodos de utilidad
   */
  toggleTheme() {
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: 'toggle' } }))
  }

  openMenu() {
    const menu = document.querySelector('.menu-toggle')
    if (menu) {
      (menu as HTMLElement).click()
    }
  }

  focusSearch() {
    const search = document.querySelector('input[type="search"], [role="search"] input')
    if (search) {
      (search as HTMLElement).focus()
    }
  }

  goToHome() {
    window.location.href = '/'
  }

  /**
   * Obtener configuración actual
   */
  getConfig(): AccessibilityConfig {
    return { ...this.config }
  }

  /**
   * Actualizar configuración
   */
  updateConfig(newConfig: Partial<AccessibilityConfig>) {
    this.config = { ...this.config, ...newConfig }
  }
}

// Instancia global
export const accessibilityManager = new AccessibilityManager()

// Funciones de utilidad
export const announceToScreenReader = (message: string, priority?: 'polite' | 'assertive') => 
  accessibilityManager.announceToScreenReader(message, priority)

export const enableHighContrast = () => accessibilityManager.enableHighContrast()
export const disableHighContrast = () => accessibilityManager.disableHighContrast()
export const enableReducedMotion = () => accessibilityManager.enableReducedMotion()
export const disableReducedMotion = () => accessibilityManager.disableReducedMotion()
