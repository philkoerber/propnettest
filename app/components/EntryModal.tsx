'use client'

import { useState, useEffect } from 'react'
import { useCrud } from '../hooks/useCrud'
import { useEntity } from '../hooks/useData'
import { ExtendedColDef, getFormFields, FormField } from '../../lib/columnDefinitions'
import { shouldShowField, Relationship } from '../../lib/relationshipValidation'
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

// Helper function to filter virtual fields
const filterVirtualFields = (entityData: Record<string, unknown>) => {
    const virtualFields = ['mieter', 'eigentümer', 'dienstleister', 'associated_immobilien']
    const filteredEntityData: Record<string, unknown> = {}

    Object.keys(entityData).forEach(key => {
        if (!virtualFields.includes(key) && entityData[key] !== undefined && entityData[key] !== null && entityData[key] !== '') {
            filteredEntityData[key] = entityData[key]
        }
    })

    return filteredEntityData
}

function renderField(field: FormField, formData: Record<string, unknown>, handleInputChange: (name: string, value: unknown) => void) {
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
                    placeholder={placeholder}
                />
            )
        case 'immobilie':
            return (
                <ImmobilienAutocomplete
                    name={name}
                    onChange={handleInputChange}
                    required={required}
                    placeholder={placeholder}
                />
            )
        case 'kontakt':
            return (
                <KontaktAutocomplete
                    name={name}
                    onChange={handleInputChange}
                    required={required}
                    placeholder={placeholder}
                />
            )
        case 'relationships':
            return (
                <RelationshipManager
                    name={name}
                    onChange={handleInputChange}
                    relationshipType={relationshipType as 'immobilien' | 'kontakte'}
                    currentRelationships={(formData[name] as Relationship[]) || []}
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

function handleSubmitFactory({
    formData,
    setFormData,
    endpoint,
    editMode,
    editData,
    update,
    create,
    onEditSuccess,
    onSuccess,
    onClose,
    resetError
}: {
    formData: Record<string, unknown>
    setFormData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
    endpoint: string
    editMode: boolean
    editData: Record<string, unknown> | null | undefined
    update: (id: string, data: Record<string, unknown>) => Promise<unknown>
    create: (data: Record<string, unknown>) => Promise<unknown>
    onEditSuccess?: () => void
    onSuccess?: () => void
    onClose: () => void
    resetError: () => void
}) {
    return async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            const { relationships, ...entityData } = formData
            const filteredEntityData = filterVirtualFields(entityData)
            const requestData: Record<string, unknown> = { ...filteredEntityData }
            if (relationships && Array.isArray(relationships)) {
                const cleanedRelationships = relationships.map((rel: Record<string, unknown>) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, immobilien_titel, kontakt_name, ...cleanRel } = rel
                    return cleanRel
                }).filter((rel: Record<string, unknown>) => {
                    if (endpoint === 'immobilien') {
                        return rel.kontakt_id && rel.art
                    } else if (endpoint === 'kontakte') {
                        return rel.immobilien_id && rel.art
                    }
                    return true
                })
                requestData.relationships = cleanedRelationships
            }
            if (editMode && editData) {
                await update(editData.id as string, requestData)
                onEditSuccess?.()
            } else {
                await create(requestData)
                onSuccess?.()
            }
            onClose()
            setFormData({})
            resetError()
        } catch {
            // Error is handled by the hook
        }
    }
}

function handleInputChangeFactory(setFormData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>) {
    return (name: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }
}

function resetErrorFactory(resetCrudError: () => void) {
    return () => {
        resetCrudError()
    }
}

function renderError(error: unknown): string {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    try {
        return JSON.stringify(error);
    } catch {
        return 'Unbekannter Fehler';
    }
}

function ModalContent({
    modalTitle,
    error,
    fields,
    formData,
    handleInputChange,
    handleSubmit,
    loading,
    editMode,
    onClose,
    setFormData,
    resetError
}: {
    modalTitle: string
    error: unknown
    fields: FormField[]
    formData: Record<string, unknown>
    handleInputChange: (name: string, value: unknown) => void
    handleSubmit: (e: React.FormEvent) => void
    loading: boolean
    editMode: boolean
    onClose: () => void
    setFormData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
    resetError: () => void
}) {
    const errorString = renderError(error);
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
                <div className="relative mx-auto p-5 border w-[600px] max-w-[90vw] shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
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

                        {errorString && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {errorString}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {fields.map((field) => {
                                if (!shouldShowField(field, formData)) {
                                    return null
                                }
                                return (
                                    <div key={field.name}>
                                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {renderField(field, formData, handleInputChange)}
                                    </div>
                                )
                            })}

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
    const { create, update, loading: crudLoading, error: crudError, resetError: resetCrudError } = useCrud(endpoint)
    const entityId = editMode && editData ? (editData.id as string) : null
    const { entity: fetchedEntity, loading: entityLoading, error: entityError } = useEntity(endpoint, entityId)
    const loading = crudLoading || entityLoading
    const error = crudError || entityError
    const resetError = resetErrorFactory(resetCrudError)
    const fields = getFormFields(columnDefs)
    useEffect(() => {
        if (editMode && fetchedEntity) {
            setFormData(fetchedEntity as Record<string, unknown>)
        } else if (!editMode) {
            setFormData({})
        }
    }, [editMode, fetchedEntity])
    const handleInputChange = handleInputChangeFactory(setFormData)
    const handleSubmit = handleSubmitFactory({
        formData,
        setFormData,
        endpoint,
        editMode,
        editData,
        update: update as (id: string, data: Record<string, unknown>) => Promise<unknown>,
        create: create as (data: Record<string, unknown>) => Promise<unknown>,
        onEditSuccess,
        onSuccess,
        onClose,
        resetError
    })
    if (!isOpen) return null
    return (
        <ModalContent
            modalTitle={modalTitle}
            error={error}
            fields={fields}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            loading={loading}
            editMode={editMode}
            onClose={onClose}
            setFormData={setFormData}
            resetError={resetError}
        />
    )
} 