"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CareerPulseLogo } from "@/components/careerpulse-logo"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    Target,
    Loader2,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Sparkles,
    RefreshCw,
    Upload,
    X
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"

interface ResumeContent {
    personal: {
        name: string
        email: string
        phone: string
        location: string
        linkedin: string
        summary: string
    }
    experience: Array<{
        company: string
        position: string
        location: string
        startDate: string
        endDate: string
        current: boolean
        description: string
    }>
    education: Array<{
        school: string
        degree: string
        field: string
        startDate: string
        endDate: string
        gpa: string
    }>
    skills: string[]
    projects: Array<{
        name: string
        description: string
        technologies: string
        link: string
    }>
    certifications: Array<{
        name: string
        issuer: string
        date: string
        link: string
    }>
}

interface Resume {
    id: string
    title: string
    content: ResumeContent
    ats_score: number | null
    updated_at: string
}

interface ATSResult {
    overallScore: number
    breakdown: { category: string; score: number; maxScore: number; status: string; feedback: string }[]
    suggestions: string[]
    keywords: { found: string[]; missing: string[] }
    strengths: string[]
    weaknesses: string[]
}

export default function ATSScorePage() {
    const router = useRouter()
    const { user: clerkUser, isLoaded } = useUser()
    const [loading, setLoading] = useState(true)
    const [resumes, setResumes] = useState<Resume[]>([])
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [atsResult, setAtsResult] = useState<ATSResult | null>(null)
    const [activeTab, setActiveTab] = useState<'saved' | 'upload'>('saved')
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [pdfText, setPdfText] = useState<string>('')
    const [extractingText, setExtractingText] = useState(false)

    useEffect(() => {
        if (isLoaded && clerkUser) {
            fetchResumes()
        } else if (isLoaded && !clerkUser) {
            router.push("/auth/login")
        }
    }, [isLoaded, clerkUser, router])

    const fetchResumes = async () => {
        if (!clerkUser) return
        const supabase = createClient()

        const { data } = await supabase
            .from("resumes")
            .select("*")
            .eq("user_id", clerkUser.id)
            .order("updated_at", { ascending: false })

        if (data) {
            setResumes(data)
            if (data.length > 0) {
                setSelectedResume(data[0])
            }
        }
        setLoading(false)
    }

    const analyzeResume = async () => {
        if (!selectedResume) return

        setAnalyzing(true)
        setAtsResult(null)

        try {
            const response = await fetch('/api/resume/ats-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: selectedResume.content })
            })
            const data = await response.json()

            if (data.overallScore !== undefined) {
                setAtsResult(data)

                // Update ATS score in database
                const supabase = createClient()
                await supabase
                    .from("resumes")
                    .update({ ats_score: data.overallScore })
                    .eq("id", selectedResume.id)

                // Update local state
                setSelectedResume({ ...selectedResume, ats_score: data.overallScore })
                setResumes(resumes.map(r =>
                    r.id === selectedResume.id ? { ...r, ats_score: data.overallScore } : r
                ))
            }
        } catch (error) {
            console.error('Error analyzing ATS:', error)
        }

        setAnalyzing(false)
    }

    const handleFileUpload = async (file: File) => {
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file')
            return
        }

        setUploadedFile(file)
        setExtractingText(true)
        setAtsResult(null)

        try {
            // Send to server for parsing
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/resume/parse-pdf', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (data.error && !data.text) {
                alert(data.error)
                setUploadedFile(null)
            } else if (!data.text || data.text.trim().length === 0) {
                alert('Could not extract text from PDF. The file may be image-based or protected.')
                setUploadedFile(null)
            } else {
                setPdfText(data.text)
            }
        } catch (error) {
            console.error('Error extracting PDF text:', error)
            alert('Error reading PDF. Please try another file.')
            setUploadedFile(null)
        } finally {
            setExtractingText(false)
        }
    }

    const analyzePDF = async () => {
        if (!pdfText) return

        setAnalyzing(true)
        setAtsResult(null)

        try {
            const response = await fetch('/api/resume/ats-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText: pdfText })
            })

            const data = await response.json()
            if (data.overallScore !== undefined) {
                setAtsResult(data)
            }
        } catch (error) {
            console.error('Error analyzing PDF:', error)
        }

        setAnalyzing(false)
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
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">ATS Score Checker</h1>
                    </div>
                    <p className="text-gray-400">Analyze your resume's compatibility with Applicant Tracking Systems</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Source Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="p-6 rounded-xl border border-border/20 bg-card/30">
                            {/* Tabs */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => { setActiveTab('saved'); setAtsResult(null); setUploadedFile(null); setPdfText('') }}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'saved'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <FileText className="w-4 h-4 inline mr-1" />
                                    My Resumes
                                </button>
                                <button
                                    onClick={() => { setActiveTab('upload'); setAtsResult(null); setSelectedResume(null) }}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'upload'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Upload className="w-4 h-4 inline mr-1" />
                                    Upload PDF
                                </button>
                            </div>

                            {activeTab === 'saved' ? (
                                <>
                                    <h2 className="text-lg font-semibold text-white mb-4">Select Resume</h2>
                                    {resumes.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-400 text-sm mb-4">No resumes yet. Create one or upload a PDF.</p>
                                            <Button size="sm" variant="outline" className="border-white/20 text-white" asChild>
                                                <Link href="/dashboard/resume">Create Resume</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {resumes.map((resume) => (
                                                <button
                                                    key={resume.id}
                                                    onClick={() => {
                                                        setSelectedResume(resume)
                                                        setAtsResult(null)
                                                    }}
                                                    className={`w-full p-4 rounded-xl border text-left transition-all ${selectedResume?.id === resume.id
                                                        ? 'border-purple-500 bg-purple-500/10'
                                                        : 'border-border/20 bg-white/5 hover:border-white/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="font-medium text-white">{resume.title}</h3>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {resume.content?.personal?.name || 'No name set'}
                                                            </p>
                                                        </div>
                                                        {resume.ats_score && (
                                                            <div className={`px-2 py-1 rounded text-xs font-medium ${resume.ats_score >= 80 ? 'bg-green-500/20 text-green-400' :
                                                                resume.ats_score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    'bg-red-500/20 text-red-400'
                                                                }`}>
                                                                {resume.ats_score}%
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <Button
                                        onClick={analyzeResume}
                                        className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                        disabled={analyzing || !selectedResume}
                                    >
                                        {analyzing ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Target className="w-4 h-4 mr-2" />
                                        )}
                                        {analyzing ? 'Analyzing...' : 'Analyze Resume'}
                                    </Button>
                                </>
                            ) : (
                                /* Upload/Paste Resume Tab */
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold text-white">Upload PDF Resume</h2>

                                    <label className="block">
                                        <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                                                ${uploadedFile ? 'border-purple-500 bg-purple-500/10' : 'border-border/40 hover:border-purple-500/50 bg-white/5'}`}>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                className="hidden"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                            />
                                            {extractingText ? (
                                                <>
                                                    <Loader2 className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-spin" />
                                                    <p className="text-white font-medium text-sm">Extracting text...</p>
                                                </>
                                            ) : uploadedFile ? (
                                                <>
                                                    <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                                    <p className="text-white font-medium text-sm">{uploadedFile.name}</p>
                                                    {pdfText && (
                                                        <p className="text-xs text-green-400 mt-1">
                                                            ✓ {pdfText.split(' ').length} words extracted
                                                        </p>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); setUploadedFile(null); setPdfText(''); }}
                                                        className="text-xs text-red-400 mt-2 hover:underline"
                                                    >
                                                        Remove
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-white font-medium text-sm">Click to upload PDF</p>
                                                    <p className="text-xs text-gray-500 mt-1">or paste text below</p>
                                                </>
                                            )}
                                        </div>
                                    </label>

                                    {/* Divider */}
                                    <div className="relative">
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border/30"></div>
                                        <p className="relative bg-black text-center text-xs text-gray-500 px-3 mx-auto w-fit">
                                            or paste resume text
                                        </p>
                                    </div>

                                    <textarea
                                        placeholder="Paste your resume text here..."
                                        value={pdfText}
                                        onChange={(e) => setPdfText(e.target.value)}
                                        className="w-full h-32 p-3 rounded-xl bg-white/5 border border-border/30 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500"
                                    />

                                    <Button
                                        onClick={analyzePDF}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                        disabled={analyzing || !pdfText || pdfText.trim().length < 50}
                                    >
                                        {analyzing ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Target className="w-4 h-4 mr-2" />
                                        )}
                                        {analyzing ? 'Analyzing...' : 'Analyze Resume'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Results Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <AnimatePresence mode="wait">
                            {analyzing ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-12 rounded-xl border border-border/20 bg-card/30 text-center"
                                >
                                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                                    <p className="text-white font-medium">Analyzing your resume...</p>
                                    <p className="text-gray-400 text-sm mt-2">Checking ATS compatibility</p>
                                </motion.div>
                            ) : atsResult ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Overall Score */}
                                    <div className="p-6 rounded-xl border border-border/20 bg-card/30 text-center">
                                        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 ${atsResult.overallScore >= 80 ? 'border-green-500' :
                                            atsResult.overallScore >= 60 ? 'border-yellow-500' :
                                                'border-red-500'
                                            }`}>
                                            <div>
                                                <span className={`text-4xl font-bold ${atsResult.overallScore >= 80 ? 'text-green-400' :
                                                    atsResult.overallScore >= 60 ? 'text-yellow-400' :
                                                        'text-red-400'
                                                    }`}>
                                                    {atsResult.overallScore}
                                                </span>
                                                <span className="text-gray-400 text-lg">%</span>
                                            </div>
                                        </div>
                                        <p className="text-white font-medium mt-4 text-lg">
                                            {atsResult.overallScore >= 80 ? '🎉 Excellent ATS Score!' :
                                                atsResult.overallScore >= 60 ? '👍 Good, but can improve' :
                                                    '⚠️ Needs improvement'}
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {selectedResume?.title}
                                        </p>
                                    </div>

                                    {/* Score Breakdown */}
                                    <div className="p-6 rounded-xl border border-border/20 bg-card/30">
                                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-purple-400" />
                                            Score Breakdown
                                        </h3>
                                        <div className="space-y-4">
                                            {atsResult.breakdown.map((item, idx) => (
                                                <div key={idx}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm text-gray-400">{item.category}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-400">{item.score}/{item.maxScore}</span>
                                                            {item.status === 'good' ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            ) : item.status === 'warning' ? (
                                                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                                            ) : (
                                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${item.status === 'good' ? 'bg-green-500' :
                                                                item.status === 'warning' ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                                }`}
                                                            style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{item.feedback}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Keywords */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                                            <h4 className="text-green-400 font-medium mb-3 text-sm">✓ Keywords Found</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {atsResult.keywords.found.slice(0, 10).map((kw, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                                            <h4 className="text-red-400 font-medium mb-3 text-sm">✗ Consider Adding</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {atsResult.keywords.missing.map((kw, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Suggestions */}
                                    {atsResult.suggestions.length > 0 && (
                                        <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/30">
                                            <h4 className="text-purple-400 font-medium mb-4 flex items-center gap-2">
                                                <Sparkles className="w-5 h-5" />
                                                AI Suggestions
                                            </h4>
                                            <ul className="space-y-3">
                                                {atsResult.suggestions.map((s, idx) => (
                                                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                                        <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={selectedResume ? analyzeResume : analyzePDF}
                                            variant="outline"
                                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Re-analyze
                                        </Button>
                                        {selectedResume ? (
                                            <Link href={`/dashboard/resume/${selectedResume.id}`} className="flex-1">
                                                <Button className="w-full bg-white text-black hover:bg-white/90">
                                                    Edit Resume
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href="/dashboard/resume" className="flex-1">
                                                <Button className="w-full bg-white text-black hover:bg-white/90">
                                                    Create Resume
                                                </Button>
                                            </Link>
                                        )}
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
                                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Analyze</h3>
                                    <p className="text-gray-400 mb-6">
                                        Select a resume and click "Analyze Resume" to check its ATS compatibility score.
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                                        <span>✓ Keyword Analysis</span>
                                        <span>✓ Format Check</span>
                                        <span>✓ Section Scoring</span>
                                        <span>✓ AI Suggestions</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
