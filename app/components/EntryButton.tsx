'use client'

import { useState } from 'react'
import EntryModal from './EntryModal'
import { ExtendedColDef } from '../../lib/columnDefinitions'

interface EntryButtonProps {
    endpoint: string
    onSuccess?: () => void
    className?: string
    buttonText?: string
    modalTitle: string
    columnDefs: ExtendedColDef[]
}

export default function EntryButton({
    endpoint,
    onSuccess,
    className = '',
    buttonText = 'Neuen Eintrag hinzufügen',
    modalTitle,
    columnDefs
}: EntryButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    const handleSuccess = () => {
        onSuccess?.()
    }

    return (
        <>
            <button
                onClick={handleOpenModal}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {buttonText}
            </button>

            <EntryModal
                endpoint={endpoint}
                modalTitle={modalTitle}
                columnDefs={columnDefs}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
            />
        </>
    )
} 