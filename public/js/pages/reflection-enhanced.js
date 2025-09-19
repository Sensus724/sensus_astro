/**
 * Reflexión Personal Mejorada - Sensus
 * Funcionalidad mejorada para la sección de reflexión personal del diario
 */

class ReflectionEnhanced {
    constructor() {
        this.currentMood = null;
        this.selectedTags = [];
        this.availableTags = [
            'gratitud', 'ansiedad', 'calma', 'estrés', 'felicidad', 'tristeza',
            'ejercicio', 'meditación', 'respiración', 'relajación', 'mindfulness',
            'trabajo', 'familia', 'amigos', 'salud', 'crecimiento', 'aprendizaje',
            'reflexión', 'objetivos', 'logros', 'desafíos', 'superación'
        ];
        this.writingPrompts = {
            feelings: "¿Cómo me siento ahora? Describe tus emociones actuales y qué las está causando.",
            thoughts: "¿Qué pensamientos tengo? Comparte los pensamientos que están pasando por tu mente.",
            gratitude: "¿Por qué me siento agradecido? Menciona las cosas por las que te sientes agradecido hoy.",
            insights: "¿Qué aprendí hoy? Reflexiona sobre las lecciones o aprendizajes del día."
        };
        
        this.init();
    }

    init() {
        this.setupMoodSelector();
        this.setupTextarea();
        this.setupTagsSystem();
        this.setupWritingPrompts();
        this.setupActions();
        this.setupAutoSave();
    }

