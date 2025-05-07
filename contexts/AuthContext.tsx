"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthService, LoginCredentials, SignupData, AuthResponse, ForgotPasswordData, ResetPasswordData, VerifyOtpData, GoogleAuthData } from '../lib/services/AuthService';
import { User as ApiUser } from '../lib/services/UserService';
import { adminUser } from "@/lib/admin-data";

// Re-export types from old auth context
export type User = {
  id: string;
  name: string;
  email: string;
  website?: string;
  plan: string;
  subscriptionStatus: string;
  nextBillingDate: string;
  billingCycle: string;
  subscriptionStartDate: string;
  company?: string;
  apiKey: string;
  apiKeyLastUsed?: string;
  role: string;
  fullName?: string; // For compatibility with new API User type
  firstName?: string; // Added for new API
  lastName?: string; // Added for new API
  status?: string; // Added for new API
  pluginActivation?: string; // Added for plugin activation status
  tokensUsed?: number; // Added for token usage tracking
};

export type UserStats = {
  apiCalls: number;
  apiCallsLimit: number;
  apiCallsHistory: { date: string; count: number }[];
  productDescriptionsGenerated: number;
  productDescriptionsLimit: number;
  blogPostsGenerated: number;
  blogPostsLimit: number;
};

export type BillingRecord = {
  id: string;
  date: string;
  invoice: string;
  amount: string;
  status: string;
};

export type RecentActivity = {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
};

// New extended interface combining old and new functionality
interface AuthContextType {
  // State
  user: User | null;
  userStats: UserStats | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  error: string | null;
  
  // New API methods (PascalCase)
  Login: (credentials: LoginCredentials) => Promise<User | null>;
  Signup: (data: SignupData) => Promise<boolean>;
  Logout: () => Promise<void>;
  ForgotPassword: (data: ForgotPasswordData) => Promise<AuthResponse | null>;
  VerifyOtp: (data: VerifyOtpData) => Promise<AuthResponse | null>;
  ResetPassword: (data: ResetPasswordData) => Promise<AuthResponse | null>;
  RefreshUser: () => Promise<User | null>;
  ClearError: () => void;
  GoogleLogin: (token: string) => Promise<User | null>;
  GoogleSignup: (token: string) => Promise<boolean>;
  
