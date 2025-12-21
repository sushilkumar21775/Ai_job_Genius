// JSearch API Service for Real Job Listings

export interface Job {
    id: string
    title: string
    company: string
    location: string
    description: string
    salary: string
    employmentType: string
    postedDate: string
    applyLink: string
    companyLogo: string | null
    isRemote: boolean
}

export interface JobSearchParams {
    query: string
    location?: string
    page?: number
    numPages?: number
    datePosted?: 'all' | 'today' | '3days' | 'week' | 'month'
    remoteOnly?: boolean
    employmentTypes?: string[]
}

export interface JobSearchResult {
    jobs: Job[]
    totalJobs: number
    page: number
    hasMore: boolean
}

// Search for jobs using JSearch API
export async function searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
    const {
        query,
        location = 'India',
        page = 1,
        numPages = 1,
        datePosted = 'month',
        remoteOnly = false,
        employmentTypes = []
    } = params

    const apiKey = process.env.RAPIDAPI_KEY

    if (!apiKey) {
        console.error('RapidAPI key not found')
        return { jobs: [], totalJobs: 0, page: 1, hasMore: false }
    }

    try {
        const searchQuery = remoteOnly ? `${query} remote` : query
        const url = new URL('https://jsearch.p.rapidapi.com/search')
        url.searchParams.append('query', `${searchQuery} in ${location}`)
        url.searchParams.append('page', page.toString())
        url.searchParams.append('num_pages', numPages.toString())
        url.searchParams.append('date_posted', datePosted)

        if (employmentTypes.length > 0) {
            url.searchParams.append('employment_types', employmentTypes.join(','))
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        })

        if (!response.ok) {
            console.error('JSearch API error:', response.status)
            return { jobs: [], totalJobs: 0, page: 1, hasMore: false }
        }

        const data = await response.json()

        if (!data.data || data.data.length === 0) {
            return { jobs: [], totalJobs: 0, page: 1, hasMore: false }
        }

        const jobs: Job[] = data.data.map((job: any) => ({
            id: job.job_id || crypto.randomUUID(),
            title: job.job_title || 'Untitled Position',
            company: job.employer_name || 'Unknown Company',
            location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country || 'Remote',
            description: job.job_description?.substring(0, 500) || '',
            salary: formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency),
            employmentType: formatEmploymentType(job.job_employment_type),
            postedDate: formatDate(job.job_posted_at_datetime_utc),
            applyLink: job.job_apply_link || '',
            companyLogo: job.employer_logo || null,
            isRemote: job.job_is_remote || false
        }))

        return {
            jobs,
            totalJobs: data.data.length,
            page,
            hasMore: data.data.length >= 10
        }
    } catch (error) {
        console.error('Job search error:', error)
        return { jobs: [], totalJobs: 0, page: 1, hasMore: false }
    }
}

// Helper functions
function formatSalary(min: number | null, max: number | null, currency: string | null): string {
    if (!min && !max) return 'Not disclosed'

    const curr = currency || 'USD'
    const formatNum = (n: number) => {
        if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
        return n.toString()
    }

    if (min && max) {
        return `${curr} ${formatNum(min)} - ${formatNum(max)}`
    }
    if (min) return `${curr} ${formatNum(min)}+`
    if (max) return `Up to ${curr} ${formatNum(max)}`
    return 'Not disclosed'
}

function formatEmploymentType(type: string | null): string {
    if (!type) return 'Full-time'

    const types: Record<string, string> = {
        'FULLTIME': 'Full-time',
        'PARTTIME': 'Part-time',
        'CONTRACTOR': 'Contract',
        'INTERN': 'Internship',
        'TEMPORARY': 'Temporary'
    }

    return types[type.toUpperCase()] || type
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Recently'

    try {
        const date = new Date(dateStr)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        return `${Math.floor(diffDays / 30)} months ago`
    } catch {
        return 'Recently'
    }
}

// Get job details by ID
export async function getJobDetails(jobId: string): Promise<Job | null> {
    const apiKey = process.env.RAPIDAPI_KEY

    if (!apiKey) {
        console.error('RapidAPI key not found')
        return null
    }

    try {
        const url = `https://jsearch.p.rapidapi.com/job-details?job_id=${encodeURIComponent(jobId)}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        if (!data.data || data.data.length === 0) {
            return null
        }

        const job = data.data[0]
        return {
            id: job.job_id,
            title: job.job_title,
            company: job.employer_name,
            location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country,
            description: job.job_description,
            salary: formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency),
            employmentType: formatEmploymentType(job.job_employment_type),
            postedDate: formatDate(job.job_posted_at_datetime_utc),
            applyLink: job.job_apply_link,
            companyLogo: job.employer_logo,
            isRemote: job.job_is_remote
        }
    } catch (error) {
        console.error('Get job details error:', error)
        return null
    }
}
