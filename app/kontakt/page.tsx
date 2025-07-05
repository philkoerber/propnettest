'use client'

import DataTable from '../components/DataTable'
import { useDataFetching } from '../hooks/useDataFetching'

export default function KontaktPage() {
    const { data, loading, error, refetch } = useDataFetching({
        endpoint: '/api/kontakte'
    })

    const handleRowClick = (rowData: any) => {
        console.log('Clicked row:', rowData)
        // Here you can add navigation to detail page or open modal
    }

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
                title="Kontakte Übersicht"
                description="Alle verfügbaren Kontakte in der Datenbank"
                onRowClick={handleRowClick}
                height="700px"
            />
        </div>
    )
} 