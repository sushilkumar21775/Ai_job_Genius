"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    Save,
    Sparkles,
    User,
    Briefcase,
    GraduationCap,
    Code,
    FolderOpen,
    Award,
    Plus,
    Trash2,
    Loader2,
    Download,
    Eye,
    X,
    Check,
    Target,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ChevronRight
} from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

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
        id: string
        company: string
        position: string
        location: string
        startDate: string
        endDate: string
        current: boolean
        description: string
    }>
    education: Array<{
        id: string
        school: string
        degree: string
        field: string
        startDate: string
        endDate: string
        gpa: string
    }>
    skills: string[]
    projects: Array<{
        id: string
        name: string
        description: string
        technologies: string
        link: string
    }>
    certifications: Array<{
        id: string
        name: string
        issuer: string
        date: string
        link: string
    }>
}

const TABS = [
    { id: "personal", label: "Personal", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Code },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "certifications", label: "Certifications", icon: Award },
]

// Template style configurations
const getTemplateStyles = (templateId: string) => {
    const templates: Record<string, {
        container: string
        header: string
        name: string
        contact: string
        sectionTitle: string
        company: string
        position: string
        description: string
        skillBg: string
        skillText: string
    }> = {
        classic: {
            container: 'bg-white font-serif',
            header: 'text-center border-b-2 border-gray-800 pb-4 mb-6',
            name: 'text-3xl font-bold text-gray-900 tracking-wide',
            contact: 'text-sm text-gray-600',
            sectionTitle: 'text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1 mb-3',
            company: 'font-semibold text-gray-900',
            position: 'text-gray-700',
            description: 'text-sm text-gray-600',
            skillBg: 'bg-gray-100',
            skillText: 'text-gray-800'
        },
        modern: {
            container: 'bg-white font-sans',
            header: 'text-center pb-4 mb-6 border-b-4 border-blue-500',
            name: 'text-4xl font-extrabold text-gray-900',
            contact: 'text-sm text-blue-600',
            sectionTitle: 'text-lg font-bold text-blue-600 uppercase tracking-wide mb-3',
            company: 'font-bold text-gray-900',
            position: 'text-blue-600',
            description: 'text-gray-600',
            skillBg: 'bg-blue-50 border border-blue-200',
            skillText: 'text-blue-700'
        },
        creative: {
            container: 'bg-gradient-to-br from-purple-50 to-pink-50 font-sans',
            header: 'text-center pb-6 mb-6',
            name: 'text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
            contact: 'text-sm text-purple-600',
            sectionTitle: 'text-lg font-bold text-purple-700 uppercase tracking-wide mb-3 border-l-4 border-purple-500 pl-3',
            company: 'font-bold text-gray-900',
            position: 'text-purple-600 font-medium',
            description: 'text-gray-700',
            skillBg: 'bg-gradient-to-r from-purple-100 to-pink-100',
            skillText: 'text-purple-700'
        },
        executive: {
            container: 'bg-white font-serif',
            header: 'text-center pb-4 mb-6 border-b border-gray-300',
            name: 'text-3xl font-bold text-gray-800 tracking-widest uppercase',
            contact: 'text-sm text-gray-500 tracking-wide',
            sectionTitle: 'text-sm font-bold text-gray-700 uppercase tracking-[0.2em] border-b border-gray-300 pb-2 mb-4',
            company: 'font-semibold text-gray-800',
            position: 'text-gray-600 italic',
            description: 'text-gray-600',
            skillBg: 'bg-gray-100 border border-gray-200',
            skillText: 'text-gray-700'
        },
        minimal: {
            container: 'bg-white font-sans',
            header: 'pb-4 mb-6 border-b border-gray-200',
            name: 'text-2xl font-medium text-gray-900',
            contact: 'text-xs text-gray-500 mt-1',
            sectionTitle: 'text-sm font-medium text-gray-900 uppercase tracking-wide mb-2',
            company: 'font-medium text-gray-900',
            position: 'text-gray-600',
            description: 'text-sm text-gray-500 leading-relaxed',
            skillBg: 'bg-transparent border border-gray-300',
            skillText: 'text-gray-600'
        },
        tech: {
            container: 'bg-slate-900 font-mono text-white',
            header: 'text-center pb-4 mb-6 border-b-2 border-cyan-400',
            name: 'text-3xl font-bold text-cyan-400',
            contact: 'text-sm text-slate-400',
            sectionTitle: 'text-base font-bold text-cyan-400 uppercase tracking-wide mb-3',
            company: 'font-bold text-white',
            position: 'text-cyan-300',
            description: 'text-slate-300 text-sm',
            skillBg: 'bg-slate-800 border border-cyan-500/50',
            skillText: 'text-cyan-300'
        }
    }
    return templates[templateId] || templates.modern
}


export default function ResumeEditorPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}>
            <ResumeEditorContent />
        </Suspense>
    )
}

function ResumeEditorContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const resumeId = params.id as string
    const previewRef = useRef<HTMLDivElement>(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("personal")
    const [resumeTitle, setResumeTitle] = useState("My Resume")
    const [template, setTemplate] = useState("modern")
    const [content, setContent] = useState<ResumeContent>({
        personal: { name: "", email: "", phone: "", location: "", linkedin: "", summary: "" },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: []
    })
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [newSkill, setNewSkill] = useState("")
    const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)

    // Popular skills database for autocomplete
    const SKILL_DATABASE = [
        // Programming Languages
        "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "C", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB",
        // Frontend
        "React", "React Native", "Next.js", "Vue.js", "Angular", "Svelte", "HTML", "CSS", "Tailwind CSS", "Bootstrap", "SASS", "Redux", "jQuery",
        // Backend
        "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot", "Ruby on Rails", "Laravel", "ASP.NET", "GraphQL", "REST API",
        // Databases
        "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Firebase", "Supabase", "DynamoDB", "Cassandra", "Oracle", "SQL Server",
        // Cloud & DevOps
        "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "CI/CD", "Terraform", "Linux", "Git", "GitHub", "GitLab", "Vercel", "Netlify",
        // AI/ML
        "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "NLP", "Computer Vision", "OpenAI", "LangChain", "Hugging Face",
        // Data
        "Data Analysis", "Data Science", "Pandas", "NumPy", "Tableau", "Power BI", "Excel", "Data Visualization", "ETL", "Big Data", "Hadoop", "Spark",
        // Mobile
        "iOS Development", "Android Development", "Flutter", "React Native", "Xamarin", "SwiftUI", "Jetpack Compose",
        // Tools & Practices
        "Agile", "Scrum", "Jira", "Figma", "Adobe XD", "Photoshop", "UI/UX Design", "Responsive Design", "Testing", "Jest", "Cypress", "Selenium",
        // Soft Skills
        "Leadership", "Communication", "Problem Solving", "Team Collaboration", "Project Management", "Time Management", "Critical Thinking", "Analytical Skills"
    ]

    // AI loading states
    const [generatingSummary, setGeneratingSummary] = useState(false)
    const [improvingExpId, setImprovingExpId] = useState<string | null>(null)
    const [suggestingSkills, setSuggestingSkills] = useState(false)
    const [suggestedSkills, setSuggestedSkills] = useState<string[]>([])

    // Preview and export states
    const [showPreview, setShowPreview] = useState(false)
    const [showTemplateSelector, setShowTemplateSelector] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")

    // ATS Analysis states
    const [analyzingATS, setAnalyzingATS] = useState(false)
    const [showATSPanel, setShowATSPanel] = useState(false)
    const [atsResult, setAtsResult] = useState<{
        overallScore: number
        breakdown: { category: string; score: number; maxScore: number; status: string; feedback: string }[]
        suggestions: string[]
        keywords: { found: string[]; missing: string[] }
        strengths: string[]
        weaknesses: string[]
    } | null>(null)

    useEffect(() => {
        fetchResume()
        if (searchParams.get('preview') === 'true') {
            setShowPreview(true)
        }
    }, [resumeId, searchParams])

    const fetchResume = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("resumes")
            .select("*")
            .eq("id", resumeId)
            .single()

        if (data) {
            setResumeTitle(data.title)
            setContent(data.content as ResumeContent)
            setTemplate(data.template || 'modern')
        }
        setLoading(false)
    }

    const saveResume = async (sectionName?: string) => {
        setSaving(true)
        const supabase = createClient()

        const { error } = await supabase
            .from("resumes")
            .update({
                title: resumeTitle,
                content: content,
                updated_at: new Date().toISOString()
            })
            .eq("id", resumeId)

        setSaving(false)

        if (!error) {
            const message = sectionName
                ? `✓ ${sectionName} saved!`
                : "✓ Resume saved successfully!"
            setToastMessage(message)
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        } else {
            setToastMessage("❌ Failed to save. Please try again.")
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        }
    }

    const updatePersonal = (field: string, value: string) => {
        setContent(prev => ({
            ...prev,
            personal: { ...prev.personal, [field]: value }
        }))
    }

    // AI Functions
    const generateSummary = async () => {
        setGeneratingSummary(true)
        try {
            const response = await fetch('/api/resume/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            })
            const data = await response.json()
            if (data.summary) {
                updatePersonal('summary', data.summary)
            }
        } catch (error) {
            console.error('Error generating summary:', error)
        }
        setGeneratingSummary(false)
    }

    const improveExperience = async (expId: string) => {
        const exp = content.experience.find(e => e.id === expId)
        if (!exp) return

        setImprovingExpId(expId)
        try {
            const response = await fetch('/api/resume/improve-experience', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: exp.description,
                    position: exp.position,
                    company: exp.company
                })
            })
            const data = await response.json()
            if (data.description) {
                updateExperience(expId, 'description', data.description)
            }
        } catch (error) {
            console.error('Error improving experience:', error)
        }
        setImprovingExpId(null)
    }

    const suggestSkillsAI = async () => {
        setSuggestingSkills(true)
        setSuggestedSkills([])
        try {
            const response = await fetch('/api/resume/suggest-skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    experience: content.experience,
                    currentSkills: content.skills
                })
            })
            const data = await response.json()
            if (data.skills) {
                setSuggestedSkills(data.skills)
            }
        } catch (error) {
            console.error('Error suggesting skills:', error)
        }
        setSuggestingSkills(false)
    }

    const addSuggestedSkill = (skill: string) => {
        if (!content.skills.includes(skill)) {
            setContent(prev => ({
                ...prev,
                skills: [...prev.skills, skill]
            }))
        }
        setSuggestedSkills(prev => prev.filter(s => s !== skill))
    }

    // ATS Score Analysis
    const analyzeATS = async () => {
        setAnalyzingATS(true)
        setShowATSPanel(true)

        try {
            const response = await fetch('/api/resume/ats-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: content })
            })
            const data = await response.json()

            if (data.overallScore !== undefined) {
                setAtsResult(data)

                // Update ATS score in database
                const supabase = createClient()
                await supabase
                    .from("resumes")
                    .update({ ats_score: data.overallScore })
                    .eq("id", resumeId)
            }
        } catch (error) {
            console.error('Error analyzing ATS:', error)
            setToastMessage("❌ Failed to analyze resume")
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        }

        setAnalyzingATS(false)
    }

    // PDF Export - Using jsPDF native text rendering (reliable, no oklch issues)
    const exportPDF = async () => {
        setExporting(true)

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            // Template-specific colors (hex values work in jsPDF)
            const templateColors: Record<string, { primary: string; accent: string; bg: string }> = {
                classic: { primary: '#1f2937', accent: '#374151', bg: '#ffffff' },
                modern: { primary: '#2563eb', accent: '#3b82f6', bg: '#ffffff' },
                creative: { primary: '#9333ea', accent: '#a855f7', bg: '#ffffff' },
                executive: { primary: '#374151', accent: '#4b5563', bg: '#ffffff' },
                minimal: { primary: '#111827', accent: '#6b7280', bg: '#ffffff' },
                tech: { primary: '#22d3ee', accent: '#06b6d4', bg: '#0f172a' }
            }
            const colors = templateColors[template] || templateColors.modern
            const isDark = template === 'tech'
            const textMain = isDark ? '#e2e8f0' : '#000000'
            const textSub = isDark ? '#94a3b8' : '#6b7280'

            // Set background for dark templates
            if (isDark) {
                pdf.setFillColor(15, 23, 42)
                pdf.rect(0, 0, 210, 297, 'F')
            }

            const pageWidth = pdf.internal.pageSize.getWidth()
            const margin = 20
            const contentWidth = pageWidth - (margin * 2)
            let y = margin

            // Helper: Add text with wrap
            const addText = (text: string, fontSize: number, isBold = false, color = textMain, align: 'left' | 'center' = 'left') => {
                pdf.setFontSize(fontSize)
                pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
                pdf.setTextColor(color)
                const lines = pdf.splitTextToSize(text, contentWidth)
                lines.forEach((line: string) => {
                    if (y > 280) { pdf.addPage(); y = margin }
                    const x = align === 'center' ? pageWidth / 2 : margin
                    pdf.text(line, x, y, { align })
                    y += fontSize * 0.4
                })
                y += 2
            }

            // Helper: Convert hex to RGB for jsPDF
            const hexToRgb = (hex: string) => {
                const r = parseInt(hex.slice(1, 3), 16)
                const g = parseInt(hex.slice(3, 5), 16)
                const b = parseInt(hex.slice(5, 7), 16)
                return { r, g, b }
            }

            // Helper: Section title with colored left border (matching preview)
            const sectionTitle = (text: string) => {
                y += 6
                const rgb = hexToRgb(colors.primary)

                // Draw colored left border line (like preview)
                pdf.setFillColor(rgb.r, rgb.g, rgb.b)
                pdf.rect(margin, y - 4.5, 2, 6, 'F')

                // Section title text
                pdf.setFontSize(12)
                pdf.setFont('helvetica', 'bold')
                pdf.setTextColor(colors.primary)
                pdf.text(text, margin + 5, y)
                y += 7
            }

            // Helper: Draw skill badge with border
            const drawSkillBadge = (skill: string, x: number, yPos: number): number => {
                const padding = 3
                pdf.setFontSize(9)
                const textWidth = pdf.getTextWidth(skill)
                const badgeWidth = textWidth + (padding * 2)
                const badgeHeight = 6

                // Badge background
                const bgRgb = hexToRgb(isDark ? '#1e293b' : '#f3f4f6')
                pdf.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b)
                pdf.roundedRect(x, yPos - 4.5, badgeWidth, badgeHeight, 1, 1, 'F')

                // Badge border
                const borderRgb = hexToRgb(isDark ? '#475569' : '#d1d5db')
                pdf.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b)
                pdf.setLineWidth(0.3)
                pdf.roundedRect(x, yPos - 4.5, badgeWidth, badgeHeight, 1, 1, 'S')

                // Badge text
                pdf.setFont('helvetica', 'normal')
                pdf.setTextColor(textMain)
                pdf.text(skill, x + padding, yPos)

                return badgeWidth + 3
            }

            // === HEADER ===
            pdf.setFontSize(22)
            pdf.setFont('helvetica', 'bold')
            pdf.setTextColor(textMain)
            pdf.text(content.personal.name || 'Your Name', pageWidth / 2, y, { align: 'center' })
            y += 8

            // Contact line
            const contactInfo = [content.personal.email, content.personal.phone, content.personal.location].filter(Boolean).join('  •  ')
            if (contactInfo) {
                pdf.setFontSize(9)
                pdf.setFont('helvetica', 'normal')
                pdf.setTextColor(textSub)
                pdf.text(contactInfo, pageWidth / 2, y, { align: 'center' })
                y += 5
            }

            if (content.personal.linkedin) {
                pdf.setFontSize(9)
                pdf.setTextColor(colors.accent)
                pdf.text(content.personal.linkedin, pageWidth / 2, y, { align: 'center' })
                y += 6
            }

            // === SUMMARY ===
            if (content.personal.summary) {
                sectionTitle('PROFESSIONAL SUMMARY')
                addText(content.personal.summary, 10, false, textMain)
            }

            // === EDUCATION ===
            const validEdu = content.education.filter(e => e.school || e.degree)
            if (validEdu.length > 0) {
                sectionTitle('EDUCATION')
                validEdu.forEach(edu => {
                    pdf.setFontSize(11)
                    pdf.setFont('helvetica', 'bold')
                    pdf.setTextColor(textMain)
                    const eduTitle = edu.school || ''
                    const dateStr = edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : ''
                    if (eduTitle) {
                        pdf.text(eduTitle, margin, y)
                        if (dateStr) {
                            pdf.setFont('helvetica', 'normal')
                            pdf.setFontSize(9)
                            pdf.setTextColor(textSub)
                            pdf.text(dateStr, pageWidth - margin, y, { align: 'right' })
                        }
                        y += 5
                    }
                    if (edu.degree) {
                        pdf.setFontSize(10)
                        pdf.setFont('helvetica', 'normal')
                        pdf.setTextColor(textMain)
                        pdf.text(`${edu.degree}${edu.field ? ' in ' + edu.field : ''}${edu.gpa ? '  •  GPA: ' + edu.gpa : ''}`, margin, y)
                        y += 6
                    }
                })
            }

            // === SKILLS (as badges like preview) ===
            if (content.skills.length > 0) {
                sectionTitle('SKILLS')

                let xPos = margin
                let rowY = y

                content.skills.forEach((skill) => {
                    pdf.setFontSize(9)
                    const badgeWidth = pdf.getTextWidth(skill) + 8

                    // Check if badge fits on current line
                    if (xPos + badgeWidth > pageWidth - margin) {
                        xPos = margin
                        rowY += 8
                    }

                    // Check page break
                    if (rowY > 280) {
                        pdf.addPage()
                        if (isDark) {
                            pdf.setFillColor(15, 23, 42)
                            pdf.rect(0, 0, 210, 297, 'F')
                        }
                        rowY = margin
                    }

                    const addedWidth = drawSkillBadge(skill, xPos, rowY)
                    xPos += addedWidth
                })
                y = rowY + 8
            }

            // === PROJECTS ===
            const validProjects = content.projects.filter(p => p.name || p.description)
            if (validProjects.length > 0) {
                sectionTitle('PROJECTS')
                validProjects.forEach(proj => {
                    // Project name (bold)
                    pdf.setFontSize(11)
                    pdf.setFont('helvetica', 'bold')
                    pdf.setTextColor(textMain)
                    pdf.text(proj.name || 'Untitled Project', margin, y)
                    y += 4

                    // Link on separate line (prevent overlap)
                    if (proj.link) {
                        pdf.setFontSize(8)
                        pdf.setFont('helvetica', 'normal')
                        pdf.setTextColor(colors.accent)
                        // Truncate link if too long
                        const maxLinkWidth = contentWidth
                        let linkText = proj.link
                        while (pdf.getTextWidth(linkText) > maxLinkWidth && linkText.length > 10) {
                            linkText = linkText.substring(0, linkText.length - 4) + '...'
                        }
                        pdf.text(linkText, margin, y)
                        y += 4
                    }

                    // Technologies (wrap properly)
                    if (proj.technologies) {
                        pdf.setFontSize(9)
                        pdf.setFont('helvetica', 'italic')
                        pdf.setTextColor(textSub)
                        const techLines = pdf.splitTextToSize('Technologies: ' + proj.technologies, contentWidth)
                        techLines.forEach((line: string) => {
                            pdf.text(line, margin, y)
                            y += 4
                        })
                    }

                    // Description
                    if (proj.description) {
                        addText(proj.description, 9, false, textMain)
                    }
                    y += 3
                })
            }

            // === EXPERIENCE ===
            const validExp = content.experience.filter(e => e.company || e.position)
            if (validExp.length > 0) {
                sectionTitle('EXPERIENCE')
                validExp.forEach(exp => {
                    pdf.setFontSize(11)
                    pdf.setFont('helvetica', 'bold')
                    pdf.setTextColor(textMain)
                    pdf.text(`${exp.position || ''}${exp.company ? ' at ' + exp.company : ''}`, margin, y)
                    y += 5
                    if (exp.startDate || exp.endDate) {
                        pdf.setFontSize(9)
                        pdf.setTextColor(textSub)
                        pdf.text(`${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`, margin, y)
                        y += 4
                    }
                    if (exp.description) {
                        addText(exp.description, 10, false, textMain)
                    }
                    y += 2
                })
            }

            // === CERTIFICATIONS ===
            const validCerts = content.certifications.filter(c => c.name)
            if (validCerts.length > 0) {
                sectionTitle('CERTIFICATIONS')
                validCerts.forEach(cert => {
                    pdf.setFontSize(10)
                    pdf.setFont('helvetica', 'bold')
                    pdf.setTextColor(textMain)
                    pdf.text(`${cert.name}${cert.issuer ? ' - ' + cert.issuer : ''}`, margin, y)
                    if (cert.date) {
                        pdf.setFont('helvetica', 'normal')
                        pdf.setTextColor(textSub)
                        pdf.text(cert.date, pageWidth - margin, y, { align: 'right' })
                    }
                    y += 5
                })
            }

            // Save
            pdf.save(`${content.personal.name || resumeTitle || 'Resume'}_Resume.pdf`)

            setToastMessage("✓ PDF downloaded successfully!")
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        } catch (error) {
            console.error('Error exporting PDF:', error)
            setToastMessage("❌ Failed to export PDF")
            setShowToast(true)
            setTimeout(() => setShowToast(false), 4000)
        }

        setExporting(false)
    }

    // Experience functions
    const addExperience = () => {
        setContent(prev => ({
            ...prev,
            experience: [...prev.experience, {
                id: crypto.randomUUID(),
                company: "",
                position: "",
                location: "",
                startDate: "",
                endDate: "",
                current: false,
                description: ""
            }]
        }))
    }

    const updateExperience = (id: string, field: string, value: string | boolean) => {
        setContent(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }))
    }

    const removeExperience = (id: string) => {
        setContent(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }))
    }

    // Education functions
    const addEducation = () => {
        setContent(prev => ({
            ...prev,
            education: [...prev.education, {
                id: crypto.randomUUID(),
                school: "",
                degree: "",
                field: "",
                startDate: "",
                endDate: "",
                gpa: ""
            }]
        }))
    }

    const updateEducation = (id: string, field: string, value: string) => {
        setContent(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        }))
    }

    const removeEducation = (id: string) => {
        setContent(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }))
    }

    // Skills functions
    const addSkill = () => {
        if (newSkill.trim() && !content.skills.includes(newSkill.trim())) {
            setContent(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }))
            setNewSkill("")
        }
    }

    const removeSkill = (skill: string) => {
        setContent(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }))
    }

    // Projects functions
    const addProject = () => {
        setContent(prev => ({
            ...prev,
            projects: [...prev.projects, {
                id: crypto.randomUUID(),
                name: "",
                description: "",
                technologies: "",
                link: ""
            }]
        }))
    }

    const updateProject = (id: string, field: string, value: string) => {
        setContent(prev => ({
            ...prev,
            projects: prev.projects.map(proj =>
                proj.id === id ? { ...proj, [field]: value } : proj
            )
        }))
    }

    const removeProject = (id: string) => {
        setContent(prev => ({
            ...prev,
            projects: prev.projects.filter(proj => proj.id !== id)
        }))
    }

    // Certifications functions
    const addCertification = () => {
        setContent(prev => ({
            ...prev,
            certifications: [...prev.certifications, {
                id: crypto.randomUUID(),
                name: "",
                issuer: "",
                date: "",
                link: ""
            }]
        }))
    }

    const updateCertification = (id: string, field: string, value: string) => {
        setContent(prev => ({
            ...prev,
            certifications: prev.certifications.map(cert =>
                cert.id === id ? { ...cert, [field]: value } : cert
            )
        }))
    }

    const removeCertification = (id: string) => {
        setContent(prev => ({
            ...prev,
            certifications: prev.certifications.filter(cert => cert.id !== id)
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        )
    }

    return (
        <>
            <div className="min-h-screen bg-black flex">
                {/* Sidebar */}
                <div className="w-64 border-r border-border/10 bg-card/30 flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-border/10">
                        <Link href="/dashboard/resume">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white w-full justify-start">
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back to Resumes
                            </Button>
                        </Link>
                    </div>

                    {/* Resume Title */}
                    <div className="p-4 border-b border-border/10">
                        <input
                            type="text"
                            value={resumeTitle}
                            onChange={(e) => setResumeTitle(e.target.value)}
                            className="w-full bg-transparent text-white font-semibold text-lg focus:outline-none border-b border-transparent focus:border-white/30 pb-1"
                        />
                    </div>

                    {/* Tabs */}
                    <nav className="flex-1 p-2">
                        {TABS.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === tab.id
                                        ? "bg-white/10 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>

                    {/* Actions */}
                    <div className="p-4 border-t border-border/10 space-y-2">
                        <Button
                            onClick={() => saveResume()}
                            className="w-full bg-white text-black hover:bg-white/90"
                            disabled={saving}
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Save Resume
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-border/30 text-white hover:bg-white/10"
                            onClick={() => setShowPreview(true)}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-border/30 text-white hover:bg-white/10"
                            onClick={exportPDF}
                            disabled={exporting}
                        >
                            {exporting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Export PDF
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-border/30 text-white hover:bg-white/10"
                            onClick={() => setShowTemplateSelector(true)}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Change Template
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    <div className="max-w-3xl mx-auto p-8">
                        {/* Personal Info */}
                        {activeTab === "personal" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={content.personal.name}
                                            onChange={(e) => updatePersonal("name", e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={content.personal.email}
                                            onChange={(e) => updatePersonal("email", e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            value={content.personal.phone}
                                            onChange={(e) => updatePersonal("phone", e.target.value)}
                                            placeholder="+1 234 567 8900"
                                            className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Location</label>
                                        <input
                                            type="text"
                                            value={content.personal.location}
                                            onChange={(e) => updatePersonal("location", e.target.value)}
                                            placeholder="San Francisco, CA"
                                            className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        value={content.personal.linkedin}
                                        onChange={(e) => updatePersonal("linkedin", e.target.value)}
                                        placeholder="https://linkedin.com/in/johndoe"
                                        className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm text-gray-400">Professional Summary</label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-purple-400 hover:text-purple-300"
                                            onClick={generateSummary}
                                            disabled={generatingSummary}
                                        >
                                            {generatingSummary ? (
                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-3 h-3 mr-1" />
                                            )}
                                            {generatingSummary ? 'Generating...' : 'Generate with AI'}
                                        </Button>
                                    </div>
                                    <textarea
                                        value={content.personal.summary}
                                        onChange={(e) => updatePersonal("summary", e.target.value)}
                                        placeholder="A brief overview of your professional background and career objectives..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                                    />
                                </div>

                                {/* Save & Continue Button */}
                                <div className="flex items-center justify-between pt-6 border-t border-border/20">
                                    <div className="flex items-center gap-2">
                                        {saveSuccess && (
                                            <span className="text-sm text-green-400 flex items-center gap-1">
                                                <Check className="w-4 h-4" />
                                                Saved!
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="border-border/30 text-white hover:bg-white/10"
                                            onClick={async () => {
                                                await saveResume('Personal Information')
                                                setSaveSuccess(true)
                                                setTimeout(() => setSaveSuccess(false), 2000)
                                            }}
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            Save
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                await saveResume('Personal Information')
                                                setActiveTab('experience')
                                            }}
                                            className="bg-white text-black hover:bg-white/90"
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : 'Continue to Experience'}
                                            <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Experience */}
                        {activeTab === "experience" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Work Experience</h2>
                                    <Button onClick={addExperience} className="bg-white text-black hover:bg-white/90">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Experience
                                    </Button>
                                </div>

                                {content.experience.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-border/30 rounded-xl">
                                        <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-400">No work experience added yet</p>
                                        <Button onClick={addExperience} variant="outline" className="mt-4 border-border/30 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Your First Experience
                                        </Button>
                                    </div>
                                ) : (
                                    content.experience.map((exp, index) => (
                                        <div key={exp.id} className="p-6 bg-white/5 border border-border/20 rounded-xl space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Experience {index + 1}</span>
                                                <button
                                                    onClick={() => removeExperience(exp.id)}
                                                    className="text-red-400 hover:text-red-300 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    value={exp.company}
                                                    onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                                                    placeholder="Company Name"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                                <input
                                                    type="text"
                                                    value={exp.position}
                                                    onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                                                    placeholder="Job Title"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                                <input
                                                    type="text"
                                                    value={exp.location}
                                                    onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                                                    placeholder="Location"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={exp.startDate}
                                                        onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                                                        placeholder="Start Date"
                                                        className="flex-1 px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={exp.endDate}
                                                        onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                                                        placeholder={exp.current ? "Present" : "End Date"}
                                                        disabled={exp.current}
                                                        className="flex-1 px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>

                                            <label className="flex items-center gap-2 text-sm text-gray-400">
                                                <input
                                                    type="checkbox"
                                                    checked={exp.current}
                                                    onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                                                    className="rounded border-border/30"
                                                />
                                                I currently work here
                                            </label>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-sm text-gray-400">Description & Achievements</label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-purple-400 hover:text-purple-300"
                                                        onClick={() => improveExperience(exp.id)}
                                                        disabled={improvingExpId === exp.id}
                                                    >
                                                        {improvingExpId === exp.id ? (
                                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                        ) : (
                                                            <Sparkles className="w-3 h-3 mr-1" />
                                                        )}
                                                        {improvingExpId === exp.id ? 'Improving...' : 'Improve with AI'}
                                                    </Button>
                                                </div>
                                                <textarea
                                                    value={exp.description}
                                                    onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                                                    placeholder="• Describe your responsibilities and achievements..."
                                                    rows={4}
                                                    className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t border-border/20">
                                    <Button
                                        variant="outline"
                                        className="border-border/30 text-white hover:bg-white/10"
                                        onClick={() => setActiveTab('personal')}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back to Personal
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            await saveResume('Work Experience')
                                            setActiveTab('education')
                                        }}
                                        className="bg-white text-black hover:bg-white/90"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Continue to Education'}
                                        <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Education */}
                        {activeTab === "education" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Education</h2>
                                    <Button onClick={addEducation} className="bg-white text-black hover:bg-white/90">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Education
                                    </Button>
                                </div>

                                {content.education.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-border/30 rounded-xl">
                                        <GraduationCap className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-400">No education added yet</p>
                                        <Button onClick={addEducation} variant="outline" className="mt-4 border-border/30 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Your Education
                                        </Button>
                                    </div>
                                ) : (
                                    content.education.map((edu, index) => (
                                        <div key={edu.id} className="p-6 bg-white/5 border border-border/20 rounded-xl space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Education {index + 1}</span>
                                                <button
                                                    onClick={() => removeEducation(edu.id)}
                                                    className="text-red-400 hover:text-red-300 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    value={edu.school}
                                                    onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                                                    placeholder="School/University"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                                <input
                                                    type="text"
                                                    value={edu.degree}
                                                    onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                                                    placeholder="Degree (e.g., Bachelor's)"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                                <input
                                                    type="text"
                                                    value={edu.field}
                                                    onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                                                    placeholder="Field of Study"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                                <input
                                                    type="text"
                                                    value={edu.gpa}
                                                    onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                                                    placeholder="GPA (optional)"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                                <input
                                                    type="text"
                                                    value={edu.startDate}
                                                    onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                                                    placeholder="Start Year"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                                <input
                                                    type="text"
                                                    value={edu.endDate}
                                                    onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                                                    placeholder="End Year"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t border-border/20">
                                    <Button
                                        variant="outline"
                                        className="border-border/30 text-white hover:bg-white/10"
                                        onClick={() => setActiveTab('experience')}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back to Experience
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            await saveResume('Education')
                                            setActiveTab('skills')
                                        }}
                                        className="bg-white text-black hover:bg-white/90"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Continue to Skills'}
                                        <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Skills */}
                        {activeTab === "skills" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Skills</h2>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                                        onClick={suggestSkillsAI}
                                        disabled={suggestingSkills}
                                    >
                                        {suggestingSkills ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4 mr-2" />
                                        )}
                                        {suggestingSkills ? 'Finding Skills...' : 'Suggest Skills'}
                                    </Button>
                                </div>

                                {/* AI Suggested Skills */}
                                <AnimatePresence>
                                    {suggestedSkills.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl"
                                        >
                                            <p className="text-sm text-purple-400 mb-3 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                AI Suggested Skills (click to add)
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {suggestedSkills.map((skill) => (
                                                    <button
                                                        key={skill}
                                                        onClick={() => addSuggestedSkill(skill)}
                                                        className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-full text-sm flex items-center gap-1 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        {skill}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="relative">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => {
                                                setNewSkill(e.target.value)
                                                setShowSkillSuggestions(e.target.value.length > 0)
                                            }}
                                            onFocus={() => setShowSkillSuggestions(newSkill.length > 0)}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    addSkill()
                                                    setShowSkillSuggestions(false)
                                                }
                                            }}
                                            placeholder="Type a skill (e.g., React, Python, Machine Learning)"
                                            className="flex-1 px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        />
                                        <Button onClick={() => { addSkill(); setShowSkillSuggestions(false); }} className="bg-white text-black hover:bg-white/90">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Autocomplete Dropdown */}
                                    {showSkillSuggestions && newSkill.length > 0 && (
                                        <div className="absolute z-50 w-full mt-2 max-h-48 overflow-auto bg-gray-900 border border-border/30 rounded-xl shadow-lg">
                                            {SKILL_DATABASE
                                                .filter(skill =>
                                                    skill.toLowerCase().includes(newSkill.toLowerCase()) &&
                                                    !content.skills.includes(skill)
                                                )
                                                .slice(0, 8)
                                                .map((skill) => (
                                                    <button
                                                        key={skill}
                                                        onClick={() => {
                                                            if (!content.skills.includes(skill)) {
                                                                setContent(prev => ({
                                                                    ...prev,
                                                                    skills: [...prev.skills, skill]
                                                                }))
                                                            }
                                                            setNewSkill("")
                                                            setShowSkillSuggestions(false)
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3 text-gray-400" />
                                                        <span>{skill}</span>
                                                    </button>
                                                ))
                                            }
                                            {SKILL_DATABASE.filter(skill =>
                                                skill.toLowerCase().includes(newSkill.toLowerCase()) &&
                                                !content.skills.includes(skill)
                                            ).length === 0 && (
                                                    <div className="px-4 py-2.5 text-gray-400 text-sm">
                                                        Press Enter to add "{newSkill}" as a custom skill
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {content.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-4 py-2 bg-white/10 text-white rounded-full flex items-center gap-2 group"
                                        >
                                            {skill}
                                            <button
                                                onClick={() => removeSkill(skill)}
                                                className="text-gray-400 hover:text-red-400"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                {content.skills.length === 0 && suggestedSkills.length === 0 && (
                                    <div className="text-center py-12 border border-dashed border-border/30 rounded-xl">
                                        <Code className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-400">No skills added yet</p>
                                        <p className="text-sm text-gray-500 mt-2">Start typing above or click "Suggest Skills" for AI recommendations</p>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t border-border/20">
                                    <Button
                                        variant="outline"
                                        className="border-border/30 text-white hover:bg-white/10"
                                        onClick={() => setActiveTab('education')}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back to Education
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            await saveResume('Skills')
                                            setActiveTab('projects')
                                        }}
                                        className="bg-white text-black hover:bg-white/90"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Continue to Projects'}
                                        <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Projects */}
                        {activeTab === "projects" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Projects</h2>
                                    <Button onClick={addProject} className="bg-white text-black hover:bg-white/90">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Project
                                    </Button>
                                </div>

                                {content.projects.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-border/30 rounded-xl">
                                        <FolderOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-400">No projects added yet</p>
                                        <Button onClick={addProject} variant="outline" className="mt-4 border-border/30 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Your First Project
                                        </Button>
                                    </div>
                                ) : (
                                    content.projects.map((proj, index) => (
                                        <div key={proj.id} className="p-6 bg-white/5 border border-border/20 rounded-xl space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Project {index + 1}</span>
                                                <button
                                                    onClick={() => removeProject(proj.id)}
                                                    className="text-red-400 hover:text-red-300 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    value={proj.name}
                                                    onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                                                    placeholder="Project Name"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                                <input
                                                    type="text"
                                                    value={proj.technologies}
                                                    onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
                                                    placeholder="Technologies Used"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                            </div>
                                            <input
                                                type="url"
                                                value={proj.link}
                                                onChange={(e) => updateProject(proj.id, "link", e.target.value)}
                                                placeholder="Project Link (optional)"
                                                className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                            />
                                            <textarea
                                                value={proj.description}
                                                onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                                                placeholder="Describe your project..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                                            />
                                        </div>
                                    ))
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t border-border/20">
                                    <Button
                                        variant="outline"
                                        className="border-border/30 text-white hover:bg-white/10"
                                        onClick={() => setActiveTab('skills')}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back to Skills
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            await saveResume('Projects')
                                            setActiveTab('certifications')
                                        }}
                                        className="bg-white text-black hover:bg-white/90"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Continue to Certifications'}
                                        <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Certifications */}
                        {activeTab === "certifications" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Certifications</h2>
                                    <Button onClick={addCertification} className="bg-white text-black hover:bg-white/90">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Certification
                                    </Button>
                                </div>

                                {content.certifications.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-border/30 rounded-xl">
                                        <Award className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-400">No certifications added yet</p>
                                        <Button onClick={addCertification} variant="outline" className="mt-4 border-border/30 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Your First Certification
                                        </Button>
                                    </div>
                                ) : (
                                    content.certifications.map((cert, index) => (
                                        <div key={cert.id} className="p-6 bg-white/5 border border-border/20 rounded-xl space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Certification {index + 1}</span>
                                                <button
                                                    onClick={() => removeCertification(cert.id)}
                                                    className="text-red-400 hover:text-red-300 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    value={cert.name}
                                                    onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                                                    placeholder="Certification Name"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                                <input
                                                    type="text"
                                                    value={cert.issuer}
                                                    onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                                                    placeholder="Issuing Organization"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                                <input
                                                    type="text"
                                                    value={cert.date}
                                                    onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                                                    placeholder="Date Earned"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                                <input
                                                    type="url"
                                                    value={cert.link}
                                                    onChange={(e) => updateCertification(cert.id, "link", e.target.value)}
                                                    placeholder="Credential URL (optional)"
                                                    className="px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Final Navigation */}
                                <div className="flex items-center justify-between pt-6 border-t border-border/20">
                                    <Button
                                        variant="outline"
                                        className="border-border/30 text-white hover:bg-white/10"
                                        onClick={() => setActiveTab('projects')}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back to Projects
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => saveResume('Certifications')}
                                            className="bg-green-600 text-white hover:bg-green-700"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Check className="w-4 h-4 mr-2" />
                                            )}
                                            Save Resume
                                        </Button>
                                        <Button
                                            onClick={() => setShowPreview(true)}
                                            className="bg-white text-black hover:bg-white/90"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Preview & Export
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => !exporting && setShowPreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-4xl w-full max-h-[90vh] overflow-auto bg-white rounded-xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowPreview(false)}
                                className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                disabled={exporting}
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>

                            {/* Resume Preview Content */}
                            {(() => {
                                const styles = getTemplateStyles(template)
                                return (
                                    <div ref={previewRef} className={`p-8 min-h-[1100px] ${styles.container}`}>
                                        {/* Header */}
                                        <div className={styles.header}>
                                            <h1 className={styles.name}>{content.personal.name || 'Your Name'}</h1>
                                            <div className={`flex items-center justify-center gap-4 mt-2 flex-wrap ${styles.contact}`}>
                                                {content.personal.email && <span>{content.personal.email}</span>}
                                                {content.personal.phone && <span>• {content.personal.phone}</span>}
                                                {content.personal.location && <span>• {content.personal.location}</span>}
                                            </div>
                                            {content.personal.linkedin && (
                                                <div className={`text-sm mt-1 ${styles.contact}`}>{content.personal.linkedin}</div>
                                            )}
                                        </div>

                                        {/* Summary */}
                                        {content.personal.summary && (
                                            <div className="mb-6">
                                                <h2 className={styles.sectionTitle}>PROFESSIONAL SUMMARY</h2>
                                                <p className={styles.description}>{content.personal.summary}</p>
                                            </div>
                                        )}

                                        {/* Experience - only show if entries have actual content */}
                                        {content.experience.filter(exp => exp.position || exp.company || exp.description).length > 0 && (
                                            <div className="mb-6">
                                                <h2 className={styles.sectionTitle}>WORK EXPERIENCE</h2>
                                                {content.experience
                                                    .filter(exp => exp.position || exp.company || exp.description)
                                                    .map((exp) => (
                                                        <div key={exp.id} className="mb-4">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h3 className={styles.position}>{exp.position}</h3>
                                                                    <p className={styles.company}>{exp.company}{exp.location && `, ${exp.location}`}</p>
                                                                </div>
                                                                {(exp.startDate || exp.endDate) && (
                                                                    <span className={styles.contact}>
                                                                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {exp.description && (
                                                                <p className={`${styles.description} mt-1 whitespace-pre-line`}>{exp.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}

                                        {/* Education - only show if entries have actual content */}
                                        {content.education.filter(edu => edu.degree || edu.school || edu.field).length > 0 && (
                                            <div className="mb-6">
                                                <h2 className={styles.sectionTitle}>EDUCATION</h2>
                                                {content.education
                                                    .filter(edu => edu.degree || edu.school || edu.field)
                                                    .map((edu) => (
                                                        <div key={edu.id} className="mb-3">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    {edu.school && <h3 className={styles.company}>{edu.school}</h3>}
                                                                    <p className={styles.description}>{edu.degree}{edu.field && ` in ${edu.field}`}{edu.gpa && ` • GPA: ${edu.gpa}`}</p>
                                                                </div>
                                                                {(edu.startDate || edu.endDate) && (
                                                                    <span className={styles.contact}>
                                                                        {edu.startDate} - {edu.endDate}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}

                                        {/* Skills */}
                                        {content.skills.length > 0 && (
                                            <div className="mb-6">
                                                <h2 className={styles.sectionTitle}>SKILLS</h2>
                                                <div className="flex flex-wrap gap-2">
                                                    {content.skills.map((skill, index) => (
                                                        <span key={index} className={`px-2 py-1 rounded text-sm ${styles.skillBg} ${styles.skillText}`}>
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Projects - only show if entries have actual content */}
                                        {content.projects.filter(proj => proj.name || proj.description).length > 0 && (
                                            <div className="mb-6">
                                                <h2 className={styles.sectionTitle}>PROJECTS</h2>
                                                {content.projects
                                                    .filter(proj => proj.name || proj.description)
                                                    .map((proj) => (
                                                        <div key={proj.id} className="mb-3">
                                                            <div className="flex justify-between items-start">
                                                                {proj.name && <h3 className={styles.company}>{proj.name}</h3>}
                                                                {proj.link && <span className={styles.contact}>{proj.link}</span>}
                                                            </div>
                                                            {proj.technologies && <p className={`text-sm ${styles.position}`}>Technologies: {proj.technologies}</p>}
                                                            {proj.description && <p className={`${styles.description} mt-1`}>{proj.description}</p>}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}

                                        {/* Certifications - only show if entries have actual content */}
                                        {content.certifications.filter(cert => cert.name || cert.issuer).length > 0 && (
                                            <div className="mb-6">
                                                <h2 className={styles.sectionTitle}>CERTIFICATIONS</h2>
                                                {content.certifications
                                                    .filter(cert => cert.name || cert.issuer)
                                                    .map((cert) => (
                                                        <div key={cert.id} className="mb-2">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    {cert.name && <h3 className={styles.company}>{cert.name}</h3>}
                                                                    {cert.issuer && <p className={styles.position}>{cert.issuer}</p>}
                                                                </div>
                                                                {cert.date && <span className={styles.contact}>{cert.date}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ATS Score Panel */}
            <AnimatePresence>
                {showATSPanel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => !analyzingATS && setShowATSPanel(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-2xl w-full max-h-[90vh] overflow-auto bg-gray-900 rounded-2xl shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">ATS Score Analysis</h2>
                                        <p className="text-sm text-gray-400">AI-powered resume optimization</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowATSPanel(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    disabled={analyzingATS}
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6">
                                {analyzingATS ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                                        <p className="text-white font-medium">Analyzing your resume...</p>
                                        <p className="text-gray-400 text-sm mt-2">Checking ATS compatibility</p>
                                    </div>
                                ) : atsResult ? (
                                    <div className="space-y-6">
                                        {/* Overall Score */}
                                        <div className="text-center">
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
                                            <p className="text-white font-medium mt-3">
                                                {atsResult.overallScore >= 80 ? '🎉 Excellent ATS Score!' :
                                                    atsResult.overallScore >= 60 ? '👍 Good, but can improve' :
                                                        '⚠️ Needs improvement'}
                                            </p>
                                        </div>

                                        {/* Score Breakdown */}
                                        <div className="bg-white/5 rounded-xl p-4">
                                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-purple-400" />
                                                Score Breakdown
                                            </h3>
                                            <div className="space-y-3">
                                                {atsResult.breakdown.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3">
                                                        <div className="w-32 text-sm text-gray-400">{item.category}</div>
                                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${item.status === 'good' ? 'bg-green-500' :
                                                                    item.status === 'warning' ? 'bg-yellow-500' :
                                                                        'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-gray-400 w-12">{item.score}/{item.maxScore}</span>
                                                        {item.status === 'good' ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        ) : item.status === 'warning' ? (
                                                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                                                        ) : (
                                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Keywords */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                                <h4 className="text-green-400 font-medium mb-2 text-sm">✓ Keywords Found</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {atsResult.keywords.found.slice(0, 8).map((kw, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                                                            {kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                                <h4 className="text-red-400 font-medium mb-2 text-sm">✗ Consider Adding</h4>
                                                <div className="flex flex-wrap gap-1">
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
                                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                                                <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4" />
                                                    AI Suggestions
                                                </h4>
                                                <ul className="space-y-2">
                                                    {atsResult.suggestions.map((s, idx) => (
                                                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                                            <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={analyzeATS}
                                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                            >
                                                <Target className="w-4 h-4 mr-2" />
                                                Re-analyze
                                            </Button>
                                            <Button
                                                onClick={() => setShowATSPanel(false)}
                                                variant="outline"
                                                className="flex-1 border-white/20 text-white hover:bg-white/10"
                                            >
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        Click analyze to see your ATS score
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Template Selector Modal */}
            <AnimatePresence>
                {showTemplateSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowTemplateSelector(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card border border-border/30 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Choose a Template</h2>
                                    <p className="text-gray-400 text-sm mt-1">Select a new template for your resume</p>
                                </div>
                                <button
                                    onClick={() => setShowTemplateSelector(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                {[
                                    { id: 'classic', name: 'Classic', desc: 'Traditional, professional look', colors: 'bg-gray-100 border-gray-800' },
                                    { id: 'modern', name: 'Modern', desc: 'Clean with blue accents', colors: 'bg-white border-blue-500' },
                                    { id: 'creative', name: 'Creative', desc: 'Vibrant purple gradients', colors: 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-500' },
                                    { id: 'executive', name: 'Executive', desc: 'Elegant, refined style', colors: 'bg-gray-50 border-gray-400' },
                                    { id: 'minimal', name: 'Minimal', desc: 'Simple and clean', colors: 'bg-white border-gray-200' },
                                    { id: 'tech', name: 'Tech', desc: 'Dark mode with cyan', colors: 'bg-slate-900 border-cyan-400' },
                                ].map((tmpl) => (
                                    <button
                                        key={tmpl.id}
                                        onClick={async () => {
                                            setTemplate(tmpl.id)
                                            const supabase = createClient()
                                            await supabase
                                                .from('resumes')
                                                .update({ template: tmpl.id, updated_at: new Date().toISOString() })
                                                .eq('id', resumeId)
                                            setShowTemplateSelector(false)
                                            setToastMessage(`✓ Template changed to ${tmpl.name}!`)
                                            setShowToast(true)
                                            setTimeout(() => setShowToast(false), 3000)
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${template === tmpl.id
                                            ? 'border-white ring-2 ring-white/30'
                                            : 'border-border/30 hover:border-white/50'
                                            }`}
                                    >
                                        <div className={`h-20 rounded-lg mb-3 ${tmpl.colors} border-2`}></div>
                                        <h3 className="font-semibold text-white">{tmpl.name}</h3>
                                        <p className="text-xs text-gray-400 mt-1">{tmpl.desc}</p>
                                        {template === tmpl.id && (
                                            <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-400">
                                                <Check className="w-3 h-3" /> Current
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]"
                    >
                        <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${toastMessage.includes('✓')
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                            }`}>
                            <span className="text-lg font-medium">{toastMessage}</span>
                            <button
                                onClick={() => setShowToast(false)}
                                className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
