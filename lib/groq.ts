import Groq from 'groq-sdk'

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

export interface ResumeData {
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

// Generate professional summary based on resume content
export async function generateProfessionalSummary(resumeData: ResumeData): Promise<string> {
    // Check if user has already written a summary - use it as context
    const existingSummary = resumeData.personal.summary?.trim() || ''

    // Collect detailed experience info including descriptions
    const experienceDetails = resumeData.experience
        .filter(exp => exp.position || exp.company)
        .map(exp => {
            let detail = `${exp.position} at ${exp.company}`
            if (exp.description) {
                detail += `: ${exp.description.substring(0, 200)}`
            }
            return detail
        })
        .join('\n')

    // Collect education info
    const educationDetails = resumeData.education
        .filter(edu => edu.degree || edu.school)
        .map(edu => `${edu.degree} in ${edu.field} from ${edu.school}`)
        .join(', ')

    // Collect project info with technologies
    const projectDetails = resumeData.projects
        .filter(proj => proj.name)
        .map(proj => {
            let detail = proj.name
            if (proj.technologies) detail += ` (${proj.technologies})`
            if (proj.description) detail += `: ${proj.description.substring(0, 100)}`
            return detail
        })
        .join('\n')

    // Skills list
    const skillsText = resumeData.skills.join(', ')

    // Check if we have meaningful data
    const hasExperience = experienceDetails.length > 0
    const hasEducation = educationDetails.length > 0
    const hasProjects = projectDetails.length > 0
    const hasSkills = skillsText.length > 0
    const hasDataToWorkWith = hasExperience || hasEducation || hasProjects || hasSkills || existingSummary

    if (!hasDataToWorkWith) {
        return 'Please fill in your Experience, Education, Projects, or Skills sections first. The AI needs this information to generate a personalized summary.'
    }

    // If user has already written a summary and that's all we have, improve it
    let prompt: string

    if (existingSummary && !hasExperience && !hasProjects) {
        // User has written a summary but other sections are empty - improve their summary
        prompt = `You are a professional resume writer. The candidate has written the following professional summary:

"${existingSummary}"

CANDIDATE INFO:
Name: ${resumeData.personal.name || 'Candidate'}
Education: ${educationDetails || 'Not specified'}
Skills: ${skillsText || 'Not specified'}

TASK: Rewrite and improve this summary to make it more:
1. Impactful and ATS-friendly
2. Specific about technologies and skills mentioned
3. Professional in tone (third person preferred)
4. Concise (50-80 words)

Keep the core message and achievements the candidate mentioned. Make it sound polished and professional.

Return ONLY the improved summary paragraph, no labels or quotes.`
    } else {
        // We have data from multiple sections
        prompt = `You are a professional resume writer. Generate a compelling professional summary (3-4 sentences, 50-80 words) for the following candidate.

CANDIDATE PROFILE:
Name: ${resumeData.personal.name || 'Candidate'}

${hasEducation ? `EDUCATION:\n${educationDetails}\n` : ''}
${hasExperience ? `WORK EXPERIENCE:\n${experienceDetails}\n` : ''}
${hasProjects ? `PROJECTS:\n${projectDetails}\n` : ''}
${hasSkills ? `SKILLS:\n${skillsText}\n` : ''}
${existingSummary ? `CURRENT SUMMARY (use as reference):\n${existingSummary}\n` : ''}

INSTRUCTIONS:
1. Write in THIRD PERSON (e.g., "Computer Engineering graduate with...")
2. Mention specific technologies, domains, or achievements from the data above
3. Highlight unique strengths based on their actual experience and projects
4. Make it ATS-friendly and impactful
5. Be SPECIFIC - use actual technologies (React, Node.js, AI/ML, etc.) from their profile
6. Do NOT use generic phrases like "motivated individual" or "strong work ethic"
7. If a current summary is provided, incorporate its key points

Return ONLY the summary paragraph, no labels or quotes.`
    }

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert resume writer. Generate specific, tailored professional summaries. If given an existing summary, improve it while keeping its core message. Never use generic phrases like "motivated individual" or "eager to learn".'
                },
                { role: 'user', content: prompt }
            ],
            max_tokens: 300,
            temperature: 0.5,
        })

        const summary = response.choices[0]?.message?.content?.trim()

        // Validate the summary
        if (summary && summary.length > 50 && !summary.includes('no listed') && !summary.includes('No experience')) {
            return summary
        }
    } catch (error) {
        console.error('Groq API error:', error)
    }

    // If we have an existing summary, return a slightly improved version
    if (existingSummary) {
        return existingSummary
    }

    // Fallback: Generate a basic summary from available data
    const name = resumeData.personal.name || 'Professional'
    if (hasSkills) {
        return `${name} is a skilled professional with expertise in ${skillsText}. Passionate about building innovative solutions and contributing to impactful projects.`
    }

    return 'Please add your Experience, Education, or Skills to generate an AI summary.'
}

