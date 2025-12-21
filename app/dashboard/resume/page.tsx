"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CareerPulseLogo } from "@/components/careerpulse-logo"
import { Button } from "@/components/ui/button"
import {
    Plus,
    FileText,
    ChevronLeft,
    Sparkles,
    MoreVertical,
    Trash2,
    Copy,
    Edit3,
    Eye,
    Loader2,
    Pencil,
    Check,
    X
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"
import { TemplateSelector, resumeTemplates } from "@/components/resume-templates"

interface ResumeContent {
    personal?: {
        name?: string
        email?: string
        summary?: string
    }
    skills?: string[]
    experience?: Array<{ position?: string; company?: string }>
}

interface Resume {
    id: string
    title: string
    template: string
    ats_score: number | null
    is_primary: boolean
    created_at: string
    updated_at: string
    content?: ResumeContent
}

export default function ResumesPage() {
    const router = useRouter()
    const { user: clerkUser, isLoaded } = useUser()
    const [loading, setLoading] = useState(true)
    const [resumes, setResumes] = useState<Resume[]>([])
    const [creating, setCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState("")
    const [showTemplateModal, setShowTemplateModal] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState("modern")

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
        }
        setLoading(false)
    }

    const createNewResume = async () => {
        if (!clerkUser) return
        setCreating(true)
        const supabase = createClient()

        const { data, error } = await supabase
            .from("resumes")
            .insert({
                user_id: clerkUser.id,
                title: `Resume ${resumes.length + 1}`,
                template: selectedTemplate,
                content: {
                    personal: { name: "", email: "", phone: "", location: "", linkedin: "", summary: "" },
                    experience: [],
                    education: [],
                    skills: [],
                    projects: [],
                    certifications: []
                },
                is_primary: resumes.length === 0
            })
            .select()
            .single()

        if (data && !error) {
            setShowTemplateModal(false)
            router.push(`/dashboard/resume/${data.id}`)
        }
        setCreating(false)
    }

    const renameResume = async (id: string, newTitle: string) => {
        if (!newTitle.trim()) {
            setEditingId(null)
            return
        }

        const supabase = createClient()
        await supabase
            .from("resumes")
            .update({ title: newTitle.trim() })
            .eq("id", id)

        setResumes(resumes.map(r => r.id === id ? { ...r, title: newTitle.trim() } : r))
        setEditingId(null)
    }

    const startEditing = (resume: Resume) => {
        setEditingId(resume.id)
        setEditTitle(resume.title)
    }

    const deleteResume = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resume?")) return

        const supabase = createClient()
        await supabase.from("resumes").delete().eq("id", id)
        setResumes(resumes.filter(r => r.id !== id))
    }

    const duplicateResume = async (resume: Resume) => {
        if (!clerkUser) return
        const supabase = createClient()
        const { data: original } = await supabase
            .from("resumes")
            .select("*")
            .eq("id", resume.id)
            .single()

        if (!original) return

        const { data } = await supabase
            .from("resumes")
            .insert({
                user_id: clerkUser.id,
                title: `${original.title} (Copy)`,
                template: original.template,
                content: original.content,
                is_primary: false
            })
            .select()
            .single()

        if (data) {
            setResumes([data, ...resumes])
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        })
    }

    const getPreviewContent = (resume: Resume) => {
        const content = resume.content as ResumeContent
        const name = content?.personal?.name || ''
        const email = content?.personal?.email || ''
        const skills = content?.skills?.slice(0, 3).join(', ') || ''
        const experience = content?.experience?.[0]
        return { name, email, skills, experience }
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Resumes</h1>
                        <p className="text-gray-400">Create ATS-optimized resumes with AI assistance</p>
                    </div>
                    <Button
                        onClick={() => setShowTemplateModal(true)}
                        className="bg-white text-black hover:bg-white/90"
                        disabled={creating}
                    >
                        {creating ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        New Resume
                    </Button>
                </div>

                {/* Resumes Grid */}
                {resumes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">No resumes yet</h2>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            Create your first AI-powered resume and start landing interviews at top companies.
                        </p>
                        <Button
                            onClick={() => setShowTemplateModal(true)}
                            className="bg-white text-black hover:bg-white/90"
                        >
                            {creating ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            Create Your First Resume
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume, index) => {
                            const preview = getPreviewContent(resume)
                            return (
                                <motion.div
                                    key={resume.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative bg-card/30 border border-border/20 rounded-xl overflow-hidden hover:border-white/30 transition-all"
                                >
                                    {/* Resume Preview */}
                                    <div className="aspect-[8.5/11] bg-white/5 p-6 relative">
                                        <div className="space-y-3">
                                            {/* Show actual name or placeholder */}
                                            <div className={`text-center ${preview.name ? 'text-white font-bold text-lg' : 'h-4 bg-white/20 rounded w-1/2 mx-auto'}`}>
                                                {preview.name || ''}
                                            </div>
                                            {preview.email ? (
                                                <p className="text-center text-gray-400 text-xs">{preview.email}</p>
                                            ) : (
                                                <div className="h-2 bg-white/10 rounded w-3/4 mx-auto"></div>
                                            )}
                                            <div className="mt-6 space-y-2">
                                                {preview.experience?.position ? (
                                                    <p className="text-white/70 text-sm">{preview.experience.position}</p>
                                                ) : (
                                                    <div className="h-3 bg-white/15 rounded w-1/3"></div>
                                                )}
                                                {preview.skills ? (
                                                    <p className="text-gray-500 text-xs">{preview.skills}</p>
                                                ) : (
                                                    <>
                                                        <div className="h-2 bg-white/5 rounded w-full"></div>
                                                        <div className="h-2 bg-white/5 rounded w-5/6"></div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hover Actions */}
                                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                            <div className="flex gap-2">
                                                <Link href={`/dashboard/resume/${resume.id}`}>
                                                    <Button size="sm" className="bg-white text-black hover:bg-white/90">
                                                        <Edit3 className="w-4 h-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Link href={`/dashboard/resume/${resume.id}?preview=true`}>
                                                    <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Preview
                                                    </Button>
                                                </Link>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-white/30 text-white hover:bg-white/10"
                                                    onClick={() => duplicateResume(resume)}
                                                >
                                                    <Copy className="w-4 h-4 mr-1" />
                                                    Duplicate
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                                    onClick={() => deleteResume(resume.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Primary Badge */}
                                        {resume.is_primary && (
                                            <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                                                Primary
                                            </div>
                                        )}

                                        {/* ATS Score */}
                                        {resume.ats_score && (
                                            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-1 rounded-lg">
                                                <Sparkles className="w-3 h-3 text-yellow-400" />
                                                <span className="text-xs text-white font-medium">ATS: {resume.ats_score}%</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Resume Info */}
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex-1 min-w-0 mr-2">
                                            {editingId === resume.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') renameResume(resume.id, editTitle)
                                                            if (e.key === 'Escape') setEditingId(null)
                                                        }}
                                                        className="bg-white/10 border border-white/30 rounded px-2 py-1 text-white text-sm w-full focus:outline-none focus:ring-2 focus:ring-white/50"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => renameResume(resume.id, editTitle)}
                                                        className="p-1 text-green-400 hover:text-green-300"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-1 text-gray-400 hover:text-white"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="font-medium text-white truncate">{resume.title}</h3>
                                                    <p className="text-xs text-gray-400">Updated {formatDate(resume.updated_at)}</p>
                                                </>
                                            )}
                                        </div>

                                        {/* Actions Menu */}
                                        {editingId !== resume.id && (
                                            <div className="relative group/menu">
                                                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                                </button>
                                                <div className="absolute right-0 bottom-full mb-2 bg-card border border-border/30 rounded-lg py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 min-w-[140px]">
                                                    <button
                                                        onClick={() => startEditing(resume)}
                                                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                        Rename
                                                    </button>
                                                    <button
                                                        onClick={() => duplicateResume(resume)}
                                                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                        Duplicate
                                                    </button>
                                                    <button
                                                        onClick={() => deleteResume(resume.id)}
                                                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border/30 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Choose a Template</h2>
                                <p className="text-gray-400 text-sm mt-1">Select a professional template for your resume</p>
                            </div>
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <TemplateSelector
                            selectedTemplate={selectedTemplate}
                            onSelectTemplate={setSelectedTemplate}
                        />

                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border/30">
                            <Button
                                variant="outline"
                                onClick={() => setShowTemplateModal(false)}
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={createNewResume}
                                className="bg-white text-black hover:bg-white/90"
                                disabled={creating}
                            >
                                {creating ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Plus className="w-4 h-4 mr-2" />
                                )}
                                Create with {resumeTemplates.find(t => t.id === selectedTemplate)?.name} Template
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
