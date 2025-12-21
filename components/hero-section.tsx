"use client"

import dynamic from "next/dynamic"
import { Button } from "./ui/button"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"

// Dynamic import with SSR disabled to prevent hydration mismatch
const ParticleTextEffect = dynamic(
  () => import("./particle-text-effect").then((mod) => mod.ParticleTextEffect),
  { ssr: false }
)

const InfiniteSlider = dynamic(
  () => import("./ui/infinite-slider").then((mod) => mod.InfiniteSlider),
  { ssr: false }
)

const ProgressiveBlur = dynamic(
  () => import("./ui/progressive-blur").then((mod) => mod.ProgressiveBlur),
  { ssr: false }
)

export function HeroSection() {
  const { isSignedIn, isLoaded } = useAuth()

  // Determine where to redirect based on auth state
  const ctaHref = isLoaded && isSignedIn ? "/dashboard" : "/auth/signup"
  const ctaText = isLoaded && isSignedIn ? "Go to Dashboard" : "Start Free Assessment"

  return (
    <section className="py-20 px-4 relative overflow-hidden min-h-screen flex flex-col justify-between">
      <div className="flex-1 flex items-start justify-center pt-20">
        <ParticleTextEffect words={["CAREER", "SUCCESS", "AI COACH", "DREAM JOB"]} />
      </div>

      <div className="container mx-auto text-center relative z-10 pb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-balance">
            Your AI-Powered Career Accelerator for <span className="text-gray-300">Students, Freshers & Professionals</span>
          </h2>

          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Land your dream job with AI-driven resume building, mock interviews, and personalized career coaching
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-white hover:bg-gray-200 text-black group" asChild>
              <Link href={ctaHref} prefetch={false}>
                {ctaText}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent group">
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          <div className="mt-16 mb-8">
            <div className="group relative m-auto max-w-6xl">
              <div className="flex flex-col items-center md:flex-row">
                <div className="md:max-w-52 md:border-r md:border-gray-600 md:pr-6 mb-4 md:mb-0">
                  <p className="text-end text-sm text-gray-400">Candidates hired at</p>
                </div>
                <div className="relative py-6 md:w-[calc(100%-13rem)]">
                  <InfiniteSlider durationOnHover={20} duration={40} gap={112}>
                    <div className="flex">
                      <img
                        className="mx-auto h-6 w-fit invert opacity-60 hover:opacity-100 transition-opacity"
                        src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                        alt="Google Logo"
                        height="24"
                        width="auto"
                      />
                    </div>

                    <div className="flex">
                      <img
                        className="mx-auto h-6 w-fit invert opacity-60 hover:opacity-100 transition-opacity"
                        src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
                        alt="Microsoft Logo"
                        height="24"
                        width="auto"
                      />
                    </div>
                    <div className="flex">
                      <img
                        className="mx-auto h-5 w-fit invert opacity-60 hover:opacity-100 transition-opacity"
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                        alt="Amazon Logo"
                        height="20"
                        width="auto"
                      />
                    </div>
                    <div className="flex">
                      <img
                        className="mx-auto h-5 w-fit invert opacity-60 hover:opacity-100 transition-opacity"
                        src="https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg"
                        alt="LinkedIn Logo"
                        height="20"
                        width="auto"
                      />
                    </div>
                    <div className="flex">
                      <img
                        className="mx-auto h-6 w-fit invert opacity-60 hover:opacity-100 transition-opacity"
                        src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
                        alt="Meta Logo"
                        height="24"
                        width="auto"
                      />
                    </div>
                    <div className="flex">
                      <img
                        className="mx-auto h-6 w-fit invert opacity-60 hover:opacity-100 transition-opacity"
                        src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
                        alt="Netflix Logo"
                        height="24"
                        width="auto"
                      />
                    </div>
                    <div className="flex">
                      <img
                        className="mx-auto h-6 w-fit invert opacity-60 hover:opacity-100 transition-opacity"
                        src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                        alt="Apple Logo"
                        height="24"
                        width="auto"
                      />
                    </div>

                    <div className="flex">
                      <img
                        className="mx-auto h-5 w-fit invert opacity-60 hover:opacity-100 transition-opacity"
                        src="https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg"
                        alt="Canva Logo"
                        height="20"
                        width="auto"
                      />
                    </div>
                  </InfiniteSlider>

                  <ProgressiveBlur
                    className="pointer-events-none absolute left-0 top-0 h-full w-20"
                    direction="left"
                    blurIntensity={1}
                  />
                  <ProgressiveBlur
                    className="pointer-events-none absolute right-0 top-0 h-full w-20"
                    direction="right"
                    blurIntensity={1}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
