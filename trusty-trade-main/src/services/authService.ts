/**
 * Auth Service - Firebase-ready modular authentication
 * Currently uses dummy auth, structured for easy Firebase integration
 */

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  avatar?: string;
  joinDate: Date;
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

// Firebase-ready auth service
class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Simulated login - replace with Firebase Auth
  async login(credentials: AuthCredentials): Promise<AuthResult> {
    await this.simulateNetworkDelay();

    if (!credentials.email || credentials.password.length < 4) {
      return { success: false, error: 'Invalid credentials' };
    }

    const user = this.createMockUser(credentials.email.split('@')[0], credentials.email);
    return { success: true, user };
  }

  // Simulated registration - replace with Firebase Auth
  async register(data: RegisterData): Promise<AuthResult> {
    await this.simulateNetworkDelay(1500);

    if (!data.name || !data.email || data.password.length < 4) {
      return { success: false, error: 'Please fill all fields correctly' };
    }

    const user = this.createMockUser(data.name, data.email);
    return { success: true, user };
  }

  // Simulated logout - replace with Firebase Auth
  async logout(): Promise<void> {
    await this.simulateNetworkDelay(300);
    // Firebase: await signOut(auth);
  }

  // Admin login - separate from user auth
  async adminLogin(email: string, password: string): Promise<AuthResult> {
    await this.simulateNetworkDelay();

    const ADMIN_EMAIL = 'admin@trustytrade.com';
    const ADMIN_PASSWORD = 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return {
        success: true,
        user: {
          id: 'admin-1',
          email: ADMIN_EMAIL,
          name: 'Admin User',
          role: 'admin',
          joinDate: new Date(),
          verificationStatus: 'verified',
        },
      };
    }

    return { success: false, error: 'Invalid admin credentials' };
  }

  private createMockUser(name: string, email: string): AuthUser {
    return {
      id: `user-${Date.now()}`,
      name,
      email,
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      joinDate: new Date(),
      verificationStatus: 'verified',
    };
  }

  private simulateNetworkDelay(ms: number = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const authService = AuthService.getInstance();
