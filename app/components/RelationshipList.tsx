'use client'

import { Relationship } from '../../lib/relationshipValidation'

interface RelationshipListProps {
    relationships: Relationship[]
    relationshipType: 'immobilien' | 'kontakte'
    onDelete: (id: string) => void
}

export default function RelationshipList({
    relationships,
    relationshipType,
    onDelete
}: RelationshipListProps) {
    if (relationships.length === 0) {
        return null
    }

    return (
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
                            {relationship.dienstleistungen && relationship.art === 'Dienstleister' && (
                                <div className="mt-1 text-xs text-gray-500">
                                    Dienstleistungen: {relationship.dienstleistungen}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onDelete(relationship.id!)}
                            className="text-red-600 hover:text-red-800 text-sm"
                        >
                            Löschen
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
} 