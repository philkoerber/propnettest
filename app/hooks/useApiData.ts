import { useState, useEffect } from 'react'

interface UseApiDataReturn {
    data: any[]
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useApiData(endpoint: string): UseApiDataReturn {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/${endpoint}`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            setData(Array.isArray(result) ? result : [result])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setData([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [endpoint])

    return {
        data,
        loading,
        error,
        refetch: fetchData
    }
} 