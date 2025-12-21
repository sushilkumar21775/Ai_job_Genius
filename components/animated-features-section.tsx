"use client"

import type React from "react"
import { motion } from "framer-motion"
import { AnimatedGradient } from "@/components/ui/animated-gradient-with-svg"
import { FileText, Video, Target, Compass, TrendingUp, Briefcase } from "lucide-react"

interface BentoCardProps {
  title: string
  value: string | number
  subtitle?: string
  colors: string[]
  delay: number
  icon?: React.ReactNode
}

const BentoCard: React.FC<BentoCardProps> = ({ title, value, subtitle, colors, delay, icon }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay + 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      className="relative overflow-hidden h-full bg-black rounded-lg border border-border/20 group"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      style={{
        filter: "url(#noise)",
      }}
    >
      <AnimatedGradient colors={colors} speed={0.05} blur="medium" />

      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
            mixBlendMode: "overlay",
          }}
        />
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="w-full h-full animate-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "48px 48px, 64px 64px",
            backgroundPosition: "0 0, 24px 24px",
          }}
        />
      </div>

      <div className="absolute inset-0 opacity-80 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shine_4s_ease-in-out_infinite] w-[200%]" />
      </div>

      <motion.div
        className="relative z-10 p-3 sm:p-5 md:p-8 text-foreground backdrop-blur-sm h-full flex flex-col justify-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {icon && (
          <motion.div className="mb-4 text-white/80" variants={item}>
            {icon}
          </motion.div>
        )}
        <motion.h3 className="text-sm sm:text-base md:text-lg text-foreground mb-2" variants={item}>
          {title}
        </motion.h3>
        <motion.p className="text-2xl sm:text-4xl md:text-5xl font-medium mb-4 text-foreground" variants={item}>
          {value}
        </motion.p>
        {subtitle && (
          <motion.p className="text-sm text-foreground/80" variants={item}>
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  )
}

export function AnimatedFeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 bg-black">
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="noise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence baseFrequency="0.4" numOctaves="2" result="noise" seed="2" type="fractalNoise" />
            <feColorMatrix in="noise" type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0.02 0.04 0.06" />
            </feComponentTransfer>
            <feComposite operator="over" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            AI-Powered Career Tools
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to land your dream job, powered by advanced AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[700px]">
          <div className="md:col-span-2">
            <BentoCard
              title="AI Resume Builder"
              value="Professional Resumes"
              subtitle="Create ATS-optimized resumes with AI suggestions, professional templates, and real-time feedback"
              colors={["#1a1a2e", "#16213e", "#1f1f2e"]}
              delay={0.2}
              icon={<FileText className="w-8 h-8" />}
            />
          </div>
          <BentoCard
            title="Mock Interview Coach"
            value="Practice & Excel"
            subtitle="AI-powered video interviews with real-time feedback and personalized tips"
            colors={["#151525", "#252535", "#1d1d2d"]}
            delay={0.4}
            icon={<Video className="w-8 h-8" />}
          />
          <BentoCard
            title="ATS Score Analyzer"
            value="95%+ Match"
            subtitle="Analyze and optimize your resume for any job description"
            colors={["#1c1c2c", "#2c2c3c", "#181828"]}
            delay={0.6}
            icon={<Target className="w-8 h-8" />}
          />
          <div className="md:col-span-2">
            <BentoCard
              title="Career Path Advisor"
              value="Personalized Paths"
              subtitle="Get AI recommendations for your ideal career trajectory based on your skills and goals"
              colors={["#171727", "#272737", "#1b1b2b"]}
              delay={0.8}
              icon={<Compass className="w-8 h-8" />}
            />
          </div>
          <div className="md:col-span-2">
            <BentoCard
              title="Skills Gap Analysis"
              value="Learn & Grow"
              subtitle="Identify skills to learn and get personalized learning recommendations"
              colors={["#131323", "#232333", "#191929"]}
              delay={1}
              icon={<TrendingUp className="w-8 h-8" />}
            />
          </div>
          <BentoCard
            title="Job Matching Engine"
            value="Smart Match"
            subtitle="Get matched with opportunities that fit your profile perfectly"
            colors={["#141424", "#242434", "#1a1a2a"]}
            delay={1.2}
            icon={<Briefcase className="w-8 h-8" />}
          />
        </div>
      </div>
    </section>
  )
}
