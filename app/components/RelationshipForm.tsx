'use client'

import { useState } from 'react'
import { Relationship, RelationshipValidator } from '../../lib/relationshipValidation'
import { RELATIONSHIP_TYPES, RelationshipType } from '../../lib/columnDefinitions'
import { useNotifications } from '../hooks/useNotifications'
import ImmobilienAutocomplete from './ImmobilienAutocomplete'
import KontaktAutocomplete from './KontaktAutocomplete'

interface RelationshipFormProps {
    relationshipType: 'immobilien' | 'kontakte'
    onSubmit: (relationship: Relationship) => void
    onCancel: () => void
    existingRelationships: Relationship[]
}

export default function RelationshipForm({
    relationshipType,
    onSubmit,
    onCancel,
    existingRelationships
}: RelationshipFormProps) {
    const [relationship, setRelationship] = useState<Relationship>({
        art: '' as RelationshipType,
        startdatum: '',
        enddatum: '',
        dienstleistungen: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const validator = new RelationshipValidator()
    const { showError } = useNotifications()

    const handleFieldChange = (field: string, value: string) => {
        setRelationship(prev => ({
            ...prev,
            [field]: value
        }))

        // Clear field-specific error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [field]: _, ...rest } = prev
                return rest
            })
        }
    }

    const handleSubmit = () => {
        // Validate the relationship
        const validationResult = validator.validate(relationship, existingRelationships, relationshipType)

        if (!validationResult.isValid) {
            setErrors(validator.getErrorsByField())

            // Show general errors as notifications
            const generalError = validationResult.errors.find(error => error.field === 'general')
            if (generalError) {
                showError(generalError.message)
            }

            return
        }

        // Clear errors and submit
        setErrors({})
        onSubmit(relationship)
    }

    const handleCancel = () => {
        setRelationship({ art: '' as RelationshipType, startdatum: '', enddatum: '', dienstleistungen: '' })
        setErrors({})
        onCancel()
    }

    const getFieldClassName = (fieldName: string) => {
        return `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'
            }`
    }

    return (
        <div className="p-4 border border-gray-300 rounded-md bg-white">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
                Neue Beziehung hinzufügen
            </h4>

            <div className="space-y-3">
                {/* General Error Display */}
                {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                )}

                {/* Entity Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {relationshipType === 'immobilien' ? 'Kontakt' : 'Immobilie'}
                    </label>
                    {relationshipType === 'immobilien' ? (
                        <KontaktAutocomplete
                            name="kontakt_id"
                            onChange={handleFieldChange}
                            required={true}
                            placeholder="Kontakt suchen..."
                        />
                    ) : (
                        <ImmobilienAutocomplete
                            name="immobilien_id"
                            onChange={handleFieldChange}
                            required={true}
                            placeholder="Immobilie suchen..."
                        />
                    )}
                    {errors.entity && (
                        <p className="mt-1 text-sm text-red-600">{errors.entity}</p>
                    )}
                </div>

                {/* Relationship Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Beziehungstyp
                    </label>
                    <select
                        value={relationship.art}
                        onChange={(e) => handleFieldChange('art', e.target.value)}
                        required={true}
                        className={getFieldClassName('art')}
                    >
                        <option value="">Bitte wählen...</option>
                        {RELATIONSHIP_TYPES.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.art && (
                        <p className="mt-1 text-sm text-red-600">{errors.art}</p>
                    )}
                </div>

                {/* Services Field - only show for Dienstleister */}
                {relationship.art === 'Dienstleister' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Angebotene Dienstleistungen <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={relationship.dienstleistungen || ''}
                            onChange={(e) => handleFieldChange('dienstleistungen', e.target.value)}
                            required={true}
                            placeholder="Beschreiben Sie die angebotenen Dienstleistungen..."
                            className={getFieldClassName('dienstleistungen')}
                            rows={3}
                        />
                        {errors.dienstleistungen && (
                            <p className="mt-1 text-sm text-red-600">{errors.dienstleistungen}</p>
                        )}
                    </div>
                )}

                {/* Start Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Startdatum
                    </label>
                    <input
                        type="date"
                        value={relationship.startdatum || ''}
                        onChange={(e) => handleFieldChange('startdatum', e.target.value)}
                        className={getFieldClassName('startdatum')}
                    />
                    {errors.startdatum && (
                        <p className="mt-1 text-sm text-red-600">{errors.startdatum}</p>
                    )}
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enddatum
                    </label>
                    <input
                        type="date"
                        value={relationship.enddatum || ''}
                        onChange={(e) => handleFieldChange('enddatum', e.target.value)}
                        className={getFieldClassName('enddatum')}
                    />
                    {errors.enddatum && (
                        <p className="mt-1 text-sm text-red-600">{errors.enddatum}</p>
                    )}
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
                        onClick={handleSubmit}
                        className="px-3 py-1 text-sm text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700"
                    >
                        Hinzufügen
                    </button>
                </div>
            </div>
        </div>
    )
} 