'use client'

import { useApiData } from '../hooks/useApiData'
import DataTable from '../components/DataTable'

export default function KontaktPage() {
    const { data, loading, error, refetch } = useApiData('kontakte')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-serif text-gray-900">Kontakt</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Verwalten Sie Ihre Kontakte und deren Informationen.
                </p>
            </div>

            <DataTable
                data={data}
                loading={loading}
                error={error}
                title="Kontakte"
                onRowClick={(rowData) => {
                    console.log('Selected contact:', rowData)
                    // Handle row click - could open edit modal, navigate to detail page, etc.
                }}
            />
        </div>
    );
}