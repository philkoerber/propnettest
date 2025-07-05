import { useState, useCallback } from 'react'

interface EntityDetails {
    name?: string
    titel?: string
}

export const useEntityDetails = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchEntityDetails = useCallback(async (
        entityId: string,
        entityType: 'kontakte' | 'immobilien'
    ): Promise<string | null> => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/${entityType}/${entityId}`)

            if (!response.ok) {
                throw new Error(`Failed to fetch ${entityType} details`)
            }

            const data: EntityDetails = await response.json()

            // Return the appropriate field based on entity type
            return entityType === 'kontakte' ? data.name || null : data.titel || null
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            console.error(`Error fetching ${entityType} details:`, err)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        fetchEntityDetails,
        loading,
        error
    }
} 