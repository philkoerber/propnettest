import { useState, useEffect } from 'react'

interface Relationship {
    id?: string
    immobilien_id?: string | number
    kontakt_id?: string | number
    art: string
    startdatum?: string
    enddatum?: string
    immobilien_titel?: string
    kontakt_name?: string
}

interface EntityWithRelationships {
    id: string
    [key: string]: unknown
    relationships?: Relationship[]
}

interface UseFetchEntityWithRelationshipsReturn {
    entity: EntityWithRelationships | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useFetchEntityWithRelationships(table: string | null, id: string | null): UseFetchEntityWithRelationshipsReturn {
    const [entity, setEntity] = useState<EntityWithRelationships | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchEntity = async () => {
        if (!table || !id) {
            setEntity(null)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/${table}/${id}`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            setEntity(result)
        } catch (err) {
            console.error('Error fetching entity with relationships:', err)
            setError(err instanceof Error ? err.message : 'An error occurred')
            setEntity(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEntity()
    }, [table, id])

    return {
        entity,
        loading,
        error,
        refetch: fetchEntity
    }
} 