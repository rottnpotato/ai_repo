"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { resetPassword, verifyOtp, setNewPassword: updatePassword } = useAuth()
  
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPasswordValue] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: Email, 2: OTP, 3: New Password

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await resetPassword(email)
      setCurrentStep(2)
      toast({
        title: "Check Your Email",
        description: "We've sent a verification code to your email address.",
      })
    } catch (error) {
      console.error("Reset password error:", error)
      toast({
        title: "Failed to Send Code",
        description: "There was an error sending the verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await verifyOtp(email, otp)
      setCurrentStep(3)
      toast({
        title: "OTP Verified",
        description: "Your verification code has been successfully verified.",
      })
    } catch (error) {
      console.error("OTP verification error:", error)
      toast({
        title: "Invalid Code",
        description: "The verification code is invalid or has expired. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await updatePassword(email, otp, newPassword)
      toast({
        title: "Password Reset Successfully",
        description: "Your password has been reset. You can now log in with your new password.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Password reset error:", error)
      toast({
        title: "Password Reset Failed",
        description: "There was an error resetting your password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-amperly-light-radial p-4">
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
              <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
              <p className="text-gray-600 mt-2">
                {currentStep === 1 && "Enter your email to reset your password"}
                {currentStep === 2 && "Enter the verification code sent to your email"}
                {currentStep === 3 && "Enter your new password"}
              </p>
            </div>

            {currentStep === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
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

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>

                <div className="mt-4 text-center">
                  <Link href="/login" className="text-sm font-medium text-amperly-primary hover:text-amperly-primary-hover">
                    Return to login
                  </Link>
                </div>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-sm font-medium text-amperly-primary hover:text-amperly-primary-hover"
                  >
                    Back to previous step
                  </button>
                </div>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={handleNewPasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-sm font-medium text-amperly-primary hover:text-amperly-primary-hover"
                  >
                    Back to previous step
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
} 