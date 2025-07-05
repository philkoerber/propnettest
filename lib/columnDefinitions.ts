import { ColDef, ICellRendererParams } from 'ag-grid-community'

// Form field type definition
export interface FormField {
    name: string
    label: string
    type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'address'
    required?: boolean
    options?: { value: string; label: string }[]
    placeholder?: string
}

// Extended column definition with form field metadata
export interface ExtendedColDef extends ColDef {
    formField?: FormField
}

// Common column configuration
const commonColumnConfig = {
    sortable: true,
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

// Immobilien (Properties) column definitions
export const immobilienColumns: ExtendedColDef[] = [
    {
        field: 'titel',
        headerName: 'Titel',
        ...commonColumnConfig,
        filter: 'textFilter',
        formField: {
            name: 'titel',
            label: 'Titel',
            type: 'text',
            required: true,
            placeholder: 'Immobilientitel eingeben'
        }
    },
    {
        field: 'beschreibung',
        headerName: 'Beschreibung',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 200,
        formField: {
            name: 'beschreibung',
            label: 'Beschreibung',
            type: 'textarea',
            placeholder: 'Beschreibung der Immobilie'
        }
    },
    {
        field: 'adresse',
        headerName: 'Adresse',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 180,
        formField: {
            name: 'adresse',
            label: 'Adresse',
            type: 'address',
            placeholder: 'Adresse eingeben...'
        }
    },
    {
        field: 'bild',
        headerName: 'Bild',
        ...commonColumnConfig,
        filter: 'textFilter',
        cellRenderer: (params: ICellRendererParams) => {
            if (params.value) {
                return `<a href="${params.value}" target="_blank" class="text-blue-600 hover:text-blue-800 underline">Bild anzeigen</a>`
            }
            return ''
        },
        formField: {
            name: 'bild',
            label: 'Bild URL',
            type: 'text',
            placeholder: 'https://example.com/bild.jpg'
        }
    },
    {
        field: 'created_at',
        headerName: 'Erstellt am',
        type: 'dateColumn',
        filter: 'dateFilter',
        width: 120,
        ...commonColumnConfig,
        cellRenderer: (params: ICellRendererParams) => {
            if (params.value) {
                return new Date(params.value).toLocaleDateString('de-DE')
            }
            return ''
        }
    }
]

// Kontakte (Contacts) column definitions
export const kontakteColumns: ExtendedColDef[] = [
    {
        field: 'name',
        headerName: 'Name',
        ...commonColumnConfig,
        filter: 'textFilter',
        formField: {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'Vollständiger Name'
        }
    },
    {
        field: 'adresse',
        headerName: 'Adresse',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 180,
        formField: {
            name: 'adresse',
            label: 'Adresse',
            type: 'address',
            placeholder: 'Adresse eingeben...'
        }
    },
    {
        field: 'bild',
        headerName: 'Bild',
        ...commonColumnConfig,
        filter: 'textFilter',
        cellRenderer: (params: ICellRendererParams) => {
            if (params.value) {
                return `<a href="${params.value}" target="_blank" class="text-blue-600 hover:text-blue-800 underline">Bild anzeigen</a>`
            }
            return ''
        },
        formField: {
            name: 'bild',
            label: 'Bild URL',
            type: 'text',
            placeholder: 'https://example.com/bild.jpg'
        }
    },
    {
        field: 'created_at',
        headerName: 'Erstellt am',
        type: 'dateColumn',
        filter: 'dateFilter',
        width: 120,
        ...commonColumnConfig,
        cellRenderer: (params: ICellRendererParams) => {
            if (params.value) {
                return new Date(params.value).toLocaleDateString('de-DE')
            }
            return ''
        }
    }
]

// Beziehungen (Relationships) column definitions
export const beziehungenColumns: ExtendedColDef[] = [
    {
        field: 'immobilien_id',
        headerName: 'Immobilien ID',
        type: 'numericColumn',
        filter: 'numberFilter',
        width: 100,
        ...commonColumnConfig,
        formField: {
            name: 'immobilien_id',
            label: 'Immobilien ID',
            type: 'number',
            required: true,
            placeholder: 'ID der Immobilie'
        }
    },
    {
        field: 'kontakt_id',
        headerName: 'Kontakt ID',
        type: 'numericColumn',
        filter: 'numberFilter',
        width: 100,
        ...commonColumnConfig,
        formField: {
            name: 'kontakt_id',
            label: 'Kontakt ID',
            type: 'number',
            required: true,
            placeholder: 'ID des Kontakts'
        }
    },
    {
        field: 'art',
        headerName: 'Art der Beziehung',
        ...commonColumnConfig,
        filter: 'textFilter',
        cellRenderer: (params: ICellRendererParams) => {
            const art = params.value
            const artColors: { [key: string]: string } = {
                'Eigentümer': 'bg-green-100 text-green-800',
                'Mieter': 'bg-blue-100 text-blue-800',
                'Dienstleister': 'bg-orange-100 text-orange-800'
            }
            const colorClass = artColors[art] || 'bg-gray-100 text-gray-800'
            return `<span class="px-2 py-1 text-xs font-medium rounded-full ${colorClass}">${art}</span>`
        },
        formField: {
            name: 'art',
            label: 'Art der Beziehung',
            type: 'select',
            required: true,
            options: [
                { value: 'Eigentümer', label: 'Eigentümer' },
                { value: 'Mieter', label: 'Mieter' },
                { value: 'Dienstleister', label: 'Dienstleister' }
            ]
        }
    },
    {
        field: 'startdatum',
        headerName: 'Startdatum',
        type: 'dateColumn',
        filter: 'dateFilter',
        width: 120,
        ...commonColumnConfig,
        cellRenderer: (params: ICellRendererParams) => {
            if (params.value) {
                return new Date(params.value).toLocaleDateString('de-DE')
            }
            return ''
        },
        formField: {
            name: 'startdatum',
            label: 'Startdatum',
            type: 'date',
            required: true
        }
    },
    {
        field: 'enddatum',
        headerName: 'Enddatum',
        type: 'dateColumn',
        filter: 'dateFilter',
        width: 120,
        ...commonColumnConfig,
        cellRenderer: (params: ICellRendererParams) => {
            if (params.value) {
                return new Date(params.value).toLocaleDateString('de-DE')
            }
            return 'Aktiv'
        },
        formField: {
            name: 'enddatum',
            label: 'Enddatum',
            type: 'date',
            required: false
        }
    },
    {
        field: 'created_at',
        headerName: 'Erstellt am',
        type: 'dateColumn',
        filter: 'dateFilter',
        width: 120,
        ...commonColumnConfig,
        cellRenderer: (params: ICellRendererParams) => {
            if (params.value) {
                return new Date(params.value).toLocaleDateString('de-DE')
            }
            return ''
        }
    }
]

// Helper function to extract form fields from column definitions
export function getFormFields(columns: ExtendedColDef[]): FormField[] {
    return columns
        .filter(col => col.formField)
        .map(col => col.formField!)
}

// Export all column definitions for easy access
export const columnDefinitions = {
    immobilien: immobilienColumns,
    kontakte: kontakteColumns,
    beziehungen: beziehungenColumns
}

// Type for table names
export type TableName = keyof typeof columnDefinitions 