import { useState, useEffect } from 'react'

interface UseDataFetchingOptions {
    endpoint: string
    autoFetch?: boolean
}

interface UseDataFetchingReturn<T> {
    data: T[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useDataFetching<T = any>({ endpoint, autoFetch = true }: UseDataFetchingOptions): UseDataFetchingReturn<T> {
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(endpoint)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            setData(result)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
            setError(errorMessage)
            console.error('Error fetching data:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (autoFetch) {
            fetchData()
        }
    }, [endpoint, autoFetch])

    return {
        data,
        loading,
        error,
        refetch: fetchData
    }
} 