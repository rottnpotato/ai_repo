"use client"

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AuthService, LoginCredentials, SignupData } from '../lib/services/AuthService';

// WordPress Activation Context Types
interface WordPressAuthContextType {
  isLoading: boolean;
  error: string | null;
  LoginForWordPress: (credentials: LoginCredentials) => Promise<{user: any; accessToken: string} | null>;
  SignupForWordPress: (data: SignupData) => Promise<{user: any; accessToken: string} | null>;
  GoogleLoginForWordPress: (token: string) => Promise<{user: any; accessToken: string} | null>;
  GoogleSignupForWordPress: (token: string) => Promise<{user: any; accessToken: string} | null>;
  ClearError: () => void;
}

const WordPressAuthContext = createContext<WordPressAuthContextType | undefined>(undefined);

interface WordPressAuthProviderProps {
  children: ReactNode;
}

export function WordPressAuthProvider({ children }: WordPressAuthProviderProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const LoginForWordPress = async (credentials: LoginCredentials): Promise<{user: any; accessToken: string} | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use existing AuthService but don't store token in localStorage
      const response = await AuthService.Login({
        email: credentials.email,
        password: credentials.password
      });
      
      console.log("WordPress Login response:", response);
      
      if (response.success && response.user && response.accessToken) {
        // Do not store token in localStorage, return it instead
        return {
          user: response.user,
          accessToken: response.accessToken
        };
      } else {
        setError(response.message || "Login failed");
        return null;
      }
    } catch (err) {
      console.error("WordPress Login error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const SignupForWordPress = async (data: SignupData): Promise<{user: any; accessToken: string} | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use existing AuthService but don't store token in localStorage
      const response = await AuthService.Register(data);
      
      console.log("WordPress Signup response:", response);
      
      if (response.success && response.user && response.accessToken) {
        // Do not store token in localStorage, return it instead
        return {
          user: response.user,
          accessToken: response.accessToken
        };
      } else {
        setError(response.message || "Signup failed");
        return null;
      }
    } catch (err) {
      console.error("WordPress Signup error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const GoogleLoginForWordPress = async (token: string): Promise<{user: any; accessToken: string} | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.GoogleLogin({
        GoogleToken: token
      });
      
      console.log("WordPress Google Login response:", response);
      
      if (response.success && response.user && response.accessToken) {
        // Do not store token in localStorage, return it instead
        return {
          user: response.user,
          accessToken: response.accessToken
        };
      } else {
        setError(response.message || "Google login failed");
        return null;
      }
    } catch (err) {
      console.error("WordPress Google Login error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const GoogleSignupForWordPress = async (token: string): Promise<{user: any; accessToken: string} | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.GoogleRegister({
        GoogleToken: token
      });
      
      console.log("WordPress Google Signup response:", response);
      
      if (response.success && response.user && response.accessToken) {
        // Do not store token in localStorage, return it instead
        return {
          user: response.user,
          accessToken: response.accessToken
        };
      } else {
        setError(response.message || "Google signup failed");
        return null;
      }
    } catch (err) {
      console.error("WordPress Google Signup error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const ClearError = () => setError(null);
  
  const value = {
    isLoading,
    error,
    LoginForWordPress,
    SignupForWordPress,
    GoogleLoginForWordPress,
    GoogleSignupForWordPress,
    ClearError
  };
  
  return (
    <WordPressAuthContext.Provider value={value}>
      {children}
    </WordPressAuthContext.Provider>
  );
}

export function UseWordPressAuth(): WordPressAuthContextType {
  const context = useContext(WordPressAuthContext);
  
  if (context === undefined) {
    throw new Error("UseWordPressAuth must be used within a WordPressAuthProvider");
  }
  
  return context;
}

export default WordPressAuthContext; 