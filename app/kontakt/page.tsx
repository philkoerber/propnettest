'use client'

import { useState } from 'react'
import { useApiData } from '../hooks/useApiData'
import { useDeleteEntry } from '../hooks/useDeleteEntry'
import DataTable from '../components/DataTable'
import AddEntryButton from '../components/EntryButton'
import EntryModal from '../components/EntryModal'
import { kontakteColumns } from '../../lib/columnDefinitions'

export default function KontaktPage() {
    const { data, loading, error, refetch } = useApiData('kontakte')
    const { deleteEntry } = useDeleteEntry('kontakte')
    const [editData, setEditData] = useState<any>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const handleDelete = async (id: number) => {
        try {
            await deleteEntry(id)
            refetch() // Refresh the data after deletion
        } catch (error) {
            console.error('Error deleting kontakte:', error)
        }
    }

    const handleEdit = (rowData: any) => {
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
                <h1 className="text-4xl font-serif text-gray-900">Kontakt</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Verwalten Sie Ihre Kontakte und deren Informationen.
                </p>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Kontakte</h2>
                <AddEntryButton
                    endpoint="kontakte"
                    onSuccess={handleAddSuccess}
                    columnDefs={kontakteColumns}
                    buttonText="Neuen Kontakt hinzufügen"
                    modalTitle="Neuen Kontakt hinzufügen"
                />
            </div>

            <DataTable
                data={data}
                loading={loading}
                error={error}
                columnDefs={kontakteColumns}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onRowClick={(rowData) => {
                    console.log('Selected contact:', rowData)
                    // Handle row click - could open edit modal, navigate to detail page, etc.
                }}
            />

            {/* Edit Modal */}
            <EntryModal
                endpoint="kontakte"
                modalTitle="Kontakt bearbeiten"
                columnDefs={kontakteColumns}
                editMode={true}
                editData={editData}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onEditSuccess={handleEditSuccess}
            />
        </div>
    );
}