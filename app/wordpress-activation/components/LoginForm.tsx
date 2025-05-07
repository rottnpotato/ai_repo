"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { UseWordPressAuth } from "@/contexts/WordPressAuthContext"
import { UseWordPressIntegration } from "@/contexts/WordPressIntegrationContext"
import { useToast } from "@/hooks/use-toast"
import Script from "next/script"

interface LoginFormProps {
  activationToken: string | null
  redirectBack: string | null
}

// Hardcoded client ID as fallback (same as in .env.local)
const GOOGLE_CLIENT_ID = "asd";

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

export function LoginForm({ activationToken, redirectBack }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false)
  const [googleButtonError, setGoogleButtonError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [mountId, setMountId] = useState(Date.now())
  
  const { LoginForWordPress, GoogleLoginForWordPress, isLoading, error, ClearError } = UseWordPressAuth()
  const { SetIntegrationActive } = UseWordPressIntegration()
  const { toast } = useToast()
  const router = useRouter()
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // When component mounts or remounts
  useEffect(() => {
    console.log("[WP-GoogleAuth] Login form mounted/remounted");
    console.log("[WP-GoogleAuth] Activation parameters:", { activationToken, redirectBack });
    
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
      console.log("[WP-GoogleAuth] Login form unmounted");
    };
  }, [activationToken, redirectBack]);

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
          text: "signin_with",
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
      console.log("[WP-GoogleAuth] Credential response received:", response);
      
      // Log the WordPress activation parameters for debugging
      console.log("[WP-GoogleAuth] WordPress activation parameters:", {
        activationToken,
        redirectBack
      });
      
      // Store activation parameters in local variables to ensure they're preserved
      const currentActivationToken = activationToken;
      const currentRedirectBack = redirectBack;
      
      // Validate activation parameters
      if (!currentActivationToken) {
        console.warn("[WP-GoogleAuth] Missing activation token for WordPress integration");
      }
      
      // Validate the response object
      if (!response) {
        throw new Error("Empty response received from Google authentication");
      }
      
      // Get the Google ID token from response
      const googleToken = response.credential;
      
      if (!googleToken) {
        throw new Error("No Google token received");
      }
      
      console.log("[WP-GoogleAuth] Sending Google token to backend...");
      
      // Use the WordPress specific Google login function
      const result = await GoogleLoginForWordPress(googleToken);
      
      // Validate result structure
      if (!result) {
        throw new Error("Empty result from Google authentication");
      }
      
      if (result.user && result.accessToken) {
        toast({
          title: "Google Login Successful",
          description: "You've been authenticated with Google.",
        });
        
        // Before redirecting, verify we have the WordPress activation parameters
        console.log("[WP-GoogleAuth] Pre-redirect WordPress parameters check:", {
          activationToken: currentActivationToken,
          redirectBack: currentRedirectBack
        });
        
        // Redirect to subscription page with the WordPress activation tokens
        // Explicitly pass the preserved values to ensure they're not lost
        redirectToSubscription(result.accessToken, currentActivationToken, currentRedirectBack);
      } else {
        console.error("[WP-GoogleAuth] Incomplete authentication result:", result);
        toast({
          title: "Google Login Failed",
          description: "Unable to authenticate with Google. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("[WP-GoogleAuth] Login error:", err);
      toast({
        title: "Google Login Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return
    }
    
    ClearError();
    
    // Store activation parameters in local variables to ensure they're preserved
    const currentActivationToken = activationToken;
    const currentRedirectBack = redirectBack;
    
    try {
      // Login using WordPress auth context
      const result = await LoginForWordPress({ email, password });
      
      if (result && result.user && result.accessToken) {
        toast({
          title: "Login Successful",
          description: "You've been successfully logged in.",
        });
        
        // Redirect to subscription page with the tokens
        redirectToSubscription(result.accessToken, currentActivationToken, currentRedirectBack);
      } else {
        toast({
          title: "Login Failed",
          description: error || "An error has occurred, please try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Login Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  }

  const redirectToSubscription = (
    accessToken: string | undefined, 
    currentActivationToken: string | null = activationToken, 
    currentRedirectBack: string | null = redirectBack
  ) => {
    // Validate that accessToken exists
    if (!accessToken) {
      console.error("[WP-Auth] Missing access token for redirect");
      toast({
        title: "Authentication Error",
        description: "Missing authentication token. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Use empty strings as fallbacks if activationToken or redirectBack are null
    const token = currentActivationToken || '';
    const redirect = currentRedirectBack || '';
    
    // Log for debugging purposes
    console.log("[WP-Auth] Redirecting with params:", { 
      activationToken: token, 
      redirectBack: redirect,
      accessToken 
    });
    
    // Set WordPress integration status as active in the global context
    SetIntegrationActive();
    
    // Navigate to the subscription page with the necessary tokens
    router.push(`/wordpress-activation/subscription?activation_token=${encodeURIComponent(token)}&redirect_back=${encodeURIComponent(redirect)}&access_token=${encodeURIComponent(accessToken)}`);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
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
              placeholder="Enter your password"
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
        </div>
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
            </>
          ) : (
            "Log in"
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
              Sign in with Google
            </Button>
          )}
        </div>
      </form>
    </>
  )
} 