import { Request } from 'express';

// ============================================================
// User Types
// ============================================================

export type UserRole = 'client' | 'consultant' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';

/** Database row shape (snake_case — matches PostgreSQL columns) */
export interface UserRow {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

/** Application-layer user (camelCase) */
export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** User object without sensitive fields (password) */
export type SafeUser = Omit<IUser, 'password'>;

// ============================================================
// Auth Types
// ============================================================

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: true;
  token: string;
  user: SafeUser;
}

// ============================================================
// Express Augmentation
// ============================================================

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ============================================================
// Error Types
// ============================================================

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>[];
}
