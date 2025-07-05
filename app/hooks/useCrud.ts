import { useState, useCallback } from 'react'
import { useNotifications } from './useNotifications'

interface UseCrudReturn {
    create: (data: Record<string, unknown>) => Promise<unknown>
    update: (id: string, data: Record<string, unknown>) => Promise<unknown>
    remove: (id: string) => Promise<void>
    loading: boolean
    error: string | null
    resetError: () => void
}

export function useCrud(endpoint: string): UseCrudReturn {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { showSuccess, showError } = useNotifications()

    const resetError = useCallback(() => {
        setError(null)
    }, [])

    const handleApiCall = useCallback(async <T>(
        url: string,
        options: RequestInit = {},
        successMessage?: string
    ): Promise<T> => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (successMessage) {
                showSuccess(successMessage)
            }

            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ups! Da ist etwas schief gelaufen.'
            setError(errorMessage)
            showError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }, [showSuccess, showError])

    const create = useCallback(async (data: Record<string, unknown>): Promise<unknown> => {
        return await handleApiCall<unknown>(`/api/${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data)
        }, 'Eintrag erfolgreich erstellt!')
    }, [handleApiCall, endpoint])

    const update = useCallback(async (id: string, data: Record<string, unknown>): Promise<unknown> => {
        return await handleApiCall<unknown>(`/api/${endpoint}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        }, 'Eintrag erfolgreich bearbeitet!')
    }, [handleApiCall, endpoint])

    const remove = useCallback(async (id: string): Promise<void> => {
        await handleApiCall<void>(`/api/${endpoint}/${id}`, {
            method: 'DELETE'
        }, 'Eintrag erfolgreich gelöscht!')
    }, [handleApiCall, endpoint])

    return {
        create,
        update,
        remove,
        loading,
        error,
        resetError
    }
} 