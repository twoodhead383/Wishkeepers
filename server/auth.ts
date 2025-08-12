import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Increased from 10 for better security
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId || !req.session?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
  }
}
