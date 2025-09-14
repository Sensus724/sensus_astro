// Sensus - Módulo de Firebase Storage

document.addEventListener('DOMContentLoaded', function() {
    initStorageModule();
});

function initStorageModule() {
    // Verificar si FirebaseServices está disponible
    if (typeof FirebaseServices === 'undefined') {
        console.error('FirebaseServices no está disponible');
        return;
    }
    
    const firebaseStorage = FirebaseServices.storage();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseStorage || !firebaseAuth) {
        console.error('Servicios de Firebase no disponibles');
        return;
    }
    
    console.log('Módulo de Storage inicializado correctamente');
}

// Función para subir archivo
function uploadFile(file, path, metadata = {}) {
    const firebaseStorage = FirebaseServices.storage();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseStorage || !firebaseAuth) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    // Validar archivo
    if (!file) {
        return Promise.reject('No se proporcionó archivo');
    }
    
    // Crear referencia de almacenamiento
    const storageRef = firebaseStorage.ref();
    const fileRef = storageRef.child(path);
    
    // Configurar metadata
    const uploadMetadata = {
        contentType: file.type,
        customMetadata: {
            uploadedBy: user.uid,
            uploadedAt: new Date().toISOString(),
            ...metadata
        }
    };
    
    // Subir archivo
    return fileRef.put(file, uploadMetadata)
        .then((snapshot) => {
            console.log('Archivo subido correctamente:', snapshot.metadata.name);
            return {
                snapshot: snapshot,
                downloadURL: snapshot.ref.getDownloadURL()
            };
        })
        .then((result) => {
            return result.downloadURL.then((url) => {
                return {
                    url: url,
                    path: path,
                    metadata: result.snapshot.metadata
                };
            });
        })
        .catch((error) => {
            console.error('Error al subir archivo:', error);
            throw error;
        });
}

// Función para subir foto de perfil
function uploadProfilePhoto(file) {
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    // Validar archivo
    if (!file || !file.type.startsWith('image/')) {
        return Promise.reject('Archivo no válido. Debe ser una imagen.');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
        return Promise.reject('El archivo es demasiado grande. Máximo 5MB.');
    }
    
    // Comprimir imagen si es necesario
    return compressImage(file, 800, 800, 0.8)
        .then((compressedFile) => {
            const path = `profile-photos/${user.uid}/${Date.now()}_${compressedFile.name}`;
            return uploadFile(compressedFile, path, {
                type: 'profile-photo',
                originalName: file.name,
                originalSize: file.size,
                compressedSize: compressedFile.size
            });
        });
}

// Función para subir backup de datos
function uploadDataBackup(data, filename) {
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    // Crear archivo JSON
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const file = new File([blob], filename, { type: 'application/json' });
    
    const path = `backups/${user.uid}/${filename}`;
    return uploadFile(file, path, {
        type: 'data-backup',
        dataType: 'user-data',
        version: '1.0'
    });
}

// Función para subir archivo de exportación
function uploadExportFile(data, filename) {
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    // Crear archivo JSON
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const file = new File([blob], filename, { type: 'application/json' });
    
    const path = `exports/${user.uid}/${filename}`;
    return uploadFile(file, path, {
        type: 'data-export',
        dataType: 'user-data',
        version: '1.0'
    });
}

// Función para descargar archivo
function downloadFile(path) {
    const firebaseStorage = FirebaseServices.storage();
    if (!firebaseStorage) return Promise.reject('Storage no disponible');
    
    const storageRef = firebaseStorage.ref();
    const fileRef = storageRef.child(path);
    
    return fileRef.getDownloadURL()
        .then((url) => {
            // Crear enlace de descarga
            const link = document.createElement('a');
            link.href = url;
            link.download = path.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return url;
        })
        .catch((error) => {
            console.error('Error al descargar archivo:', error);
            throw error;
        });
}

// Función para obtener URL de descarga
function getDownloadURL(path) {
    const firebaseStorage = FirebaseServices.storage();
    if (!firebaseStorage) return Promise.reject('Storage no disponible');
    
    const storageRef = firebaseStorage.ref();
    const fileRef = storageRef.child(path);
    
    return fileRef.getDownloadURL();
}

// Función para listar archivos del usuario
function listUserFiles(folder = '') {
    const firebaseStorage = FirebaseServices.storage();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseStorage || !firebaseAuth) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    const storageRef = firebaseStorage.ref();
    const userRef = storageRef.child(folder || user.uid);
    
    return userRef.listAll()
        .then((result) => {
            const files = [];
            
            // Procesar archivos
            result.items.forEach((itemRef) => {
                files.push({
                    name: itemRef.name,
                    fullPath: itemRef.fullPath,
                    type: 'file'
                });
            });
            
            // Procesar carpetas
            result.prefixes.forEach((folderRef) => {
                files.push({
                    name: folderRef.name,
                    fullPath: folderRef.fullPath,
                    type: 'folder'
                });
            });
            
            return files;
        })
        .catch((error) => {
            console.error('Error al listar archivos:', error);
            throw error;
        });
}

// Función para eliminar archivo
function deleteFile(path) {
    const firebaseStorage = FirebaseServices.storage();
    if (!firebaseStorage) return Promise.reject('Storage no disponible');
    
    const storageRef = firebaseStorage.ref();
    const fileRef = storageRef.child(path);
    
    return fileRef.delete()
        .then(() => {
            console.log('Archivo eliminado correctamente:', path);
            return true;
        })
        .catch((error) => {
            console.error('Error al eliminar archivo:', error);
            throw error;
        });
}

