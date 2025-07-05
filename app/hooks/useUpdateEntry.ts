import { useState } from 'react'
import { useNotifications } from './useNotifications'

interface UseUpdateEntryReturn {
    updateEntry: (id: string, data: any) => Promise<any>
    loading: boolean
    error: string | null
    resetError: () => void
}

export function useUpdateEntry(endpoint: string): UseUpdateEntryReturn {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { showSuccess, showError } = useNotifications()

    const updateEntry = async (id: string, data: any) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/${endpoint}/${id}`, {
                method: 'PATCH',
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
            showSuccess('Eintrag erfolgreich bearbeitet!')
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
        updateEntry,
        loading,
        error,
        resetError
    }
} 