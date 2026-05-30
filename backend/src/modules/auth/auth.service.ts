import jwt from 'jsonwebtoken';
import User from './auth.model';
import {
  RegisterInput,
  LoginInput,
  AuthResponse,
  JwtPayload,
  SafeUser,
  IUser,
} from '../../types';

// ============================================================
// Custom Error Classes
// ============================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ============================================================
// Auth Service
// ============================================================

class AuthService {
  /**
   * Generate a JWT token for the given user.
   */
  private generateToken(user: IUser): string {
    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('JWT_SECRET is not configured', 500);
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign(payload, secret, {
      expiresIn,
    } as jwt.SignOptions);
  }

  // ----------------------------------------------------------
  // Register
  // ----------------------------------------------------------

  async register(input: RegisterInput): Promise<AuthResponse> {
    const { name, email, password, role } = input;

    // 1. Validate required fields
    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // 2. Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    // 3. Create user (password hashing handled inside model)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'client',
    });

    // 4. Generate JWT
    const token = this.generateToken(user);

    // 5. Return response
    return {
      success: true,
      token,
      user: User.sanitize(user),
    };
  }

  // ----------------------------------------------------------
  // Login
  // ----------------------------------------------------------

  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // 1. Validate required fields
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // 2. Find user by email (includes password for comparison)
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 3. Check account status
    if (user.status === 'suspended') {
      throw new AppError(
        'Your account has been suspended. Please contact support.',
        403
      );
    }

    // 4. Compare password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // 5. Generate JWT
    const token = this.generateToken(user);

    // 6. Return response
    return {
      success: true,
      token,
      user: User.sanitize(user),
    };
  }

  // ----------------------------------------------------------
  // Get Current User (Me)
  // ----------------------------------------------------------

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.status === 'suspended') {
      throw new AppError(
        'Your account has been suspended. Please contact support.',
        403
      );
    }

    return User.sanitize(user);
  }
}

export default new AuthService();
