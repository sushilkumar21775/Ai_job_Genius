"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CareerPulseLogo } from "@/components/careerpulse-logo"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    Video,
    Loader2,
    Play,
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    MessageSquare,
    User,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Lightbulb,
    Target,
    RotateCcw,
    History
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"
import Vapi from "@vapi-ai/web"

const roleOptions = [
    "Software Developer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Scientist",
    "Product Manager",
    "UX Designer",
    "DevOps Engineer",
    "Mobile Developer",
    "QA Engineer"
]

export default function VoiceInterviewPage() {
    const router = useRouter()
    const { user: clerkUser, isLoaded } = useUser()
    const vapiRef = useRef<Vapi | null>(null)

    // Setup state
    const [step, setStep] = useState<'setup' | 'interview' | 'ended'>('setup')
    const [role, setRole] = useState("")
    const [targetRole, setTargetRole] = useState("")

    // Interview state
    const [isConnecting, setIsConnecting] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [transcript, setTranscript] = useState<{ role: 'assistant' | 'user', text: string }[]>([])
    const [currentSpeech, setCurrentSpeech] = useState("")
    const [volumeLevel, setVolumeLevel] = useState(0)
    const [aiFeedback, setAiFeedback] = useState<any>(null)
    const [loadingFeedback, setLoadingFeedback] = useState(false)

    const transcriptRef = useRef<HTMLDivElement>(null)
    const transcriptDataRef = useRef<{ role: 'assistant' | 'user', text: string }[]>([])

    useEffect(() => {
        if (isLoaded && clerkUser) {
            fetchUserProfile()
            initializeVapi()
        }

        return () => {
            if (vapiRef.current) {
                vapiRef.current.stop()
            }
        }
    }, [isLoaded, clerkUser])

    useEffect(() => {
        // Auto-scroll transcript
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
        }
    }, [transcript, currentSpeech])

    // Save interview and get AI feedback when call ends
    useEffect(() => {
        if (step === 'ended' && transcriptDataRef.current.length > 0 && clerkUser) {
            const saveAndAnalyze = async () => {
                try {
                    const supabase = createClient()
                    const userId = clerkUser.id

                    const questions = transcriptDataRef.current.filter(t => t.role === 'assistant').map(t => t.text)
                    const answers = transcriptDataRef.current.filter(t => t.role === 'user').map(t => t.text)

                    // Save interview first
                    const { data: interview, error } = await supabase.from('mock_interviews').insert({
                        user_id: userId,
                        interview_type: 'behavioral',
                        questions: questions,
                        answers: answers,
                        completed_at: new Date().toISOString()
                    }).select().single()

                    if (error) {
                        console.error('Error saving interview:', error)
                        return
                    }

                    console.log('Interview saved successfully!')

                    // Get AI feedback
                    setLoadingFeedback(true)
                    try {
                        const response = await fetch('/api/interview/analyze', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ questions, answers, role })
                        })

                        const feedback = await response.json()
                        setAiFeedback(feedback)

                        // Save feedback to database
                        if (interview?.id && feedback) {
                            await supabase.from('mock_interviews').update({
                                feedback: feedback,
                                score: feedback.overallScore
                            }).eq('id', interview.id)
                            console.log('Feedback saved to database!')
                        }
                    } catch (error) {
                        console.error('Error getting feedback:', error)
                    } finally {
                        setLoadingFeedback(false)
                    }
                } catch (error) {
                    console.error('Error:', error)
                }
            }
            saveAndAnalyze()
        }
    }, [step, role])

    const fetchUserProfile = async () => {
        if (!clerkUser) return
        const supabase = createClient()

        const { data: profile } = await supabase
            .from("profiles")
            .select("target_roles")
            .eq("id", clerkUser.id)
            .single()

        if (profile?.target_roles) {
            setTargetRole(profile.target_roles)
            setRole(profile.target_roles)
        }
    }

    const initializeVapi = () => {
        const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
        if (!publicKey) {
            console.error('VAPI public key not found')
            return
        }

        const vapi = new Vapi(publicKey)
        vapiRef.current = vapi

        // Event listeners
        vapi.on('call-start', () => {
            setIsConnecting(false)
            setIsConnected(true)
            setStep('interview')
        })

        vapi.on('call-end', () => {
            setIsConnected(false)
            setStep('ended')
        })

        vapi.on('speech-start', () => {
            setIsSpeaking(true)
        })

        vapi.on('speech-end', () => {
            setIsSpeaking(false)
        })

        vapi.on('message', (message: any) => {
            if (message.type === 'transcript') {
                if (message.transcriptType === 'final') {
                    setTranscript(prev => {
                        const newTranscript = [...prev, {
                            role: message.role,
                            text: message.transcript
                        }]
                        transcriptDataRef.current = newTranscript
                        return newTranscript
                    })
                    setCurrentSpeech("")
                } else if (message.transcriptType === 'partial') {
                    setCurrentSpeech(message.transcript)
                }
            }
        })

        vapi.on('volume-level', (level: number) => {
            setVolumeLevel(level)
        })

        vapi.on('error', (error: any) => {
            console.error('VAPI error:', error)
            setIsConnecting(false)
        })
    }

    const startInterview = async () => {
        if (!vapiRef.current) return

        setIsConnecting(true)
        setTranscript([])

        try {
            // Use the published VAPI Assistant
            const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID

            if (!assistantId) {
                console.error('VAPI Assistant ID not found')
                setIsConnecting(false)
                return
            }

            await vapiRef.current.start(assistantId)
        } catch (error) {
            console.error('Failed to start interview:', error)
            setIsConnecting(false)
        }
    }

    const endInterview = () => {
        if (vapiRef.current) {
            vapiRef.current.stop()
        }
    }

    const toggleMute = () => {
        if (vapiRef.current) {
            if (isMuted) {
                vapiRef.current.setMuted(false)
            } else {
                vapiRef.current.setMuted(true)
            }
            setIsMuted(!isMuted)
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
                    <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10" asChild>
                        <Link href="/dashboard/interview/history">
                            <History className="w-4 h-4 mr-2" />
                            History
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8 max-w-4xl">
                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                            <Video className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">AI Voice Interview</h1>
                    </div>
                    <p className="text-gray-400">Practice with a real AI interviewer in real-time conversation</p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* Setup Step */}
                    {step === 'setup' && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Role Selection */}
                            <div className="p-6 rounded-xl border border-border/20 bg-card/30">
                                <h2 className="text-lg font-semibold text-white mb-4">Select Role for Interview</h2>
                                <div className="relative">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full p-3 bg-white/5 border border-border/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                                    >
                                        <option value="" className="bg-gray-900">Select a role...</option>
                                        {roleOptions.map((r) => (
                                            <option key={r} value={r} className="bg-gray-900">{r}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="p-6 rounded-xl border border-purple-500/30 bg-purple-500/10">
                                <h3 className="text-purple-400 font-medium mb-3">📋 How it works</h3>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li>• Click "Start Interview" to connect with AI interviewer</li>
                                    <li>• The AI will ask what role you're interviewing for</li>
                                    <li>• Answer questions by speaking naturally</li>
                                    <li>• All conversation is transcribed below in real-time</li>
                                    <li>• Click "End Interview" when you're done</li>
                                </ul>
                            </div>

                            {/* Microphone Check */}
                            <div className="p-6 rounded-xl border border-border/20 bg-card/30 text-center">
                                <Mic className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">
                                    Make sure your microphone is enabled.<br />
                                    You'll need to allow microphone access when prompted.
                                </p>
                            </div>

                            {/* Start Button */}
                            <Button
                                onClick={startInterview}
                                className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg"
                                disabled={isConnecting}
                            >
                                {isConnecting ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <Phone className="w-5 h-5 mr-2" />
                                )}
                                {isConnecting ? 'Connecting...' : 'Start Interview'}
                            </Button>
                        </motion.div>
                    )}

                    {/* Interview Step */}
                    {step === 'interview' && (
                        <motion.div
                            key="interview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Interview Status */}
                            <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                        <span className="text-green-400 font-medium">Interview in Progress</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isSpeaking && (
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs animate-pulse">
                                                AI Speaking...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* AI Avatar / Volume Indicator */}
                            <div className="p-8 rounded-xl border border-border/20 bg-card/30 text-center">
                                <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 transition-all ${isSpeaking ? 'scale-110 shadow-lg shadow-purple-500/50' : ''}`}>
                                    <User className="w-12 h-12 text-white" />
                                </div>
                                <p className="text-white font-medium">AI Interviewer</p>
                                <p className="text-sm text-gray-400">{role} Interview</p>

                                {/* Volume bars */}
                                <div className="flex items-center justify-center gap-1 mt-4">
                                    {[...Array(10)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1 rounded-full transition-all ${i < volumeLevel * 10
                                                ? 'bg-purple-500'
                                                : 'bg-white/10'
                                                }`}
                                            style={{ height: `${(i + 1) * 4}px` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Transcript */}
                            <div className="p-4 rounded-xl border border-border/20 bg-card/30">
                                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-purple-400" />
                                    Live Transcript
                                </h3>
                                <div
                                    ref={transcriptRef}
                                    className="h-64 overflow-y-auto space-y-3 pr-2"
                                >
                                    {transcript.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-lg ${item.role === 'assistant'
                                                ? 'bg-purple-500/10 border border-purple-500/20'
                                                : 'bg-blue-500/10 border border-blue-500/20 ml-8'
                                                }`}
                                        >
                                            <p className={`text-xs mb-1 ${item.role === 'assistant' ? 'text-purple-400' : 'text-blue-400'
                                                }`}>
                                                {item.role === 'assistant' ? '🎙️ Interviewer' : '👤 You'}
                                            </p>
                                            <p className="text-sm text-white">{item.text}</p>
                                        </div>
                                    ))}
                                    {currentSpeech && (
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 animate-pulse">
                                            <p className="text-xs text-gray-400 mb-1">Speaking...</p>
                                            <p className="text-sm text-gray-300">{currentSpeech}</p>
                                        </div>
                                    )}
                                    {transcript.length === 0 && !currentSpeech && (
                                        <p className="text-gray-500 text-center py-8">
                                            Waiting for conversation to start...
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    onClick={toggleMute}
                                    variant="outline"
                                    size="lg"
                                    className={`rounded-full w-14 h-14 ${isMuted ? 'border-red-500 text-red-500' : 'border-white/20 text-white'}`}
                                >
                                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                </Button>
                                <Button
                                    onClick={endInterview}
                                    size="lg"
                                    className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 text-white"
                                >
                                    <PhoneOff className="w-6 h-6" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Ended Step */}
                    {step === 'ended' && (
                        <motion.div
                            key="ended"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Header */}
                            <div className="p-8 rounded-xl border border-border/20 bg-card/30 text-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                                    <Phone className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Interview Completed!</h2>
                                <p className="text-gray-400">Great job practicing your interview skills.</p>
                            </div>

                            {/* AI Feedback */}
                            {loadingFeedback ? (
                                <div className="p-8 rounded-xl border border-border/20 bg-card/30 text-center">
                                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                                    <p className="text-white font-medium">Analyzing your performance...</p>
                                    <p className="text-sm text-gray-400 mt-2">AI is reviewing your answers</p>
                                </div>
                            ) : aiFeedback && (
                                <>
                                    {/* Overall Score */}
                                    <div className="p-6 rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                                        <div className="text-center mb-6">
                                            <div className={`text-6xl font-bold mb-2 ${aiFeedback.overallScore >= 80 ? 'text-green-400' :
                                                aiFeedback.overallScore >= 60 ? 'text-yellow-400' : 'text-orange-400'
                                                }`}>
                                                {aiFeedback.overallScore}%
                                            </div>
                                            <p className="text-gray-400">Overall Performance Score</p>
                                        </div>

                                        {/* Detailed Scores */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(aiFeedback.detailedFeedback).map(([key, value]: [string, any]) => (
                                                <div key={key} className="p-4 bg-white/5 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-gray-400 capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        <span className="text-white font-bold">{value.score}%</span>
                                                    </div>
                                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                                                            style={{ width: `${value.score}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">{value.feedback}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Strengths & Improvements */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30">
                                            <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5" />
                                                Strengths
                                            </h3>
                                            <ul className="space-y-2">
                                                {aiFeedback.strengths.map((strength: string, idx: number) => (
                                                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                                        <span className="text-green-400 mt-1">✓</span>
                                                        {strength}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-6 rounded-xl bg-orange-500/10 border border-orange-500/30">
                                            <h3 className="text-orange-400 font-semibold mb-4 flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5" />
                                                Areas for Improvement
                                            </h3>
                                            <ul className="space-y-2">
                                                {aiFeedback.areasForImprovement.map((area: string, idx: number) => (
                                                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                                        <span className="text-orange-400 mt-1">→</span>
                                                        {area}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Suggestions */}
                                    <div className="p-6 rounded-xl border border-border/20 bg-card/30">
                                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5 text-yellow-400" />
                                            Actionable Suggestions
                                        </h3>
                                        <div className="grid gap-3">
                                            {aiFeedback.suggestions.map((suggestion: string, idx: number) => (
                                                <div key={idx} className="p-3 bg-white/5 rounded-lg flex items-start gap-3">
                                                    <span className="text-purple-400 font-bold">{idx + 1}</span>
                                                    <p className="text-sm text-gray-300">{suggestion}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Next Steps */}
                                    <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
                                        <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                                            <Target className="w-5 h-5" />
                                            Next Steps
                                        </h3>
                                        <ul className="space-y-2">
                                            {aiFeedback.nextSteps.map((step: string, idx: number) => (
                                                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                                    <span className="text-blue-400">•</span>
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}

                            {/* Transcript Summary */}
                            {transcript.length > 0 && (
                                <div className="p-6 rounded-xl border border-border/20 bg-card/30">
                                    <h3 className="text-white font-semibold mb-4">Interview Transcript</h3>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {transcript.map((item, idx) => (
                                            <div key={idx} className="text-sm">
                                                <span className={`font-medium ${item.role === 'assistant' ? 'text-purple-400' : 'text-blue-400'}`}>
                                                    {item.role === 'assistant' ? 'Interviewer: ' : 'You: '}
                                                </span>
                                                <span className="text-gray-300">{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4">
                                <Button
                                    onClick={() => {
                                        setStep('setup')
                                        setTranscript([])
                                        setAiFeedback(null)
                                        transcriptDataRef.current = []
                                    }}
                                    variant="outline"
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Practice Again
                                </Button>
                                <Link href="/dashboard" className="flex-1">
                                    <Button className="w-full bg-white text-black hover:bg-white/90">
                                        Back to Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
