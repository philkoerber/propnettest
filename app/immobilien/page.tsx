'use client'

import { useApiData } from '../hooks/useApiData'
import DataTable from '../components/DataTable'
import AddEntryButton from '../components/AddEntryButton'
import { immobilienColumns } from '../../lib/columnDefinitions'

export default function ImmobilienPage() {
    const { data, loading, error, refetch } = useApiData('immobilien')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-serif text-gray-900">Immobilien</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Verwalten Sie Ihre Immobilien und deren Details.
                </p>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Immobilien</h2>
                <AddEntryButton
                    endpoint="immobilien"
                    title="Immobilie"
                    onSuccess={refetch}
                    columnDefs={immobilienColumns}
                    buttonText="Neue Immobilie hinzufügen"
                />
            </div>

            <DataTable
                data={data}
                loading={loading}
                error={error}
                columnDefs={immobilienColumns}
                onRowClick={(rowData) => {
                    console.log('Selected property:', rowData)
                    // Handle row click - could open edit modal, navigate to detail page, etc.
                }}
            />
        </div>
    );
} 