"use client"

import type { FC } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  withText?: boolean
  className?: string
}

export const Logo: FC<LogoProps> = ({ size = "md", withText = true, className = "" }) => {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <Link href="/dashboard" className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className={`${sizes[size]} rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center`}
        >
          <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
            <div
              className={`${size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"} rounded-full bg-gradient-to-br from-orange-400 to-red-600`}
            ></div>
          </div>
        </motion.div>
      </div>
      {withText && (
        <div className="flex flex-col">
          <span
            className={`font-bold ${textSizes[size]} bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent leading-tight`}
          >
            WooProducts
          </span>
          {size !== "sm" && <span className="text-xs font-medium text-gray-500 -mt-1">AI-powered content</span>}
        </div>
      )}
    </Link>
  )
}
