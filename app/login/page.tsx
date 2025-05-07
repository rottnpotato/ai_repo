"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
// import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import Script from "next/script"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Declare global google type for TypeScript
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

// Hardcoded client ID as fallback (same as in .env.local)
const GOOGLE_CLIENT_ID = "953309403031-68ev06n48b53l7nj60m36q419cnjrbj4.apps.googleusercontent.com";

// Helper function to safely get the Google client ID
const getGoogleClientId = () => {
  // Try to access the environment variable
  const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  // Log for debugging
  console.log("[GoogleAuth] Environment variable access attempt:", 
    envClientId ? "Found" : "Not found or empty");
  
  // Return environment variable if available, otherwise use fallback
  return envClientId || GOOGLE_CLIENT_ID;
};

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false)
  const [googleButtonError, setGoogleButtonError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [mountId, setMountId] = useState(Date.now()) // Unique ID for each mount
  const authContext = useAuth()
  const { Login, GoogleLogin } = authContext
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  // const { data: session } = useSession()
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // Check if user is already authenticated and redirect if needed
  useEffect(() => {
    if (authContext.isAuthenticated && authContext.user) {
      const isUserAdmin = authContext.user.role === "admin";
      console.log("User already authenticated, redirecting...");
      
      // Redirect to the appropriate page based on user role
      if (isUserAdmin) {
        router.replace("/admin/users");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [authContext.isAuthenticated, authContext.user, router]);

  // When component mounts or remounts
  useEffect(() => {
    console.log("[GoogleAuth] Login page mounted/remounted");
    mountedRef.current = true;
    setMountId(Date.now()); // Generate new mount ID
    setGoogleButtonRendered(false); // Reset button state
    setGoogleButtonError(false); // Clear error state
    setRetryCount(0); // Reset retry counter
    
    // If Google script is already loaded, try to initialize
    if (window.google && window.google.accounts) {
      console.log("[GoogleAuth] Google API already available on mount, initializing button");
      setGoogleScriptLoaded(true);
      setTimeout(() => {
        if (mountedRef.current) {
          initializeGoogleSignIn();
        }
      }, 100);
    }

    return () => {
      mountedRef.current = false;
      console.log("[GoogleAuth] Login page unmounted");
    };
  }, [pathname]); // Re-run when pathname changes (navigation)

  // Handle Google Script Load
  const handleGoogleScriptLoad = () => {
    if (!mountedRef.current) return;
    
    setGoogleScriptLoaded(true);
    console.log("[GoogleAuth] Google Sign-In API script loaded successfully");
    
    // Wait a bit to ensure script is fully initialized
    setTimeout(() => {
      if (mountedRef.current) {
        initializeGoogleSignIn();
      }
    }, 100);
  };

  // Initialize Google Sign-In
  const initializeGoogleSignIn = () => {
    if (!mountedRef.current) return;
    
    if (!window.google || !window.google.accounts) {
      console.error("[GoogleAuth] Google Sign-In API not available");
      
      // Retry initialization if we haven't exceeded max retries
      if (retryCount < 3) {
        console.log(`[GoogleAuth] Retrying initialization (attempt ${retryCount + 1}/3)...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (mountedRef.current) {
            initializeGoogleSignIn();
          }
        }, 1000); // Wait 1 second before retrying
        return;
      } else {
        setGoogleButtonError(true);
        return;
      }
    }

    try {
      // Get client ID using our helper function
      const clientId = getGoogleClientId();
      
      console.log("[GoogleAuth] Using Google Client ID:", clientId);
      
      if (!clientId) {
        console.error("[GoogleAuth] No Google Client ID available!");
        setGoogleButtonError(true);
        return;
      }
      
      // Clear any previous error state
      setGoogleButtonError(false);

      // Check if googleButtonRef is available
      if (!googleButtonRef.current) {
        console.error("[GoogleAuth] Button container ref not available");
        setTimeout(() => {
          if (mountedRef.current) {
            initializeGoogleSignIn();
          }
        }, 500);
        return;
      }

      // Initialize the Google Sign-In
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear the container before rendering
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
        
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: googleButtonRef.current.offsetWidth,
        });
        
        console.log("[GoogleAuth] Google Sign-In button rendered");
        setGoogleButtonRendered(true);
      }
    } catch (error) {
      console.error("[GoogleAuth] Error initializing Google Sign-In:", error);
      setGoogleButtonError(true);
    }
  };

  useEffect(() => {
    // Log the client ID for debugging using our helper function
    const clientId = getGoogleClientId();
    console.log("[GoogleAuth] Client ID availability check:", 
      clientId ? "Available" : "Not available");
    
    // Check if the Google API is already loaded
    if (googleScriptLoaded && window.google && googleButtonRef.current && !googleButtonRendered) {
      initializeGoogleSignIn();
    }
    
    // Setup periodic check to ensure button is rendered
    const checkInterval = setInterval(() => {
      if (mountedRef.current && googleScriptLoaded && !googleButtonRendered && !googleButtonError && retryCount < 3) {
        console.log("[GoogleAuth] Periodic check - button not rendered yet, retrying...");
        initializeGoogleSignIn();
      }
    }, 2000);
    
    // Cleanup
    return () => {
      clearInterval(checkInterval);
    };
  }, [googleScriptLoaded, googleButtonRendered, googleButtonError, retryCount, mountId]);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!mountedRef.current) return;
    
    try {
      console.log("Google credential response received:", response);
      setIsGoogleLoading(true);
      
      // Get the Google ID token from response
      const googleToken = response.credential;
      
      if (!googleToken) {
        throw new Error("No Google token received");
      }
      
      console.log("Sending Google token to backend...");
      
      // Use our GoogleLogin method from auth context
      const user = await GoogleLogin(googleToken);
      
      if (user) {
        console.log("Google login successful");
        toast({
          title: "Login Successful",
          description: "You have successfully signed in with Google.",
        });
        
        if (!mountedRef.current) return;
        
        // Access role directly from the returned user object
        const userRole = user.role;
        const isUserAdmin = userRole === "admin";
        
        console.log("User from Google login:", user);
        console.log("User role:", userRole);
        console.log("Is user admin:", isUserAdmin);
        
        // Redirect based on role, using replace to handle navigation history properly
        if (isUserAdmin) {
          router.replace("/admin/users");
        } else {
          router.replace("/dashboard");
        }
      } else {
        throw new Error("Google login failed on the server");
      }
    } catch (error) {
      console.error("Google login error:", error);
      if (mountedRef.current) {
        toast({
          title: "Google Login Failed",
          description: error instanceof Error ? error.message : "There was an error signing in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsGoogleLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Unified login using the API-based Login method
      const credentials = {
        email: email,
        password: password
      };
      
      const user = await Login(credentials);
      
      if (user) {
        // Success - use the returned user object directly
        toast({
          title: "Login Successful",
          description: "You have been successfully logged in.",
        });
        
        // Access role directly from the returned user object
        const userRole = user.role;
        const isUserAdmin = userRole === "admin";
        
        console.log("User from login:", user);
        console.log("User role:", userRole);
        console.log("Is user admin:", isUserAdmin);
        
        // Redirect based on role, using replace to handle navigation history properly
        if (isUserAdmin) {
          router.replace("/admin/users");
        } else {
          router.replace("/dashboard");
        }
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      
      // For modern Google Sign-In API using One Tap
      if (window.google && window.google.accounts) {
        window.google.accounts.id.prompt();
        console.log("Google One Tap prompt triggered");
      } else {
        console.error("Google Sign-In API not available");
        // Display a warning toast
        toast({
          title: "Google Sign-In Not Available",
          description: "Google Sign-In is not available at the moment. Please try using email and password instead.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Google login error:", error)
      toast({
        title: "Google Login Failed",
        description: "There was an error signing in with Google. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  // Render Google Button or Fallback
  const renderGoogleSignInOption = () => {
    if (googleButtonError) {
      return (
        <div className="mb-6">
          <Alert className="mb-4 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Google Sign-In button couldn't be loaded. You can try the manual option below or use email/password.
            </AlertDescription>
          </Alert>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={handleManualGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
            )}
            Sign in with Google
          </Button>
        </div>
      );
    }
    
    return (
      <div className="mb-6">
        {/* Google Sign-In Button */}
        <div 
          ref={googleButtonRef} 
          className="w-full min-h-[40px] flex justify-center" 
          key={`google-btn-${mountId}`}
        ></div>
        {!googleButtonRendered && googleScriptLoaded && !googleButtonError && (
          <div className="mt-2 flex justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="ml-2 text-xs text-gray-500">Loading Google Sign-In...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Load Google Sign-In API */}
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={handleGoogleScriptLoad}
        onError={(e) => {
          console.error("Error loading Google Sign-In script:", e);
          setGoogleButtonError(true);
        }}
        strategy="afterInteractive"
      />
    
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-2">
                  <Logo size="lg" />
                </div>
                <p className="text-gray-600 mt-2">Sign in to your account</p>
              </div>

              {renderGoogleSignInOption()}

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                      onClick={togglePasswordVisibility}
                      aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="font-medium text-orange-600 hover:text-orange-500">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
