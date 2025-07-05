'use client'

import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridOptions, ICellRendererParams, GridApi } from 'ag-grid-community'
import { useMemo, useState, useEffect } from 'react'
import SearchBar from './SearchBar'

// Import AG Grid styles for legacy theme
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

// Import module registration
import "../../lib/ag-grid-modules"

// Actions Renderer Component
const ActionsRenderer = (props: ICellRendererParams) => {
    const isDeleting = props.context?.deletingRows?.has(props.data.id) || false
    const isEditing = props.context?.editingRows?.has(props.data.id) || false

    const handleDelete = async () => {
        if (window.confirm('Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?')) {
            try {
                if (props.context?.onDelete) {
                    await props.context.onDelete(props.data.id)
                }
            } catch (error) {
                console.error('Error deleting entry:', error)
                alert('Fehler beim Löschen des Eintrags')
            }
        }
    }

    const handleEdit = () => {
        if (props.context?.onEdit) {
            props.context.onEdit(props.data)
        }
    }

    if (isDeleting || isEditing) {
        return (
            <div className="flex items-center justify-center p-1">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="flex space-x-1">
            <button
                onClick={handleEdit}
                disabled={isEditing}
                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Bearbeiten"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Löschen"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    )
}

interface DataTableProps {
    data: Record<string, unknown>[]
    loading?: boolean
    error?: string | null
    onRowClick?: (rowData: Record<string, unknown>) => void
    onDelete?: (id: string) => Promise<void>
    onEdit?: (rowData: Record<string, unknown>) => void
    className?: string
    columnDefs?: ColDef[]
}

export default function DataTable({
    data,
    loading = false,
    error = null,
    onRowClick,
    onDelete,
    onEdit,
    className = '',
    columnDefs: providedColumnDefs,
}: DataTableProps) {
    const [gridApi, setGridApi] = useState<GridApi | null>(null)
    const [deletingRows, setDeletingRows] = useState<Set<string>>(new Set())
    const [editingRows, setEditingRows] = useState<Set<string>>(new Set())
    const [searchTerm, setSearchTerm] = useState('')

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) {
            return data
        }

        const searchLower = searchTerm.toLowerCase()
        return data.filter(row => {
            return Object.values(row).some(value => {
                if (value === null || value === undefined) return false
                return String(value).toLowerCase().includes(searchLower)
            })
        })
    }, [data, searchTerm])

    // Use provided column definitions or generate them dynamically
    const columnDefs = useMemo((): ColDef[] => {
        let columns: ColDef[] = []

        // If column definitions are provided, use them
        if (providedColumnDefs) {
            columns = [...providedColumnDefs]
        } else {
            // Fallback to dynamic generation if no data
            if (!data || data.length === 0) return []

            // Get the first row to determine column structure
            const firstRow = data[0]

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
                    minWidth: 150,
                    flex: 1,
                    cellStyle: {
                        padding: '8px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'flex-start',
                        height: '100%',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
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
                    column.width = 200 // Default wider width for text columns
                }

                columns.push(column)
            })
        }

        // Add actions column if onDelete or onEdit is provided
        if (onDelete || onEdit) {
            columns.push({
                field: 'actions',
                headerName: 'Aktionen',
                width: 120,
                sortable: false,
                filter: false,
                resizable: false,
                pinned: 'right', // Pin to the right
                cellRenderer: ActionsRenderer,
                cellClass: 'ag-cell-actions',
                cellStyle: {
                    padding: '8px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                }
            })
        }

        return columns
    }, [data, providedColumnDefs, onDelete, onEdit])

    // Wrapper for delete function that tracks deleting rows
    const handleDelete = useMemo(() => {
        if (!onDelete) return undefined

        return async (id: string) => {
            setDeletingRows(prev => new Set(prev).add(id))
            try {
                await onDelete(id)
            } finally {
                setDeletingRows(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(id)
                    return newSet
                })
            }
        }
    }, [onDelete])

    // Wrapper for edit function that tracks editing rows
    const handleEdit = useMemo(() => {
        if (!onEdit) return undefined

        return (rowData: Record<string, unknown>) => {
            setEditingRows(prev => new Set(prev).add(rowData.id as string))
            try {
                onEdit(rowData)
            } finally {
                setEditingRows(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(rowData.id as string)
                    return newSet
                })
            }
        }
    }, [onEdit])

    // Grid options
    const gridOptions: GridOptions = useMemo(() => ({
        columnDefs,
        rowData: filteredData,
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: [10, 20, 50, 100],
        domLayout: 'autoHeight',
        suppressRowClickSelection: false,
        rowSelection: 'single',
        animateRows: true,
        defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true,
            minWidth: 150,
            flex: 1,
            cellStyle: {
                display: 'flex',
                alignItems: 'flex-start',
                height: '100%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
            }
        },
        context: {
            onDelete: handleDelete,
            onEdit: handleEdit,
            deletingRows,
            editingRows
        },
        onGridReady: (params) => {
            setGridApi(params.api)
        },
        onRowClicked: (event) => {
            // Prevent row click if row is being deleted
            if (deletingRows.has(event.data.id)) {
                return
            }
            if (onRowClick) {
                onRowClick(event.data)
            }
        }
    }), [columnDefs, filteredData, onRowClick, handleDelete, handleEdit, deletingRows, editingRows])

    // Auto-resize columns when data changes
    useEffect(() => {
        if (gridApi && filteredData.length > 0) {
            setTimeout(() => {
                gridApi.sizeColumnsToFit()
            }, 100)
        }
    }, [gridApi, filteredData])

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
                <div className="mb-4">
                    <SearchBar
                        placeholder="Suchen..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                </div>

                <div
                    className="ag-theme-alpine w-full"
                    style={{
                        height: '600px',
                        '--ag-header-height': '50px',
                        '--ag-row-height': '120px',
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
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10, 20, 50, 100]}
                        domLayout="autoHeight"
                        rowSelection="single"
                        animateRows={true}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true,
                            minWidth: 150,
                            flex: 1,
                            cellStyle: {
                                display: 'flex',
                                alignItems: 'flex-start',
                                height: '100%',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }
                        }}
                        context={{
                            onDelete: handleDelete,
                            onEdit: handleEdit,
                            deletingRows,
                            editingRows
                        }}
                        onGridReady={(params) => {
                            setGridApi(params.api)
                        }}
                        onRowClicked={(event) => {
                            // Prevent row click if row is being deleted
                            if (deletingRows.has(event.data.id)) {
                                return
                            }
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
            <div className="mb-4">
                <SearchBar
                    placeholder="Suchen..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                />
            </div>

            <div
                className="ag-theme-alpine w-full"
                style={{
                    height: '600px',
                    '--ag-header-height': '50px',
                    '--ag-row-height': '100px',
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