// Improve experience description with action verbs and quantifiable results
export async function improveExperienceDescription(
    currentDescription: string,
    position: string,
    company: string
): Promise<string> {
    const prompt = `Improve this job description for a ${position} role at ${company}. Use strong action verbs, quantify achievements where possible, and make it ATS-friendly. Keep 3-5 bullet points, each starting with •.

Current description:
${currentDescription || 'No description provided'}

Return ONLY the improved bullet points, no intro text.`

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
    })

    return response.choices[0]?.message?.content?.trim() ||
        `• Led key initiatives and projects to drive business outcomes\n• Collaborated with cross-functional teams to deliver solutions\n• Implemented process improvements resulting in increased efficiency`
}

// Suggest skills based on experience and job titles
export async function suggestSkills(
    experience: ResumeData['experience'],
    currentSkills: string[]
): Promise<string[]> {
    const jobTitles = experience.map(exp => exp.position).filter(Boolean).join(', ')
    const descriptions = experience.map(exp => exp.description).filter(Boolean).join(' ')
    const existingSkills = currentSkills.join(', ')

    const prompt = `Based on these job titles: ${jobTitles || 'General professional'}
And work descriptions: ${descriptions || 'Various professional responsibilities'}
Existing skills: ${existingSkills || 'None listed'}

Suggest 8-10 relevant technical and soft skills that are NOT already listed. Focus on in-demand, ATS-friendly skills.

Return ONLY a comma-separated list of skills, nothing else.`

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
    })

    const skillsText = response.choices[0]?.message?.content?.trim() || ''
    const suggestedSkills = skillsText
        .split(',')
        .map(s => s.trim())
        .filter(s => s && !currentSkills.includes(s))

    return suggestedSkills.length > 0
        ? suggestedSkills
        : ['Problem Solving', 'Communication', 'Team Leadership', 'Project Management', 'Analytical Thinking']
}

// General AI suggestions for resume improvement
export async function getResumeSuggestions(resumeData: ResumeData): Promise<string[]> {
    const prompt = `Analyze this resume and give 3-4 brief, actionable improvement tips (one line each):
- Has ${resumeData.experience.length} work experiences
- Has ${resumeData.education.length} education entries
- Has ${resumeData.skills.length} skills
- Summary: ${resumeData.personal.summary ? 'Present' : 'Missing'}
- LinkedIn: ${resumeData.personal.linkedin ? 'Present' : 'Missing'}

Return only numbered tips, no intro.`

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
    })

    const suggestions = response.choices[0]?.message?.content?.trim() || ''
    return suggestions.split('\n').filter(s => s.trim())
}

// ATS Score Analysis Result Interface
export interface ATSAnalysisResult {
    overallScore: number
    breakdown: {
        category: string
        score: number
        maxScore: number
        status: 'good' | 'warning' | 'critical'
        feedback: string
    }[]
    suggestions: string[]
    keywords: {
        found: string[]
        missing: string[]
    }
    strengths: string[]
    weaknesses: string[]
}

