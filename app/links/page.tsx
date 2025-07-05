'use client'

import { useState } from 'react'
import { useApiData } from '../hooks/useApiData'
import { useDeleteEntry } from '../hooks/useDeleteEntry'
import DataTable from '../components/DataTable'
import EntryButton from '../components/EntryButton'
import EntryModal from '../components/EntryModal'
import { beziehungenColumns } from '../../lib/columnDefinitions'

export default function LinksPage() {
    const { data, loading, error, refetch } = useApiData('beziehungen')
    const { deleteEntry } = useDeleteEntry('beziehungen')
    const [editData, setEditData] = useState<any>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const handleDelete = async (id: string) => {
        try {
            await deleteEntry(id)
            refetch() // Refresh the data after deletion
        } catch (error) {
            console.error('Error deleting beziehungen:', error)
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
                <h1 className="text-4xl font-serif text-gray-900">Links</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Verwalten Sie die Beziehungen zwischen Immobilien und Kontakten.
                </p>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Beziehungen</h2>
                <EntryButton
                    endpoint="beziehungen"
                    onSuccess={handleAddSuccess}
                    columnDefs={beziehungenColumns}
                    buttonText="Neue Beziehung hinzufügen"
                    modalTitle="Neue Beziehung hinzufügen"
                />
            </div>

            <DataTable
                data={data}
                loading={loading}
                error={error}
                columnDefs={beziehungenColumns}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onRowClick={(rowData) => {
                    console.log('Selected relationship:', rowData)
                    // Handle row click - could open edit modal, navigate to detail page, etc.
                }}
            />

            {/* Edit Modal */}
            <EntryModal
                endpoint="beziehungen"
                modalTitle="Beziehung bearbeiten"
                columnDefs={beziehungenColumns}
                editMode={true}
                editData={editData}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onEditSuccess={handleEditSuccess}
            />
        </div>
    );
} 