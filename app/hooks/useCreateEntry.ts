import { useState } from 'react'
import { useNotifications } from './useNotifications'

interface UseCreateEntryReturn {
    createEntry: (data: Record<string, unknown>) => Promise<unknown>
    loading: boolean
    error: string | null
    resetError: () => void
}

export function useCreateEntry(endpoint: string): UseCreateEntryReturn {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { showSuccess, showError } = useNotifications()

    const createEntry = async (data: Record<string, unknown>) => {
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
            showSuccess('Eintrag erfolgreich erstellt!')
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ups! Da ist etwas schief gelaufen.'
            setError(errorMessage)
            showError(errorMessage)
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