"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Home,
  Database,
  CreditCard,
  Shield,
  Package,
  Coins,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  const menuItems = [
    // {
    //   name: "Dashboard",
    //   href: "/admin",
    //   icon: BarChart3,
    // },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Token Usage",
      href: "/admin/token-usage",
      icon: Coins,
    },
    // {
    //   name: "API Usage",
    //   href: "/admin/api-usage",
    //   icon: Database,
    // },
    // {
    //   name: "Billing",
    //   href: "/admin/billing",
    //   icon: CreditCard,
    // },
    {
      name: "Subscription Plans",
      href: "/admin/subscription-plans",
      icon: Package,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
    // {
    //   name: "Security",
    //   href: "/admin/security",
    //   icon: Shield,
    // },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col max-h-screen sticky top-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
          <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
            {!collapsed ? (
              <Logo withText size="md" className="text-sidebar-foreground" />
            ) : (
              <div className="w-8 h-8 rounded-md bg-sidebar-foreground flex items-center justify-center">
                <span className="text-sidebar font-bold text-lg">A</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-border"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="py-4 flex-grow">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => {
              // Check if the current path matches this menu item
              // Handle exact match for dashboard and partial matches for sub-routes
              const isActive = 
                item.href === "/admin" 
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
                
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center py-2 px-3 rounded-md text-sidebar-foreground/80 hover:bg-sidebar-border transition-colors",
                    collapsed ? "justify-center" : "",
                    isActive && "bg-sidebar-border font-medium text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center mb-4">
            {!collapsed && (
              <div className="ml-3">
                <p className="font-medium text-sidebar-foreground">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/70">Administrator</p>
              </div>
            )}
          </div>
          <div className="flex">
            <Button
              variant="outline"
              size={collapsed ? "icon" : "default"}
              onClick={() => router.push("/")}
              className={cn(
                "flex-1 border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-border",
                collapsed ? "w-full" : "mr-2"
              )}
            >
              <Home className={cn("h-4 w-4", collapsed ? "" : "mr-2")} />
              {!collapsed && "Home"}
            </Button>
            {!collapsed && (
              <Button
                variant="outline"
                size={collapsed ? "icon" : "default"}
                onClick={() => router.push("/logout")}
                className="flex-1 border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-border"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  )
} 