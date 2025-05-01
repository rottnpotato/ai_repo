import Api from '../api';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
  ConfirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    role: string;
    googleId?: string;
  };
  accessToken: string;
  message?: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordData {
  Email: string;
}

export interface VerifyOtpData {
  Email: string;
  Otp: string;
}

export interface ResetPasswordData {
  Email: string;
  ResetToken: string;
  NewPassword: string;
}

export interface VerifyEmailData {
  Token: string;
  Email: string;
}

export interface ResendVerificationData {
  Email: string;
}

export interface ValidateTokenData {
  token: string;
}

export interface GoogleAuthData {
  GoogleToken: string;
}

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  /**
   * Login user with email and password
   */
  static async Login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Convert camelCase credentials to PascalCase for API compatibility
    const apiCredentials = {
      email: credentials.email,
      password: credentials.password
    };
    
    const response = await Api.post<AuthResponse>('auth/login', apiCredentials);
    console.log("Login response: "+response);
    
    // Store token for future API calls
    if (response.accessToken) {
      localStorage.setItem('authToken', response.accessToken);
    }
    
    return response;
  }
  
  /**
   * Register a new user account
   */
  static async Register(data: SignupData): Promise<AuthResponse> {
    const response = await Api.post<AuthResponse>('auth/register', data);
    return response;
  }
  
  /**
   * Verify user's email address using verification token
   */
  static async VerifyEmail(data: VerifyEmailData): Promise<AuthResponse> {
    return Api.get<AuthResponse>(`auth/verify?Token=${data.Token}&Email=${encodeURIComponent(data.Email)}`);
  }
  
  /**
   * Resend verification email
   */
  static async ResendVerification(data: ResendVerificationData): Promise<AuthResponse> {
    return Api.post<AuthResponse>('auth/resend-verification', data);
  }
  
  /**
   * Log out the current user
   */
  static async Logout(): Promise<LogoutResponse> {
    try {
      // Call the logout endpoint to invalidate the token on the server side
      const response = await Api.post<LogoutResponse>('auth/logout');
      
      // Always remove the token from local storage
      localStorage.removeItem('authToken');
      
      return response;
    } catch (err) {
      console.error('Logout error:', err);
      // Still remove the token from local storage even if API call fails
      localStorage.removeItem('authToken');
      
      // Return a default response for error cases
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Logout failed'
      };
    }
  }
  
  /**
   * Request a password reset
   */
  static async ForgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    return Api.post<AuthResponse>('auth/forgot-password', data);
  }

  /**
   * Verify OTP sent for password reset
   */
  static async VerifyOtp(data: VerifyOtpData): Promise<AuthResponse> {
    return Api.post<AuthResponse>('auth/verify-otp', data);
  }
  
  /**
   * Reset password with token
   */
  static async ResetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    return Api.post<AuthResponse>('auth/reset-password', data);
  }
  
  /**
   * Get current user information
   */
  static async GetProfile(): Promise<AuthResponse['user']> {
    return Api.get<AuthResponse['user']>('auth/profile');
  }
  
  /**
   * Verify if a JWT token is valid
   */
  static async VerifyToken(): Promise<{ isValid: boolean; user: AuthResponse['user'] }> {
    return Api.get<{ isValid: boolean; user: AuthResponse['user'] }>('auth/verify-token');
  }

  /**
   * Validate a JWT token and return its decoded information
   */
  static async ValidateToken(data: ValidateTokenData): Promise<{ success: boolean; valid: boolean; user: AuthResponse['user'] }> {
    return Api.post<{ success: boolean; valid: boolean; user: AuthResponse['user'] }>('auth/validate', data);
  }
  
  /**
   * Check if the user is currently authenticated
   */
  static IsAuthenticated(): boolean {
    return typeof localStorage !== 'undefined' && !!localStorage.getItem('authToken');
  }

  /**
   * Login with Google OAuth token
   */
  static async GoogleLogin(data: GoogleAuthData): Promise<AuthResponse> {
    const response = await Api.post<AuthResponse>('auth/google/login', data);
    
    // Store token for future API calls
    if (response.accessToken) {
      localStorage.setItem('authToken', response.accessToken);
    }
    
    return response;
  }

  /**
   * Register with Google OAuth token
   */
  static async GoogleRegister(data: GoogleAuthData): Promise<AuthResponse> {
    const response = await Api.post<AuthResponse>('auth/google/login', data);
    
    // Store token for future API calls if registration is auto-login
    if (response.accessToken) {
      localStorage.setItem('authToken', response.accessToken);
    }
    
    return response;
  }
}

export default AuthService; 