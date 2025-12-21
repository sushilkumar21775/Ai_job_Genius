"use client"

import dynamic from "next/dynamic"
import { SignIn } from "@clerk/nextjs"
import { CareerPulseLogo } from "@/components/careerpulse-logo"
import Link from "next/link"
import { dark } from "@clerk/themes"

// Dynamic import with SSR disabled
const BackgroundPaths = dynamic(
    () => import("@/components/ui/floating-paths").then((mod) => mod.BackgroundPaths),
    { ssr: false }
)

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <BackgroundPaths />
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                </div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-card/50 backdrop-blur-xl border border-border/20 rounded-2xl p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <Link href="/">
                            <CareerPulseLogo />
                        </Link>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-400">Sign in to continue your career journey</p>
                    </div>

                    {/* Clerk SignIn Component */}
                    <div className="flex justify-center [&_.cl-internal-b3fm6y]:!bg-transparent [&_.cl-card]:!bg-transparent [&_.cl-card]:!shadow-none [&_.cl-headerTitle]:!hidden [&_.cl-headerSubtitle]:!hidden [&_.cl-footer]:!hidden">
                        <SignIn
                            appearance={{
                                baseTheme: dark,
                                elements: {
                                    rootBox: "w-full",
                                    card: "bg-transparent shadow-none p-0 w-full border-0",
                                    headerTitle: "hidden",
                                    headerSubtitle: "hidden",
                                    socialButtonsBlockButton: "bg-white/5 border border-white/20 text-white hover:bg-white/10 rounded-xl py-3",
                                    socialButtonsBlockButtonText: "text-white font-medium",
                                    socialButtonsBlockButtonArrow: "text-white",
                                    dividerLine: "bg-white/20",
                                    dividerText: "text-gray-400 bg-transparent",
                                    formFieldLabel: "text-gray-400",
                                    formFieldInput: "bg-white/5 border border-white/20 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-transparent",
                                    formButtonPrimary: "bg-white text-black hover:bg-white/90 rounded-xl py-3",
                                    footerAction: "hidden",
                                    footerActionLink: "text-white hover:text-white/80",
                                    footerActionText: "text-gray-400",
                                    identityPreviewEditButton: "text-white",
                                    formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
                                    footer: "hidden",
                                    cardBox: "bg-transparent shadow-none",
                                    main: "gap-4",
                                    form: "gap-4",
                                },
                                layout: {
                                    socialButtonsPlacement: "top",
                                    socialButtonsVariant: "blockButton",
                                }
                            }}
                            routing="path"
                            path="/auth/login"
                            signUpUrl="/auth/signup"
                        />
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center mt-6 text-gray-400">
                        Don't have an account?{" "}
                        <Link href="/auth/signup" className="text-white hover:underline font-medium">
                            Sign up free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
