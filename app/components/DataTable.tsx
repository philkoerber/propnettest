'use client'

import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community'
import { useMemo, useState, useEffect } from 'react'

// Import AG Grid styles for legacy theme
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

// Import module registration
import "../../lib/ag-grid-modules"

interface DataTableProps {
    data: any[]
    loading?: boolean
    error?: string | null
    title?: string
    onRowClick?: (rowData: any) => void
    className?: string
    columnDefs?: ColDef[]
}

export default function DataTable({
    data,
    loading = false,
    error = null,
    title,
    onRowClick,
    className = '',
    columnDefs: providedColumnDefs
}: DataTableProps) {
    const [gridApi, setGridApi] = useState<any>(null)

    // Use provided column definitions or generate them dynamically
    const columnDefs = useMemo((): ColDef[] => {
        // If column definitions are provided, use them
        if (providedColumnDefs) {
            return providedColumnDefs
        }

        // Fallback to dynamic generation if no data
        if (!data || data.length === 0) return []

        // Get the first row to determine column structure
        const firstRow = data[0]
        const columns: ColDef[] = []

        Object.keys(firstRow).forEach((key) => {
            // Skip internal fields or customize as needed
            if (key === 'id' || key === 'created_at' || key === 'updated_at') {
                return
            }

            const column: ColDef = {
                field: key,
                headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                sortable: true,
                filter: true,
                resizable: true,
                minWidth: 120,
                flex: 1,
                cellStyle: {
                    padding: '8px',
                    borderBottom: '1px solid #e5e7eb'
                },
                headerClass: 'ag-header-cell-custom',
                cellClass: 'ag-cell-custom'
            }

            // Customize column types based on data
            const value = firstRow[key]
            if (typeof value === 'number') {
                column.type = 'numericColumn'
                column.filter = 'numberFilter'
                column.width = 100
            } else if (typeof value === 'boolean') {
                column.cellRenderer = (params: ICellRendererParams) => {
                    return params.value ? '✓' : '✗'
                }
                column.filter = 'textFilter'
                column.width = 80
            } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
                column.type = 'dateColumn'
                column.filter = 'dateFilter'
                column.cellRenderer = (params: ICellRendererParams) => {
                    if (params.value) {
                        return new Date(params.value).toLocaleDateString('de-DE')
                    }
                    return ''
                }
            } else {
                // Default to text filter for string values
                column.filter = 'textFilter'
            }

            columns.push(column)
        })

        return columns
    }, [data, providedColumnDefs])

    // Grid options
    const gridOptions: GridOptions = useMemo(() => ({
        columnDefs,
        rowData: data,
        pagination: true,
        paginationPageSize: 15,
        paginationPageSizeSelector: [10, 20, 50, 100],
        domLayout: 'autoHeight',
        suppressRowClickSelection: false,
        rowSelection: 'single',
        animateRows: true,
        defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true,
            minWidth: 100,
            flex: 1
        },
        onGridReady: (params) => {
            setGridApi(params.api)
        },
        onRowClicked: (event) => {
            if (onRowClick) {
                onRowClick(event.data)
            }
        }
    }), [columnDefs, data, onRowClick])

    // Auto-resize columns when data changes
    useEffect(() => {
        if (gridApi && data.length > 0) {
            setTimeout(() => {
                gridApi.sizeColumnsToFit()
            }, 100)
        }
    }, [gridApi, data])

    if (loading) {
        return (
            <div className={`ag-theme-alpine ${className}`} style={{ height: '400px' }}>
                <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`ag-theme-alpine ${className}`} style={{ height: '400px' }}>
                <div className="flex items-center justify-center h-full">
                    <div className="text-red-500">Error: {error}</div>
                </div>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className={`w-full ${className}`}>
                {title && (
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    </div>
                )}
                <div
                    className="ag-theme-alpine w-full"
                    style={{
                        height: '600px',
                        '--ag-header-height': '50px',
                        '--ag-row-height': '50px',
                        '--ag-header-background-color': '#f8fafc',
                        '--ag-header-foreground-color': '#374151',
                        '--ag-border-color': '#e5e7eb',
                        '--ag-row-hover-color': '#f3f4f6'
                    } as React.CSSProperties}
                >
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={[]}
                        pagination={true}
                        paginationPageSize={15}
                        paginationPageSizeSelector={[10, 20, 50, 100]}
                        domLayout="autoHeight"
                        rowSelection="single"
                        animateRows={true}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true,
                            minWidth: 100,
                            flex: 1
                        }}
                        onGridReady={(params) => {
                            setGridApi(params.api)
                        }}
                        onRowClicked={(event) => {
                            if (onRowClick) {
                                onRowClick(event.data)
                            }
                        }}
                        theme="legacy"
                    />
                </div>
            </div>
        )
    }

    return (
        <div className={`w-full ${className}`}>
            {title && (
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                </div>
            )}
            <div
                className="ag-theme-alpine w-full"
                style={{
                    height: '600px',
                    '--ag-header-height': '50px',
                    '--ag-row-height': '50px',
                    '--ag-header-background-color': '#f8fafc',
                    '--ag-header-foreground-color': '#374151',
                    '--ag-border-color': '#e5e7eb',
                    '--ag-row-hover-color': '#f3f4f6'
                } as React.CSSProperties}
            >
                <AgGridReact
                    {...gridOptions}
                    theme="legacy"
                />
            </div>
        </div>
    )
} 