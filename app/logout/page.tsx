"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut } from "lucide-react"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function LogoutPage() {
  const { logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(true)
  const [hasLoggedOut, setHasLoggedOut] = useState(false)

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Only perform logout if user is authenticated and hasn't already logged out
        if (isAuthenticated && !hasLoggedOut) {
          setHasLoggedOut(true)
          await logout()
          toast({
            title: "Logged out successfully",
            description: "You have been logged out of your account.",
          })
        } else if (!isAuthenticated) {
          // Already logged out, just redirect
          setIsLoggingOut(false)
          setTimeout(() => {
            router.push("/login")
          }, 500)
          return
        }
      } catch (error) {
        console.error("Logout error:", error)
        toast({
          title: "Logout Error",
          description: "There was an error logging out. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoggingOut(false)
        // Short delay before redirecting to login page
        setTimeout(() => {
          router.push("/login")
        }, 1500)
      }
    }

    performLogout()
  }, [logout, router, toast, isAuthenticated, hasLoggedOut])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-amperly-light p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden p-8">
          {isLoggingOut ? (
            <div className="py-6">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amperly-primary"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Logging out...</h2>
              <p className="text-gray-600 mt-2">Please wait while we securely log you out.</p>
            </div>
          ) : (
            <div className="py-6">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <LogOut className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Logged Out Successfully</h2>
              <p className="text-gray-600 mt-2">You have been securely logged out of your account.</p>
              <p className="text-gray-600 mt-1">Redirecting to login page...</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push("/login")}
            className="text-sm font-medium text-amperly-primary hover:text-amperly-primary-hover"
          >
            Return to Login
          </button>
        </div>
      </motion.div>
    </div>
  )
}