  // Old methods (camelCase) for backwards compatibility
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, website?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  regenerateApiKey: () => Promise<void>;
  generateContent: (type: string, title: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  setNewPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock data for compatibility during transition
const mockUserStats: UserStats = {
  apiCalls: 450,
  apiCallsLimit: 1000,
  apiCallsHistory: Array.from({ length: 10 }, (_, i) => ({
    date: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000).toISOString(),
    count: Math.floor(Math.random() * 50) + 10,
  })),
  productDescriptionsGenerated: 35,
  productDescriptionsLimit: 200,
  blogPostsGenerated: 8,
  blogPostsLimit: 15,
};

// Helper to convert API user to UI User
const apiUserToUIUser = (apiUser: any): User => {
  console.log("apiUserToUIUser:", apiUser);
  
  if (!apiUser) {
    console.error("apiUser is undefined or null");
    throw new Error("API user data is required");
  }

  // Ensure role is always defined
  const userRole = apiUser.role || "user";  // Default to "user" if role is not present
  
  try {
    return {
      id: apiUser.id || "",
      name: `${apiUser.firstName || ""} ${apiUser.lastName || ""}`.trim(),
      email: apiUser.email || "",
      firstName: apiUser.firstName || "",
      lastName: apiUser.lastName || "", 
      fullName: `${apiUser.firstName || ""} ${apiUser.lastName || ""}`.trim(),
      plan: 'professional', // Default values for fields not in API
      subscriptionStatus: 'active',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      billingCycle: 'monthly',
      subscriptionStartDate: new Date().toISOString(),
      apiKey: 'sk_test_' + Math.random().toString(36).substring(2, 15),
      role: userRole,
      status: apiUser.status || "active",
      pluginActivation: apiUser.pluginActivation || "",
      tokensUsed: apiUser.tokensUsed || 0
    };
  } catch (error) {
    console.error("Error converting API user to UI user:", error);
    throw new Error("Failed to convert API user data");
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const CheckAuthStatus = async () => {
      setIsLoading(true);
      
      try {
        // First check local storage for token
        const hasToken = AuthService.IsAuthenticated();
        
        if (hasToken) {
          try {
            // Try to verify token validity with the server
            const verifyResult = await AuthService.VerifyToken();
            
            if (verifyResult.isValid && verifyResult.user) {
              const uiUser = apiUserToUIUser(verifyResult.user);
              setUser(uiUser);
              setUserStats(mockUserStats);
              setIsAuthenticated(true);
              setIsAdmin(uiUser.role === 'admin');
            } else {
              // Token is invalid, try to get current profile instead
              try {
                const userData = await AuthService.GetProfile();
                if (userData) {
                  const uiUser = apiUserToUIUser(userData);
                  setUser(uiUser);
                  setUserStats(mockUserStats);
                  setIsAuthenticated(true);
                  setIsAdmin(uiUser.role === 'admin');
                } else {
                  throw new Error('No user data returned');
                }
              } catch (profileErr) {
                console.error('Failed to get profile after token verification:', profileErr);
                // Clear token as it's invalid
                localStorage.removeItem('authToken');
                setIsAuthenticated(false);
              }
            }
          } catch (verifyErr) {
            console.error('Token verification failed:', verifyErr);
            // If verification explicitly fails (not just server error), clear token
            // Try to get profile as a fallback
            try {
              const userData = await AuthService.GetProfile();
              if (userData) {
                const uiUser = apiUserToUIUser(userData);
                setUser(uiUser);
                setUserStats(mockUserStats);
                setIsAuthenticated(true);
                setIsAdmin(uiUser.role === 'admin');
              } else {
                throw new Error('No user data returned');
              }
            } catch (profileErr) {
              console.error('Failed to get profile after failed verification:', profileErr);
              localStorage.removeItem('authToken');
              setIsAuthenticated(false);
            }
          }
        } else {
          // No token, but still try to get profile in case session cookies exist
          try {
            const userData = await AuthService.GetProfile();
            if (userData) {
              const uiUser = apiUserToUIUser(userData);
              setUser(uiUser);
              setUserStats(mockUserStats);
              setIsAuthenticated(true);
              setIsAdmin(uiUser.role === 'admin');
            }
          } catch (err) {
            // No valid session
            console.log('No valid authentication found');
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    CheckAuthStatus();
  }, []);
  
  // New API-based methods
  const Login = async (credentials: LoginCredentials): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.Login(credentials);
      console.log("Login response:", response);
      if (response.success) {
        console.log("Raw user data from API:", response.user);
        const uiUser = apiUserToUIUser(response.user);
        console.log("Converted UI user with role:", uiUser);
        setUser(uiUser);
        setUserStats(mockUserStats);
        setIsAuthenticated(true);
        setIsAdmin(uiUser.role === 'admin');
        return uiUser;
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const Signup = async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.Register(data);
      if (response.success) {
        // For signup/register, we typically don't auto-login the user
        // since we usually require email verification
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const Logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await AuthService.Logout();
      
      // Clear user data regardless of response
      setUser(null);
      setUserStats(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      // Log the response for debugging
      console.log("Logout response:", response);
      
      // If logout failed on server but we cleared local state, that's acceptable
      if (!response.success) {
        console.warn("Server-side logout failed but client was logged out:", response.message);
      }
    } catch (err) {
      console.error('Logout error:', err);
      // We still want to clear the local state even if there was an error
      setUser(null);
      setUserStats(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const ForgotPassword = async (data: ForgotPasswordData): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await AuthService.ForgotPassword(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset request failed';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const VerifyOtp = async (data: VerifyOtpData): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await AuthService.VerifyOtp(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OTP verification failed';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const ResetPassword = async (data: ResetPasswordData): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await AuthService.ResetPassword(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const RefreshUser = async (): Promise<User | null> => {
    setIsLoading(true);
    
    try {
      if (AuthService.IsAuthenticated()) {
        const userData = await AuthService.GetProfile();
        const uiUser = apiUserToUIUser(userData);
        setUser(uiUser);
        setIsAuthenticated(true);
        setIsAdmin(uiUser.role === 'admin');
        return uiUser;
      }
      return null;
    } catch (err) {
      console.error('Error refreshing user:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const ClearError = () => setError(null);
  
  const GoogleLogin = async (token: string): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data: GoogleAuthData = { GoogleToken: token };
      const response = await AuthService.GoogleLogin(data);
      console.log("Google login response:", response);
      
      if (response.success) {
        console.log("Raw Google user data from API:", response.user);
        const uiUser = apiUserToUIUser(response.user);
        console.log("Converted Google UI user with role:", uiUser);
        setUser(uiUser);
        setUserStats(mockUserStats);
        setIsAuthenticated(true);
        setIsAdmin(uiUser.role === 'admin');
        return uiUser;
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const GoogleSignup = async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data: GoogleAuthData = { GoogleToken: token };
      const response = await AuthService.GoogleRegister(data);
      
      if (response.success) {
        // For Google signup/register, we auto-login the user since Google accounts
        // are pre-verified by Google's OAuth
        const uiUser = apiUserToUIUser(response.user);
        setUser(uiUser);
        setUserStats(mockUserStats);
        setIsAuthenticated(true);
        setIsAdmin(uiUser.role === 'admin');
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google signup failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Old methods (camelCase) for backwards compatibility
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const credentials: LoginCredentials = {
        email: email,
        password: password
      };
      const user = await Login(credentials);
      
      if (!user) {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error(error);
      throw error; // Re-throw to allow caller to handle the error
    }
  };
  
  const signup = async (name: string, email: string, password: string, website?: string): Promise<void> => {
    try {
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const data: SignupData = {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Password: password,
        ConfirmPassword: password,
      };
      await Signup(data);
    } catch (error) {
      console.error(error);
    }
  };
  
  const logout = async (): Promise<void> => {
    await Logout();
  };
  
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    // Simulate API call during transition
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (user) {
          const updatedUser = { ...user, ...data };
          setUser(updatedUser);
          resolve();
        } else {
          reject(new Error("User not found"));
        }
      }, 1000);
    });
  };
  
  const regenerateApiKey = async (): Promise<void> => {
    // Simulate API call during transition
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (user) {
          const newApiKey = `sk_test_WooProductsAI_${Math.random().toString(36).substring(2, 15)}`;
          const updatedUser = { ...user, apiKey: newApiKey };
          setUser(updatedUser);
          resolve();
        } else {
          reject(new Error("User not found"));
        }
      }, 1500);
    });
  };
  
  const generateContent = async (type: string, title: string): Promise<void> => {
    // Simulate API call during transition
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (user && userStats) {
          // Update stats based on content type
          const updatedStats = { ...userStats };

          if (type === "product_description") {
            updatedStats.productDescriptionsGenerated += 1;
          } else if (type === "blog_post") {
            updatedStats.blogPostsGenerated += 1;
          }

          updatedStats.apiCalls += 1;
          setUserStats(updatedStats);
          resolve();
        } else {
          reject(new Error("User not found"));
        }
      }, 2000);
    });
  };
  
  const resetPassword = async (email: string): Promise<void> => {
    try {
      const data: ForgotPasswordData = {
        Email: email
      };
      await ForgotPassword(data);
    } catch (error) {
      console.error(error);
    }
  };
  
  const verifyOtp = async (email: string, otp: string): Promise<void> => {
    try {
      const data: VerifyOtpData = {
        Email: email,
        Otp: otp
      };
      await VerifyOtp(data);
    } catch (error) {
      console.error(error);
    }
  };
  
  const setNewPassword = async (email: string, otp: string, newPassword: string): Promise<void> => {
    try {
      const data: ResetPasswordData = {
        Email: email,
        ResetToken: otp,
        NewPassword: newPassword
      };
      await ResetPassword(data);
    } catch (error) {
      console.error(error);
    }
  };
  
  const adminLogin = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate admin authentication during transition
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === "admin@example.com" && password === "adminpassword") {
          setUser(adminUser as User);
          setUserStats(null);
          setIsAuthenticated(true);
          setIsAdmin(true);
          setIsLoading(false);
          resolve();
        } else {
          setIsLoading(false);
          reject(new Error("Invalid admin credentials"));
        }
      }, 1000);
    });
  };
  
  // Legacy method for backward compatibility
  const googleLogin = async (token: string): Promise<void> => {
    const user = await GoogleLogin(token);
    
    if (!user) {
      throw new Error(error || 'Google login failed');
    }
  };
  
  const value = {
    user,
    userStats,
    isAuthenticated,
    isLoading,
    isAdmin,
    error,
    // New API methods
    Login,
    Signup,
    Logout,
    ForgotPassword,
    VerifyOtp,
    ResetPassword,
    RefreshUser,
    ClearError,
    GoogleLogin,
    GoogleSignup,
    // Old methods for backwards compatibility
    login,
    signup,
    logout,
    updateProfile,
    regenerateApiKey,
    generateContent,
    resetPassword,
    verifyOtp,
    setNewPassword,
    adminLogin,
    googleLogin,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Primary export with PascalCase (following project convention)
export function UseAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('UseAuth must be used within an AuthProvider');
  }
  return context;
}

// Alternative export with camelCase (for compatibility)
export const useAuth = UseAuth;

export default AuthContext; 