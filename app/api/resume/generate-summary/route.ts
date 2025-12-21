import { NextRequest, NextResponse } from 'next/server'
import { generateProfessionalSummary, ResumeData } from '@/lib/groq'

export async function POST(request: NextRequest) {
    try {
        const resumeData: ResumeData = await request.json()

        const summary = await generateProfessionalSummary(resumeData)

        return NextResponse.json({ summary })
    } catch (error) {
        console.error('Error generating summary:', error)
        return NextResponse.json(
            {
                summary: 'Results-driven professional with proven expertise in delivering high-quality work. Committed to continuous learning and contributing to team success.',
                error: 'Failed to generate AI summary, using fallback'
            },
            { status: 200 }
        )
    }
}
