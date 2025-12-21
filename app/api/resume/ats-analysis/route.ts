import { NextResponse } from 'next/server'
import { analyzeATSScore } from '@/lib/groq'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { resumeData, targetJobTitle } = body

        if (!resumeData) {
            return NextResponse.json(
                { error: 'Resume data is required' },
                { status: 400 }
            )
        }

        const analysis = await analyzeATSScore(resumeData, targetJobTitle)

        return NextResponse.json(analysis)
    } catch (error) {
        console.error('ATS Analysis error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze resume' },
            { status: 500 }
        )
    }
}
