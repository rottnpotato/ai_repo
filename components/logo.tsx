"use client"

import type { FC } from "react"
import Link from "next/link"
import Image from "next/image"
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
        <Image
          src="/amperly-icon-512-2022.png"
          alt="Amperly AI Logo"
          width={size === "lg" ? 40 : size === "md" ? 32 : 24}
          height={size === "lg" ? 40 : size === "md" ? 32 : 24}
          className={`${sizes[size]} rounded-md`}
          priority
        />
      </div>
      {withText && (
        <span className={`font-bold ${textSizes[size]} text-gradient-amperly`}>
          Amperly<span className="text-foreground/90">AI</span>
        </span>
      )}
    </Link>
  )
}
