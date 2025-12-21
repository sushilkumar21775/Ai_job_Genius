"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CareerPulseLogo } from "@/components/careerpulse-logo"
import { Button } from "@/components/ui/button"
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    GraduationCap,
    Target,
    ChevronLeft,
    Edit3,
    Save,
    Loader2,
    Building,
    Calendar,
    DollarSign
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"

interface Profile {
    id: string
    email: string | null
    full_name: string | null
    phone: string | null
    location: string | null
    career_status: string | null
    years_of_experience: string | null
    current_company: string | null
    job_title: string | null
    qualification: string | null
    university: string | null
    field_of_study: string | null
    graduation_year: string | null
    target_roles: string | null
    preferred_industries: string | null
    expected_salary: string | null
    work_type: string | null
    profile_completion: number
}

interface UserSkill {
    skill_name: string
}

export default function ProfilePage() {
    const router = useRouter()
    const { user: clerkUser, isLoaded } = useUser()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(false)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [skills, setSkills] = useState<UserSkill[]>([])
    const [formData, setFormData] = useState<Partial<Profile>>({})

    useEffect(() => {
        if (isLoaded && clerkUser) {
            fetchProfile()
        } else if (isLoaded && !clerkUser) {
            router.push("/auth/login")
        }
    }, [isLoaded, clerkUser, router])

    const fetchProfile = async () => {
        if (!clerkUser) return
        const supabase = createClient()

        const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", clerkUser.id)
            .single()

        if (profileData) {
            setProfile({ ...profileData, email: clerkUser.emailAddresses[0]?.emailAddress })
            setFormData(profileData)
        }

        const { data: skillsData } = await supabase
            .from("user_skills")
            .select("skill_name")
            .eq("user_id", clerkUser.id)

        if (skillsData) {
            setSkills(skillsData)
        }

        setLoading(false)
    }

    const handleSave = async () => {
        if (!profile?.id) return

        setSaving(true)
        const supabase = createClient()

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: formData.full_name,
                phone: formData.phone,
                location: formData.location,
                career_status: formData.career_status,
                years_of_experience: formData.years_of_experience,
                current_company: formData.current_company,
                job_title: formData.job_title,
                qualification: formData.qualification,
                university: formData.university,
                field_of_study: formData.field_of_study,
                graduation_year: formData.graduation_year,
                target_roles: formData.target_roles,
                preferred_industries: formData.preferred_industries,
                expected_salary: formData.expected_salary,
                work_type: formData.work_type,
            })
            .eq("id", profile.id)

        if (!error) {
            setProfile({ ...profile, ...formData })
            setEditing(false)
        }

        setSaving(false)
    }

    const updateField = (field: keyof Profile, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U"
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    const formatCareerStatus = (status: string | null | undefined) => {
        if (!status) return "Not set"
        return status.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
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
                    <Link href="/">
                        <CareerPulseLogo />
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8 max-w-4xl">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-border/20 rounded-2xl p-8 mb-8"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                {getInitials(profile?.full_name)}
                            </div>
                            <div>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.full_name || ""}
                                        onChange={(e) => updateField("full_name", e.target.value)}
                                        className="text-2xl font-bold text-white bg-transparent border-b border-white/30 focus:outline-none focus:border-white mb-2"
                                        placeholder="Your Name"
                                    />
                                ) : (
                                    <h1 className="text-2xl font-bold text-white mb-2">{profile?.full_name || "Your Name"}</h1>
                                )}
                                <p className="text-gray-400 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {profile?.email}
                                </p>
                                <p className="text-gray-400 flex items-center gap-2 mt-1">
                                    <Briefcase className="w-4 h-4" />
                                    {formatCareerStatus(profile?.career_status)}
                                </p>
                            </div>
                        </div>
                        {editing ? (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="border-border/30 text-white hover:bg-white/10"
                                    onClick={() => {
                                        setFormData(profile || {})
                                        setEditing(false)
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="bg-white text-black hover:bg-white/90"
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setEditing(true)}
                                variant="outline"
                                className="border-border/30 text-white hover:bg-white/10"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    {/* Profile Completion */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Profile Completion</span>
                            <span className="text-white">{profile?.profile_completion || 0}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${profile?.profile_completion || 0}%` }}
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Profile Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card/30 border border-border/20 rounded-xl p-6"
                    >
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-400" />
                            Contact Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Phone</label>
                                {editing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone || ""}
                                        onChange={(e) => updateField("phone", e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                        placeholder="Your phone number"
                                    />
                                ) : (
                                    <p className="text-white flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        {profile?.phone || "Not set"}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Location</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.location || ""}
                                        onChange={(e) => updateField("location", e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                        placeholder="City, Country"
                                    />
                                ) : (
                                    <p className="text-white flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        {profile?.location || "Not set"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Career Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card/30 border border-border/20 rounded-xl p-6"
                    >
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-purple-400" />
                            Career Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Current Company</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.current_company || ""}
                                        onChange={(e) => updateField("current_company", e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                        placeholder="Company name"
                                    />
                                ) : (
                                    <p className="text-white flex items-center gap-2">
                                        <Building className="w-4 h-4 text-gray-400" />
                                        {profile?.current_company || "Not set"}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Job Title</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.job_title || ""}
                                        onChange={(e) => updateField("job_title", e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                        placeholder="Your role"
                                    />
                                ) : (
                                    <p className="text-white">{profile?.job_title || "Not set"}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Experience</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.years_of_experience || ""}
                                        onChange={(e) => updateField("years_of_experience", e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                        placeholder="Years of experience"
                                    />
                                ) : (
                                    <p className="text-white flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {profile?.years_of_experience ? `${profile.years_of_experience} years` : "Not set"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Education */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-card/30 border border-border/20 rounded-xl p-6"
                    >
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-cyan-400" />
                            Education
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Qualification</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.qualification || ""}
                                        onChange={(e) => updateField("qualification", e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                        placeholder="Highest qualification"
                                    />
                                ) : (
                                    <p className="text-white capitalize">{profile?.qualification?.replace("-", " ") || "Not set"}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">University</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.university || ""}
                                        onChange={(e) => updateField("university", e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                        placeholder="University name"
                                    />
                                ) : (
                                    <p className="text-white">{profile?.university || "Not set"}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Field of Study</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.field_of_study || ""}
                                        onChange={(e) => updateField("field_of_study", e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                        placeholder="Major/Field"
                                    />
                                ) : (
                                    <p className="text-white">{profile?.field_of_study || "Not set"}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Career Goals */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-card/30 border border-border/20 rounded-xl p-6"
                    >
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-400" />
                            Career Goals
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Target Roles</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.target_roles || ""}
                                        onChange={(e) => updateField("target_roles", e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                        placeholder="e.g., Software Engineer"
                                    />
                                ) : (
                                    <p className="text-white">{profile?.target_roles || "Not set"}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Expected Salary</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.expected_salary || ""}
                                        onChange={(e) => updateField("expected_salary", e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-border/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                        placeholder="e.g., $60K - $80K"
                                    />
                                ) : (
                                    <p className="text-white flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        {profile?.expected_salary || "Not set"}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Work Type</label>
                                <p className="text-white capitalize">{profile?.work_type || "Not set"}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Skills Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-card/30 border border-border/20 rounded-xl p-6 mt-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-4">Skills</h2>
                    {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <span
                                    key={skill.skill_name}
                                    className="px-3 py-1.5 bg-white/10 text-white rounded-full text-sm"
                                >
                                    {skill.skill_name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400">No skills added yet. <Link href="/onboarding" className="text-white hover:underline">Add skills →</Link></p>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
