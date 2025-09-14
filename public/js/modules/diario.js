// Sensus - Módulo de diario emocional

document.addEventListener('DOMContentLoaded', function() {
    initDiarioModule();
});

function initDiarioModule() {
    const diarioForm = document.getElementById('diario-form');
    const moodSelector = document.getElementById('mood-selector');
    const diarioEntries = document.getElementById('diario-entries');
    const streakCounter = document.getElementById('streak-counter');
    const statsContainer = document.getElementById('stats-container');
    
    if (!diarioForm) return;
    
    // Inicializar selector de estado de ánimo
    initMoodSelector();
    
    // Manejar envío del formulario de diario
    diarioForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Guardar entrada de diario
        saveDiarioEntry();
    });
    
    // Cargar entradas anteriores
    loadDiarioEntries();
    
    // Actualizar contador de racha
    updateStreakCounter();
    
    // Cargar estadísticas
    loadStats();
}

// Inicializar selector de estado de ánimo
function initMoodSelector() {
    const moodSelector = document.getElementById('mood-selector');
    const moodInput = document.getElementById('mood-input');
    
    if (!moodSelector || !moodInput) return;
    
    const moods = [
        { value: 1, emoji: '😢', label: 'Muy mal' },
        { value: 2, emoji: '😔', label: 'Mal' },
        { value: 3, emoji: '😐', label: 'Neutral' },
        { value: 4, emoji: '🙂', label: 'Bien' },
        { value: 5, emoji: '😄', label: 'Muy bien' }
    ];
    
    // Crear botones de estado de ánimo
    moods.forEach(mood => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mood-btn';
        button.dataset.value = mood.value;
        button.innerHTML = `
            <span class="mood-emoji">${mood.emoji}</span>
            <span class="mood-label">${mood.label}</span>
        `;
        
        button.addEventListener('click', function() {
            // Eliminar clase activa de todos los botones
            document.querySelectorAll('.mood-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Agregar clase activa al botón seleccionado
            this.classList.add('active');
            
            // Actualizar valor del input oculto
            moodInput.value = this.dataset.value;
        });
        
        moodSelector.appendChild(button);
    });
}

// Guardar entrada de diario en Firebase
function saveDiarioEntry() {
    // Verificar si el usuario está autenticado
    const user = firebase.auth().currentUser;
    
    if (!user) {
        // Usuario no autenticado, mostrar modal de autenticación
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.classList.add('active');
            showAuthTab('login');
            alert('Por favor, inicia sesión para guardar tu entrada de diario.');
        }
        return;
    }
    
    // Obtener valores del formulario
    const moodInput = document.getElementById('mood-input');
    const entryText = document.getElementById('entry-text');
    const activityTags = document.getElementById('activity-tags');
    
    if (!moodInput || !entryText) return;
    
    const mood = parseInt(moodInput.value) || 3; // Valor predeterminado: neutral
    const text = entryText.value.trim();
    const tags = activityTags ? activityTags.value.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // Validar entrada
    if (!text) {
        alert('Por favor, escribe algo en tu diario.');
        return;
    }
    
    // Referencia a la colección de entradas de diario del usuario
    const diarioRef = firebase.firestore().collection('users').doc(user.uid).collection('diarioEntries');
    
    // Crear nueva entrada
    diarioRef.add({
        mood: mood,
        text: text,
        tags: tags,
        date: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function() {
        alert('Entrada guardada correctamente.');
        
        // Limpiar formulario
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        moodInput.value = '';
        entryText.value = '';
        if (activityTags) activityTags.value = '';
        
        // Actualizar entradas y estadísticas
        loadDiarioEntries();
        updateStreakCounter();
        loadStats();
    })
    .catch(function(error) {
        console.error('Error al guardar la entrada:', error);
        alert('Error al guardar la entrada. Por favor, inténtalo de nuevo.');
    });
}

