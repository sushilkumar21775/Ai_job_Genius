"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CareerPulseLogo } from "@/components/careerpulse-logo"
import {
    ArrowRight,
    ArrowLeft,
    User,
    Briefcase,
    GraduationCap,
    Code,
    Target,
    FileText,
    Check,
    Upload,
    MapPin,
    Phone,
    Building,
    Calendar,
    DollarSign,
    Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"

const STEPS = [
    { id: 1, title: "Basic Info", icon: User },
    { id: 2, title: "Career Status", icon: Briefcase },
    { id: 3, title: "Education", icon: GraduationCap },
    { id: 4, title: "Skills", icon: Code },
    { id: 5, title: "Career Goals", icon: Target },
]

const CAREER_STATUS_OPTIONS = [
    { value: "student", label: "Student", description: "Currently pursuing education" },
    { value: "fresher", label: "Fresher", description: "Recently graduated, seeking first job" },
    { value: "experienced", label: "Experienced", description: "Currently working professional" },
    { value: "career-switch", label: "Career Switch", description: "Looking to change careers" },
]

const WORK_TYPE_OPTIONS = [
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
    { value: "onsite", label: "On-site" },
    { value: "any", label: "Any" },
]

const POPULAR_SKILLS = [
    "JavaScript", "Python", "React", "Node.js", "Java", "SQL",
    "TypeScript", "AWS", "Docker", "Git", "Machine Learning", "Data Analysis",
    "Project Management", "Communication", "Leadership", "Problem Solving"
]

export default function OnboardingPage() {
    const router = useRouter()
    const { user: clerkUser, isLoaded } = useUser()
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        fullName: "",
        phone: "",
        location: "",
        // Step 2: Career Status
        careerStatus: "",
        yearsOfExperience: "",
        currentCompany: "",
        jobTitle: "",
        // Step 3: Education
        qualification: "",
        otherQualification: "",
        university: "",
        graduationYear: "",
        fieldOfStudy: "",
        // Step 4: Skills
        skills: [] as string[],
        // Step 5: Career Goals
        targetRoles: "",
        preferredIndustries: "",
        expectedSalary: "",
        workType: "",
        // Step 6: Resume
        hasResume: false,
    })

    // Get user on mount
    useEffect(() => {
        if (isLoaded && clerkUser) {
            // Pre-fill name from Clerk user data
            if (clerkUser.fullName || clerkUser.firstName) {
                setFormData(prev => ({ ...prev, fullName: clerkUser.fullName || clerkUser.firstName || '' }))
            }
        }
    }, [isLoaded, clerkUser])

    const updateFormData = (field: string, value: string | string[] | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const toggleSkill = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }))
    }

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    const saveProfile = async () => {
        if (!clerkUser) return
        const userId = clerkUser.id

        setLoading(true)
        const supabase = createClient()

        // Calculate profile completion
        let completedFields = 0
        const totalFields = 10
        if (formData.fullName) completedFields++
        if (formData.phone) completedFields++
        if (formData.location) completedFields++
        if (formData.careerStatus) completedFields++
        if (formData.qualification) completedFields++
        if (formData.university) completedFields++
        if (formData.skills.length >= 3) completedFields++
        if (formData.targetRoles) completedFields++
        if (formData.workType) completedFields++
        if (formData.hasResume) completedFields++

        const profileCompletion = Math.round((completedFields / totalFields) * 100)

        // Upsert profile (insert or update)
        const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
                id: userId,
                full_name: formData.fullName,
                phone: formData.phone,
                location: formData.location,
                career_status: formData.careerStatus || null,
                years_of_experience: formData.yearsOfExperience || null,
                current_company: formData.currentCompany || null,
                job_title: formData.jobTitle || null,
                qualification: formData.qualification || null,
                university: formData.university || null,
                field_of_study: formData.fieldOfStudy || null,
                graduation_year: formData.graduationYear || null,
                target_roles: formData.targetRoles || null,
                preferred_industries: formData.preferredIndustries || null,
                expected_salary: formData.expectedSalary || null,
                work_type: formData.workType || null,
                onboarding_completed: true,
                profile_completion: profileCompletion,
            }, { onConflict: 'id' })

        if (profileError) {
            console.error("Profile update error:", profileError)
            setLoading(false)
            return
        }

        // Save skills
        if (formData.skills.length > 0) {
            // First delete existing skills
            await supabase.from("user_skills").delete().eq("user_id", userId)

            // Insert new skills
            const skillsToInsert = formData.skills.map(skill => ({
                user_id: userId,
                skill_name: skill,
                skill_level: "intermediate"
            }))

            await supabase.from("user_skills").insert(skillsToInsert)
        }

        setLoading(false)
        router.push("/dashboard")
        router.refresh()
    }

    const handleComplete = () => {
        saveProfile()
    }

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Header */}
            <header className="p-6 flex justify-between items-center">
                <CareerPulseLogo />
                <button
                    onClick={() => router.push("/dashboard")}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                    Skip for now
                </button>
            </header>

            {/* Progress Bar */}
            <div className="px-6 mb-8">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        {STEPS.map((step, index) => {
                            const StepIcon = step.icon
                            const isCompleted = currentStep > step.id
                            const isCurrent = currentStep === step.id
                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                    ${isCompleted ? "bg-white text-black" : isCurrent ? "bg-white/20 text-white border-2 border-white" : "bg-white/5 text-gray-500"}
                  `}>
                                        {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className={`w-12 md:w-20 h-0.5 mx-2 transition-colors duration-300 ${isCompleted ? "bg-white" : "bg-white/10"}`} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        {STEPS.map(step => (
                            <span key={step.id} className={`hidden md:block ${currentStep === step.id ? "text-white" : ""}`}>
                                {step.title}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 flex items-center justify-center px-6 pb-12">
                <div className="w-full max-w-2xl">
                    <AnimatePresence mode="wait" custom={currentStep}>
                        <motion.div
                            key={currentStep}
                            custom={currentStep}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="bg-card/30 backdrop-blur-xl border border-border/20 rounded-2xl p-8"
                        >
                            {/* Step 1: Basic Info */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">Let's get to know you</h2>
                                        <p className="text-gray-400">Tell us a bit about yourself</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={formData.fullName}
                                                onChange={(e) => updateFormData("fullName", e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                value={formData.phone}
                                                onChange={(e) => updateFormData("phone", e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                            />
                                        </div>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Location (City, Country)"
                                                value={formData.location}
                                                onChange={(e) => updateFormData("location", e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Career Status */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">Where are you in your career?</h2>
                                        <p className="text-gray-400">This helps us personalize your experience</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {CAREER_STATUS_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => updateFormData("careerStatus", option.value)}
                                                className={`p-4 rounded-xl border text-left transition-all ${formData.careerStatus === option.value
                                                    ? "border-white bg-white/10"
                                                    : "border-border/30 bg-white/5 hover:bg-white/10"
                                                    }`}
                                            >
                                                <div className="font-medium text-white">{option.label}</div>
                                                <div className="text-sm text-gray-400">{option.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                    {(formData.careerStatus === "experienced" || formData.careerStatus === "career-switch") && (
                                        <div className="space-y-4 mt-6">
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Years of Experience"
                                                    value={formData.yearsOfExperience}
                                                    onChange={(e) => updateFormData("yearsOfExperience", e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Current/Last Company"
                                                    value={formData.currentCompany}
                                                    onChange={(e) => updateFormData("currentCompany", e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Current/Last Job Title"
                                                    value={formData.jobTitle}
                                                    onChange={(e) => updateFormData("jobTitle", e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Education */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">Your Education</h2>
                                        <p className="text-gray-400">Tell us about your academic background</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <select
                                                value={formData.qualification}
                                                onChange={(e) => updateFormData("qualification", e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
                                            >
                                                <option value="" className="bg-black">Select Highest Qualification</option>
                                                <option value="high-school" className="bg-black">High School</option>
                                                <option value="bachelors" className="bg-black">Bachelor's Degree</option>
                                                <option value="masters" className="bg-black">Master's Degree</option>
                                                <option value="phd" className="bg-black">PhD</option>
                                                <option value="other" className="bg-black">Other</option>
                                            </select>
                                        </div>
                                        {formData.qualification === "other" && (
                                            <input
                                                type="text"
                                                placeholder="Please specify your qualification"
                                                value={formData.otherQualification || ""}
                                                onChange={(e) => updateFormData("otherQualification", e.target.value)}
                                                className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                            />
                                        )}
                                        <input
                                            type="text"
                                            placeholder="University/College Name"
                                            value={formData.university}
                                            onChange={(e) => updateFormData("university", e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Field of Study / Major"
                                            value={formData.fieldOfStudy}
                                            onChange={(e) => updateFormData("fieldOfStudy", e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Graduation Year"
                                            value={formData.graduationYear}
                                            onChange={(e) => updateFormData("graduationYear", e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Skills */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">Your Skills</h2>
                                        <p className="text-gray-400">Select your key skills (choose at least 3)</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {POPULAR_SKILLS.map((skill) => (
                                            <button
                                                key={skill}
                                                onClick={() => toggleSkill(skill)}
                                                className={`px-4 py-2 rounded-full text-sm transition-all ${formData.skills.includes(skill)
                                                    ? "bg-white text-black"
                                                    : "bg-white/5 text-white border border-border/30 hover:bg-white/10"
                                                    }`}
                                            >
                                                {formData.skills.includes(skill) && <Check className="w-3 h-3 inline mr-1" />}
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-400 text-center">
                                        Selected: {formData.skills.length} skills
                                    </p>
                                </div>
                            )}

                            {/* Step 5: Career Goals */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">Your Career Goals</h2>
                                        <p className="text-gray-400">What are you looking for?</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Target Job Roles (e.g., Software Engineer, Product Manager)"
                                                value={formData.targetRoles}
                                                onChange={(e) => updateFormData("targetRoles", e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Preferred Industries (e.g., Tech, Finance, Healthcare)"
                                            value={formData.preferredIndustries}
                                            onChange={(e) => updateFormData("preferredIndustries", e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        />
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Expected Salary Range (e.g., $60K - $80K)"
                                                value={formData.expectedSalary}
                                                onChange={(e) => updateFormData("expectedSalary", e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-border/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-3">Preferred Work Type</p>
                                            <div className="flex flex-wrap gap-3">
                                                {WORK_TYPE_OPTIONS.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => updateFormData("workType", option.value)}
                                                        className={`px-4 py-2 rounded-full text-sm transition-all ${formData.workType === option.value
                                                            ? "bg-white text-black"
                                                            : "bg-white/5 text-white border border-border/30 hover:bg-white/10"
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        <Button
                            onClick={prevStep}
                            variant="outline"
                            className={`border-border/30 text-white hover:bg-white/10 ${currentStep === 1 ? "invisible" : ""}`}
                            disabled={loading}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>
                        {currentStep < 5 ? (
                            <Button onClick={nextStep} className="bg-white text-black hover:bg-white/90" disabled={loading}>
                                Next Step
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={handleComplete} className="bg-white text-black hover:bg-white/90" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Complete Profile
                                        <Check className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
