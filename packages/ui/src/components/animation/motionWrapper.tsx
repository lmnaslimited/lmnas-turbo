"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface MotionWrapperProps {
  children: ReactNode
}

export function MotionWrapper({ children }: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}
