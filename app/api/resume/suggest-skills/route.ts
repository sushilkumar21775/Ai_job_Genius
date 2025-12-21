import { NextRequest, NextResponse } from 'next/server'
import { suggestSkills, ResumeData } from '@/lib/groq'

export async function POST(request: NextRequest) {
    try {
        const { experience, currentSkills } = await request.json()

        const skills = await suggestSkills(experience, currentSkills)

        return NextResponse.json({ skills })
    } catch (error) {
        console.error('Error suggesting skills:', error)
        return NextResponse.json(
            {
                skills: ['Problem Solving', 'Communication', 'Team Leadership', 'Project Management', 'Analytical Thinking', 'Time Management', 'Critical Thinking', 'Adaptability'],
                error: 'Failed to suggest skills, using fallback'
            },
            { status: 200 }
        )
    }
}