    setupMoodSelector() {
        const moodButtons = document.querySelectorAll('.mood-btn-enhanced');
        
        moodButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectMood(button);
            });

            // Efectos de hover mejorados
            button.addEventListener('mouseenter', () => {
                if (!button.classList.contains('selected')) {
                    button.style.transform = 'translateY(-4px) scale(1.02)';
                }
            });

            button.addEventListener('mouseleave', () => {
                if (!button.classList.contains('selected')) {
                    button.style.transform = 'translateY(0) scale(1)';
                }
            });
        });
    }

    selectMood(button) {
        // Remover selección anterior
        document.querySelectorAll('.mood-btn-enhanced').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Seleccionar nuevo estado de ánimo
        button.classList.add('selected');
        this.currentMood = button.dataset.mood;

        // Efecto visual de selección
        button.style.transform = 'translateY(-4px) scale(1.02)';
        
        // Actualizar validación del formulario
        this.validateForm();
        
        // Mostrar notificación sutil
        this.showMoodNotification(button.dataset.mood);
    }

    showMoodNotification(mood) {
        const moodNames = {
            calm: 'Tranquilo',
            relaxed: 'Relajado', 
            neutral: 'Neutral',
            anxious: 'Ansioso',
            overwhelmed: 'Abrumado'
        };

        this.showNotification(`Estado de ánimo seleccionado: ${moodNames[mood]}`, 'success');
    }

    setupTextarea() {
        const textarea = document.getElementById('reflection-text');
        const charCount = document.getElementById('char-count');
        
        if (!textarea || !charCount) return;

        // Contador de caracteres en tiempo real
        textarea.addEventListener('input', () => {
            const count = textarea.value.length;
            charCount.textContent = count;
            
            // Cambiar color según la cantidad de texto
            if (count < 50) {
                charCount.style.color = '#9ca3af';
            } else if (count < 200) {
                charCount.style.color = '#f59e0b';
            } else {
                charCount.style.color = '#10b981';
            }

            this.validateForm();
        });

        // Auto-resize del textarea
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        });

        // Efectos de focus mejorados
        textarea.addEventListener('focus', () => {
            textarea.parentElement.style.transform = 'translateY(-2px)';
        });

        textarea.addEventListener('blur', () => {
            textarea.parentElement.style.transform = 'translateY(0)';
        });
    }

    setupTagsSystem() {
        const tagsInput = document.getElementById('entry-tags');
        const suggestionsContainer = document.getElementById('tag-suggestions');
        const selectedTagsContainer = document.getElementById('selected-tags');

        if (!tagsInput || !suggestionsContainer || !selectedTagsContainer) return;

        // Mostrar sugerencias mientras se escribe
        tagsInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length > 0) {
                this.showTagSuggestions(query, suggestionsContainer);
            } else {
                this.hideTagSuggestions(suggestionsContainer);
            }
        });

        // Añadir tag al presionar Enter
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag(e.target.value.trim());
                e.target.value = '';
                this.hideTagSuggestions(suggestionsContainer);
            }
        });

        // Ocultar sugerencias al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!tagsInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                this.hideTagSuggestions(suggestionsContainer);
            }
        });

        // Cargar tags existentes
        this.loadExistingTags();
    }

    showTagSuggestions(query, container) {
        const suggestions = this.availableTags
            .filter(tag => tag.toLowerCase().includes(query))
            .slice(0, 5);

        if (suggestions.length === 0) {
            this.hideTagSuggestions(container);
            return;
        }

        container.innerHTML = suggestions.map(tag => `
            <div class="tag-suggestion" data-tag="${tag}">
                <i class="fas fa-tag"></i>
                <span>${tag}</span>
                <span class="tag-count">${this.getTagCount(tag)}</span>
            </div>
        `).join('');

        container.style.display = 'block';

        // Añadir event listeners a las sugerencias
        container.querySelectorAll('.tag-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                this.addTag(suggestion.dataset.tag);
                document.getElementById('entry-tags').value = '';
                this.hideTagSuggestions(container);
            });
        });
    }

    hideTagSuggestions(container) {
        container.style.display = 'none';
    }

    addTag(tagText) {
        if (!tagText || this.selectedTags.includes(tagText)) return;

        this.selectedTags.push(tagText);
        this.renderSelectedTags();
        this.validateForm();
        
        // Efecto visual
        this.showNotification(`Etiqueta añadida: ${tagText}`, 'info');
    }

    removeTag(tagText) {
        this.selectedTags = this.selectedTags.filter(tag => tag !== tagText);
        this.renderSelectedTags();
        this.validateForm();
    }

    renderSelectedTags() {
        const container = document.getElementById('selected-tags');
        if (!container) return;

        container.innerHTML = this.selectedTags.map(tag => `
            <div class="tag-item">
                <span>${tag}</span>
                <button class="tag-remove" onclick="reflectionEnhanced.removeTag('${tag}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    getTagCount(tag) {
        // Simular conteo de tags (en una implementación real, esto vendría de la base de datos)
        return Math.floor(Math.random() * 10) + 1;
    }

    setupWritingPrompts() {
        const promptButtons = document.querySelectorAll('.prompt-btn-enhanced');
        
        promptButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.insertPrompt(button.dataset.prompt);
            });
        });
    }

    insertPrompt(promptType) {
        const textarea = document.getElementById('reflection-text');
        if (!textarea) return;

        const prompt = this.writingPrompts[promptType];
        if (!prompt) return;

        const currentText = textarea.value;
        const newText = currentText ? `${currentText}\n\n${prompt}` : prompt;
        
        textarea.value = newText;
        textarea.focus();
        
        // Trigger input event para actualizar contador
        textarea.dispatchEvent(new Event('input'));
        
        // Efecto visual
        this.showNotification('Prompt añadido a tu reflexión', 'success');
    }

    setupActions() {
        const clearBtn = document.getElementById('clear-reflection');
        const saveBtn = document.getElementById('save-reflection');

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearReflection();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveReflection();
            });
        }
    }

    clearReflection() {
        if (confirm('¿Estás seguro de que quieres limpiar toda la reflexión? Esta acción no se puede deshacer.')) {
            // Limpiar textarea
            const textarea = document.getElementById('reflection-text');
            if (textarea) {
                textarea.value = '';
                textarea.dispatchEvent(new Event('input'));
            }

            // Limpiar mood selection
            document.querySelectorAll('.mood-btn-enhanced').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.currentMood = null;

            // Limpiar tags
            this.selectedTags = [];
            this.renderSelectedTags();

            // Resetear validación
            this.validateForm();

            this.showNotification('Reflexión limpiada', 'info');
        }
    }

    async saveReflection() {
        const textarea = document.getElementById('reflection-text');
        if (!textarea) return;

        const reflectionData = {
            text: textarea.value.trim(),
            mood: this.currentMood,
            tags: this.selectedTags,
            timestamp: new Date().toISOString(),
            wordCount: textarea.value.trim().split(/\s+/).filter(word => word.length > 0).length
        };

        if (!this.validateReflectionData(reflectionData)) {
            return;
        }

        try {
            // Mostrar loading
            this.setSaveButtonLoading(true);

            // Simular guardado (en una implementación real, esto sería una llamada a la API)
            await this.simulateSave(reflectionData);

            // Guardar en localStorage como respaldo
            this.saveToLocalStorage(reflectionData);

            // Limpiar formulario después de guardar
            this.clearReflection();

            this.showNotification('¡Reflexión guardada exitosamente!', 'success');

        } catch (error) {
            console.error('Error al guardar reflexión:', error);
            this.showNotification('Error al guardar la reflexión. Inténtalo de nuevo.', 'error');
        } finally {
            this.setSaveButtonLoading(false);
        }
    }

    validateReflectionData(data) {
        if (!data.text || data.text.length < 10) {
            this.showNotification('Por favor escribe al menos 10 caracteres en tu reflexión.', 'warning');
            return false;
        }

        if (!data.mood) {
            this.showNotification('Por favor selecciona tu estado de ánimo actual.', 'warning');
            return false;
        }

        return true;
    }

    async simulateSave(data) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simular éxito/error aleatorio (solo para demo)
        if (Math.random() < 0.1) {
            throw new Error('Error de red simulado');
        }
    }

    saveToLocalStorage(data) {
        try {
            const existingReflections = JSON.parse(localStorage.getItem('sensus_reflections') || '[]');
            existingReflections.push(data);
            localStorage.setItem('sensus_reflections', JSON.stringify(existingReflections));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    }

    setSaveButtonLoading(loading) {
        const saveBtn = document.getElementById('save-reflection');
        if (!saveBtn) return;

        if (loading) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        } else {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Reflexión';
        }
    }

    validateForm() {
        const textarea = document.getElementById('reflection-text');
        const saveBtn = document.getElementById('save-reflection');
        
        if (!textarea || !saveBtn) return;

        const hasText = textarea.value.trim().length >= 10;
        const hasMood = this.currentMood !== null;

        saveBtn.disabled = !(hasText && hasMood);
    }

    setupAutoSave() {
        const textarea = document.getElementById('reflection-text');
        if (!textarea) return;

        let autoSaveTimeout;
        
        textarea.addEventListener('input', () => {
            clearTimeout(autoSaveTimeout);
            
            // Auto-guardar borrador cada 30 segundos
            autoSaveTimeout = setTimeout(() => {
                this.autoSaveDraft();
            }, 30000);
        });
    }

    autoSaveDraft() {
        const textarea = document.getElementById('reflection-text');
        if (!textarea || textarea.value.trim().length < 10) return;

        const draft = {
            text: textarea.value,
            mood: this.currentMood,
            tags: this.selectedTags,
            timestamp: new Date().toISOString()
        };

        try {
            localStorage.setItem('sensus_reflection_draft', JSON.stringify(draft));
            this.showNotification('Borrador guardado automáticamente', 'info', 2000);
        } catch (error) {
            console.error('Error al guardar borrador:', error);
        }
    }

    loadExistingTags() {
        try {
            const reflections = JSON.parse(localStorage.getItem('sensus_reflections') || '[]');
            const allTags = reflections.flatMap(reflection => reflection.tags || []);
            
            // Actualizar lista de tags disponibles con los más usados
            const tagCounts = {};
            allTags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
            
            const popularTags = Object.keys(tagCounts)
                .sort((a, b) => tagCounts[b] - tagCounts[a])
                .slice(0, 10);
            
            this.availableTags = [...new Set([...popularTags, ...this.availableTags])];
        } catch (error) {
            console.error('Error al cargar tags existentes:', error);
        }
    }

    showNotification(message, type = 'info', duration = 4000) {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Añadir estilos si no existen
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 0.75rem;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                    z-index: 10000;
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all 0.3s ease;
                    max-width: 400px;
                }
                .notification.show {
                    transform: translateX(0);
                    opacity: 1;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                }
                .notification-success {
                    border-left: 4px solid #10b981;
                }
                .notification-error {
                    border-left: 4px solid #ef4444;
                }
                .notification-warning {
                    border-left: 4px solid #f59e0b;
                }
                .notification-info {
                    border-left: 4px solid #3b82f6;
                }
                .notification-content i {
                    font-size: 1.25rem;
                }
                .notification-success .notification-content i {
                    color: #10b981;
                }
                .notification-error .notification-content i {
                    color: #ef4444;
                }
                .notification-warning .notification-content i {
                    color: #f59e0b;
                }
                .notification-info .notification-content i {
                    color: #3b82f6;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Mostrar notificación
        setTimeout(() => notification.classList.add('show'), 100);

        // Ocultar notificación
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.reflectionEnhanced = new ReflectionEnhanced();
});

// Exportar para uso global
window.ReflectionEnhanced = ReflectionEnhanced;
