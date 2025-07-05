import { useState } from 'react'
import { useNotifications } from './useNotifications'

interface UseDeleteEntryReturn {
    deleteEntry: (id: string) => Promise<void>
    loading: boolean
    error: string | null
    resetError: () => void
}

export function useDeleteEntry(endpoint: string): UseDeleteEntryReturn {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { showSuccess, showError } = useNotifications()

    const deleteEntry = async (id: string) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/${endpoint}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
            }

            showSuccess('Eintrag erfolgreich gelöscht!')
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
        deleteEntry,
        loading,
        error,
        resetError
    }
} 