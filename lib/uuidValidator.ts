// UUID validation utility for API routes
export function isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
}

export function validateUUID(id: string): { isValid: boolean; error?: string } {
    if (!isValidUUID(id)) {
        return {
            isValid: false,
            error: 'Invalid UUID format'
        }
    }
    return { isValid: true }
} 