// Comprehensive ATS Score Analyzer
export async function analyzeATSScore(resumeData: ResumeData, targetJobTitle?: string): Promise<ATSAnalysisResult> {
    const breakdown: ATSAnalysisResult['breakdown'] = []
    let totalScore = 0
    let maxPossibleScore = 0

    // Helper function to calculate text density
    const wordCount = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length

    // 1. Contact Information (10 points)
    const contactScore = (() => {
        let score = 0
        if (resumeData.personal.name) score += 2
        if (resumeData.personal.email) score += 3
        if (resumeData.personal.phone) score += 2
        if (resumeData.personal.location) score += 1
        if (resumeData.personal.linkedin) score += 2
        return score
    })()
    breakdown.push({
        category: 'Contact Information',
        score: contactScore,
        maxScore: 10,
        status: contactScore >= 8 ? 'good' : contactScore >= 5 ? 'warning' : 'critical',
        feedback: contactScore >= 8 ? 'Complete contact details' : 'Missing key contact information'
    })
    totalScore += contactScore
    maxPossibleScore += 10

    // 2. Professional Summary (15 points)
    const summary = resumeData.personal.summary || ''
    const summaryWords = wordCount(summary)
    const summaryScore = (() => {
        if (summaryWords === 0) return 0
        if (summaryWords < 20) return 5
        if (summaryWords < 40) return 10
        if (summaryWords <= 100) return 15
        return 12 // Too long
    })()
    breakdown.push({
        category: 'Professional Summary',
        score: summaryScore,
        maxScore: 15,
        status: summaryScore >= 12 ? 'good' : summaryScore >= 5 ? 'warning' : 'critical',
        feedback: summaryWords === 0 ? 'No summary found - add a professional summary' :
            summaryWords < 40 ? 'Summary too short - aim for 50-80 words' :
                summaryWords > 100 ? 'Summary too long - keep it concise' : 'Well-crafted summary'
    })
    totalScore += summaryScore
    maxPossibleScore += 15

    // 3. Work Experience (25 points)
    const filledExperiences = resumeData.experience.filter(exp => exp.position || exp.company)
    const experienceScore = (() => {
        let score = 0
        if (filledExperiences.length >= 1) score += 5
        if (filledExperiences.length >= 2) score += 5
        if (filledExperiences.length >= 3) score += 5

        // Check for descriptions with action verbs
        const actionVerbs = ['led', 'developed', 'managed', 'created', 'implemented', 'designed', 'built', 'improved', 'increased', 'reduced', 'achieved', 'delivered', 'launched', 'spearheaded', 'orchestrated']
        const descriptionsText = filledExperiences.map(e => e.description?.toLowerCase() || '').join(' ')
        const hasActionVerbs = actionVerbs.some(verb => descriptionsText.includes(verb))
        if (hasActionVerbs) score += 5

        // Check for quantifiable results
        const hasNumbers = /\d+%|\$\d+|\d+\s*(users|customers|projects|team|members|revenue)/i.test(descriptionsText)
        if (hasNumbers) score += 5

        return Math.min(score, 25)
    })()
    breakdown.push({
        category: 'Work Experience',
        score: experienceScore,
        maxScore: 25,
        status: experienceScore >= 20 ? 'good' : experienceScore >= 10 ? 'warning' : 'critical',
        feedback: filledExperiences.length === 0 ? 'No work experience added' :
            experienceScore < 15 ? 'Add action verbs and quantifiable achievements' : 'Strong experience section'
    })
    totalScore += experienceScore
    maxPossibleScore += 25

    // 4. Education (10 points)
    const filledEducation = resumeData.education.filter(edu => edu.degree || edu.school)
    const educationScore = (() => {
        let score = 0
        if (filledEducation.length >= 1) score += 5
        if (filledEducation.some(e => e.degree)) score += 2
        if (filledEducation.some(e => e.field)) score += 2
        if (filledEducation.some(e => e.gpa)) score += 1
        return Math.min(score, 10)
    })()
    breakdown.push({
        category: 'Education',
        score: educationScore,
        maxScore: 10,
        status: educationScore >= 7 ? 'good' : educationScore >= 4 ? 'warning' : 'critical',
        feedback: filledEducation.length === 0 ? 'No education added' :
            educationScore < 7 ? 'Add degree details and field of study' : 'Complete education section'
    })
    totalScore += educationScore
    maxPossibleScore += 10

    // 5. Skills (15 points)
    const skillsCount = resumeData.skills.length
    const skillsScore = (() => {
        if (skillsCount === 0) return 0
        if (skillsCount < 3) return 5
        if (skillsCount < 6) return 10
        if (skillsCount <= 15) return 15
        return 12 // Too many skills can be unfocused
    })()
    breakdown.push({
        category: 'Skills Section',
        score: skillsScore,
        maxScore: 15,
        status: skillsScore >= 12 ? 'good' : skillsScore >= 5 ? 'warning' : 'critical',
        feedback: skillsCount === 0 ? 'No skills listed - add relevant skills' :
            skillsCount < 6 ? 'Add more relevant skills (aim for 8-12)' :
                skillsCount > 15 ? 'Too many skills - focus on most relevant' : 'Good skills variety'
    })
    totalScore += skillsScore
    maxPossibleScore += 15

    // 6. Projects (10 points) - Important for tech roles
    const filledProjects = resumeData.projects.filter(p => p.name || p.description)
    const projectsScore = (() => {
        let score = 0
        if (filledProjects.length >= 1) score += 3
        if (filledProjects.length >= 2) score += 3
        if (filledProjects.some(p => p.technologies)) score += 2
        if (filledProjects.some(p => p.link)) score += 2
        return Math.min(score, 10)
    })()
    breakdown.push({
        category: 'Projects',
        score: projectsScore,
        maxScore: 10,
        status: projectsScore >= 7 ? 'good' : projectsScore >= 3 ? 'warning' : 'critical',
        feedback: filledProjects.length === 0 ? 'Add projects to showcase your work' :
            projectsScore < 7 ? 'Add technologies used and project links' : 'Strong projects section'
    })
    totalScore += projectsScore
    maxPossibleScore += 10

    // 7. Certifications (5 points)
    const filledCerts = resumeData.certifications.filter(c => c.name)
    const certsScore = Math.min(filledCerts.length * 2, 5)
    breakdown.push({
        category: 'Certifications',
        score: certsScore,
        maxScore: 5,
        status: certsScore >= 4 ? 'good' : certsScore >= 2 ? 'warning' : 'critical',
        feedback: filledCerts.length === 0 ? 'Consider adding relevant certifications' : 'Certifications boost credibility'
    })
    totalScore += certsScore
    maxPossibleScore += 5

    // 8. Keywords & ATS Compatibility (10 points) - Use AI for this
    const allText = [
        resumeData.personal.summary,
        ...resumeData.experience.map(e => `${e.position} ${e.description}`),
        ...resumeData.skills,
        ...resumeData.projects.map(p => `${p.name} ${p.technologies} ${p.description}`)
    ].join(' ').toLowerCase()

    // Common ATS keywords by category
    const techKeywords = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'api', 'html', 'css', 'git', 'agile', 'scrum']
    const softKeywords = ['leadership', 'communication', 'problem-solving', 'teamwork', 'collaboration', 'analytical', 'project management']

    const foundKeywords: string[] = []
    const missingKeywords: string[] = []

    techKeywords.forEach(kw => {
        if (allText.includes(kw)) foundKeywords.push(kw)
        else missingKeywords.push(kw)
    })

    const keywordScore = Math.min(Math.floor(foundKeywords.length * 1.5), 10)
    breakdown.push({
        category: 'ATS Keywords',
        score: keywordScore,
        maxScore: 10,
        status: keywordScore >= 7 ? 'good' : keywordScore >= 4 ? 'warning' : 'critical',
        feedback: foundKeywords.length < 4 ? 'Add more industry-relevant keywords' : 'Good keyword optimization'
    })
    totalScore += keywordScore
    maxPossibleScore += 10

    // Calculate overall percentage
    const overallScore = Math.round((totalScore / maxPossibleScore) * 100)

    // Generate AI-powered suggestions
    let suggestions: string[] = []
    let strengths: string[] = []
    let weaknesses: string[] = []

    try {
        const analysisPrompt = `Analyze this resume for ATS compatibility and provide specific feedback.

RESUME DATA:
- Name: ${resumeData.personal.name || 'Not provided'}
- Summary: ${resumeData.personal.summary?.substring(0, 200) || 'Not provided'}
- Experience: ${filledExperiences.length} positions
- Education: ${filledEducation.length} entries
- Skills: ${resumeData.skills.slice(0, 10).join(', ') || 'None'}
- Projects: ${filledProjects.length} projects
- Current ATS Score: ${overallScore}%

Provide your response in this EXACT JSON format:
{
    "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"]
}

Be specific and actionable. Focus on ATS optimization.`

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are an ATS optimization expert. Respond ONLY with valid JSON, no markdown or extra text.' },
                { role: 'user', content: analysisPrompt }
            ],
            max_tokens: 500,
            temperature: 0.5,
        })

        const aiResponse = response.choices[0]?.message?.content?.trim() || ''

        // Try to parse JSON
        try {
            const parsed = JSON.parse(aiResponse)
            suggestions = parsed.suggestions || []
            strengths = parsed.strengths || []
            weaknesses = parsed.weaknesses || []
        } catch {
            // Fallback suggestions based on score
            suggestions = breakdown
                .filter(b => b.status !== 'good')
                .map(b => b.feedback)
            strengths = breakdown
                .filter(b => b.status === 'good')
                .map(b => b.category)
            weaknesses = breakdown
                .filter(b => b.status === 'critical')
                .map(b => b.category)
        }
    } catch (error) {
        console.error('AI analysis error:', error)
        suggestions = breakdown.filter(b => b.status !== 'good').map(b => b.feedback)
        strengths = breakdown.filter(b => b.status === 'good').map(b => b.category)
        weaknesses = breakdown.filter(b => b.status === 'critical').map(b => b.category)
    }

    return {
        overallScore,
        breakdown,
        suggestions,
        keywords: {
            found: foundKeywords,
            missing: missingKeywords.slice(0, 5)
        },
        strengths,
        weaknesses
    }
}

