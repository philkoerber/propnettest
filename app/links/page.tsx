'use client'

import { useState } from 'react'
import { useApiData } from '../hooks/useApiData'
import { useDeleteEntry } from '../hooks/useDeleteEntry'
import NetworkChart from '../components/NetworkChart'
import NetworkLegend from '../components/NetworkLegend'
import EntryButton from '../components/EntryButton'
import EntryModal from '../components/EntryModal'
import { beziehungenColumns } from '../../lib/columnDefinitions'

export default function LinksPage() {
    const { data, loading, error, refetch } = useApiData('beziehungen')
    const [editData, setEditData] = useState<Record<string, unknown> | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)


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
                <h2 className="text-xl font-semibold text-gray-900">Network Chart</h2>
                <EntryButton
                    endpoint="beziehungen"
                    onSuccess={handleAddSuccess}
                    columnDefs={beziehungenColumns}
                    buttonText="Neue Beziehung hinzufügen"
                    modalTitle="Neue Beziehung hinzufügen"
                />
            </div>

            <NetworkLegend />

            <NetworkChart
                data={data as any[]}
                loading={loading}
                error={error}
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