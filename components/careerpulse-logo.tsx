"use client"

import { motion } from "framer-motion"

export function CareerPulseLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {/* Rocket/Arrow Icon with Pulse Effect */}
        <div className="w-9 h-9 bg-gradient-to-br from-white via-gray-200 to-gray-400 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
          {/* Rocket Shape */}
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            className="w-5 h-5 text-black z-10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
          {/* Pulse Ring Effect */}
          <motion.div 
            className="absolute inset-0 rounded-xl border-2 border-white/50"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        {/* Accent Dot */}
        <motion.div 
          className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg"
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-foreground leading-tight tracking-tight">
          CareerPulse
        </span>
        <span className="text-[10px] font-medium text-foreground/60 tracking-widest uppercase">
          AI Coach
        </span>
      </div>
    </div>
  )
}
