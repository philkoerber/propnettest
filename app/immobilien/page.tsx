'use client'

import { useState } from 'react'
import { useApiData } from '../hooks/useApiData'
import { useDeleteEntry } from '../hooks/useDeleteEntry'
import DataTable from '../components/DataTable'
import EntryButton from '../components/EntryButton'
import EntryModal from '../components/EntryModal'
import { immobilienColumns } from '../../lib/columnDefinitions'

export default function ImmobilienPage() {
    const { data, loading, error, refetch } = useApiData('immobilien')
    const { deleteEntry } = useDeleteEntry('immobilien')
    const [editData, setEditData] = useState<any>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const handleDelete = async (id: string) => {
        try {
            await deleteEntry(id)
            refetch() // Refresh the data after deletion
        } catch (error) {
            console.error('Error deleting immobilien:', error)
        }
    }

    const handleEdit = (rowData: any) => {
        console.log(rowData)
        setEditData(rowData)
        setIsEditModalOpen(true)
    }

    const handleEditSuccess = () => {
        setIsEditModalOpen(false)
        setEditData(null)
        refetch() // Refresh the data after edit
    }

    const handleAddSuccess = () => {
        refetch() // Refresh the data after adding
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-serif text-gray-900">Immobilien</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Verwalten Sie Ihre Immobilien und deren Details.
                </p>
            </div>

            <div className="flex justify-between items-center">
                <EntryButton
                    endpoint="immobilien"
                    onSuccess={handleAddSuccess}
                    columnDefs={immobilienColumns}
                    buttonText="Neue Immobilie hinzufügen"
                    modalTitle="Neue Immobilie hinzufügen"
                />
            </div>

            <DataTable
                data={data}
                loading={loading}
                error={error}
                columnDefs={immobilienColumns}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onRowClick={(rowData) => {
                    console.log('Selected property:', rowData)
                    // Handle row click - could open edit modal, navigate to detail page, etc.
                }}
            />

            {/* Edit Modal */}
            <EntryModal
                endpoint="immobilien"
                modalTitle="Immobilie bearbeiten"
                columnDefs={immobilienColumns}
                editMode={true}
                editData={editData}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onEditSuccess={handleEditSuccess}
            />
        </div>
    );
} 