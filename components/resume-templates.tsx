"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

export interface ResumeTemplateData {
    id: string
    name: string
    description: string
    preview: string
    colors: {
        primary: string
        accent: string
        text: string
        background: string
    }
}

export const resumeTemplates: ResumeTemplateData[] = [
    {
        id: "classic",
        name: "Classic",
        description: "Traditional and professional, perfect for corporate roles",
        preview: "classic",
        colors: {
            primary: "#1a365d",
            accent: "#2b6cb0",
            text: "#1a202c",
            background: "#ffffff"
        }
    },
    {
        id: "modern",
        name: "Modern",
        description: "Clean and minimalist design for tech and startups",
        preview: "modern",
        colors: {
            primary: "#0f172a",
            accent: "#8b5cf6",
            text: "#334155",
            background: "#ffffff"
        }
    },
    {
        id: "creative",
        name: "Creative",
        description: "Bold and unique for design and marketing roles",
        preview: "creative",
        colors: {
            primary: "#7c3aed",
            accent: "#ec4899",
            text: "#1f2937",
            background: "#fafafa"
        }
    },
    {
        id: "executive",
        name: "Executive",
        description: "Sophisticated layout for senior positions",
        preview: "executive",
        colors: {
            primary: "#0d1b2a",
            accent: "#1b4965",
            text: "#2d3748",
            background: "#ffffff"
        }
    },
    {
        id: "minimal",
        name: "Minimal",
        description: "Simple and ATS-optimized for maximum compatibility",
        preview: "minimal",
        colors: {
            primary: "#171717",
            accent: "#404040",
            text: "#262626",
            background: "#ffffff"
        }
    },
    {
        id: "tech",
        name: "Tech",
        description: "Developer-focused with skills emphasis",
        preview: "tech",
        colors: {
            primary: "#0ea5e9",
            accent: "#06b6d4",
            text: "#1e293b",
            background: "#ffffff"
        }
    }
]

interface TemplateCardProps {
    template: ResumeTemplateData
    isSelected: boolean
    onSelect: () => void
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${isSelected
                    ? 'border-purple-500 ring-2 ring-purple-500/30'
                    : 'border-border/30 hover:border-purple-500/50'
                }`}
        >
            {/* Template Preview */}
            <div className="aspect-[8.5/11] bg-white p-3 relative">
                <TemplatePreview template={template} />

                {/* Selected Indicator */}
                {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>

            {/* Template Info */}
            <div className="p-3 bg-card/80 backdrop-blur">
                <h3 className="font-semibold text-white text-sm">{template.name}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{template.description}</p>
            </div>
        </motion.div>
    )
}

function TemplatePreview({ template }: { template: ResumeTemplateData }) {
    const { colors } = template

    return (
        <div className="w-full h-full text-[6px] overflow-hidden" style={{ color: colors.text, background: colors.background }}>
            {template.id === "classic" && (
                <div className="space-y-2">
                    <div className="text-center pb-2 border-b" style={{ borderColor: colors.primary }}>
                        <div className="font-bold text-[10px]" style={{ color: colors.primary }}>JOHN DOE</div>
                        <div className="text-[5px]">Software Engineer | john@email.com</div>
                    </div>
                    <div>
                        <div className="font-bold" style={{ color: colors.primary }}>EXPERIENCE</div>
                        <div className="mt-1">
                            <div className="font-semibold">Senior Developer</div>
                            <div className="text-gray-500">Tech Corp • 2020-Present</div>
                        </div>
                    </div>
                </div>
            )}

            {template.id === "modern" && (
                <div className="flex h-full">
                    <div className="w-1/3 p-2" style={{ background: colors.primary }}>
                        <div className="text-white font-bold text-[8px]">JOHN</div>
                        <div className="text-white font-bold text-[8px]">DOE</div>
                        <div className="mt-2 text-white/80 text-[5px]">SKILLS</div>
                        <div className="mt-1 space-y-1">
                            <div className="bg-white/20 rounded px-1">React</div>
                            <div className="bg-white/20 rounded px-1">Node.js</div>
                        </div>
                    </div>
                    <div className="w-2/3 p-2">
                        <div className="font-bold" style={{ color: colors.accent }}>Experience</div>
                        <div className="mt-1">Senior Developer at Tech Corp</div>
                    </div>
                </div>
            )}

            {template.id === "creative" && (
                <div>
                    <div className="p-2 text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>
                        <div className="font-bold text-[10px]">John Doe</div>
                        <div className="text-[5px] opacity-80">Creative Designer</div>
                    </div>
                    <div className="p-2">
                        <div className="flex gap-1 mb-2">
                            <span className="px-1 rounded text-white text-[5px]" style={{ background: colors.accent }}>Design</span>
                            <span className="px-1 rounded text-white text-[5px]" style={{ background: colors.primary }}>UI/UX</span>
                        </div>
                        <div className="font-bold text-[6px]" style={{ color: colors.primary }}>Experience</div>
                    </div>
                </div>
            )}

            {template.id === "executive" && (
                <div className="space-y-2">
                    <div className="p-2" style={{ background: colors.primary }}>
                        <div className="text-white font-bold text-[10px] tracking-wider">JOHN DOE</div>
                        <div className="text-white/60 text-[5px] tracking-widest uppercase">Chief Executive Officer</div>
                    </div>
                    <div className="px-2">
                        <div className="border-l-2 pl-2" style={{ borderColor: colors.accent }}>
                            <div className="font-bold text-[6px]" style={{ color: colors.primary }}>EXECUTIVE SUMMARY</div>
                            <div className="text-[5px] text-gray-600">Strategic leader with 15+ years...</div>
                        </div>
                    </div>
                </div>
            )}

            {template.id === "minimal" && (
                <div className="p-2 space-y-2">
                    <div>
                        <div className="font-bold text-[10px]">John Doe</div>
                        <div className="text-gray-500 text-[5px]">john@email.com • 555-0100</div>
                    </div>
                    <div className="border-t pt-2 border-gray-200">
                        <div className="font-semibold text-[6px]">Experience</div>
                        <div className="text-[5px]">Senior Developer • Tech Corp • 2020-Present</div>
                    </div>
                    <div className="border-t pt-2 border-gray-200">
                        <div className="font-semibold text-[6px]">Education</div>
                        <div className="text-[5px]">Computer Science • University • 2016</div>
                    </div>
                </div>
            )}

            {template.id === "tech" && (
                <div>
                    <div className="p-2 border-l-4" style={{ borderColor: colors.primary, background: '#f8fafc' }}>
                        <div className="font-mono font-bold text-[10px]" style={{ color: colors.primary }}>John Doe</div>
                        <div className="font-mono text-[5px]">Full Stack Developer</div>
                    </div>
                    <div className="p-2">
                        <div className="font-mono font-bold text-[6px]" style={{ color: colors.primary }}>// Skills</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                            <span className="px-1 rounded text-[5px] text-white" style={{ background: colors.primary }}>TypeScript</span>
                            <span className="px-1 rounded text-[5px] text-white" style={{ background: colors.accent }}>React</span>
                            <span className="px-1 rounded text-[5px] text-white" style={{ background: colors.primary }}>Node.js</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

interface TemplateSelectorProps {
    selectedTemplate: string
    onSelectTemplate: (templateId: string) => void
}

export function TemplateSelector({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {resumeTemplates.map((template) => (
                <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    onSelect={() => onSelectTemplate(template.id)}
                />
            ))}
        </div>
    )
}

export function getTemplateById(id: string): ResumeTemplateData | undefined {
    return resumeTemplates.find(t => t.id === id)
}
