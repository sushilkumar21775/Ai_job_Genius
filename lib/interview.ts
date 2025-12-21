// AI-Powered Mock Interview Service

import Groq from 'groq-sdk'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

export interface InterviewQuestion {
    id: number
    question: string
    type: 'behavioral' | 'technical' | 'situational'
    difficulty: 'easy' | 'medium' | 'hard'
    tips: string[]
}

export interface InterviewFeedback {
    overallScore: number
    clarity: number
    relevance: number
    structure: number
    strengths: string[]
    improvements: string[]
    suggestedAnswer: string
}

// Generate interview questions based on role and type
export async function generateInterviewQuestions(
    role: string,
    interviewType: 'behavioral' | 'technical' | 'mixed',
    count: number = 5
): Promise<InterviewQuestion[]> {
    const prompt = `Generate ${count} interview questions for a ${role} position.
Interview type: ${interviewType}

Return ONLY valid JSON array with this structure (no markdown, no explanation):
[
    {
        "id": 1,
        "question": "The interview question",
        "type": "behavioral|technical|situational",
        "difficulty": "easy|medium|hard",
        "tips": ["tip 1", "tip 2"]
    }
]

Make questions realistic and commonly asked in real interviews. Include a mix of difficulties.`

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are an expert interviewer. Respond ONLY with valid JSON array, no markdown.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 1500,
            temperature: 0.7,
        })

        const content = response.choices[0]?.message?.content?.trim() || ''

        // Clean up response
        let cleanedContent = content
        if (content.includes('```')) {
            cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        }

        const questions = JSON.parse(cleanedContent)
        return questions as InterviewQuestion[]
    } catch (error) {
        console.error('Error generating questions:', error)
        // Return fallback questions
        return getDefaultQuestions(role, interviewType)
    }
}

// Evaluate user's answer and provide feedback
export async function evaluateAnswer(
    question: string,
    userAnswer: string,
    role: string
): Promise<InterviewFeedback> {
    const prompt = `You are evaluating a job interview answer.

Role: ${role}
Question: ${question}
Candidate's Answer: ${userAnswer}

Evaluate the answer and respond with ONLY valid JSON (no markdown):
{
    "overallScore": 75,
    "clarity": 80,
    "relevance": 70,
    "structure": 75,
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "suggestedAnswer": "A brief example of a strong answer"
}

Score from 0-100. Be constructive but honest.`

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are an expert interview coach. Respond ONLY with valid JSON, no markdown.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.6,
        })

        const content = response.choices[0]?.message?.content?.trim() || ''

        let cleanedContent = content
        if (content.includes('```')) {
            cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        }

        const feedback = JSON.parse(cleanedContent)
        return feedback as InterviewFeedback
    } catch (error) {
        console.error('Error evaluating answer:', error)
        return {
            overallScore: 70,
            clarity: 70,
            relevance: 70,
            structure: 70,
            strengths: ['You provided an answer to the question'],
            improvements: ['Consider adding more specific examples', 'Structure your answer using the STAR method'],
            suggestedAnswer: 'A well-structured answer would include a specific example with context, actions taken, and measurable results.'
        }
    }
}

// Fallback questions if AI fails
function getDefaultQuestions(role: string, type: string): InterviewQuestion[] {
    const behavioralQuestions: InterviewQuestion[] = [
        {
            id: 1,
            question: "Tell me about yourself and your background.",
            type: "behavioral",
            difficulty: "easy",
            tips: ["Keep it concise (2-3 minutes)", "Focus on relevant experience", "End with why you're interested in this role"]
        },
        {
            id: 2,
            question: "Describe a challenging project you worked on. How did you handle it?",
            type: "behavioral",
            difficulty: "medium",
            tips: ["Use the STAR method", "Be specific about your role", "Highlight the positive outcome"]
        },
        {
            id: 3,
            question: "Tell me about a time you had a conflict with a colleague. How did you resolve it?",
            type: "behavioral",
            difficulty: "medium",
            tips: ["Focus on resolution, not blame", "Show emotional intelligence", "Highlight what you learned"]
        },
        {
            id: 4,
            question: "What is your greatest professional achievement?",
            type: "behavioral",
            difficulty: "easy",
            tips: ["Choose a relevant achievement", "Quantify results if possible", "Connect it to the role you're applying for"]
        },
        {
            id: 5,
            question: "Where do you see yourself in 5 years?",
            type: "behavioral",
            difficulty: "easy",
            tips: ["Show ambition but be realistic", "Align with company growth", "Focus on skill development"]
        }
    ]

    const technicalQuestions: InterviewQuestion[] = [
        {
            id: 1,
            question: `What technologies and tools are you most proficient in for ${role}?`,
            type: "technical",
            difficulty: "easy",
            tips: ["Be honest about your skill level", "Mention recent learning", "Relate to job requirements"]
        },
        {
            id: 2,
            question: "Walk me through your approach to solving a complex technical problem.",
            type: "technical",
            difficulty: "medium",
            tips: ["Describe your thought process", "Mention tools and techniques", "Discuss trade-offs considered"]
        },
        {
            id: 3,
            question: "How do you stay updated with the latest industry trends and technologies?",
            type: "technical",
            difficulty: "easy",
            tips: ["Mention specific resources", "Show continuous learning mindset", "Give recent examples"]
        },
        {
            id: 4,
            question: "Describe your experience with version control and collaboration tools.",
            type: "technical",
            difficulty: "easy",
            tips: ["Mention specific tools (Git, etc.)", "Describe your workflow", "Highlight teamwork"]
        },
        {
            id: 5,
            question: "How do you ensure the quality of your work?",
            type: "technical",
            difficulty: "medium",
            tips: ["Mention testing approaches", "Discuss code review", "Talk about documentation"]
        }
    ]

    return type === 'technical' ? technicalQuestions : behavioralQuestions
}
