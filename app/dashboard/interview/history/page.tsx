"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CareerPulseLogo } from "@/components/careerpulse-logo"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    Video,
    Calendar,
    Clock,
    ChevronRight,
    MessageSquare,
    TrendingUp,
    Loader2,
    Sparkles
} from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"

interface Interview {
    id: string
    interview_type: string
    questions: string[]
    answers: string[]
    score: number | null
    feedback: any
    completed_at: string
    created_at: string
}

export default function InterviewHistoryPage() {
    const { user: clerkUser, isLoaded } = useUser()
    const [interviews, setInterviews] = useState<Interview[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
    const [analyzingFeedback, setAnalyzingFeedback] = useState(false)

    useEffect(() => {
        if (isLoaded && clerkUser) {
            fetchInterviews()
        }
    }, [isLoaded, clerkUser])

    const fetchInterviews = async () => {
        if (!clerkUser) return
        const supabase = createClient()

        const { data, error } = await supabase
            .from('mock_interviews')
            .select('*')
            .eq('user_id', clerkUser.id)
            .order('created_at', { ascending: false })

        if (data) {
            setInterviews(data)
        }
        setLoading(false)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const generateFeedback = async (interview: Interview) => {
        if (!interview.questions || !interview.answers) {
            console.error('No questions or answers found')
            return
        }

        console.log('Sending for analysis:', {
            questions: interview.questions,
            answers: interview.answers,
            role: interview.interview_type
        })

        setAnalyzingFeedback(true)
        try {
            const response = await fetch('/api/interview/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questions: interview.questions,
                    answers: interview.answers,
                    role: interview.interview_type || 'behavioral'
                })
            })

            if (!response.ok) {
                console.error('API error:', response.status)
            }

            const feedback = await response.json()
            console.log('Received feedback:', feedback)

            // Save to database
            const supabase = createClient()
            await supabase.from('mock_interviews').update({
                feedback: feedback,
                score: feedback.overallScore
            }).eq('id', interview.id)

            // Update local state
            const updatedInterview = { ...interview, feedback, score: feedback.overallScore }
            setSelectedInterview(updatedInterview)
            setInterviews(prev => prev.map(i => i.id === interview.id ? updatedInterview : i))
        } catch (error) {
            console.error('Error generating feedback:', error)
        } finally {
            setAnalyzingFeedback(false)
        }
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <header className="border-b border-border/10 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" asChild>
                            <Link href="/dashboard">
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Dashboard
                            </Link>
                        </Button>
                    </div>
                    <Link href="/">
                        <CareerPulseLogo />
                    </Link>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" asChild>
                        <Link href="/dashboard/interview">
                            <Video className="w-4 h-4 mr-2" />
                            New Interview
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8 max-w-6xl">
                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                            <Video className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Interview History</h1>
                    </div>
                    <p className="text-gray-400">Review your past mock interviews and track your progress</p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                ) : interviews.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No Interviews Yet</h2>
                        <p className="text-gray-400 mb-6">Complete your first mock interview to see your history here.</p>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" asChild>
                            <Link href="/dashboard/interview">
                                Start Your First Interview
                            </Link>
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Interview List */}
                        <div className="lg:col-span-1 space-y-4">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                {interviews.length} Interview{interviews.length !== 1 ? 's' : ''} Completed
                            </h2>
                            {interviews.map((interview, idx) => (
                                <motion.div
                                    key={interview.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => setSelectedInterview(interview)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedInterview?.id === interview.id
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-border/20 bg-card/30 hover:border-border/40'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-white font-medium capitalize">
                                                {interview.interview_type || 'Behavioral'} Interview
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(interview.completed_at || interview.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-500">
                                                    {interview.questions?.length || 0} questions
                                                </span>
                                                {interview.score && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${interview.score >= 80 ? 'bg-green-500/20 text-green-400' :
                                                        interview.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-orange-500/20 text-orange-400'
                                                        }`}>
                                                        {interview.score}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-500" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Interview Details */}
                        <div className="lg:col-span-2">
                            {selectedInterview ? (
                                <motion.div
                                    key={selectedInterview.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Header */}
                                    <div className="p-6 rounded-xl border border-border/20 bg-card/30">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-white mb-2 capitalize">
                                                    {selectedInterview.interview_type || 'Behavioral'} Interview
                                                </h2>
                                                <p className="text-gray-400">
                                                    {formatDate(selectedInterview.completed_at || selectedInterview.created_at)}
                                                </p>
                                            </div>
                                            {selectedInterview.score && (
                                                <div className={`text-4xl font-bold ${selectedInterview.score >= 80 ? 'text-green-400' :
                                                    selectedInterview.score >= 60 ? 'text-yellow-400' : 'text-orange-400'
                                                    }`}>
                                                    {selectedInterview.score}%
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* AI Feedback */}
                                    {selectedInterview.feedback && selectedInterview.feedback.overallScore ? (
                                        <div className="space-y-4">
                                            {/* Strengths & Improvements */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {selectedInterview.feedback.strengths && (
                                                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                                                        <h4 className="text-green-400 font-semibold mb-3 text-sm">✓ Strengths</h4>
                                                        <ul className="space-y-1">
                                                            {selectedInterview.feedback.strengths.slice(0, 3).map((s: string, i: number) => (
                                                                <li key={i} className="text-xs text-gray-300">{s}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {selectedInterview.feedback.areasForImprovement && (
                                                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                                                        <h4 className="text-orange-400 font-semibold mb-3 text-sm">→ Improve</h4>
                                                        <ul className="space-y-1">
                                                            {selectedInterview.feedback.areasForImprovement.slice(0, 3).map((s: string, i: number) => (
                                                                <li key={i} className="text-xs text-gray-300">{s}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Suggestions */}
                                            {selectedInterview.feedback.suggestions && (
                                                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                                                    <h4 className="text-purple-400 font-semibold mb-3 text-sm">💡 Key Suggestions</h4>
                                                    <ul className="space-y-1">
                                                        {selectedInterview.feedback.suggestions.slice(0, 4).map((s: string, i: number) => (
                                                            <li key={i} className="text-xs text-gray-300">• {s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-6 rounded-xl border border-dashed border-purple-500/50 bg-purple-500/5 text-center">
                                            <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                                            <h4 className="text-white font-semibold mb-2">No AI Feedback Yet</h4>
                                            <p className="text-sm text-gray-400 mb-4">
                                                Generate AI analysis for this interview
                                            </p>
                                            <Button
                                                onClick={() => generateFeedback(selectedInterview)}
                                                disabled={analyzingFeedback}
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                            >
                                                {analyzingFeedback ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-4 h-4 mr-2" />
                                                        Generate AI Feedback
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Transcript */}
                                    <div className="p-6 rounded-xl border border-border/20 bg-card/30">
                                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-purple-400" />
                                            Interview Transcript
                                        </h3>
                                        <div className="space-y-4 max-h-60 overflow-y-auto">
                                            {selectedInterview.questions?.map((question, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                                        <p className="text-xs text-purple-400 mb-1">Q{idx + 1}</p>
                                                        <p className="text-sm text-white">{question}</p>
                                                    </div>
                                                    {selectedInterview.answers?.[idx] && (
                                                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg ml-4">
                                                            <p className="text-xs text-blue-400 mb-1">A{idx + 1}</p>
                                                            <p className="text-sm text-gray-300">{selectedInterview.answers[idx]}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Practice Again Button */}
                                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white" asChild>
                                        <Link href="/dashboard/interview">
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            Practice Another Interview
                                        </Link>
                                    </Button>
                                </motion.div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-center py-20">
                                    <div>
                                        <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400">Select an interview to view details</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
