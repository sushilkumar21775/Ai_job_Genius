import { NextResponse } from 'next/server'
import { searchJobs } from '@/lib/jobs'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        const query = searchParams.get('query') || 'software developer'
        const location = searchParams.get('location') || 'India'
        const page = parseInt(searchParams.get('page') || '1')
        const datePosted = (searchParams.get('datePosted') as 'all' | 'today' | '3days' | 'week' | 'month') || 'month'
        const remoteOnly = searchParams.get('remoteOnly') === 'true'

        const result = await searchJobs({
            query,
            location,
            page,
            datePosted,
            remoteOnly
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Job search API error:', error)
        return NextResponse.json(
            { error: 'Failed to search jobs', jobs: [], totalJobs: 0 },
            { status: 500 }
        )
    }
}
