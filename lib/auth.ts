import { currentUser, auth } from '@clerk/nextjs/server'

export async function getCurrentUser() {
    const user = await currentUser()
    if (!user) return null

    return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        full_name: user.fullName || user.firstName || 'User',
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        avatar_url: user.imageUrl || '',
    }
}

export async function requireAuth() {
    const { userId } = await auth()
    if (!userId) {
        throw new Error('Not authenticated')
    }
    return userId
}
