import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import {
    isValidTable,
    getTableErrorMessages,
    COMMON_ERROR_MESSAGES
} from '../../../lib/errorMessages'

// Helper function to handle database errors
const handleDatabaseError = (error: any, table: string, operation: 'fetch' | 'create' | 'update' | 'delete') => {
    console.error(`Error ${operation} ${table}:`, error)
    const errorMessages = getTableErrorMessages(table as any)
    return NextResponse.json(
        { error: errorMessages[operation] || 'Unknown error' },
        { status: 500 }
    )
}

// Helper function to fetch and transform beziehungen data
const fetchBeziehungenData = async () => {
    const { data: beziehungenData, error: beziehungenError } = await supabase
        .from('beziehungen')
        .select(`
            *,
            immobilien:immobilien_id(titel, adresse, beschreibung),
            kontakt:kontakt_id(name, adresse)
        `)
        .order('created_at', { ascending: false })

    if (beziehungenError) {
        throw beziehungenError
    }

    return beziehungenData?.map(item => ({
        ...item,
        immobilien_summary: item.immobilien ? `${item.immobilien.titel} - ${item.immobilien.adresse}` : 'Unbekannte Immobilie',
        kontakt_summary: item.kontakt ? `${item.kontakt.name} - ${item.kontakt.adresse}` : 'Unbekannter Kontakt'
    })) || []
}

// Helper function to fetch kontakte with associated immobilien
const fetchKontakteWithImmobilien = async () => {
    const { data: kontakteData, error: kontakteError } = await supabase
        .from('kontakte')
        .select('*')
        .order('created_at', { ascending: false })

    if (kontakteError) {
        throw kontakteError
    }

    const kontakteWithImmobilien = await Promise.all(
        kontakteData?.map(async (kontakt: Record<string, unknown>) => {
            const { data: beziehungenData } = await supabase
                .from('beziehungen')
                .select(`
                    art,
                    immobilien:immobilien_id(titel)
                `)
                .eq('kontakt_id', kontakt.id)

            const associatedImmobilien = (beziehungenData as unknown[] | undefined)?.map((beziehung: unknown) => {
                const b = beziehung as { art?: string; immobilien?: { titel?: string } }
                return {
                    art: b.art,
                    immobilien_titel: b.immobilien?.titel || 'Unbekannte Immobilie'
                }
            }) || []

            return {
                ...kontakt,
                associated_immobilien: associatedImmobilien
            }
        }) || []
    )

    return kontakteWithImmobilien
}

// Helper function to fetch immobilien with associated kontakte
const fetchImmobilienWithKontakte = async () => {
    const { data: immobilienData, error: immobilienError } = await supabase
        .from('immobilien')
        .select('*')
        .order('created_at', { ascending: false })

    if (immobilienError) {
        throw immobilienError
    }

    const immobilienWithKontakte = await Promise.all(
        immobilienData?.map(async (immobilie: Record<string, unknown>) => {
            const { data: beziehungenData } = await supabase
                .from('beziehungen')
                .select(`
                    art,
                    kontakt:kontakt_id(name)
                `)
                .eq('immobilien_id', immobilie.id)

            // Group kontakte by relationship type
            const mieter = (beziehungenData as unknown[] | undefined)?.filter((beziehung: unknown) => (beziehung as { art?: string }).art === 'Mieter')
                .map((beziehung: unknown) => (beziehung as { kontakt?: unknown }).kontakt) || []
            const eigentümer = (beziehungenData as unknown[] | undefined)?.filter((beziehung: unknown) => (beziehung as { art?: string }).art === 'Eigentümer')
                .map((beziehung: unknown) => (beziehung as { kontakt?: unknown }).kontakt) || []
            const dienstleister = (beziehungenData as unknown[] | undefined)?.filter((beziehung: unknown) => (beziehung as { art?: string }).art === 'Dienstleister')
                .map((beziehung: unknown) => (beziehung as { kontakt?: unknown }).kontakt) || []

            return {
                ...immobilie,
                mieter,
                eigentümer,
                dienstleister
            }
        }) || []
    )

    return immobilienWithKontakte
}

// Helper function to fetch standard table data
const fetchStandardTableData = async (table: string) => {
    const result = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })

    if (result.error) {
        throw result.error
    }

    return result.data
}

// Helper function to filter virtual fields from entity data
const filterVirtualFields = (entityData: Record<string, unknown>) => {
    const virtualFields = ['mieter', 'eigentümer', 'dienstleister', 'associated_immobilien']
    const filteredEntityData: Record<string, unknown> = {}

    Object.keys(entityData).forEach(key => {
        if (!virtualFields.includes(key)) {
            filteredEntityData[key] = entityData[key]
        }
    })

    return filteredEntityData
}

// Helper function to create relationship data
const createRelationshipData = (relationships: any[], table: string, entityId: string) => {
    return relationships.map((rel: any) => {
        if (table === 'immobilien') {
            return {
                immobilien_id: entityId,
                kontakt_id: rel.kontakt_id,
                art: rel.art,
                startdatum: rel.startdatum,
                enddatum: rel.enddatum
            }
        } else if (table === 'kontakte') {
            return {
                immobilien_id: rel.immobilien_id,
                kontakt_id: entityId,
                art: rel.art,
                startdatum: rel.startdatum,
                enddatum: rel.enddatum
            }
        }
        return rel
    })
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ table: string }> }
) {
    try {
        const { table } = await params

        if (!isValidTable(table)) {
            return NextResponse.json(
                { error: COMMON_ERROR_MESSAGES.invalidTable },
                { status: 400 }
            )
        }

        let data

        // Use a switch statement for cleaner table-specific handling
        switch (table) {
            case 'beziehungen':
                data = await fetchBeziehungenData()
                break
            case 'kontakte':
                data = await fetchKontakteWithImmobilien()
                break
            case 'immobilien':
                data = await fetchImmobilienWithKontakte()
                break
            default:
                data = await fetchStandardTableData(table)
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: COMMON_ERROR_MESSAGES.internalServerError },
            { status: 500 }
        )
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ table: string }> }
) {
    try {
        const { table } = await params

        if (!isValidTable(table)) {
            return NextResponse.json(
                { error: COMMON_ERROR_MESSAGES.invalidTable },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { relationships, ...entityData } = body
        const filteredEntityData = filterVirtualFields(entityData)

        // Create the entity
        const { data: entity, error: entityError } = await supabase
            .from(table)
            .insert(filteredEntityData)
            .select()
            .single()

        if (entityError) {
            return handleDatabaseError(entityError, table, 'create')
        }

        // Create relationships if provided
        if (relationships && Array.isArray(relationships) && relationships.length > 0) {
            const relationshipData = createRelationshipData(relationships, table, entity.id)

            const { error: relationshipsError } = await supabase
                .from('beziehungen')
                .insert(relationshipData)

            if (relationshipsError) {
                console.error('Error creating relationships:', relationshipsError)
                return NextResponse.json(
                    {
                        error: 'Entity created but relationships failed to create',
                        entity,
                        relationshipError: relationshipsError.message
                    },
                    { status: 207 }
                )
            }
        }

        return NextResponse.json(entity, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: COMMON_ERROR_MESSAGES.internalServerError },
            { status: 500 }
        )
    }
} 