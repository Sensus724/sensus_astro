// Sensus - Módulo de encriptación AES-256 para el diario
// Importante: La clave nunca se almacena en el servidor

// Función para generar clave única por usuario
function generateUserKey(uid, userPassword) {
    // Combinar UID + contraseña para generar clave única
    const combined = uid + userPassword;
    
    // Usar Web Crypto API para generar hash SHA-256
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(combined))
        .then(hash => {
            return crypto.subtle.importKey(
                'raw',
                hash,
                { name: 'AES-GCM' },
                false,
                ['encrypt', 'decrypt']
            );
        });
}

// Función para encriptar texto del diario
async function encryptJournalEntry(text, uid, userPassword) {
    try {
        const key = await generateUserKey(uid, userPassword);
        
        // Generar IV aleatorio
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // Encriptar texto
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            new TextEncoder().encode(text)
        );
        
        // Combinar IV + datos encriptados
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedData), iv.length);
        
        // Convertir a base64 para almacenar en Firestore
        return btoa(String.fromCharCode(...combined));
        
    } catch (error) {
        console.error('Error encriptando entrada del diario:', error);
        throw new Error('No se pudo encriptar la entrada del diario');
    }
}

// Función para desencriptar texto del diario
async function decryptJournalEntry(encryptedText, uid, userPassword) {
    try {
        const key = await generateUserKey(uid, userPassword);
        
        // Convertir de base64
        const combined = new Uint8Array(
            atob(encryptedText).split('').map(char => char.charCodeAt(0))
        );
        
        // Separar IV y datos encriptados
        const iv = combined.slice(0, 12);
        const encryptedData = combined.slice(12);
        
        // Desencriptar
        const decryptedData = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encryptedData
        );
        
        // Convertir a texto
        return new TextDecoder().decode(decryptedData);
        
    } catch (error) {
        console.error('Error desencriptando entrada del diario:', error);
        throw new Error('No se pudo desencriptar la entrada del diario');
    }
}

// Función para verificar si el texto está encriptado
function isEncrypted(text) {
    try {
        // Intentar decodificar base64
        atob(text);
        return true;
    } catch (error) {
        return false;
    }
}

// Función para generar hash de verificación
async function generateHash(text) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Exportar funciones
window.Encryption = {
    encryptJournalEntry,
    decryptJournalEntry,
    isEncrypted,
    generateHash
};
