'use client'

import { useState, useEffect } from 'react'
import ImmobilienAutocomplete from './ImmobilienAutocomplete'
import KontaktAutocomplete from './KontaktAutocomplete'
import { useEntityDetails } from '../hooks/useEntityDetails'

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

interface RelationshipManagerProps {
    name: string
    onChange: (name: string, value: Relationship[]) => void
    relationshipType: 'immobilien' | 'kontakte' // Which type of relationships to manage
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
    const [newRelationship, setNewRelationship] = useState<Relationship>({
        art: '',
        startdatum: '',
        enddatum: ''
    })
    const [pendingUpdates, setPendingUpdates] = useState<Relationship[] | null>(null)
    const { fetchEntityDetails } = useEntityDetails()

    // Only update local state from props when the prop changes
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

    const handleAddRelationship = async () => {
        if (newRelationship.art &&
            ((relationshipType === 'immobilien' && newRelationship.kontakt_id) ||
                (relationshipType === 'kontakte' && newRelationship.immobilien_id))) {

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
            setPendingUpdates(updated) // Defer the onChange call
            setNewRelationship({ art: '', startdatum: '', enddatum: '' })
            setIsAdding(false)
        }
    }

    const handleDeleteRelationship = (id: string) => {
        const updated = relationships.filter(r => r.id !== id)
        setRelationships(updated)
        setPendingUpdates(updated) // Defer the onChange call
    }

    const handleCancel = () => {
        setNewRelationship({ art: '', startdatum: '', enddatum: '' })
        setIsAdding(false)
    }

    const handleRelationshipChange = (field: string, value: string) => {
        setNewRelationship(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const relationshipTypeOptions = [
        { value: 'Eigentümer', label: 'Eigentümer' },
        { value: 'Mieter', label: 'Mieter' },
        { value: 'Dienstleister', label: 'Dienstleister' }
    ]

    return (
        <div className="space-y-4">
            {/* Current Relationships */}
            {relationships.length > 0 && (
                <div className="space-y-2">
                    {relationships.map((relationship) => (
                        <div key={relationship.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                    {relationshipType === 'immobilien'
                                        ? (relationship.kontakt_name || `Kontakt ID: ${relationship.kontakt_id}`)
                                        : (relationship.immobilien_titel || `Immobilie ID: ${relationship.immobilien_id}`)
                                    }
                                </div>
                                <div className="text-sm text-gray-600">
                                    {relationship.art}
                                    {relationship.startdatum && ` • Von: ${relationship.startdatum}`}
                                    {relationship.enddatum && ` • Bis: ${relationship.enddatum}`}
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleDeleteRelationship(relationship.id!)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Löschen
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Form */}
            {isAdding && (
                <div className="p-4 border border-gray-300 rounded-md bg-white">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Neue Beziehung hinzufügen
                    </h4>

                    <div className="space-y-3">
                        {/* Autocomplete for the opposite entity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {relationshipType === 'immobilien' ? 'Kontakt' : 'Immobilie'}
                            </label>
                            {relationshipType === 'immobilien' ? (
                                <KontaktAutocomplete
                                    name="kontakt_id"
                                    onChange={handleRelationshipChange}
                                    required={true}
                                    placeholder="Kontakt suchen..."
                                />
                            ) : (
                                <ImmobilienAutocomplete
                                    name="immobilien_id"
                                    onChange={handleRelationshipChange}
                                    required={true}
                                    placeholder="Immobilie suchen..."
                                />
                            )}
                        </div>

                        {/* Relationship Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Beziehungstyp
                            </label>
                            <select
                                value={newRelationship.art}
                                onChange={(e) => handleRelationshipChange('art', e.target.value)}
                                required={true}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Bitte wählen...</option>
                                {relationshipTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Startdatum
                            </label>
                            <input
                                type="date"
                                value={newRelationship.startdatum || ''}
                                onChange={(e) => handleRelationshipChange('startdatum', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Enddatum
                            </label>
                            <input
                                type="date"
                                value={newRelationship.enddatum || ''}
                                onChange={(e) => handleRelationshipChange('enddatum', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-3 py-1 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                            >
                                Abbrechen
                            </button>
                            <button
                                type="button"
                                onClick={handleAddRelationship}
                                className="px-3 py-1 text-sm text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700"
                            >
                                Hinzufügen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Button */}
            {!isAdding && (
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