import { ColDef, ICellRendererParams } from 'ag-grid-community'
import React from 'react'

// Form field type definition
export interface FormField {
    name: string
    label: string
    type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'address' | 'immobilie' | 'kontakt'
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

// Cell renderer components for beziehungen
const ImmobilienSummaryRenderer = (props: ICellRendererParams) => {
    return props.value || 'Unbekannte Immobilie'
}

const KontaktSummaryRenderer = (props: ICellRendererParams) => {
    return props.value || 'Unbekannter Kontakt'
}

const ArtRenderer = (props: ICellRendererParams) => {
    const art = props.value
    // const artColors: { [key: string]: string } = {
    //     'Eigentümer': 'bg-green-100 text-green-800',
    //     'Mieter': 'bg-blue-100 text-blue-800',
    //     'Dienstleister': 'bg-orange-100 text-orange-800'
    // }

    return art
}

// Cell renderer for associated immobilien
const AssociatedImmobilienRenderer = (props: ICellRendererParams) => {
    if (!props.value || props.value.length === 0) {
        return '-'
    }

    return props.value.map((item: any, index: number) =>
        `${item.art} @ ${item.immobilien_titel}`
    ).join(', ')
}

// Cell renderer for associated kontakte
const AssociatedKontakteRenderer = (props: ICellRendererParams) => {
    if (!props.value || props.value.length === 0) {
        return '-'
    }

    return props.value.map((kontakt: any) => kontakt.name).join(', ')
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
        field: 'mieter',
        headerName: 'Mieter',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 150,
        cellRenderer: AssociatedKontakteRenderer
    },
    {
        field: 'eigentümer',
        headerName: 'Eigentümer',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 150,
        cellRenderer: AssociatedKontakteRenderer
    },
    {
        field: 'dienstleister',
        headerName: 'Dienstleister',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 150,
        cellRenderer: AssociatedKontakteRenderer
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
        field: 'associated_immobilien',
        headerName: 'Verknüpfte Immobilien',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 250,
        cellRenderer: AssociatedImmobilienRenderer,
        cellRendererParams: {
            suppressCount: true
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
        field: 'immobilien_summary',
        headerName: 'Immobilie',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 250,
        cellRenderer: ImmobilienSummaryRenderer,
        formField: {
            name: 'immobilien_id',
            label: 'Immobilie',
            type: 'immobilie',
            required: true,
            placeholder: 'Immobilie suchen...'
        }
    },
    {
        field: 'kontakt_summary',
        headerName: 'Kontakt',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 250,
        cellRenderer: KontaktSummaryRenderer,
        formField: {
            name: 'kontakt_id',
            label: 'Kontakt',
            type: 'kontakt',
            required: true,
            placeholder: 'Kontakt suchen...'
        }
    },
    {
        field: 'art',
        headerName: 'Art',
        ...commonColumnConfig,
        filter: 'textFilter',
        cellRenderer: ArtRenderer,
        formField: {
            name: 'art',
            label: 'Art',
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
            return '-'
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