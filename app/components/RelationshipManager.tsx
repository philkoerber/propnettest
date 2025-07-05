'use client'

import { useState, useEffect } from 'react'
import { useEntityDetails } from '../hooks/useEntityDetails'
import { Relationship } from '../../lib/relationshipValidation'
import RelationshipList from './RelationshipList'
import RelationshipForm from './RelationshipForm'

interface RelationshipManagerProps {
    name: string
    onChange: (name: string, value: Relationship[]) => void
    relationshipType: 'immobilien' | 'kontakte'
    currentRelationships?: Relationship[]
}

export default function RelationshipManager({
    name,
    onChange,
    relationshipType,
    currentRelationships = []
}: RelationshipManagerProps) {
    const [relationships, setRelationships] = useState<Relationship[]>(currentRelationships)
    const [isAdding, setIsAdding] = useState(false)
    const [pendingUpdates, setPendingUpdates] = useState<Relationship[] | null>(null)
    const { fetchEntityDetails } = useEntityDetails()

    // Update local state when props change
    useEffect(() => {
        setRelationships(currentRelationships)
    }, [currentRelationships])

    // Handle pending updates after render cycle
    useEffect(() => {
        if (pendingUpdates !== null) {
            onChange(name, pendingUpdates)
            setPendingUpdates(null)
        }
    }, [pendingUpdates, name, onChange])

    const handleAddRelationship = async (newRelationship: Relationship) => {
        // Fetch entity details to get the name/title
        let entityName: string | undefined = undefined
        if (relationshipType === 'immobilien' && newRelationship.kontakt_id) {
            entityName = await fetchEntityDetails(newRelationship.kontakt_id.toString(), 'kontakte') || undefined
        } else if (relationshipType === 'kontakte' && newRelationship.immobilien_id) {
            entityName = await fetchEntityDetails(newRelationship.immobilien_id.toString(), 'immobilien') || undefined
        }

        const relationship: Relationship = {
            id: `temp-${Date.now()}`, // Temporary ID for new relationships
            ...newRelationship,
            ...(relationshipType === 'immobilien'
                ? { kontakt_name: entityName }
                : { immobilien_titel: entityName }
            )
        }

        const updated = [...relationships, relationship]
        setRelationships(updated)
        setPendingUpdates(updated)
        setIsAdding(false)
    }

    const handleDeleteRelationship = (id: string) => {
        const updated = relationships.filter(r => r.id !== id)
        setRelationships(updated)
        setPendingUpdates(updated)
    }

    const handleCancelForm = () => {
        setIsAdding(false)
    }

    return (
        <div className="space-y-4">
            {/* Current Relationships */}
            <RelationshipList
                relationships={relationships}
                relationshipType={relationshipType}
                onDelete={handleDeleteRelationship}
            />

            {/* Add Form or Add Button */}
            {isAdding ? (
                <RelationshipForm
                    relationshipType={relationshipType}
                    onSubmit={handleAddRelationship}
                    onCancel={handleCancelForm}
                    existingRelationships={relationships}
                />
            ) : (
                <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="w-full px-3 py-2 border border-gray-300 border-dashed rounded-md text-gray-600 hover:text-gray-800 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Beziehung hinzufügen
                </button>
            )}
        </div>
    )
} 