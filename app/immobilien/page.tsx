'use client'

import { useApiData } from '../hooks/useApiData'
import DataTable from '../components/DataTable'

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

            <DataTable
                data={data}
                loading={loading}
                error={error}
                title="Immobilien"
                onRowClick={(rowData) => {
                    console.log('Selected property:', rowData)
                    // Handle row click - could open edit modal, navigate to detail page, etc.
                }}
            />
        </div>
    );
} 