// Career Path Analysis Interface
export interface CareerPathResult {
    currentLevel: string
    recommendedPaths: {
        role: string
        description: string
        matchScore: number
        salaryRange: string
        demandLevel: 'High' | 'Medium' | 'Low'
        requiredSkills: string[]
        skillsYouHave: string[]
        skillGaps: string[]
        timeToAchieve: string
    }[]
    skillsAnalysis: {
        topSkills: string[]
        inDemandSkills: string[]
        skillsToLearn: string[]
    }
    industryInsights: string[]
    nextSteps: string[]
}

// AI-Powered Career Path Analysis
export async function analyzeCareerPath(
    skills: string[],
    experience: { position: string; company: string; description: string }[],
    education: { degree: string; field: string }[],
    targetRoles: string,
    careerStatus: string
): Promise<CareerPathResult> {
    const prompt = `You are a career counselor AI. Analyze this profile and provide career path recommendations.

PROFILE:
- Skills: ${skills.join(', ') || 'Not specified'}
- Experience: ${experience.map(e => `${e.position} at ${e.company}`).join('; ') || 'No experience listed'}
- Education: ${education.map(e => `${e.degree} in ${e.field}`).join('; ') || 'Not specified'}
- Target Roles: ${targetRoles || 'Not specified'}
- Career Status: ${careerStatus || 'Not specified'}

Provide your response in this EXACT JSON format (no markdown, no extra text):
{
    "currentLevel": "Entry Level/Mid Level/Senior Level/Lead Level",
    "recommendedPaths": [
        {
            "role": "Job Title",
            "description": "Brief description of the role",
            "matchScore": 85,
            "salaryRange": "$XX,000 - $XX,000",
            "demandLevel": "High",
            "requiredSkills": ["skill1", "skill2"],
            "skillsYouHave": ["skill1"],
            "skillGaps": ["skill2"],
            "timeToAchieve": "X-Y months"
        }
    ],
    "skillsAnalysis": {
        "topSkills": ["Your strongest skills"],
        "inDemandSkills": ["Market-demanded skills you have"],
        "skillsToLearn": ["Skills to acquire"]
    },
    "industryInsights": ["Insight 1", "Insight 2"],
    "nextSteps": ["Action 1", "Action 2", "Action 3"]
}

Provide 3-4 recommended career paths sorted by match score. Be realistic and specific.`

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are an expert career counselor. Respond ONLY with valid JSON, no markdown or extra text.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 1500,
            temperature: 0.6,
        })

        const aiResponse = response.choices[0]?.message?.content?.trim() || ''

        try {
            // Clean up the response if it has markdown code blocks
            let cleanedResponse = aiResponse
            if (aiResponse.includes('```json')) {
                cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
            } else if (aiResponse.includes('```')) {
                cleanedResponse = aiResponse.replace(/```\n?/g, '')
            }

            const parsed = JSON.parse(cleanedResponse)
            return parsed as CareerPathResult
        } catch (parseError) {
            console.error('JSON parse error:', parseError)
            // Return fallback
            return getDefaultCareerPath(skills, targetRoles)
        }
    } catch (error) {
        console.error('Career path analysis error:', error)
        return getDefaultCareerPath(skills, targetRoles)
    }
}

// Fallback career path result
function getDefaultCareerPath(skills: string[], targetRoles: string): CareerPathResult {
    const hasDevSkills = skills.some(s =>
        ['javascript', 'python', 'react', 'node', 'java', 'c++', 'typescript'].some(tech =>
            s.toLowerCase().includes(tech)
        )
    )

    return {
        currentLevel: skills.length > 5 ? 'Mid Level' : 'Entry Level',
        recommendedPaths: [
            {
                role: targetRoles || (hasDevSkills ? 'Full Stack Developer' : 'Software Engineer'),
                description: 'Build and maintain software applications using modern technologies',
                matchScore: 75,
                salaryRange: '$60,000 - $120,000',
                demandLevel: 'High',
                requiredSkills: hasDevSkills ? ['React', 'Node.js', 'TypeScript', 'SQL'] : ['Python', 'JavaScript', 'Git'],
                skillsYouHave: skills.slice(0, 3),
                skillGaps: ['Cloud Services', 'System Design'],
                timeToAchieve: '3-6 months'
            },
            {
                role: 'Frontend Developer',
                description: 'Create user interfaces and web applications',
                matchScore: 70,
                salaryRange: '$55,000 - $100,000',
                demandLevel: 'High',
                requiredSkills: ['React', 'CSS', 'JavaScript', 'TypeScript'],
                skillsYouHave: skills.filter(s => ['react', 'css', 'html', 'javascript'].some(t => s.toLowerCase().includes(t))),
                skillGaps: ['Testing', 'Performance Optimization'],
                timeToAchieve: '2-4 months'
            },
            {
                role: 'Backend Developer',
                description: 'Build server-side applications and APIs',
                matchScore: 65,
                salaryRange: '$60,000 - $110,000',
                demandLevel: 'High',
                requiredSkills: ['Node.js', 'Python', 'SQL', 'REST APIs'],
                skillsYouHave: skills.filter(s => ['node', 'python', 'sql', 'api'].some(t => s.toLowerCase().includes(t))),
                skillGaps: ['Microservices', 'DevOps'],
                timeToAchieve: '4-6 months'
            }
        ],
        skillsAnalysis: {
            topSkills: skills.slice(0, 5),
            inDemandSkills: skills.filter(s => ['react', 'python', 'aws', 'typescript'].some(t => s.toLowerCase().includes(t))),
            skillsToLearn: ['Docker', 'Kubernetes', 'AWS', 'System Design']
        },
        industryInsights: [
            'AI/ML skills are increasingly valued in the tech industry',
            'Remote work opportunities continue to grow',
            'Full-stack developers are in high demand'
        ],
        nextSteps: [
            'Complete a portfolio project showcasing your skills',
            'Obtain relevant certifications (AWS, Google Cloud, etc.)',
            'Network with professionals in your target field',
            'Apply to entry-level positions to gain experience'
        ]
    }
}

// Interview Performance Analysis
export interface InterviewFeedback {
    overallScore: number
    strengths: string[]
    areasForImprovement: string[]
    detailedFeedback: {
        communication: { score: number; feedback: string }
        technicalKnowledge: { score: number; feedback: string }
        problemSolving: { score: number; feedback: string }
        clarity: { score: number; feedback: string }
    }
    suggestions: string[]
    nextSteps: string[]
}

export async function analyzeInterviewPerformance(
    questions: string[],
    answers: string[],
    role: string = 'General'
): Promise<InterviewFeedback> {
    const prompt = `Analyze this mock interview performance and provide detailed feedback.

Role: ${role}

Interview Q&A:
${questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || 'No answer provided'}`).join('\n\n')}

Provide a comprehensive analysis in JSON format with:
1. overallScore (0-100)
2. strengths (array of 3-5 specific strengths)
3. areasForImprovement (array of 3-5 specific areas to improve)
4. detailedFeedback with scores and feedback for:
   - communication (clarity, articulation)
   - technicalKnowledge (depth, accuracy)
   - problemSolving (approach, logic)
   - clarity (structure, conciseness)
5. suggestions (array of 5-7 actionable tips)
6. nextSteps (array of 3-5 recommended actions)

Return ONLY valid JSON, no markdown formatting.`

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are an expert interview coach. Provide constructive, specific feedback. Return only valid JSON.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7,
        })

        const content = response.choices[0]?.message?.content?.trim() || ''

        // Clean up markdown if present
        let cleanedContent = content
        if (content.includes('```')) {
            cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        }

        const feedback = JSON.parse(cleanedContent)
        return feedback as InterviewFeedback
    } catch (error) {
        console.error('Error analyzing interview:', error)
        // Return default feedback
        return {
            overallScore: 70,
            strengths: [
                'You provided answers to all questions',
                'Showed willingness to engage with the interview process'
            ],
            areasForImprovement: [
                'Provide more specific examples from your experience',
                'Structure answers using the STAR method (Situation, Task, Action, Result)',
                'Elaborate more on technical details'
            ],
            detailedFeedback: {
                communication: { score: 70, feedback: 'Good basic communication. Work on being more concise and structured.' },
                technicalKnowledge: { score: 65, feedback: 'Demonstrated some knowledge. Dive deeper into technical concepts.' },
                problemSolving: { score: 70, feedback: 'Showed problem-solving approach. Explain your thought process more clearly.' },
                clarity: { score: 68, feedback: 'Generally clear responses. Use more concrete examples.' }
            },
            suggestions: [
                'Practice the STAR method for behavioral questions',
                'Prepare specific examples from your experience beforehand',
                'Research common interview questions for your role',
                'Record yourself answering questions to improve delivery',
                'Focus on quantifiable achievements in your answers'
            ],
            nextSteps: [
                'Review and practice answers to common interview questions',
                'Conduct more mock interviews to build confidence',
                'Study technical concepts relevant to your target role'
            ]
        }
    }
}
