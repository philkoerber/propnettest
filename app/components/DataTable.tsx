'use client'

import { useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridOptions, GridApi, ColumnApi } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

interface DataTableProps {
    data: any[]
    title?: string
    description?: string
    loading?: boolean
    error?: string | null
    onRowClick?: (rowData: any) => void
    customColumnDefs?: ColDef[]
    enableSorting?: boolean
    enableFiltering?: boolean
    enablePagination?: boolean
    pageSize?: number
    height?: string
}

export default function DataTable({
    data,
    title,
    description,
    loading = false,
    error = null,
    onRowClick,
    customColumnDefs,
    enableSorting = true,
    enableFiltering = true,
    enablePagination = true,
    pageSize = 10,
    height = '600px'
}: DataTableProps) {
    const [gridApi, setGridApi] = useState<GridApi | null>(null)
    const [columnApi, setColumnApi] = useState<ColumnApi | null>(null)

    // Dynamically generate column definitions based on data structure
    const columnDefs = useMemo(() => {
        if (customColumnDefs) {
            return customColumnDefs
        }

        if (!data || data.length === 0) {
            return []
        }

        // Get the first row to determine column structure
        const firstRow = data[0]
        const columns: ColDef[] = []

        Object.keys(firstRow).forEach(key => {
            // Skip internal fields like created_at, updated_at, id if they're not the primary identifier
            if (key === 'id' || key === 'created_at' || key === 'updated_at') {
                return
            }

            const value = firstRow[key]
            let columnDef: ColDef = {
                field: key,
                headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                sortable: enableSorting,
                filter: enableFiltering,
                resizable: true,
                minWidth: 120,
                flex: 1
            }

            // Customize column based on data type
            if (typeof value === 'boolean') {
                columnDef.cellRenderer = (params: any) => {
                    return params.value ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ja
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Nein
                        </span>
                    )
                }
            } else if (typeof value === 'number') {
                columnDef.type = 'numericColumn'
                columnDef.width = 120
            } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
                columnDef.type = 'dateColumn'
                columnDef.cellRenderer = (params: any) => {
                    if (!params.value) return ''
                    const date = new Date(params.value)
                    return date.toLocaleDateString('de-DE')
                }
            } else if (typeof value === 'string' && value.length > 50) {
                columnDef.cellRenderer = (params: any) => {
                    const text = params.value || ''
                    return text.length > 50 ? `${text.substring(0, 50)}...` : text
                }
                columnDef.tooltipField = key
            }

            columns.push(columnDef)
        })

        return columns
    }, [data, customColumnDefs, enableSorting, enableFiltering])

    const gridOptions: GridOptions = {
        columnDefs,
        rowData: data,
        pagination: enablePagination,
        paginationPageSize: pageSize,
        paginationPageSizeSelector: [10, 25, 50, 100],
        domLayout: 'autoHeight',
        rowSelection: 'single',
        suppressRowClickSelection: true,
        onRowClicked: onRowClick ? (event) => onRowClick(event.data) : undefined,
        defaultColDef: {
            sortable: enableSorting,
            filter: enableFiltering,
            resizable: true,
            floatingFilter: enableFiltering,
        },
        onGridReady: (params) => {
            setGridApi(params.api)
            setColumnApi(params.columnApi)
        },
        // German localization
        localeText: {
            page: 'Seite',
            of: 'von',
            to: 'bis',
            of: 'von',
            next: 'Weiter',
            last: 'Letzte',
            first: 'Erste',
            previous: 'Zurück',
            loadingOoo: 'Laden...',
            noRowsToShow: 'Keine Daten verfügbar',
            filterOoo: 'Filter...',
            equals: 'Gleich',
            notEqual: 'Nicht gleich',
            blank: 'Leer',
            notBlank: 'Nicht leer',
            empty: 'Leer',
            contains: 'Enthält',
            notContains: 'Enthält nicht',
            startsWith: 'Beginnt mit',
            endsWith: 'Endet mit',
            inRange: 'Im Bereich',
            lessThan: 'Weniger als',
            greaterThan: 'Größer als',
            lessThanOrEqual: 'Weniger als oder gleich',
            greaterThanOrEqual: 'Größer als oder gleich',
            inRangeStart: 'Von',
            inRangeEnd: 'Bis',
        }
    }

    if (loading) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Lade Daten...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Fehler beim Laden</h3>
                    <p className="mt-1 text-sm text-gray-500">{error}</p>
                </div>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Daten verfügbar</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Es sind noch keine Daten vorhanden.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {(title || description) && (
                <div>
                    {title && (
                        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
                    )}
                    {description && (
                        <p className="mt-1 text-sm text-gray-600">{description}</p>
                    )}
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div
                    className="ag-theme-alpine w-full"
                    style={{ height }}
                >
                    <AgGridReact
                        {...gridOptions}
                        className="w-full h-full"
                    />
                </div>
            </div>
        </div>
    )
} 