import { NextResponse } from 'next/server'
import { evaluateAnswer } from '@/lib/interview'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { question, answer, role } = body

        if (!question || !answer) {
            return NextResponse.json(
                { error: 'Question and answer are required' },
                { status: 400 }
            )
        }

        const feedback = await evaluateAnswer(
            question,
            answer,
            role || 'General'
        )

        return NextResponse.json(feedback)
    } catch (error) {
        console.error('Evaluate answer error:', error)
        return NextResponse.json(
            { error: 'Failed to evaluate answer' },
            { status: 500 }
        )
    }
}
