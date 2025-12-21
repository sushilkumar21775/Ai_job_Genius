import { NextResponse } from 'next/server'
import { generateInterviewQuestions } from '@/lib/interview'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { role, interviewType, count } = body

        if (!role) {
            return NextResponse.json(
                { error: 'Role is required' },
                { status: 400 }
            )
        }

        const questions = await generateInterviewQuestions(
            role,
            interviewType || 'mixed',
            count || 5
        )

        return NextResponse.json({ questions })
    } catch (error) {
        console.error('Generate questions error:', error)
        return NextResponse.json(
            { error: 'Failed to generate questions' },
            { status: 500 }
        )
    }
}
