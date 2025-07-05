// Define allowed table names
export const ALLOWED_TABLES = ['kontakte', 'immobilien', 'beziehungen'] as const
export type AllowedTable = typeof ALLOWED_TABLES[number]

// Table-specific error messages
export const TABLE_ERROR_MESSAGES = {
    kontakte: {
        fetch: 'Fehler beim Abrufen der Kontaktdaten',
        create: 'Fehler beim Erstellen des Kontakts',
        update: 'Fehler beim Aktualisieren des Kontakts',
        delete: 'Fehler beim Löschen des Kontakts',
        notFound: 'Kontakt nicht gefunden',
        invalidData: 'Ungültige Kontaktdaten',
        fetchCurrent: 'Fehler beim Abrufen der aktuellen Kontaktdaten'
    },
    immobilien: {
        fetch: 'Fehler beim Abrufen der Immobiliendaten',
        create: 'Fehler beim Erstellen der Immobilie',
        update: 'Fehler beim Aktualisieren der Immobilie',
        delete: 'Fehler beim Löschen der Immobilie',
        notFound: 'Immobilie nicht gefunden',
        invalidData: 'Ungültige Immobiliendaten',
        fetchCurrent: 'Fehler beim Abrufen der aktuellen Immobiliendaten'
    },
    beziehungen: {
        fetch: 'Fehler beim Abrufen der Beziehungsdaten',
        create: 'Fehler beim Erstellen der Beziehung',
        update: 'Fehler beim Aktualisieren der Beziehung',
        delete: 'Fehler beim Löschen der Beziehung',
        notFound: 'Beziehung nicht gefunden',
        invalidData: 'Ungültige Beziehungsdaten',
        fetchCurrent: 'Fehler beim Abrufen der aktuellen Beziehungsdaten'
    }
} as const

// Common error messages
export const COMMON_ERROR_MESSAGES = {
    invalidTable: 'Ungültiger Tabellenname',
    internalServerError: 'Interner Serverfehler',
    invalidRequestData: 'Ungültige Anfragedaten',
    invalidUUID: 'Ungültiges UUID-Format',
    success: 'Vorgang erfolgreich abgeschlossen'
} as const

// Helper function to get table-specific error messages
export function getTableErrorMessages(table: AllowedTable) {
    return TABLE_ERROR_MESSAGES[table]
}

// Helper function to validate table name
export function isValidTable(table: string): table is AllowedTable {
    return ALLOWED_TABLES.includes(table as AllowedTable)
} 