"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "secondary"
  size?: "sm" | "default" | "lg" | "xl"
}

const variantStyles = {
  primary: {
    border: "border-primary",
    text: "text-primary",
    hoverBg: "bg-primary",
    hoverText: "text-primary-foreground",
  },
  success: {
    border: "border-success",
    text: "text-success",
    hoverBg: "bg-success",
    hoverText: "text-success-foreground",
  },
  warning: {
    border: "border-warning",
    text: "text-warning",
    hoverBg: "bg-warning",
    hoverText: "text-warning-foreground",
  },
  danger: {
    border: "border-destructive",
    text: "text-destructive",
    hoverBg: "bg-destructive",
    hoverText: "text-destructive-foreground",
  },
  secondary: {
    border: "border-muted-foreground",
    text: "text-muted-foreground",
    hoverBg: "bg-muted-foreground",
    hoverText: "text-background",
  },
}

const sizeStyles = {
  sm: "h-9 px-4 text-xs rounded-md",
  default: "h-11 px-5 py-2.5 text-sm rounded-lg",
  lg: "h-12 px-8 text-base rounded-lg",
  xl: "h-14 px-10 text-lg rounded-xl",
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ className, variant = "primary", size = "default", children, disabled, ...props }, ref) => {
  const styles = variantStyles[variant]
  const sizeStyle = sizeStyles[size]

  return (
    <motion.button
      ref={ref}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
        "border-2 bg-transparent overflow-hidden",
        "transition-colors duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        styles.border,
        styles.text,
        sizeStyle,
        className
      )}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      whileHover={disabled ? {} : "hover"}
      initial="initial"
      {...props}
    >
      {/* Background fill animation */}
      <motion.span
        className={cn(
          "absolute inset-0 z-0",
          styles.hoverBg
        )}
        variants={{
          initial: { scaleX: 0 },
          hover: { scaleX: 1 },
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ originX: 0 }}
      />
      
      {/* Content */}
      <motion.span
        className="relative z-10 flex items-center justify-center gap-2"
        variants={{
          initial: { color: "inherit" },
          hover: { color: "inherit" },
        }}
      >
        <span className={cn(
          "transition-colors duration-300",
          `group-hover:${styles.hoverText}`
        )}>
          {children}
        </span>
      </motion.span>
    </motion.button>
  )
})

InteractiveHoverButton.displayName = "InteractiveHoverButton"

export { InteractiveHoverButton }
