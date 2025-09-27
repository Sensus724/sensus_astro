/**
 * Tipos globales para Express
 */

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role?: string;
        permissions?: string[];
        sessionId?: string;
        lastActivity?: Date;
      };
      securityContext?: {
        ip: string;
        userAgent: string;
        isBlocked: boolean;
        rateLimitInfo: any;
        suspiciousActivity: boolean;
      };
      session?: {
        csrfToken?: string;
        [key: string]: any;
      };
      file?: {
        size: number;
        mimetype: string;
        [key: string]: any;
      };
      isBot?: boolean;
    }
  }
}

export {};
