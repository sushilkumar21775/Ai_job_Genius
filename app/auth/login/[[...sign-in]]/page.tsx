"use client"

import dynamic from "next/dynamic"
import { useSignIn } from "@clerk/nextjs"
import { CareerPulseLogo } from "@/components/careerpulse-logo"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"

// Dynamic import with SSR disabled
const BackgroundPaths = dynamic(
    () => import("@/components/ui/floating-paths").then((mod) => mod.BackgroundPaths),
    { ssr: false }
)

export default function LoginPage() {
    const { isLoaded, signIn, setActive } = useSignIn()
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!isLoaded) return

        setIsLoading(true)

        try {
            const result = await signIn.create({
                identifier: email,
                password: password,
            })

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId })
                router.push("/dashboard")
            }
        } catch (err: unknown) {
            const error = err as { errors?: { message: string }[] }
            setError(error.errors?.[0]?.message || "Invalid email or password")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        if (!isLoaded) return

        try {
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/auth/callback",
                redirectUrlComplete: "/dashboard",
            })
        } catch (err: unknown) {
            const error = err as { errors?: { message: string }[] }
            setError(error.errors?.[0]?.message || "Something went wrong")
        }
    }

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

                    {/* Inner card matching Clerk's style */}
                    <div className="bg-[#1a1a1a] rounded-xl p-5 border border-gray-800">
                        {/* Google Sign In */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={!isLoaded}
                            className="w-full flex items-center justify-center gap-3 bg-[#111] border border-gray-700 text-white hover:bg-[#1a1a1a] rounded-lg py-2.5 transition-colors text-sm cursor-pointer relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-gray-700"></div>
                            <span className="text-gray-500 text-xs">or</span>
                            <div className="flex-1 h-px bg-gray-700"></div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label className="block text-gray-400 text-xs mb-1.5">Email address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder=""
                                    required
                                    className="w-full bg-[#111] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-gray-400 text-xs mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder=""
                                        required
                                        className="w-full bg-[#111] border border-gray-700 text-white rounded-lg px-3 py-2 pr-10 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <p className="text-red-400 text-xs flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 flex items-center justify-center text-[10px]">!</span>
                                    {error}
                                </p>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white text-black hover:bg-gray-100 rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </form>
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
