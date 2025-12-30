"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/components/theme-provider"

export function AnimatedThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-lg bg-transparent hover:bg-muted flex items-center justify-center transition-colors"
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-foreground"
      >
        {/* Sun rays - visible in dark mode */}
        <motion.g
          initial={false}
          animate={{
            opacity: isDark ? 1 : 0,
            rotate: isDark ? 0 : 45,
            scale: isDark ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </motion.g>

        {/* Sun circle / Moon */}
        <motion.circle
          cx="12"
          cy="12"
          initial={false}
          animate={{
            r: isDark ? 5 : 9,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />

        {/* Moon cutout */}
        <motion.circle
          cx="12"
          cy="12"
          r="9"
          fill="currentColor"
          initial={false}
          animate={{
            cx: isDark ? 12 : 18,
            cy: isDark ? 12 : 6,
            r: isDark ? 0 : 8,
            opacity: isDark ? 0 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ fill: "hsl(var(--background))" }}
        />
      </motion.svg>
    </motion.button>
  )
}
