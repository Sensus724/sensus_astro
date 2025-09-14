// Sensus - Diario emocional con encriptación AES-256

// Emojis de emociones disponibles
const EMOTION_EMOJIS = [
    { emoji: '😊', label: 'Feliz', value: 'happy' },
    { emoji: '😐', label: 'Neutral', value: 'neutral' },
    { emoji: '😢', label: 'Triste', value: 'sad' },
    { emoji: '😠', label: 'Enojado', value: 'angry' },
    { emoji: '😨', label: 'Ansioso', value: 'anxious' },
    { emoji: '😌', label: 'Tranquilo', value: 'calm' },
    { emoji: '😴', label: 'Cansado', value: 'tired' },
    { emoji: '🤗', label: 'Agradecido', value: 'grateful' }
];

// Función para renderizar el diario
function renderJournal(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let selectedEmotion = null;
    let journalText = '';
    
    container.innerHTML = `
        <div class="journal-container">
            <div class="journal-header">
                <h2>Mi Diario Emocional</h2>
                <p class="journal-subtitle">¿Cómo te sientes hoy? ¿Qué pasó?</p>
            </div>
            
            <div class="emotion-selector">
                <h3>Selecciona tu emoción principal:</h3>
                <div class="emotion-grid">
                    ${EMOTION_EMOJIS.map(emotion => `
                        <button class="emotion-btn" data-emotion="${emotion.value}" data-emoji="${emotion.emoji}">
                            <span class="emotion-emoji">${emotion.emoji}</span>
                            <span class="emotion-label">${emotion.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="journal-textarea-container">
                <textarea 
                    id="journal-text" 
                    class="journal-textarea" 
                    placeholder="Escribe libremente sobre tu día, tus pensamientos, sentimientos... Este texto está encriptado y solo tú puedes leerlo."
                    rows="8"
                ></textarea>
                <div class="character-count">
                    <span id="char-count">0</span> caracteres
                </div>
            </div>
            
            <div class="journal-actions">
                <button class="btn btn-outline" id="clear-journal">Limpiar</button>
                <button class="btn btn-primary" id="save-journal" disabled>Guardar Entrada</button>
            </div>
            
            <div class="privacy-notice">
                <i class="fas fa-shield-alt"></i>
                <span>Tu diario está encriptado con AES-256. Solo tú puedes leerlo.</span>
            </div>
        </div>
    `;
    
    // Agregar event listeners
    const emotionBtns = container.querySelectorAll('.emotion-btn');
    const journalTextarea = container.querySelector('#journal-text');
    const saveBtn = container.querySelector('#save-journal');
    const clearBtn = container.querySelector('#clear-journal');
    const charCount = container.querySelector('#char-count');
    
    // Selección de emoción
    emotionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover selección anterior
            emotionBtns.forEach(b => b.classList.remove('selected'));
            
            // Seleccionar nueva emoción
            btn.classList.add('selected');
            selectedEmotion = {
                emoji: btn.dataset.emoji,
                value: btn.dataset.emotion
            };
            
            updateSaveButton();
        });
    });
    
    // Cambios en el texto
    journalTextarea.addEventListener('input', (e) => {
        journalText = e.target.value;
        charCount.textContent = journalText.length;
        updateSaveButton();
    });
    
    // Botón guardar
    saveBtn.addEventListener('click', async () => {
        if (!selectedEmotion || !journalText.trim()) return;
        
        try {
            await saveJournalEntry(journalText, selectedEmotion);
            
            // Limpiar formulario
            journalTextarea.value = '';
            charCount.textContent = '0';
            emotionBtns.forEach(b => b.classList.remove('selected'));
            selectedEmotion = null;
            journalText = '';
            updateSaveButton();
            
            // Mostrar mensaje de éxito
            showJournalToast('¡Tu diario se guardó! Hoy fuiste valiente 💙', 'success');
            
        } catch (error) {
            console.error('Error guardando entrada del diario:', error);
            showJournalToast('Error guardando entrada del diario', 'error');
        }
    });
    
    // Botón limpiar
    clearBtn.addEventListener('click', () => {
        journalTextarea.value = '';
        charCount.textContent = '0';
        emotionBtns.forEach(b => b.classList.remove('selected'));
        selectedEmotion = null;
        journalText = '';
        updateSaveButton();
    });
    
    function updateSaveButton() {
        saveBtn.disabled = !selectedEmotion || !journalText.trim();
    }
}

// Función para guardar entrada del diario
async function saveJournalEntry(text, emotion) {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) {
        throw new Error('Servicios de Firebase no disponibles');
    }
    
    const user = firebaseAuth.currentUser;
    if (!user) {
        throw new Error('Usuario no autenticado');
    }
    
    // Solicitar contraseña para encriptación
    const password = await promptForPassword();
    if (!password) {
        throw new Error('Contraseña requerida para encriptar el diario');
    }
    
    try {
        // Encriptar texto
        const encryptedText = await window.Encryption.encryptJournalEntry(text, user.uid, password);
        
        // Crear entrada del diario
        const entry = {
            encryptedText: encryptedText,
            emotion: emotion,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            date: new Date().toISOString().split('T')[0],
            wordCount: text.split(' ').length,
            isEncrypted: true
        };
        
        // Guardar en Firestore
        await firebaseFirestore
            .collection('users')
            .doc(user.uid)
            .collection('journal_entries')
            .add(entry);
        
        // Actualizar estadísticas del usuario
        await updateJournalStats(user.uid);
        
        // Trackear evento
        if (window.Analytics) {
            window.Analytics.trackEvent('diary_entry_created', {
                emotion: emotion.value,
                word_count: entry.wordCount
            });
        }
        
    } catch (error) {
        console.error('Error encriptando/guardando entrada:', error);
        throw error;
    }
}

// Función para solicitar contraseña
function promptForPassword() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'password-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <h3>Contraseña de Encriptación</h3>
                <p>Ingresa una contraseña para encriptar tu diario. Esta contraseña no se almacena en nuestros servidores.</p>
                <input type="password" id="encryption-password" class="form-control" placeholder="Contraseña">
                <div class="modal-actions">
                    <button class="btn btn-outline" id="cancel-password">Cancelar</button>
                    <button class="btn btn-primary" id="confirm-password">Confirmar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const passwordInput = modal.querySelector('#encryption-password');
        const cancelBtn = modal.querySelector('#cancel-password');
        const confirmBtn = modal.querySelector('#confirm-password');
        
        passwordInput.focus();
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(null);
        });
        
        confirmBtn.addEventListener('click', () => {
            const password = passwordInput.value;
            if (password) {
                document.body.removeChild(modal);
                resolve(password);
            }
        });
        
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });
    });
}

// Función para actualizar estadísticas del diario
async function updateJournalStats(userId) {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return;
    
    try {
        const userRef = firebaseFirestore.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) return;
        
        const userData = userDoc.data();
        const stats = userData.stats || {};
        
        // Actualizar estadísticas del diario
        stats.totalJournalEntries = (stats.totalJournalEntries || 0) + 1;
        stats.lastJournalEntry = firebase.firestore.FieldValue.serverTimestamp();
        
        // Calcular racha
        await updateJournalStreak(userId, stats);
        
        await userRef.update({ stats });
        
    } catch (error) {
        console.error('Error actualizando estadísticas del diario:', error);
    }
}

// Función para actualizar racha del diario
async function updateJournalStreak(userId, stats) {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return;
    
    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Verificar si ya escribió hoy
        const todayEntry = await firebaseFirestore
            .collection('users')
            .doc(userId)
            .collection('journal_entries')
            .where('date', '==', today.toISOString().split('T')[0])
            .get();
        
        if (todayEntry.empty) return;
        
        // Verificar si escribió ayer
        const yesterdayEntry = await firebaseFirestore
            .collection('users')
            .doc(userId)
            .collection('journal_entries')
            .where('date', '==', yesterday.toISOString().split('T')[0])
            .get();
        
        if (yesterdayEntry.empty) {
            // Romper racha
            stats.currentJournalStreak = 1;
        } else {
            // Continuar racha
            stats.currentJournalStreak = (stats.currentJournalStreak || 0) + 1;
        }
        
        // Actualizar mejor racha
        if (stats.currentJournalStreak > (stats.longestJournalStreak || 0)) {
            stats.longestJournalStreak = stats.currentJournalStreak;
        }
        
    } catch (error) {
        console.error('Error actualizando racha del diario:', error);
    }
}

// Función para obtener entradas del diario
async function getJournalEntries(userId, limit = 10) {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return [];
    
    try {
        const snapshot = await firebaseFirestore
            .collection('users')
            .doc(userId)
            .collection('journal_entries')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error obteniendo entradas del diario:', error);
        return [];
    }
}

// Función para desencriptar y mostrar entrada del diario
async function decryptJournalEntry(entry, userId) {
    const password = await promptForPassword();
    if (!password) return null;
    
    try {
        const decryptedText = await window.Encryption.decryptJournalEntry(
            entry.encryptedText, 
            userId, 
            password
        );
        
        return decryptedText;
    } catch (error) {
        console.error('Error desencriptando entrada:', error);
        showJournalToast('Error desencriptando entrada. Verifica tu contraseña.', 'error');
        return null;
    }
}

// Función para mostrar toast del diario
function showJournalToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `journal-toast journal-toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Exportar funciones
window.Journal = {
    renderJournal,
    saveJournalEntry,
    getJournalEntries,
    decryptJournalEntry,
    EMOTION_EMOJIS
};
