'use client'

import { useApiData } from '../hooks/useApiData'
import DataTable from '../components/DataTable'

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

            <DataTable
                data={data}
                loading={loading}
                error={error}
                title="Beziehungen"
                onRowClick={(rowData) => {
                    console.log('Selected relationship:', rowData)
                    // Handle row click - could open edit modal, navigate to detail page, etc.
                }}
            />
        </div>
    );
} 