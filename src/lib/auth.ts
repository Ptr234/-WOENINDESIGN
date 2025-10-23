import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { User } from '@/types';
import { DatabaseService } from './database';
import { query } from './database/connection';
import { validateUUID, sanitizeEmail, userLoginSchema, validateRequest } from './security/validation';
import { logError, recordMetric } from './performance/monitoring';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: User['role'];
  iat?: number;
  exp?: number;
}

export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a JWT token
   */
  static generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Get user from token with caching and monitoring
   */
  static async getUserFromToken(token: string): Promise<User | null> {
    const startTime = performance.now();
    
    try {
      const payload = this.verifyToken(token);
      
      if (!validateUUID(payload.userId)) {
        throw new Error('Invalid user ID in token');
      }

      // Use enhanced database service with caching
      const result = await DatabaseService.query(
        'SELECT id, email, role, first_name, last_name, phone, profile_picture, is_verified, is_active, created_at, updated_at FROM users WHERE id = $1 AND is_active = true',
        [payload.userId],
        {
          cache: {
            key: `user:${payload.userId}`,
            ttl: 300, // 5 minutes
            tags: ['user']
          },
          monitoring: {
            name: 'get_user_from_token',
            metadata: { userId: payload.userId }
          }
        }
      );

      if (result.rows.length === 0) {
        recordMetric('auth.user_not_found', performance.now() - startTime);
        return null;
      }

      const user = result.rows[0] as Record<string, unknown>;
      const userObj = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        profilePicture: user.profile_picture,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
      
      recordMetric('auth.user_retrieved', performance.now() - startTime);
      return userObj;
    } catch (error) {
      const duration = performance.now() - startTime;
      logError(error as Error, 'getUserFromToken', undefined, { duration });
      recordMetric('auth.user_retrieval_error', duration);
      return null;
    }
  }

  /**
   * Authenticate user with email and password with enhanced security
   */
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    const startTime = performance.now();
    
    try {
      // Validate input
      const validation = validateRequest(userLoginSchema)({ email, password });
      if (!validation.success) {
        recordMetric('auth.validation_failed', performance.now() - startTime);
        return null;
      }

      const sanitizedEmail = sanitizeEmail(email);
      
      const result = await DatabaseService.query(
        'SELECT id, email, password_hash, role, first_name, last_name, phone, profile_picture, is_verified, is_active, created_at, updated_at, last_login_at FROM users WHERE email = $1 AND is_active = true',
        [sanitizedEmail],
        {
          monitoring: {
            name: 'authenticate_user_lookup',
            metadata: { email: sanitizedEmail }
          }
        }
      );

      if (result.rows.length === 0) {
        recordMetric('auth.user_not_found', performance.now() - startTime);
        return null;
      }

      const user = result.rows[0] as Record<string, unknown>;
      const isPasswordValid = await this.verifyPassword(password, user.password_hash);

      if (!isPasswordValid) {
        recordMetric('auth.invalid_password', performance.now() - startTime);
        return null;
      }

      // Update last login timestamp
      await DatabaseService.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = $1',
        [user.id],
        {
          monitoring: {
            name: 'update_last_login',
            metadata: { userId: user.id }
          }
        }
      );

      const userObj = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        profilePicture: user.profile_picture,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
      
      recordMetric('auth.login_success', performance.now() - startTime);
      return userObj;
    } catch (error) {
      const duration = performance.now() - startTime;
      logError(error as Error, 'authenticateUser', undefined, { email: sanitizeEmail(email), duration });
      recordMetric('auth.login_error', duration);
      return null;
    }
  }

  /**
   * Generate password reset token
   */
  static async generatePasswordResetToken(email: string): Promise<string | null> {
    try {
      const user = await query(
        'SELECT id FROM users WHERE email = $1 AND is_active = true',
        [email.toLowerCase()]
      );

      if (user.rows.length === 0) {
        return null;
      }

      const token = jwt.sign(
        { userId: user.rows[0].id, type: 'password_reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store token in database
      await query(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.rows[0].id, token, new Date(Date.now() + 3600000)] // 1 hour from now
      );

      return token;
    } catch (error) {
      console.error('Error generating password reset token:', error);
      return null;
    }
  }

  /**
   * Verify password reset token
   */
  static async verifyPasswordResetToken(token: string): Promise<string | null> {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { type: string; email: string; exp: number };
      
      if (payload.type !== 'password_reset') {
        return null;
      }

      const result = await query(
        'SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW() AND used = false',
        [token]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0].user_id;
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      return null;
    }
  }

  /**
   * Reset user password
   */
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const userId = await this.verifyPasswordResetToken(token);
      if (!userId) {
        return false;
      }

      const hashedPassword = await this.hashPassword(newPassword);

      await query('BEGIN');

      // Update password
      await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, userId]
      );

      // Mark token as used
      await query(
        'UPDATE password_reset_tokens SET used = true WHERE token = $1',
        [token]
      );

      await query('COMMIT');
      return true;
    } catch (error) {
      await query('ROLLBACK');
      console.error('Error resetting password:', error);
      return false;
    }
  }

  /**
   * Enhanced middleware to authenticate requests with security checks
   */
  static async authenticateRequest(request: NextRequest): Promise<User | null> {
    const startTime = performance.now();
    
    try {
      const authHeader = request.headers.get('authorization');
      const token = this.extractTokenFromHeader(authHeader);

      if (!token) {
        recordMetric('auth.no_token', performance.now() - startTime);
        return null;
      }

      // Additional security checks
      if (token.length > 2048) { // Prevent extremely long tokens
        recordMetric('auth.token_too_long', performance.now() - startTime);
        return null;
      }

      const user = await this.getUserFromToken(token);
      
      if (user) {
        recordMetric('auth.request_authenticated', performance.now() - startTime);
      } else {
        recordMetric('auth.request_failed', performance.now() - startTime);
      }
      
      return user;
    } catch (error) {
      const duration = performance.now() - startTime;
      logError(error as Error, 'authenticateRequest', undefined, { 
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        duration 
      });
      recordMetric('auth.request_error', duration);
      return null;
    }
  }

  /**
   * Check if user has required role
   */
  static hasRole(user: User, requiredRoles: User['role'][]): boolean {
    return requiredRoles.includes(user.role);
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate random string for tokens
   */
  static generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export default AuthService;