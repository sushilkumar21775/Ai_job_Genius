import { NextRequest, NextResponse } from 'next/server'
import { improveExperienceDescription } from '@/lib/groq'

export async function POST(request: NextRequest) {
    try {
        const { description, position, company } = await request.json()

        const improved = await improveExperienceDescription(description, position, company)

        return NextResponse.json({ description: improved })
    } catch (error) {
        console.error('Error improving description:', error)
        return NextResponse.json(
            {
                description: `• Led key initiatives and projects to drive business outcomes\n• Collaborated with cross-functional teams to deliver solutions\n• Implemented process improvements resulting in increased efficiency`,
                error: 'Failed to improve description, using fallback'
            },
            { status: 200 }
        )
    }
}
