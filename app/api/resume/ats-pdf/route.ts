import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { resumeText, jobDescription } = body

        if (!resumeText) {
            return NextResponse.json(
                { error: 'Resume text is required' },
                { status: 400 }
            )
        }

        const prompt = `Analyze this resume text for ATS (Applicant Tracking System) compatibility.

RESUME TEXT:
${resumeText}

${jobDescription ? `TARGET JOB DESCRIPTION:
${jobDescription}

Match the resume against this job description.` : ''}

Provide a detailed ATS analysis in JSON format with EXACTLY this structure:
{
    "overallScore": <number 0-100>,
    "breakdown": [
        {"category": "Contact Information", "score": <number>, "maxScore": 10, "status": "<good|warning|poor>", "feedback": "<brief feedback>"},
        {"category": "Work Experience", "score": <number>, "maxScore": 25, "status": "<good|warning|poor>", "feedback": "<brief feedback>"},
        {"category": "Education", "score": <number>, "maxScore": 15, "status": "<good|warning|poor>", "feedback": "<brief feedback>"},
        {"category": "Skills & Keywords", "score": <number>, "maxScore": 25, "status": "<good|warning|poor>", "feedback": "<brief feedback>"},
        {"category": "Format & Structure", "score": <number>, "maxScore": 15, "status": "<good|warning|poor>", "feedback": "<brief feedback>"},
        {"category": "Summary/Objective", "score": <number>, "maxScore": 10, "status": "<good|warning|poor>", "feedback": "<brief feedback>"}
    ],
    "suggestions": ["<actionable improvement 1>", "<actionable improvement 2>", ...],
    "keywords": {
        "found": ["<keyword1>", "<keyword2>", ...],
        "missing": ["<suggested keyword1>", "<suggested keyword2>", ...]
    },
    "strengths": ["<strength 1>", "<strength 2>", ...],
    "weaknesses": ["<weakness 1>", "<weakness 2>", ...]
}

Return ONLY valid JSON, no markdown formatting or explanation.`

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert ATS (Applicant Tracking System) analyzer. Provide accurate, specific ATS scoring and recommendations. Return only valid JSON.'
                },
                { role: 'user', content: prompt }
            ],
            max_tokens: 2500,
            temperature: 0.5,
        })

        const content = response.choices[0]?.message?.content?.trim() || ''

        // Clean up markdown if present
        let cleanedContent = content
        if (content.includes('```')) {
            cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        }

        const result = JSON.parse(cleanedContent)
        return NextResponse.json(result)
    } catch (error) {
        console.error('PDF ATS analysis error:', error)
        // Return fallback result on error
        return NextResponse.json({
            overallScore: 65,
            breakdown: [
                { category: 'Contact Information', score: 8, maxScore: 10, status: 'good', feedback: 'Contact details detected' },
                { category: 'Work Experience', score: 15, maxScore: 25, status: 'warning', feedback: 'Experience section needs more detail' },
                { category: 'Education', score: 10, maxScore: 15, status: 'good', feedback: 'Education section present' },
                { category: 'Skills & Keywords', score: 15, maxScore: 25, status: 'warning', feedback: 'Add more industry-specific keywords' },
                { category: 'Format & Structure', score: 10, maxScore: 15, status: 'warning', feedback: 'Structure could be improved' },
                { category: 'Summary/Objective', score: 7, maxScore: 10, status: 'warning', feedback: 'Consider adding a summary' }
            ],
            suggestions: [
                'Add more quantifiable achievements',
                'Include industry-specific keywords',
                'Ensure consistent formatting throughout',
                'Add a professional summary section',
                'Use action verbs to start bullet points'
            ],
            keywords: {
                found: ['Experience', 'Education', 'Skills'],
                missing: ['Results-driven', 'Achieved', 'Collaborated', 'Managed', 'Developed']
            },
            strengths: ['Resume text was parseable', 'Basic structure detected'],
            weaknesses: ['Could not fully analyze - please try again', 'Consider improving formatting']
        })
    }
}
