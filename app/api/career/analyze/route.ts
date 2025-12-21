import { NextResponse } from 'next/server'
import { analyzeCareerPath } from '@/lib/groq'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { skills, experience, education, targetRoles, careerStatus } = body

        if (!skills || skills.length === 0) {
            return NextResponse.json(
                { error: 'Skills are required for career path analysis' },
                { status: 400 }
            )
        }

        const analysis = await analyzeCareerPath(
            skills,
            experience || [],
            education || [],
            targetRoles || '',
            careerStatus || ''
        )

        return NextResponse.json(analysis)
    } catch (error) {
        console.error('Career Path Analysis error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze career path' },
            { status: 500 }
        )
    }
}
