import { ICellRendererParams } from 'ag-grid-community'
import React from 'react'

// Address renderer that splits by commas and formats nicely
export const AddressRenderer = (props: ICellRendererParams) => {
    if (!props.value) return '-'

    const address = props.value as string
    const parts = address.split(',').map(part => part.trim()).filter(part => part)

    if (parts.length === 1) {
        return React.createElement('div', { className: 'text-sm' }, parts[0])
    }

    return React.createElement('div', { className: 'text-sm space-y-1' },
        parts.map((part, index) =>
            React.createElement('div', { key: index, className: 'text-gray-700' }, part)
        )
    )
}

// Cell renderer components for beziehungen
export const ImmobilienSummaryRenderer = (props: ICellRendererParams) => {
    return props.value || 'Unbekannte Immobilie'
}

export const KontaktSummaryRenderer = (props: ICellRendererParams) => {
    return props.value || 'Unbekannter Kontakt'
}

export const ArtRenderer = (props: ICellRendererParams) => {
    const art = props.value
    // const artColors: { [key: string]: string } = {
    //     'Eigentümer': 'bg-green-100 text-green-800',
    //     'Mieter': 'bg-blue-100 text-blue-800',
    //     'Dienstleister': 'bg-orange-100 text-orange-800'
    // }

    return art
}

// Cell renderer for associated immobilien
export const AssociatedImmobilienRenderer = (props: ICellRendererParams) => {
    if (!props.value || props.value.length === 0) {
        return '-'
    }

    const items = props.value.map((item: Record<string, unknown>) =>
        `${item.art} @ ${item.immobilien_titel}`
    )

    if (items.length === 1) {
        return React.createElement('div', { className: 'text-sm' }, items[0])
    }

    return React.createElement('div', { className: 'text-sm space-y-1' },
        items.map((item: string, index: number) =>
            React.createElement('div', { key: index, className: 'text-gray-700' }, item)
        )
    )
}

// Cell renderer for associated kontakte
export const AssociatedKontakteRenderer = (props: ICellRendererParams) => {
    if (!props.value || props.value.length === 0) {
        return '-'
    }

    const kontakte = props.value.map((kontakt: Record<string, unknown>) => kontakt.name)

    if (kontakte.length === 1) {
        return React.createElement('div', { className: 'text-sm' }, kontakte[0])
    }

    return React.createElement('div', { className: 'text-sm space-y-1' },
        kontakte.map((name: string, index: number) =>
            React.createElement('div', { key: index, className: 'text-gray-700' }, name)
        )
    )
}

// Date renderer for consistent date formatting
export const DateRenderer = (props: ICellRendererParams) => {
    if (props.value) {
        return new Date(props.value).toLocaleDateString('de-DE')
    }
    return ''
}