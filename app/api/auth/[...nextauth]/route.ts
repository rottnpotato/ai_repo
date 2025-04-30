// Removed static exports configuration
// export const dynamic = 'force-static';
// export function generateStaticParams() {...}

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { AuthOptions } from "next-auth"

// Note: We're now using our NestJS backend for authentication
// This file is only maintained for compatibility with components
// that might still be using NextAuth session logic

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // For now, we'll use the mock login from our existing auth context
          // In a real implementation, you would validate against your DB or API
          const mockUser = {
            id: "user_1",
            name: "John Smith",
            email: credentials.email,
            image: null,
          }
          
          return mockUser
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 