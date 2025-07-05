import { useState, useEffect, useCallback } from 'react'

interface UseDataReturn<T> {
    data: T[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useData<T = unknown>(endpoint: string): UseDataReturn<T> {
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/${endpoint}`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            const dataArray = Array.isArray(result) ? result : [result]
            setData(dataArray as T[])
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            setError(errorMessage)
            setData([])
        } finally {
            setLoading(false)
        }
    }, [endpoint])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refetch: fetchData
    }
}

interface UseEntityReturn<T> {
    entity: T | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useEntity<T = unknown>(endpoint: string | null, id: string | null): UseEntityReturn<T> {
    const [entity, setEntity] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchEntity = useCallback(async () => {
        if (!endpoint || !id) {
            setEntity(null)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/${endpoint}/${id}`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            setEntity(result as T)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            setError(errorMessage)
            setEntity(null)
        } finally {
            setLoading(false)
        }
    }, [endpoint, id])

    useEffect(() => {
        fetchEntity()
    }, [fetchEntity])

    return {
        entity,
        loading,
        error,
        refetch: fetchEntity
    }
} 