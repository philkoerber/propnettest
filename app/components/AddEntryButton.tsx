'use client'

import { useState } from 'react'
import { useCreateEntry } from '../hooks/useCreateEntry'
import { ExtendedColDef, getFormFields } from '../../lib/columnDefinitions'

interface AddEntryButtonProps {
    endpoint: string
    title: string
    onSuccess?: () => void
    className?: string
    buttonText?: string
    modalTitle?: string
    columnDefs: ExtendedColDef[]
}

export default function AddEntryButton({
    endpoint,
    title,
    onSuccess,
    className = '',
    buttonText = 'Neuen Eintrag hinzufügen',
    modalTitle,
    columnDefs
}: AddEntryButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState<Record<string, any>>({})
    const { createEntry, loading, error, resetError } = useCreateEntry(endpoint)

    // Extract form fields from column definitions
    const fields = getFormFields(columnDefs)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await createEntry(formData)
            setIsModalOpen(false)
            setFormData({})
            resetError()
            onSuccess?.()
        } catch (err) {
            // Error is handled by the hook
        }
    }

    const handleInputChange = (name: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const renderField = (field: any) => {
        const { name, label, type, required, options, placeholder } = field

        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        name={name}
                        value={formData[name] || ''}
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
                        value={formData[name] || ''}
                        onChange={(e) => handleInputChange(name, e.target.value)}
                        required={required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Bitte wählen...</option>
                        {options?.map((option: any) => (
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
                        value={formData[name] || ''}
                        onChange={(e) => handleInputChange(name, e.target.value)}
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
                        value={formData[name] || ''}
                        onChange={(e) => handleInputChange(name, e.target.value)}
                        required={required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                )
            case 'address':
                // Placeholder for Google Places Autocomplete integration
                return (
                    <input
                        type="text"
                        name={name}
                        value={formData[name] || ''}
                        onChange={(e) => handleInputChange(name, e.target.value)}
                        required={required}
                        placeholder={placeholder || 'Adresse suchen...'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    // TODO: Replace with Google Places Autocomplete
                    />
                )
            default:
                return (
                    <input
                        type="text"
                        name={name}
                        value={formData[name] || ''}
                        onChange={(e) => handleInputChange(name, e.target.value)}
                        required={required}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                )
        }
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {buttonText}
            </button>

            {isModalOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                            setIsModalOpen(false)
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
                                        {modalTitle || `Neuen ${title} hinzufügen`}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setIsModalOpen(false)
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
                                                setIsModalOpen(false)
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
                                            {loading ? 'Wird erstellt...' : 'Erstellen'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
} 