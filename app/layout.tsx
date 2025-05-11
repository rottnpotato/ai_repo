"use client"

import type React from "react"
import "./globals.css"
import { Figtree } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "next-auth/react"
import Head from "next/head"
import { WordPressIntegrationProvider } from "@/contexts/WordPressIntegrationContext"

const figtree = Figtree({ subsets: ["latin"] })

/**
 * Root layout component
 * 
 * Note on authentication:
 * - Primary authentication is handled through our AuthProvider (contexts/AuthContext.tsx)
 * - NextAuth SessionProvider is included for compatibility during the transition
 * - With static exports, API routes requiring server functionality won't be available
 * 
 * WordPress Integration:
 * - WordPressIntegrationProvider maintains integration status at the app level
 * - Status persists across user changes while the app is running
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Amperly AI | Automate customer interactions with AI</title>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={figtree.className}>
        {/* SessionProvider is maintained for backward compatibility */}
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {/* Main authentication is now handled by AuthProvider with NestJS backend */}
            <AuthProvider>
              <WordPressIntegrationProvider>
                <main className="min-h-screen bg-background">{children}</main>
                <Toaster />
              </WordPressIntegrationProvider>
            </AuthProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
