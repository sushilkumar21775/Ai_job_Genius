import { NextResponse } from 'next/server'
import { analyzeInterviewPerformance } from '@/lib/groq'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { questions, answers, role } = body

        if (!questions || !answers) {
            return NextResponse.json(
                { error: 'Questions and answers are required' },
                { status: 400 }
            )
        }

        const feedback = await analyzeInterviewPerformance(
            questions,
            answers,
            role || 'General'
        )

        return NextResponse.json(feedback)
    } catch (error) {
        console.error('Interview analysis error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze interview' },
            { status: 500 }
        )
    }
}
