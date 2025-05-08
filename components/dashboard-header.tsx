"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronDown, Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { UserDropdown } from "@/components/user-dropdown"

export default function DashboardHeader() {
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [displayName, setDisplayName] = useState("")

  useEffect(() => {
    if (user) {
      const name = user.firstName 
        ? `${user.firstName} ${user.lastName || ""}`
        : user.email || "User";
      setDisplayName(name.trim());
    }
  }, [user]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/dashboard" className="flex items-center">
            <Logo className="h-8 w-8" />
            <span className="ml-2 hidden text-xl font-bold sm:inline-block">Amperly AI</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Settings
            </Link>
            <Link 
              href="/subscription" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Subscription
            </Link>
          </nav>
        </div>

        {user && (
          <UserDropdown userName={displayName}>
            <div className="flex items-center gap-2">
              <div className="flex flex-col space-y-0.5">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </UserDropdown>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 h-[calc(100vh-4rem)] w-full bg-white p-6 md:hidden">
          <nav className="flex flex-col gap-6">
            <Link 
              href="/dashboard" 
              className="text-lg font-medium transition-colors hover:text-primary"
              onClick={closeMenu}
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="text-lg font-medium transition-colors hover:text-primary"
              onClick={closeMenu}
            >
              Settings
            </Link>
            <Link 
              href="/subscription" 
              className="text-lg font-medium transition-colors hover:text-primary"
              onClick={closeMenu}
            >
              Subscription
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
} 