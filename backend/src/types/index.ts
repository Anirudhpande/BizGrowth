import { Request } from 'express';

// ============================================================
// User Types
// ============================================================

export type UserRole = 'client' | 'consultant' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending' | 'inactive';

/** Database row shape (snake_case — matches PostgreSQL columns) */
export interface UserRow {
  id: string; // auth_user_id (users.id)
  profile_id: string; // profiles.id
  email: string;
  password?: string; // password_hash from users
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  bio: string;
  phone: string;
  avatar_url: string;
  company_name: string;
  industry: string;
  city: string;
  state: string;
  country: string;
  website: string;
  linkedin_url: string;
  experience_years: number;
  created_at: string;
  updated_at: string;
}

/** Application-layer user (camelCase) */
export interface IUser {
  id: string; // users.id (auth_user_id)
  profileId: string; // profiles.id
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  name: string; // Dynamic combination of firstName + lastName
  role: UserRole;
  status: UserStatus;
  bio: string;
  phone: string;
  avatarUrl: string;
  companyName: string;
  company: string; // Maps to companyName for backward compatibility
  industry: string;
  city: string;
  state: string;
  country: string;
  website: string;
  linkedinUrl: string;
  experienceYears: number;
  createdAt: Date;
  updatedAt: Date;
}

/** User object without sensitive fields (password) */
export type SafeUser = Omit<IUser, 'password'>;

// ============================================================
// User Profile Types
// ============================================================

/** Fields that a user can update on their own profile */
export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  name?: string; // Maps to firstName/lastName splits
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  companyName?: string;
  company?: string; // Maps to companyName
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  linkedinUrl?: string;
  experienceYears?: number;
}

/** Fields that an admin can update on any user */
export interface AdminUpdateUserInput extends UpdateProfileInput {
  role?: UserRole;
  status?: UserStatus;
  email?: string;
}

/** Pagination query parameters */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  industry?: string;
  sortBy?: 'name' | 'created_at' | 'company';
  sortOrder?: 'asc' | 'desc';
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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

// ============================================================
// Organization Types
// ============================================================

export interface OrganizationRow {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface IOrganization {
  id: string;
  name: string;
  description: string;
  industry: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationInput {
  name: string;
  description?: string;
  industry?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  industry?: string;
}
