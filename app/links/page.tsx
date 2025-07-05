'use client'

import { useApiData } from '../hooks/useApiData'
import DataTable from '../components/DataTable'
import AddEntryButton from '../components/AddEntryButton'
import { beziehungenColumns } from '../../lib/columnDefinitions'

export default function LinksPage() {
    const { data, loading, error, refetch } = useApiData('beziehungen')

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
                <AddEntryButton
                    endpoint="beziehungen"
                    title="Beziehung"
                    onSuccess={refetch}
                    columnDefs={beziehungenColumns}
                    buttonText="Neue Beziehung hinzufügen"
                />
            </div>

            <DataTable
                data={data}
                loading={loading}
                error={error}
                columnDefs={beziehungenColumns}
                onRowClick={(rowData) => {
                    console.log('Selected relationship:', rowData)
                    // Handle row click - could open edit modal, navigate to detail page, etc.
                }}
            />
        </div>
    );
} 