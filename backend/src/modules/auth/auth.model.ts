import bcrypt from 'bcrypt';
import supabase from '../../config/db';
import { IUser, SafeUser, UserRow, UserRole } from '../../types';

// ============================================================
// Row ↔ Application Mapping
// ============================================================

/**
 * Maps a PostgreSQL snake_case row to a camelCase application object.
 */
function mapRowToUser(row: UserRow): IUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Strips the password from a user object for API responses.
 */
function sanitize(user: IUser): SafeUser {
  const { password, ...safe } = user;
  return safe;
}

// ============================================================
// User Model — Data Access Layer for Supabase (PostgreSQL)
// ============================================================

class UserModel {
  private readonly TABLE = 'users';

  /**
   * Find a user by email. Returns null if not found.
   * Includes the password field for authentication checks.
   */
  async findByEmail(email: string): Promise<IUser | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      // PGRST116 = "No rows found" — not a real error
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return data ? mapRowToUser(data as UserRow) : null;
  }

  /**
   * Find a user by ID. Returns null if not found.
   * Does NOT include the password field.
   */
  async findById(id: string): Promise<IUser | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('id, name, email, role, status, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) return null;

    // Password is not selected — set an empty string so the type is satisfied
    return mapRowToUser({ ...data, password: '' } as UserRow);
  }

  /**
   * Create a new user. Password is hashed before insertion.
   * Returns the created user without the password.
   */
  async create(input: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<IUser> {
    // Hash password with bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(input.password, 10);

    const { data, error } = await supabase
      .from(this.TABLE)
      .insert({
        name: input.name,
        email: input.email.toLowerCase(),
        password: hashedPassword,
        role: input.role || 'client',
        status: 'active',
      })
      .select('*')
      .single();

    if (error) {
      // 23505 = unique_violation (duplicate email)
      if (error.code === '23505') {
        throw Object.assign(new Error('An account with this email already exists'), {
          statusCode: 409,
        });
      }
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create user — no data returned');
    }

    return mapRowToUser(data as UserRow);
  }

  /**
   * Compare a candidate password against a bcrypt hash.
   */
  async comparePassword(
    candidatePassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  /**
   * Return a user object without the password.
   */
  sanitize(user: IUser): SafeUser {
    return sanitize(user);
  }
}

// ============================================================
// Singleton Export
// ============================================================

const User = new UserModel();
export default User;
