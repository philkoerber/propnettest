import { ColDef } from 'ag-grid-community'
import {
    AddressRenderer,
    ImmobilienSummaryRenderer,
    KontaktSummaryRenderer,
    ArtRenderer,
    AssociatedImmobilienRenderer,
    AssociatedKontakteRenderer,
    DateRenderer,
} from './CellRenderers'

// Enhanced form field type definition with better type safety
export interface ConditionalRule {
    field: string
    value: string
}

export interface FormField {
    name: string
    label: string
    type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'address' | 'immobilie' | 'kontakt' | 'relationships'
    required?: boolean
    options?: { value: string; label: string }[]
    placeholder?: string
    relationshipType?: 'immobilien' | 'kontakte' // For relationship fields
    conditional?: ConditionalRule // For conditional fields
    validation?: {
        custom?: (value: unknown, formData: Record<string, unknown>) => string | null
    }
}

export interface ExtendedColDef extends ColDef {
    formField?: FormField
}

// Common column configuration
const commonColumnConfig = {
    sortable: true,
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

// Relationship type options - centralized for consistency
export const RELATIONSHIP_TYPES: { value: string; label: string }[] = [
    { value: 'Eigentümer', label: 'Eigentümer' },
    { value: 'Mieter', label: 'Mieter' },
    { value: 'Dienstleister', label: 'Dienstleister' }
]

export type RelationshipType = 'Eigentümer' | 'Mieter' | 'Dienstleister'

// Immobilien (Properties) column definitions
export const immobilienColumns: ExtendedColDef[] = [
    {
        field: 'titel',
        headerName: 'Titel',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 200,
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
        width: 250,
        cellStyle: {
            ...commonColumnConfig.cellStyle,
            maxHeight: '80px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
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
        width: 250,
        cellRenderer: AddressRenderer,
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
        width: 200,
        cellRenderer: AssociatedKontakteRenderer
    },
    {
        field: 'eigentümer',
        headerName: 'Eigentümer',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 200,
        cellRenderer: AssociatedKontakteRenderer
    },
    {
        field: 'dienstleister',
        headerName: 'Dienstleister',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 200,
        cellRenderer: AssociatedKontakteRenderer
    },
    {
        field: 'created_at',
        headerName: 'Erstellt am',
        type: 'dateColumn',
        filter: 'dateFilter',
        width: 120,
        ...commonColumnConfig,
        cellRenderer: DateRenderer
    },
    {
        field: 'relationships',
        headerName: 'Beziehungen',
        ...commonColumnConfig,
        width: 300,
        formField: {
            name: 'relationships',
            label: 'Beziehungen verwalten',
            type: 'relationships',
            relationshipType: 'immobilien',
            placeholder: 'Beziehungen zu Kontakten verwalten...'
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
        width: 180,
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
        width: 300,
        cellRenderer: AddressRenderer,
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
        width: 500,
        cellRenderer: AssociatedImmobilienRenderer,
        cellRendererParams: {
            suppressCount: true
        }
    },
    {
        field: 'created_at',
        headerName: 'Erstellt am',
        type: 'dateColumn',
        filter: 'dateFilter',
        width: 120,
        ...commonColumnConfig,
        cellRenderer: DateRenderer
    },
    {
        field: 'relationships',
        headerName: 'Beziehungen',
        ...commonColumnConfig,
        width: 300,
        formField: {
            name: 'relationships',
            label: 'Beziehungen verwalten',
            type: 'relationships',
            relationshipType: 'kontakte',
            placeholder: 'Beziehungen zu Immobilien verwalten...'
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
        width: 300,
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
        width: 300,
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
        width: 150,
        cellRenderer: ArtRenderer,
        formField: {
            name: 'art',
            label: 'Art',
            type: 'select',
            required: true,
            options: RELATIONSHIP_TYPES
        }
    },
    {
        field: 'startdatum',
        headerName: 'Startdatum',
        type: 'dateColumn',
        filter: 'dateFilter',
        width: 120,
        ...commonColumnConfig,
        cellRenderer: DateRenderer,
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
        cellRenderer: DateRenderer,
        formField: {
            name: 'enddatum',
            label: 'Enddatum',
            type: 'date',
            required: false
        }
    },
    {
        field: 'dienstleistungen',
        headerName: 'Dienstleistungen',
        ...commonColumnConfig,
        filter: 'textFilter',
        width: 200,
        formField: {
            name: 'dienstleistungen',
            label: 'Angebotene Dienstleistungen',
            type: 'textarea',
            required: true,
            placeholder: 'Beschreiben Sie die angebotenen Dienstleistungen...',
            conditional: {
                field: 'art',
                value: 'Dienstleister'
            }
        }
    },
    {
        field: 'created_at',
        headerName: 'Erstellt am',
        type: 'dateColumn',
        filter: 'dateFilter',
        width: 120,
        ...commonColumnConfig,
        cellRenderer: DateRenderer
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