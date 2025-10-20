import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: { userId: string; email: string; role: string; type: 'staff' | 'patient' }): string {
  return jwt.sign(payload, config.jwt.secret, { 
    expiresIn: config.jwt.expiresIn,
    issuer: 'clinic-app',
    audience: 'clinic-users'
  } as jwt.SignOptions);
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { userId: string; email: string; role: string; type: 'staff' | 'patient' } | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'clinic-app',
      audience: 'clinic-users'
    }) as { userId: string; email: string; role: string; type: 'staff' | 'patient' };
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  // Optional: Add more password strength requirements
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }
  
  // if (!/[a-z]/.test(password)) {
  //   errors.push('Password must contain at least one lowercase letter');
  // }
  
  // if (!/\d/.test(password)) {
  //   errors.push('Password must contain at least one number');
  // }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