// Cargar entradas de diario desde Firebase
function loadDiarioEntries() {
    const diarioEntries = document.getElementById('diario-entries');
    const noDiarioEntries = document.getElementById('no-diario-entries');
    
    if (!diarioEntries || !noDiarioEntries) return;
    
    // Verificar si el usuario está autenticado
    const user = firebase.auth().currentUser;
    
    if (!user) {
        // Usuario no autenticado, mostrar mensaje
        diarioEntries.innerHTML = '';
        noDiarioEntries.classList.remove('hidden');
        return;
    }
    
    // Referencia a la colección de entradas de diario del usuario
    const diarioRef = firebase.firestore().collection('users').doc(user.uid).collection('diarioEntries');
    
    // Obtener entradas ordenadas por fecha (más recientes primero)
    diarioRef.orderBy('date', 'desc')
        .limit(10)
        .get()
        .then(function(querySnapshot) {
            // Limpiar contenedor de entradas
            diarioEntries.innerHTML = '';
            
            if (querySnapshot.empty) {
                // No hay entradas
                noDiarioEntries.classList.remove('hidden');
                return;
            }
            
            // Hay entradas
            noDiarioEntries.classList.add('hidden');
            
            // Agregar cada entrada al contenedor
            querySnapshot.forEach(function(doc) {
                const data = doc.data();
                const mood = data.mood || 3;
                const text = data.text || '';
                const tags = data.tags || [];
                const date = data.date ? data.date.toDate() : new Date();
                
                // Formatear fecha
                const formattedDate = date.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                
                // Obtener emoji según el estado de ánimo
                let moodEmoji;
                switch (mood) {
                    case 1: moodEmoji = '😢'; break;
                    case 2: moodEmoji = '😔'; break;
                    case 3: moodEmoji = '😐'; break;
                    case 4: moodEmoji = '🙂'; break;
                    case 5: moodEmoji = '😄'; break;
                    default: moodEmoji = '😐';
                }
                
                // Crear elemento de entrada
                const entryElement = document.createElement('div');
                entryElement.className = 'diario-entry';
                
                // Crear HTML de la entrada
                let entryHTML = `
                    <div class="entry-header">
                        <span class="entry-date">${formattedDate}</span>
                        <span class="entry-mood">${moodEmoji}</span>
                    </div>
                    <div class="entry-content">
                        <p>${text}</p>
                    </div>
                `;
                
                // Agregar etiquetas si existen
                if (tags.length > 0) {
                    entryHTML += '<div class="entry-tags">';
                    tags.forEach(tag => {
                        entryHTML += `<span class="tag">${tag}</span>`;
                    });
                    entryHTML += '</div>';
                }
                
                // Establecer HTML de la entrada
                entryElement.innerHTML = entryHTML;
                
                // Agregar entrada al contenedor
                diarioEntries.appendChild(entryElement);
            });
        })
        .catch(function(error) {
            console.error('Error al cargar entradas:', error);
            diarioEntries.innerHTML = '<p class="error-message">Error al cargar entradas.</p>';
        });
}

// Actualizar contador de racha
function updateStreakCounter() {
    const streakCounter = document.getElementById('streak-counter');
    
    if (!streakCounter) return;
    
    // Verificar si el usuario está autenticado
    const user = firebase.auth().currentUser;
    
    if (!user) {
        // Usuario no autenticado
        streakCounter.textContent = '0';
        return;
    }
    
    // Referencia al documento de estadísticas del usuario
    const statsRef = firebase.firestore().collection('users').doc(user.uid).collection('stats').doc('diario');
    
    // Obtener estadísticas
    statsRef.get()
        .then(function(doc) {
            if (doc.exists) {
                const data = doc.data();
                const streak = data.streak || 0;
                
                // Actualizar contador
                streakCounter.textContent = streak;
            } else {
                // No hay estadísticas
                streakCounter.textContent = '0';
                
                // Crear documento de estadísticas
                statsRef.set({
                    streak: 0,
                    lastEntry: null,
                    totalEntries: 0,
                    moodAverage: 3
                });
            }
        })
        .catch(function(error) {
            console.error('Error al obtener estadísticas:', error);
            streakCounter.textContent = '0';
        });
}

// Cargar estadísticas
function loadStats() {
    const statsContainer = document.getElementById('stats-container');
    
    if (!statsContainer) return;
    
    // Verificar si el usuario está autenticado
    const user = firebase.auth().currentUser;
    
    if (!user) {
        // Usuario no autenticado
        statsContainer.innerHTML = '<p>Inicia sesión para ver tus estadísticas.</p>';
        return;
    }
    
    // Referencia al documento de estadísticas del usuario
    const statsRef = firebase.firestore().collection('users').doc(user.uid).collection('stats').doc('diario');
    
    // Obtener estadísticas
    statsRef.get()
        .then(function(doc) {
            if (doc.exists) {
                const data = doc.data();
                const streak = data.streak || 0;
                const totalEntries = data.totalEntries || 0;
                const moodAverage = data.moodAverage || 3;
                
                // Formatear promedio de estado de ánimo
                const formattedAverage = moodAverage.toFixed(1);
                
                // Obtener emoji según el promedio
                let moodEmoji;
                if (moodAverage < 1.5) moodEmoji = '😢';
                else if (moodAverage < 2.5) moodEmoji = '😔';
                else if (moodAverage < 3.5) moodEmoji = '😐';
                else if (moodAverage < 4.5) moodEmoji = '🙂';
                else moodEmoji = '😄';
                
                // Actualizar estadísticas
                statsContainer.innerHTML = `
                    <div class="stat-item">
                        <span class="stat-label">Racha actual</span>
                        <span class="stat-value">${streak} días</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total de entradas</span>
                        <span class="stat-value">${totalEntries}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Estado de ánimo promedio</span>
                        <span class="stat-value">${formattedAverage} ${moodEmoji}</span>
                    </div>
                `;
            } else {
                // No hay estadísticas
                statsContainer.innerHTML = '<p>No hay estadísticas disponibles.</p>';
            }
        })
        .catch(function(error) {
            console.error('Error al obtener estadísticas:', error);
            statsContainer.innerHTML = '<p class="error-message">Error al cargar estadísticas.</p>';
        });
}

// Mostrar pestaña de autenticación
function showAuthTab(tab) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (!loginTab || !registerTab || !loginForm || !registerForm) return;
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    }
}