// Función para obtener metadata del archivo
function getFileMetadata(path) {
    const firebaseStorage = FirebaseServices.storage();
    if (!firebaseStorage) return Promise.reject('Storage no disponible');
    
    const storageRef = firebaseStorage.ref();
    const fileRef = storageRef.child(path);
    
    return fileRef.getMetadata()
        .then((metadata) => {
            return metadata;
        })
        .catch((error) => {
            console.error('Error al obtener metadata:', error);
            throw error;
        });
}

// Función para actualizar metadata del archivo
function updateFileMetadata(path, metadata) {
    const firebaseStorage = FirebaseServices.storage();
    if (!firebaseStorage) return Promise.reject('Storage no disponible');
    
    const storageRef = firebaseStorage.ref();
    const fileRef = storageRef.child(path);
    
    return fileRef.updateMetadata(metadata)
        .then((updatedMetadata) => {
            console.log('Metadata actualizada correctamente');
            return updatedMetadata;
        })
        .catch((error) => {
            console.error('Error al actualizar metadata:', error);
            throw error;
        });
}

// Función para comprimir imagen
function compressImage(file, maxWidth, maxHeight, quality) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calcular nuevas dimensiones
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            // Configurar canvas
            canvas.width = width;
            canvas.height = height;
            
            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir a blob
            canvas.toBlob((blob) => {
                const compressedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now()
                });
                resolve(compressedFile);
            }, file.type, quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// Función para subir con progreso
function uploadFileWithProgress(file, path, onProgress, metadata = {}) {
    const firebaseStorage = FirebaseServices.storage();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseStorage || !firebaseAuth) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    // Crear referencia de almacenamiento
    const storageRef = firebaseStorage.ref();
    const fileRef = storageRef.child(path);
    
    // Configurar metadata
    const uploadMetadata = {
        contentType: file.type,
        customMetadata: {
            uploadedBy: user.uid,
            uploadedAt: new Date().toISOString(),
            ...metadata
        }
    };
    
    // Subir archivo con progreso
    const uploadTask = fileRef.put(file, uploadMetadata);
    
    // Escuchar cambios de progreso
    uploadTask.on('state_changed',
        (snapshot) => {
            // Progreso de subida
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
                onProgress(progress, snapshot);
            }
        },
        (error) => {
            console.error('Error durante la subida:', error);
            throw error;
        },
        () => {
            // Subida completada
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                if (onProgress) {
                    onProgress(100, uploadTask.snapshot, downloadURL);
                }
            });
        }
    );
    
    return uploadTask;
}

// Función para cancelar subida
function cancelUpload(uploadTask) {
    if (uploadTask) {
        uploadTask.cancel();
        console.log('Subida cancelada');
    }
}

// Función para limpiar archivos antiguos
function cleanupOldFiles(folder, maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 días por defecto
    const firebaseStorage = FirebaseServices.storage();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseStorage || !firebaseAuth) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    const storageRef = firebaseStorage.ref();
    const folderRef = storageRef.child(folder || user.uid);
    
    return folderRef.listAll()
        .then((result) => {
            const now = Date.now();
            const deletePromises = [];
            
            result.items.forEach((itemRef) => {
                itemRef.getMetadata().then((metadata) => {
                    const createdAt = new Date(metadata.timeCreated).getTime();
                    const age = now - createdAt;
                    
                    if (age > maxAge) {
                        deletePromises.push(itemRef.delete());
                    }
                });
            });
            
            return Promise.all(deletePromises);
        })
        .then(() => {
            console.log('Limpieza de archivos antiguos completada');
        })
        .catch((error) => {
            console.error('Error durante la limpieza:', error);
            throw error;
        });
}

// Función para obtener estadísticas de almacenamiento
function getStorageStats() {
    const firebaseStorage = FirebaseServices.storage();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseStorage || !firebaseAuth) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    const storageRef = firebaseStorage.ref();
    const userRef = storageRef.child(user.uid);
    
    return userRef.listAll()
        .then((result) => {
            let totalSize = 0;
            let fileCount = 0;
            
            const filePromises = result.items.map((itemRef) => {
                return itemRef.getMetadata().then((metadata) => {
                    totalSize += parseInt(metadata.size);
                    fileCount++;
                });
            });
            
            return Promise.all(filePromises).then(() => {
                return {
                    totalFiles: fileCount,
                    totalSize: totalSize,
                    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                    folders: result.prefixes.length
                };
            });
        })
        .catch((error) => {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        });
}

// Exportar funciones para uso global
window.Storage = {
    uploadFile: uploadFile,
    uploadProfilePhoto: uploadProfilePhoto,
    uploadDataBackup: uploadDataBackup,
    uploadExportFile: uploadExportFile,
    downloadFile: downloadFile,
    getDownloadURL: getDownloadURL,
    listUserFiles: listUserFiles,
    deleteFile: deleteFile,
    getFileMetadata: getFileMetadata,
    updateFileMetadata: updateFileMetadata,
    uploadFileWithProgress: uploadFileWithProgress,
    cancelUpload: cancelUpload,
    cleanupOldFiles: cleanupOldFiles,
    getStorageStats: getStorageStats,
    compressImage: compressImage
};
