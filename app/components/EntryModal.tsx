'use client'

import { useState, useEffect } from 'react'
import { useCreateEntry } from '../hooks/useCreateEntry'
import { useUpdateEntry } from '../hooks/useUpdateEntry'
import { ExtendedColDef, getFormFields, FormField } from '../../lib/columnDefinitions'
import AddressAutocomplete from './AddressAutocomplete'
import ImmobilienAutocomplete from './ImmobilienAutocomplete'
import KontaktAutocomplete from './KontaktAutocomplete'
import RelationshipManager from './RelationshipManager'

interface EntryModalProps {
    endpoint: string
    modalTitle: string
    columnDefs: ExtendedColDef[]
    editMode?: boolean
    editData?: Record<string, unknown> | null
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    onEditSuccess?: () => void
}

export default function EntryModal({
    endpoint,
    modalTitle,
    columnDefs,
    editMode = false,
    editData,
    isOpen,
    onClose,
    onSuccess,
    onEditSuccess
}: EntryModalProps) {
    const [formData, setFormData] = useState<Record<string, unknown>>({})
    const { createEntry, loading: createLoading, error: createError, resetError: resetCreateError } = useCreateEntry(endpoint)
    const { updateEntry, loading: updateLoading, error: updateError, resetError: resetUpdateError } = useUpdateEntry(endpoint)

    const loading = createLoading || updateLoading
    const error = createError || updateError
    const resetError = () => {
        resetCreateError()
        resetUpdateError()
    }

    // Extract form fields from column definitions
    const fields = getFormFields(columnDefs)

    // Initialize form data when edit mode is enabled
    useEffect(() => {
        if (editMode && editData) {
            setFormData(editData)
        } else {
            setFormData({})
        }
    }, [editMode, editData, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editMode && editData) {
                await updateEntry(editData.id as string, formData)
                onEditSuccess?.()
            } else {
                await createEntry(formData)
                onSuccess?.()
            }
            onClose()
            setFormData({})
            resetError()
        } catch {
            // Error is handled by the hook
        }
    }

    const handleInputChange = (name: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const renderField = (field: FormField) => {
        const { name, type, required, options, placeholder, relationshipType } = field

        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        name={name}
                        value={String(formData[name] ?? '')}
                        onChange={(e) => handleInputChange(name, e.target.value)}
                        required={required}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                    />
                )
            case 'select':
                return (
                    <select
                        name={name}
                        value={String(formData[name] ?? '')}
                        onChange={(e) => handleInputChange(name, e.target.value)}
                        required={required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Bitte wählen...</option>
                        {options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )
            case 'number':
                return (
                    <input
                        type="number"
                        name={name}
                        value={formData[name] !== undefined && formData[name] !== null ? Number(formData[name]) : ''}
                        onChange={(e) => handleInputChange(name, e.target.value === '' ? '' : Number(e.target.value))}
                        required={required}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                )
            case 'date':
                return (
                    <input
                        type="date"
                        name={name}
                        value={String(formData[name] ?? '')}
                        onChange={(e) => handleInputChange(name, e.target.value)}
                        required={required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                )
            case 'address':
                return (
                    <AddressAutocomplete
                        name={name}
                        value={String(formData[name] ?? '')}
                        onChange={handleInputChange}
                        required={required}
                        placeholder={placeholder || 'Adresse suchen...'}
                    />
                )
            case 'immobilie':
                return (
                    <ImmobilienAutocomplete
                        name={name}
                        onChange={handleInputChange}
                        required={required}
                        placeholder={placeholder || 'Immobilie suchen...'}
                    />
                )
            case 'kontakt':
                return (
                    <KontaktAutocomplete
                        name={name}
                        onChange={handleInputChange}
                        required={required}
                        placeholder={placeholder || 'Kontakt suchen...'}
                    />
                )
            case 'relationships':
                return (
                    <RelationshipManager
                        name={name}
                        onChange={handleInputChange}
                        relationshipType={relationshipType || 'immobilien'}
                        currentRelationships={(formData[name] as Array<{ id?: string; immobilien_id?: string | number; kontakt_id?: string | number; art: string; startdatum?: string; enddatum?: string; immobilien_titel?: string; kontakt_name?: string }>) || []}
                    />
                )
            default:
                return (
                    <input
                        type="text"
                        name={name}
                        value={String(formData[name] ?? '')}
                        onChange={(e) => handleInputChange(name, e.target.value)}
                        required={required}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                )
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={() => {
                    onClose()
                    setFormData({})
                    resetError()
                }}
            />
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {modalTitle}
                            </h3>
                            <button
                                onClick={() => {
                                    onClose()
                                    setFormData({})
                                    resetError()
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {fields.map((field) => (
                                <div key={field.name}>
                                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    {renderField(field)}
                                </div>
                            ))}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose()
                                        setFormData({})
                                        resetError()
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? (editMode ? 'Wird aktualisiert...' : 'Wird erstellt...')
                                        : (editMode ? 'Aktualisieren' : 'Erstellen')
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
} 