"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { UseWordPressAuth } from "@/contexts/WordPressAuthContext"
import { useToast } from "@/hooks/use-toast"
import Script from "next/script"

interface SignupFormProps {
  activationToken: string | null
  redirectBack: string | null
}

// Hardcoded client ID as fallback (same as in .env.local)
const GOOGLE_CLIENT_ID = "953309403031-68ev06n48b53l7nj60m36q419cnjrbj4.apps.googleusercontent.com";

// Helper function to safely get the Google client ID
const getGoogleClientId = () => {
  // Try to access the environment variable
  const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  // Log for debugging
  console.log("[WP-GoogleAuth] Environment variable access attempt:", 
    envClientId ? "Found" : "Not found or empty");
  
  // Return environment variable if available, otherwise use fallback
  return envClientId || GOOGLE_CLIENT_ID;
};

export function SignupForm({ activationToken, redirectBack }: SignupFormProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false)
  const [googleButtonError, setGoogleButtonError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [mountId, setMountId] = useState(Date.now())
  
  const { SignupForWordPress, GoogleSignupForWordPress, isLoading, error, ClearError } = UseWordPressAuth()
  const { toast } = useToast()
  const router = useRouter()
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // When component mounts or remounts
  useEffect(() => {
    console.log("[WP-GoogleAuth] Signup form mounted/remounted");
    mountedRef.current = true;
    setMountId(Date.now()); // Generate new mount ID
    setGoogleButtonRendered(false); // Reset button state
    setGoogleButtonError(false); // Clear error state
    setRetryCount(0); // Reset retry counter
    
    // If Google script is already loaded, try to initialize
    if (window.google && window.google.accounts) {
      console.log("[WP-GoogleAuth] Google API already available on mount, initializing button");
      setGoogleScriptLoaded(true);
      setTimeout(() => {
        if (mountedRef.current) {
          initializeGoogleSignIn();
        }
      }, 100);
    }

    return () => {
      mountedRef.current = false;
      console.log("[WP-GoogleAuth] Signup form unmounted");
    };
  }, []); 

  // Handle Google Script Load
  const handleGoogleScriptLoad = () => {
    if (!mountedRef.current) return;
    
    setGoogleScriptLoaded(true);
    console.log("[WP-GoogleAuth] Google Sign-In API script loaded successfully");
    
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
      console.error("[WP-GoogleAuth] Google Sign-In API not available");
      
      // Retry initialization if we haven't exceeded max retries
      if (retryCount < 3) {
        console.log(`[WP-GoogleAuth] Retrying initialization (attempt ${retryCount + 1}/3)...`);
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
      
      console.log("[WP-GoogleAuth] Using Google Client ID:", clientId);
      
      if (!clientId) {
        console.error("[WP-GoogleAuth] No Google Client ID available!");
        setGoogleButtonError(true);
        return;
      }
      
      // Clear any previous error state
      setGoogleButtonError(false);

      // Check if googleButtonRef is available
      if (!googleButtonRef.current) {
        console.error("[WP-GoogleAuth] Button container ref not available");
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
          text: "signup_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: googleButtonRef.current.offsetWidth,
        });
        
        console.log("[WP-GoogleAuth] Google Sign-In button rendered");
        setGoogleButtonRendered(true);
      }
    } catch (error) {
      console.error("[WP-GoogleAuth] Error initializing Google Sign-In:", error);
      setGoogleButtonError(true);
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!mountedRef.current) return;
    
    try {
      console.log("WordPress Google credential response received:", response);
      
      // Get the Google ID token from response
      const googleToken = response.credential;
      
      if (!googleToken) {
        throw new Error("No Google token received");
      }
      
      console.log("Sending Google token to backend...");
      
      // Use the WordPress specific Google signup function
      const result = await GoogleSignupForWordPress(googleToken);
      
      if (result && result.user && result.accessToken) {
        toast({
          title: "Google Signup Successful",
          description: "Your account has been created with Google.",
        });
        
        // Redirect to subscription page with the tokens
        redirectToSubscription(result.accessToken);
      } else {
        toast({
          title: "Google Signup Failed",
          description: "Unable to create account with Google.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("WordPress Google signup error:", err);
      toast({
        title: "Google Signup Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return
    }
    
    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return
    }
    
    ClearError();
    
    try {
      // Signup using WordPress auth context
      const result = await SignupForWordPress({
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Password: password,
        ConfirmPassword: confirmPassword
      });
      
      if (result && result.user && result.accessToken) {
        toast({
          title: "Signup Successful",
          description: "Your account has been created successfully.",
        });
        
        // Redirect to subscription page with the tokens
        redirectToSubscription(result.accessToken);
      } else {
        toast({
          title: "Signup Failed",
          description: error || "Account creation failed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast({
        title: "Signup Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  }

  const redirectToSubscription = (accessToken: string) => {
    if (!activationToken || !redirectBack) {
      toast({
        title: "Missing Information",
        description: "Required WordPress integration parameters are missing",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to the subscription page with the necessary tokens
    router.push(`/wordpress-activation/subscription?activation_token=${encodeURIComponent(activationToken)}&redirect_back=${encodeURIComponent(redirectBack)}&access_token=${encodeURIComponent(accessToken)}`);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }
  
  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={handleGoogleScriptLoad}
        strategy="afterInteractive"
      />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="firstName"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
                required
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="lastName"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
                required
                className="pl-10"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="password"
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="pl-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="confirmPassword"
              type={isConfirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              className="pl-10"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {isConfirmPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing up...
            </>
          ) : (
            "Sign up"
          )}
        </Button>
        
        <div className="relative flex items-center justify-center my-4">
          <Separator className="absolute w-full" />
          <span className="relative px-2 bg-white text-xs text-gray-500">OR CONTINUE WITH</span>
        </div>
        
        {/* Google Sign-In Button */}
        <div className="flex flex-col items-center space-y-3">
          <div 
            ref={googleButtonRef} 
            className={`w-full h-10 flex justify-center items-center ${googleButtonError ? 'hidden' : ''}`}
          >
            {!googleScriptLoaded && !googleButtonRendered && (
              <div className="flex items-center justify-center w-full h-10 border border-gray-300 rounded-md">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          
          {googleButtonError && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => window.google?.accounts.id.prompt()}
              disabled={!googleScriptLoaded}
            >
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="w-5 h-5 mr-2"
              />
              Sign up with Google
            </Button>
          )}
        </div>
      </form>
    </>
  )
} 