import { NextResponse } from 'next/server'
import { extractText } from 'unpdf'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Convert file to Uint8Array
        const bytes = await file.arrayBuffer()
        const uint8Array = new Uint8Array(bytes)

        // Extract text using unpdf
        const { text, totalPages } = await extractText(uint8Array, { mergePages: true })

        if (!text || text.trim().length === 0) {
            return NextResponse.json({
                error: 'Could not extract text from PDF. The file may be image-based or protected.',
                text: ''
            })
        }

        return NextResponse.json({
            text: text,
            pages: totalPages,
            success: true
        })
    } catch (error: any) {
        console.error('PDF parsing error:', error)
        return NextResponse.json(
            { error: `Failed to parse PDF: ${error.message || 'Unknown error'}` },
            { status: 500 }
        )
    }
}
