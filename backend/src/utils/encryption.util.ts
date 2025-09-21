import crypto from 'crypto';
import { logger } from './logger.util';

class EncryptionUtil {
  private algorithm = 'aes-256-cbc';
  private key: Buffer;

  constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey || encryptionKey.length !== 32) {
      logger.error('ENCRYPTION_KEY debe ser exactamente 32 caracteres');
      throw new Error('Clave de encriptación inválida');
    }
    this.key = Buffer.from(encryptionKey, 'utf8');
  }

  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('Error encriptando texto:', error);
      throw new Error('Error encriptando datos');
    }
  }

  decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        throw new Error('Formato de texto encriptado inválido');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Error desencriptando texto:', error);
      throw new Error('Error desencriptando datos');
    }
  }

  // Método para verificar si un texto está encriptado
  isEncrypted(text: string): boolean {
    try {
      const parts = text.split(':');
      return parts.length === 2 && parts[0].length === 32;
    } catch {
      return false;
    }
  }

  // Método para generar una clave de encriptación segura
  static generateKey(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // Método para hashear contraseñas (si se necesita en el futuro)
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return salt + ':' + hash;
  }

  // Método para verificar contraseñas (si se necesita en el futuro)
  static verifyPassword(password: string, hashedPassword: string): boolean {
    const parts = hashedPassword.split(':');
    if (parts.length !== 2) return false;
    
    const salt = parts[0];
    const hash = parts[1];
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return hash === verifyHash;
  }
}

export default new EncryptionUtil();
