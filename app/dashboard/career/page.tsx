"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CareerPulseLogo } from "@/components/careerpulse-logo"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    Compass,
    Loader2,
    TrendingUp,
    Target,
    Sparkles,
    ChevronRight,
    Star,
    Clock,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    Briefcase,
    BookOpen,
    RefreshCw
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"

interface CareerPath {
    role: string
    description: string
    matchScore: number
    salaryRange: string
    demandLevel: 'High' | 'Medium' | 'Low'
    requiredSkills: string[]
    skillsYouHave: string[]
    skillGaps: string[]
    timeToAchieve: string
}

interface CareerResult {
    currentLevel: string
    recommendedPaths: CareerPath[]
    skillsAnalysis: {
        topSkills: string[]
        inDemandSkills: string[]
        skillsToLearn: string[]
    }
    industryInsights: string[]
    nextSteps: string[]
}

export default function CareerPathPage() {
    const router = useRouter()
    const { user: clerkUser, isLoaded } = useUser()
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<CareerResult | null>(null)
    const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null)

    // User data
    const [skills, setSkills] = useState<string[]>([])
    const [experience, setExperience] = useState<{ position: string; company: string; description: string }[]>([])
    const [education, setEducation] = useState<{ degree: string; field: string }[]>([])
    const [targetRoles, setTargetRoles] = useState("")
    const [careerStatus, setCareerStatus] = useState("")
    const [userName, setUserName] = useState("")

    useEffect(() => {
        if (isLoaded && clerkUser) {
            fetchUserData()
        } else if (isLoaded && !clerkUser) {
            router.push("/auth/login")
        }
    }, [isLoaded, clerkUser, router])

    const fetchUserData = async () => {
        if (!clerkUser) return
        const supabase = createClient()

        // Fetch profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", clerkUser.id)
            .single()

        if (profile) {
            setTargetRoles(profile.target_roles || "")
            setCareerStatus(profile.career_status || "")
            setUserName(profile.full_name || "")
        }

        // Fetch skills
        const { data: skillsData } = await supabase
            .from("user_skills")
            .select("skill_name")
            .eq("user_id", clerkUser.id)

        if (skillsData) {
            setSkills(skillsData.map(s => s.skill_name))
        }

        // Fetch resume for experience/education
        const { data: resumes } = await supabase
            .from("resumes")
            .select("content")
            .eq("user_id", clerkUser.id)
            .order("updated_at", { ascending: false })
            .limit(1)

        if (resumes && resumes.length > 0) {
            const content = resumes[0].content as any
            if (content?.experience) {
                setExperience(content.experience.filter((e: any) => e.position || e.company))
            }
            if (content?.education) {
                setEducation(content.education.filter((e: any) => e.degree || e.field))
            }
            // Also get skills from resume if user_skills is empty
            if (content?.skills && skillsData?.length === 0) {
                setSkills(content.skills)
            }
        }

        setLoading(false)
    }

    const analyzeCareer = async () => {
        setAnalyzing(true)
        setResult(null)
        setSelectedPath(null)

        try {
            const response = await fetch('/api/career/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skills,
                    experience,
                    education,
                    targetRoles,
                    careerStatus
                })
            })
            const data = await response.json()

            if (data.recommendedPaths) {
                setResult(data)
                if (data.recommendedPaths.length > 0) {
                    setSelectedPath(data.recommendedPaths[0])
                }
            }
        } catch (error) {
            console.error('Error analyzing career:', error)
        }

        setAnalyzing(false)
    }

    const getDemandColor = (level: string) => {
        switch (level) {
            case 'High': return 'text-green-400 bg-green-500/20'
            case 'Medium': return 'text-yellow-400 bg-yellow-500/20'
            case 'Low': return 'text-red-400 bg-red-500/20'
            default: return 'text-gray-400 bg-gray-500/20'
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400'
        if (score >= 60) return 'text-yellow-400'
        return 'text-orange-400'
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
            {/* Header */}
            <header className="border-b border-border/10 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Dashboard
                            </Button>
                        </Link>
                    </div>
                    <CareerPulseLogo />
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                            <Compass className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Career Path Explorer</h1>
                    </div>
                    <p className="text-gray-400">AI-powered career recommendations based on your skills and goals</p>
                </motion.div>

                {/* Profile Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-xl border border-border/20 bg-card/30 mb-8"
                >
                    <h2 className="text-lg font-semibold text-white mb-4">Your Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Skills ({skills.length})</p>
                            <div className="flex flex-wrap gap-2">
                                {skills.slice(0, 6).map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-white/10 text-white text-xs rounded">
                                        {skill}
                                    </span>
                                ))}
                                {skills.length > 6 && (
                                    <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded">
                                        +{skills.length - 6} more
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Experience</p>
                            <p className="text-white">
                                {experience.length > 0
                                    ? `${experience.length} position${experience.length > 1 ? 's' : ''}`
                                    : 'No experience listed'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Target Roles</p>
                            <p className="text-white">{targetRoles || 'Not specified'}</p>
                        </div>
                    </div>

                    <Button
                        onClick={analyzeCareer}
                        className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        disabled={analyzing || skills.length === 0}
                    >
                        {analyzing ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {analyzing ? 'Analyzing...' : 'Analyze Career Path'}
                    </Button>

                    {skills.length === 0 && (
                        <p className="text-yellow-500 text-sm mt-4">
                            ⚠️ Please add skills in your profile or resume to get career recommendations.
                        </p>
                    )}
                </motion.div>

                {/* Results */}
                <AnimatePresence mode="wait">
                    {analyzing ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-12 rounded-xl border border-border/20 bg-card/30 text-center"
                        >
                            <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
                            <p className="text-white font-medium">Analyzing your career potential...</p>
                            <p className="text-gray-400 text-sm mt-2">Finding the best opportunities for you</p>
                        </motion.div>
                    ) : result ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            {/* Current Level Badge */}
                            <div className="flex items-center gap-4">
                                <div className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
                                    <span className="text-green-400 font-medium">📊 Current Level: {result.currentLevel}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Career Paths List */}
                                <div className="lg:col-span-1 space-y-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Target className="w-5 h-5 text-green-400" />
                                        Recommended Paths
                                    </h3>
                                    {result.recommendedPaths.map((path, idx) => (
                                        <motion.button
                                            key={idx}
                                            onClick={() => setSelectedPath(path)}
                                            className={`w-full p-4 rounded-xl border text-left transition-all ${selectedPath?.role === path.role
                                                ? 'border-green-500 bg-green-500/10'
                                                : 'border-border/20 bg-white/5 hover:border-white/30'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-white">{path.role}</h4>
                                                <span className={`text-lg font-bold ${getScoreColor(path.matchScore)}`}>
                                                    {path.matchScore}%
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-xs ${getDemandColor(path.demandLevel)}`}>
                                                    {path.demandLevel} Demand
                                                </span>
                                                <span className="text-xs text-gray-400">{path.timeToAchieve}</span>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Selected Path Details */}
                                <div className="lg:col-span-2 space-y-6">
                                    {selectedPath && (
                                        <motion.div
                                            key={selectedPath.role}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="space-y-6"
                                        >
                                            {/* Path Header */}
                                            <div className="p-6 rounded-xl border border-border/20 bg-card/30">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-white">{selectedPath.role}</h3>
                                                        <p className="text-gray-400 mt-1">{selectedPath.description}</p>
                                                    </div>
                                                    <div className={`text-3xl font-bold ${getScoreColor(selectedPath.matchScore)}`}>
                                                        {selectedPath.matchScore}%
                                                        <p className="text-xs text-gray-400 font-normal">Match</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 mt-6">
                                                    <div className="p-3 bg-white/5 rounded-lg">
                                                        <DollarSign className="w-5 h-5 text-green-400 mb-1" />
                                                        <p className="text-xs text-gray-400">Salary Range</p>
                                                        <p className="text-white font-medium text-sm">{selectedPath.salaryRange}</p>
                                                    </div>
                                                    <div className="p-3 bg-white/5 rounded-lg">
                                                        <TrendingUp className="w-5 h-5 text-blue-400 mb-1" />
                                                        <p className="text-xs text-gray-400">Market Demand</p>
                                                        <p className={`font-medium text-sm ${getDemandColor(selectedPath.demandLevel).split(' ')[0]}`}>
                                                            {selectedPath.demandLevel}
                                                        </p>
                                                    </div>
                                                    <div className="p-3 bg-white/5 rounded-lg">
                                                        <Clock className="w-5 h-5 text-purple-400 mb-1" />
                                                        <p className="text-xs text-gray-400">Time to Achieve</p>
                                                        <p className="text-white font-medium text-sm">{selectedPath.timeToAchieve}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Skills Comparison */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                                                    <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Skills You Have
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedPath.skillsYouHave.map((skill, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {selectedPath.skillsYouHave.length === 0 && (
                                                            <span className="text-gray-500 text-sm">None identified yet</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                                                    <h4 className="text-orange-400 font-medium mb-3 flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Skills to Learn
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedPath.skillGaps.map((skill, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Required Skills */}
                                            <div className="p-4 rounded-xl border border-border/20 bg-white/5">
                                                <h4 className="text-white font-medium mb-3">Required Skills for {selectedPath.role}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedPath.requiredSkills.map((skill, idx) => {
                                                        const hasSkill = selectedPath.skillsYouHave.some(s =>
                                                            s.toLowerCase() === skill.toLowerCase()
                                                        )
                                                        return (
                                                            <span
                                                                key={idx}
                                                                className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${hasSkill
                                                                    ? 'bg-green-500/20 text-green-300'
                                                                    : 'bg-white/10 text-gray-300'
                                                                    }`}
                                                            >
                                                                {hasSkill && <CheckCircle2 className="w-3 h-3" />}
                                                                {skill}
                                                            </span>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            {/* Find Jobs Button */}
                                            <Link href={`/dashboard/jobs?q=${encodeURIComponent(selectedPath.role)}`}>
                                                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                                                    <Briefcase className="w-4 h-4 mr-2" />
                                                    Find {selectedPath.role} Jobs
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Industry Insights & Next Steps */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-xl border border-border/20 bg-card/30">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-blue-400" />
                                        Industry Insights
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.industryInsights.map((insight, idx) => (
                                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                                <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-green-400" />
                                        Recommended Next Steps
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.nextSteps.map((step, idx) => (
                                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                                <span className="w-5 h-5 bg-green-500/30 text-green-400 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                                                    {idx + 1}
                                                </span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Re-analyze Button */}
                            <div className="flex justify-center">
                                <Button
                                    onClick={analyzeCareer}
                                    variant="outline"
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Re-analyze Career Path
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-12 rounded-xl border border-border/20 bg-card/30 text-center"
                        >
                            <Compass className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Discover Your Career Path</h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                Click "Analyze Career Path" to get personalized career recommendations based on your skills and experience.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                                <span>✓ Role Recommendations</span>
                                <span>✓ Salary Insights</span>
                                <span>✓ Skill Gap Analysis</span>
                                <span>✓ Action Steps</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
