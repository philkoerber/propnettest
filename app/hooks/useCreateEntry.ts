import { useState } from 'react'

interface UseCreateEntryReturn {
    createEntry: (data: any) => Promise<any>
    loading: boolean
    error: string | null
    resetError: () => void
}

export function useCreateEntry(endpoint: string): UseCreateEntryReturn {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createEntry = async (data: any) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const resetError = () => {
        setError(null)
    }

    return {
        createEntry,
        loading,
        error,
        resetError
    }
} 