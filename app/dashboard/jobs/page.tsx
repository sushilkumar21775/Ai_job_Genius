"use client"

import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CareerPulseLogo } from "@/components/careerpulse-logo"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    Search,
    Loader2,
    MapPin,
    Building2,
    Clock,
    DollarSign,
    ExternalLink,
    Briefcase,
    Filter,
    X,
    Globe
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"

interface Job {
    id: string
    title: string
    company: string
    location: string
    description: string
    salary: string
    employmentType: string
    postedDate: string
    applyLink: string
    companyLogo: string | null
    isRemote: boolean
}

export default function JobsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
            <JobsPageContent />
        </Suspense>
    )
}

function JobsPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user: clerkUser, isLoaded } = useUser()

    const [loading, setLoading] = useState(false)
    const [loadingRecommended, setLoadingRecommended] = useState(true)
    const [jobs, setJobs] = useState<Job[]>([])
    const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "")
    const [location, setLocation] = useState("India")
    const [remoteOnly, setRemoteOnly] = useState(false)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [hasSearched, setHasSearched] = useState(false)
    const [userSkills, setUserSkills] = useState<string[]>([])
    const [targetRole, setTargetRole] = useState("")
    const [showRecommended, setShowRecommended] = useState(true)

    useEffect(() => {
        if (isLoaded) {
            fetchUserDataAndJobs()
            // If query param exists, search automatically
            if (searchParams.get('q')) {
                setSearchQuery(searchParams.get('q') || "")
                setTimeout(() => searchJobs(), 500)
            }
        }
    }, [isLoaded])

    const fetchUserDataAndJobs = async () => {
        if (!clerkUser) {
            setLoadingRecommended(false)
            return
        }

        const supabase = createClient()

        // Fetch profile for target roles
        const { data: profile } = await supabase
            .from("profiles")
            .select("target_roles")
            .eq("id", clerkUser.id)
            .single()

        if (profile?.target_roles) {
            setTargetRole(profile.target_roles)
        }

        // Fetch skills from user_skills
        const { data: skillsData } = await supabase
            .from("user_skills")
            .select("skill_name")
            .eq("user_id", clerkUser.id)

        let skills: string[] = []
        if (skillsData && skillsData.length > 0) {
            skills = skillsData.map(s => s.skill_name)
        }

        // Also check resume for skills if user_skills is empty
        if (skills.length === 0) {
            const { data: resumes } = await supabase
                .from("resumes")
                .select("content")
                .eq("user_id", clerkUser.id)
                .order("updated_at", { ascending: false })
                .limit(1)

            if (resumes && resumes.length > 0) {
                const content = resumes[0].content as any
                if (content?.skills) {
                    skills = content.skills
                }
            }
        }

        setUserSkills(skills)

        // Fetch recommended jobs based on skills/target role
        if (skills.length > 0 || profile?.target_roles) {
            await fetchRecommendedJobs(skills, profile?.target_roles || "")
        } else {
            setLoadingRecommended(false)
        }
    }

    const fetchRecommendedJobs = async (skills: string[], target: string) => {
        setLoadingRecommended(true)

        try {
            // Build search query from skills and target role
            const searchTerms = []
            if (target) searchTerms.push(target)
            if (skills.length > 0) searchTerms.push(...skills.slice(0, 3))

            const query = searchTerms.join(" ") || "Developer"

            const params = new URLSearchParams({
                query: query,
                location: "India",
                remoteOnly: "false"
            })

            const response = await fetch(`/api/jobs/search?${params}`)
            const data = await response.json()

            if (data.jobs) {
                setRecommendedJobs(data.jobs)
                if (data.jobs.length > 0 && !selectedJob) {
                    setSelectedJob(data.jobs[0])
                }
            }
        } catch (error) {
            console.error('Error fetching recommended jobs:', error)
        }

        setLoadingRecommended(false)
    }

    const searchJobs = async () => {
        if (!searchQuery.trim()) return

        setLoading(true)
        setHasSearched(true)
        setShowRecommended(false)
        setSelectedJob(null)

        try {
            const params = new URLSearchParams({
                query: searchQuery,
                location: location,
                remoteOnly: remoteOnly.toString()
            })

            const response = await fetch(`/api/jobs/search?${params}`)
            const data = await response.json()

            if (data.jobs) {
                setJobs(data.jobs)
                if (data.jobs.length > 0) {
                    setSelectedJob(data.jobs[0])
                }
            }
        } catch (error) {
            console.error('Error searching jobs:', error)
        }

        setLoading(false)
    }

    const displayedJobs = showRecommended ? recommendedJobs : jobs

    const suggestedSearches = [
        "React Developer",
        "Full Stack Developer",
        "Frontend Developer",
        "Node.js Developer",
        "Python Developer",
        "Data Scientist"
    ]

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
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Job Search</h1>
                    </div>
                    <p className="text-gray-400">Find real jobs from LinkedIn, Indeed, Glassdoor & more</p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-xl border border-border/20 bg-card/30 mb-8"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Job title, skills, or company"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchJobs()}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-border/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchJobs()}
                                className="w-full md:w-48 pl-10 pr-4 py-3 bg-white/5 border border-border/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={remoteOnly}
                                    onChange={(e) => setRemoteOnly(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 bg-transparent text-blue-500 focus:ring-blue-500"
                                />
                                <Globe className="w-4 h-4" />
                                Remote
                            </label>
                            <Button
                                onClick={searchJobs}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6"
                                disabled={loading || !searchQuery.trim()}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Search className="w-4 h-4 mr-2" />
                                        Search
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Quick Search Suggestions */}
                    {!hasSearched && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-400 mb-2">Quick search:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedSearches.map((term, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSearchQuery(term)
                                            setTimeout(() => searchJobs(), 100)
                                        }}
                                        className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-border/20 rounded-full text-sm text-gray-300 transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Results */}
                <AnimatePresence mode="wait">
                    {(loading || loadingRecommended) ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-12 rounded-xl border border-border/20 bg-card/30 text-center"
                        >
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <p className="text-white font-medium">
                                {loadingRecommended ? 'Finding jobs for you...' : 'Searching for jobs...'}
                            </p>
                            <p className="text-gray-400 text-sm mt-2">Based on your skills and profile</p>
                        </motion.div>
                    ) : displayedJobs.length > 0 ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
                        >
                            {/* Job List */}
                            <div className="lg:col-span-2 space-y-4 max-h-[70vh] overflow-auto pr-2">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-400">
                                        {showRecommended ? (
                                            <span className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded text-xs">✨ Jobs For You</span>
                                                Based on your {targetRole || 'skills'}
                                            </span>
                                        ) : (
                                            `Found ${displayedJobs.length} jobs for "${searchQuery}"`
                                        )}
                                    </p>
                                    {!showRecommended && recommendedJobs.length > 0 && (
                                        <button
                                            onClick={() => setShowRecommended(true)}
                                            className="text-xs text-blue-400 hover:text-blue-300"
                                        >
                                            View Recommended
                                        </button>
                                    )}
                                </div>
                                {displayedJobs.map((job, idx) => (
                                    <motion.button
                                        key={job.id}
                                        onClick={() => setSelectedJob(job)}
                                        className={`w-full p-4 rounded-xl border text-left transition-all ${selectedJob?.id === job.id
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-border/20 bg-white/5 hover:border-white/30'
                                            }`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <div className="flex items-start gap-3">
                                            {job.companyLogo ? (
                                                <img
                                                    src={job.companyLogo}
                                                    alt={job.company}
                                                    className="w-12 h-12 rounded-lg object-contain bg-white"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                                                    <Building2 className="w-6 h-6 text-blue-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-white truncate">{job.title}</h3>
                                                <p className="text-sm text-gray-400">{job.company}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {job.isRemote ? 'Remote' : job.location}
                                                    </span>
                                                    <span>{job.postedDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Job Details */}
                            <div className="lg:col-span-3">
                                {selectedJob && (
                                    <motion.div
                                        key={selectedJob.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-6 rounded-xl border border-border/20 bg-card/30 sticky top-24"
                                    >
                                        <div className="flex items-start gap-4 mb-6">
                                            {selectedJob.companyLogo ? (
                                                <img
                                                    src={selectedJob.companyLogo}
                                                    alt={selectedJob.company}
                                                    className="w-16 h-16 rounded-xl object-contain bg-white"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                                                    <Building2 className="w-8 h-8 text-blue-400" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
                                                <p className="text-gray-400">{selectedJob.company}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                            <div className="p-3 bg-white/5 rounded-lg">
                                                <MapPin className="w-4 h-4 text-blue-400 mb-1" />
                                                <p className="text-xs text-gray-400">Location</p>
                                                <p className="text-sm text-white">{selectedJob.isRemote ? 'Remote' : selectedJob.location}</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-lg">
                                                <DollarSign className="w-4 h-4 text-green-400 mb-1" />
                                                <p className="text-xs text-gray-400">Salary</p>
                                                <p className="text-sm text-white">{selectedJob.salary}</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-lg">
                                                <Briefcase className="w-4 h-4 text-purple-400 mb-1" />
                                                <p className="text-xs text-gray-400">Type</p>
                                                <p className="text-sm text-white">{selectedJob.employmentType}</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-lg">
                                                <Clock className="w-4 h-4 text-orange-400 mb-1" />
                                                <p className="text-xs text-gray-400">Posted</p>
                                                <p className="text-sm text-white">{selectedJob.postedDate}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-white font-medium mb-2">Job Description</h3>
                                            <div className="text-sm text-gray-400 max-h-60 overflow-auto pr-2">
                                                {selectedJob.description.split('\n').map((line, i) => (
                                                    <p key={i} className="mb-2">{line}</p>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <a
                                                href={selectedJob.applyLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1"
                                            >
                                                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                                                    Apply Now
                                                    <ExternalLink className="w-4 h-4 ml-2" />
                                                </Button>
                                            </a>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ) : hasSearched ? (
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-12 rounded-xl border border-border/20 bg-card/30 text-center"
                        >
                            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
                            <p className="text-gray-400 mb-6">
                                Try adjusting your search terms or location
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-12 rounded-xl border border-border/20 bg-card/30 text-center"
                        >
                            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Search for Jobs</h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                Enter a job title, skill, or company name to find real job listings from top platforms.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                                <span>✓ LinkedIn Jobs</span>
                                <span>✓ Indeed</span>
                                <span>✓ Glassdoor</span>
                                <span>✓ ZipRecruiter</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
