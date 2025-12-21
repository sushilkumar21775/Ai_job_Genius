"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CareerPulseLogo } from "@/components/careerpulse-logo"
import { Button } from "@/components/ui/button"
import {
    FileText,
    Video,
    Target,
    Compass,
    Bell,
    ChevronRight,
    Sparkles,
    CheckCircle,
    LogOut,
    Loader2,
    Briefcase,
    User,
    ChevronDown
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"

const quickActions = [
    {
        icon: FileText,
        title: "AI Resume Builder",
        description: "Create ATS-optimized resume",
        href: "/dashboard/resume",
        color: "from-blue-500/20 to-cyan-500/20"
    },
    {
        icon: Target,
        title: "ATS Score Check",
        description: "Analyze your resume",
        href: "/dashboard/ats",
        color: "from-orange-500/20 to-red-500/20"
    },
    {
        icon: Briefcase,
        title: "Job Search",
        description: "Find real job listings",
        href: "/dashboard/jobs",
        color: "from-yellow-500/20 to-amber-500/20"
    },
    {
        icon: Compass,
        title: "Career Path",
        description: "Explore opportunities",
        href: "/dashboard/career",
        color: "from-green-500/20 to-emerald-500/20"
    },
    {
        icon: Video,
        title: "Mock Interview",
        description: "Practice with AI interviewer",
        href: "/dashboard/interview",
        color: "from-purple-500/20 to-pink-500/20"
    },
]

interface Profile {
    full_name: string | null
    email: string | null
    career_status: string | null
    qualification: string | null
    university: string | null
    target_roles: string | null
    work_type: string | null
    onboarding_completed: boolean
    profile_completion: number
    phone: string | null
    location: string | null
}

interface UserSkill {
    skill_name: string
}

export default function DashboardPage() {
    const router = useRouter()
    const { user: clerkUser, isLoaded } = useUser()
    const { signOut } = useClerk()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [skills, setSkills] = useState<UserSkill[]>([])
    const [resumeCount, setResumeCount] = useState(0)
    const [interviewCount, setInterviewCount] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            if (!isLoaded) return
            if (!clerkUser) {
                router.push("/auth/login")
                return
            }

            const supabase = createClient()
            const userId = clerkUser.id

            // Run ALL queries in parallel for faster loading
            const [profileResult, skillsResult, resumeResult, interviewResult] = await Promise.all([
                supabase.from("profiles").select("*").eq("id", userId).single(),
                supabase.from("user_skills").select("skill_name").eq("user_id", userId),
                supabase.from("resumes").select("*", { count: "exact", head: true }).eq("user_id", userId),
                supabase.from("mock_interviews").select("*", { count: "exact", head: true }).eq("user_id", userId)
            ])

            // If no profile exists, create one from Clerk data
            if (!profileResult.data) {
                const newProfile = {
                    id: userId,
                    full_name: clerkUser.fullName || clerkUser.firstName || 'User',
                    email: clerkUser.emailAddresses[0]?.emailAddress || '',
                    onboarding_completed: false,
                    profile_completion: 0,
                }
                await supabase.from("profiles").upsert(newProfile)
                setProfile({ ...newProfile, career_status: null, qualification: null, university: null, target_roles: null, work_type: null, phone: null, location: null } as Profile)
            } else {
                setProfile(profileResult.data)
            }

            if (skillsResult.data) setSkills(skillsResult.data)
            setResumeCount(resumeResult.count || 0)
            setInterviewCount(interviewResult.count || 0)

            setLoading(false)
        }

        fetchData()
    }, [isLoaded, clerkUser, router])

    const handleLogout = async () => {
        await signOut()
        router.push("/")
    }

    const profileSteps = [
        { label: "Basic Info", completed: !!(profile?.full_name && profile?.phone) },
        { label: "Career Status", completed: !!profile?.career_status },
        { label: "Education", completed: !!profile?.qualification },
        { label: "Skills", completed: skills.length >= 3 },
        { label: "Career Goals", completed: !!profile?.target_roles },
    ]

    const completedSteps = profileSteps.filter(s => s.completed).length
    const completionPercentage = Math.round((completedSteps / profileSteps.length) * 100)

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U"
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    const getFirstName = (name: string | null | undefined) => {
        if (!name) return "User"
        return name.split(" ")[0]
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            <header className="border-b border-border/10 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/">
                        <CareerPulseLogo />
                    </Link>
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative">
                            <Bell className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="relative group">
                            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                                    {getInitials(profile?.full_name)}
                                </div>
                                <div className="hidden md:flex items-center gap-2">
                                    <div>
                                        <p className="text-sm text-white font-medium">{profile?.full_name || "User"}</p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>
                            </button>
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-gray-900 border border-border/20 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <Link href="/" className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    Home
                                </Link>
                                <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                    <User className="w-4 h-4" />
                                    My Profile
                                </Link>
                                <hr className="my-2 border-border/20" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-red-400 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {getFirstName(profile?.full_name)}! 👋
                    </h1>
                    <p className="text-gray-400">Let's continue building your career success story.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickActions.map((action, index) => {
                                    const Icon = action.icon
                                    return (
                                        <Link key={index} href={action.href} prefetch={false}>
                                            <div
                                                className={`p-6 rounded-xl border border-border/20 bg-gradient-to-br ${action.color} backdrop-blur-sm cursor-pointer group hover:scale-[1.02] hover:-translate-y-0.5 transition-transform duration-150`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="p-3 rounded-lg bg-white/10">
                                                        <Icon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-150" />
                                                </div>
                                                <h3 className="text-lg font-medium text-white mt-4">{action.title}</h3>
                                                <p className="text-sm text-gray-400 mt-1">{action.description}</p>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </motion.div>

                        {/* AI Insights */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-xl border border-border/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                <h2 className="text-xl font-semibold text-white">AI Career Insights</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-white/5 border border-border/10">
                                    <p className="text-white font-medium mb-1">🎯 Resume Tip</p>
                                    <p className="text-sm text-gray-400">
                                        {profile?.target_roles
                                            ? `Based on your target role as ${profile.target_roles}, adding quantifiable achievements could increase your callback rate by 40%.`
                                            : "Complete your profile to get personalized resume tips!"}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5 border border-border/10">
                                    <p className="text-white font-medium mb-1">📈 Your Skills</p>
                                    <p className="text-sm text-gray-400">
                                        {skills.length > 0
                                            ? `You have ${skills.length} skills listed: ${skills.slice(0, 3).map(s => s.skill_name).join(", ")}${skills.length > 3 ? ` and ${skills.length - 3} more` : ""}.`
                                            : "Add your skills in the onboarding to get personalized insights!"}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Profile Completion */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-xl border border-border/20 bg-card/30"
                        >
                            <h3 className="text-lg font-semibold text-white mb-4">Profile Completion</h3>
                            <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionPercentage}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                />
                            </div>
                            <p className="text-sm text-gray-400 mb-4">{completionPercentage}% complete</p>
                            <div className="space-y-2">
                                {profileSteps.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        {item.completed ? (
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border border-gray-500" />
                                        )}
                                        <span className={item.completed ? "text-gray-400" : "text-white"}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {completionPercentage < 100 && (
                                <Button className="w-full mt-4 bg-white text-black hover:bg-white/90" asChild>
                                    <Link href="/onboarding">
                                        Complete Profile
                                    </Link>
                                </Button>
                            )}
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-xl border border-border/20 bg-card/30"
                        >
                            <h3 className="text-lg font-semibold text-white mb-4">Your Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Resumes Created</span>
                                    <span className="text-white font-medium">{resumeCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Mock Interviews</span>
                                    <span className="text-white font-medium">{interviewCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Skills Listed</span>
                                    <span className="text-white font-medium">{skills.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Work Preference</span>
                                    <span className="text-white font-medium capitalize">{profile?.work_type || "Not set"}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Upgrade CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/10"
                        >
                            <Sparkles className="w-8 h-8 text-purple-400 mb-3" />
                            <h3 className="text-lg font-semibold text-white mb-2">Upgrade to Pro</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Unlock unlimited mock interviews, advanced ATS optimization, and more.
                            </p>
                            <Button className="w-full bg-white text-black hover:bg-white/90" asChild>
                                <Link href="/#pricing">
                                    View Plans
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
