import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import {
    isValidTable,
    getTableErrorMessages,
    COMMON_ERROR_MESSAGES
} from '../../../lib/errorMessages'

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

        let data, error

        // Special handling for beziehungen to include joined data
        if (table === 'beziehungen') {
            const { data: beziehungenData, error: beziehungenError } = await supabase
                .from(table)
                .select(`
                    *,
                    immobilien:immobilien_id(titel, adresse, beschreibung),
                    kontakt:kontakt_id(name, adresse)
                `)
                .order('created_at', { ascending: false })

            if (beziehungenError) {
                console.error(`Error fetching ${table}:`, beziehungenError)
                const errorMessages = getTableErrorMessages(table)
                return NextResponse.json(
                    { error: errorMessages.fetch },
                    { status: 500 }
                )
            }

            // Transform the data to include summary fields
            data = beziehungenData?.map(item => ({
                ...item,
                immobilien_summary: item.immobilien ? `${item.immobilien.titel} - ${item.immobilien.adresse}` : 'Unbekannte Immobilie',
                kontakt_summary: item.kontakt ? `${item.kontakt.name} - ${item.kontakt.adresse}` : 'Unbekannter Kontakt'
            })) || []
        } else if (table === 'kontakte') {
            // Special handling for kontakte to include associated immobilien
            const { data: kontakteData, error: kontakteError } = await supabase
                .from(table)
                .select('*')
                .order('created_at', { ascending: false })

            if (kontakteError) {
                console.error(`Error fetching ${table}:`, kontakteError)
                const errorMessages = getTableErrorMessages(table)
                return NextResponse.json(
                    { error: errorMessages.fetch },
                    { status: 500 }
                )
            }

            // Get associated immobilien for each kontakt
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

            data = kontakteWithImmobilien
        } else if (table === 'immobilien') {
            // Special handling for immobilien to include associated kontakte
            const { data: immobilienData, error: immobilienError } = await supabase
                .from(table)
                .select('*')
                .order('created_at', { ascending: false })

            if (immobilienError) {
                console.error(`Error fetching ${table}:`, immobilienError)
                const errorMessages = getTableErrorMessages(table)
                return NextResponse.json(
                    { error: errorMessages.fetch },
                    { status: 500 }
                )
            }

            // Get associated kontakte for each immobilien, grouped by relationship type
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

            data = immobilienWithKontakte
        } else {
            // Standard handling for other tables
            const result = await supabase
                .from(table)
                .select('*')
                .order('created_at', { ascending: false })

            data = result.data
            error = result.error
        }

        if (error) {
            console.error(`Error fetching ${table}:`, error)
            const errorMessages = getTableErrorMessages(table)
            return NextResponse.json(
                { error: errorMessages.fetch },
                { status: 500 }
            )
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

        // Extract relationships from the request body if they exist
        const { relationships, ...entityData } = body

        // Filter out virtual fields that don't exist in the database
        const virtualFields = ['mieter', 'eigentümer', 'dienstleister', 'associated_immobilien']
        const filteredEntityData: Record<string, unknown> = {}

        Object.keys(entityData).forEach(key => {
            if (!virtualFields.includes(key)) {
                filteredEntityData[key] = entityData[key]
            }
        })

        // Start a transaction
        const { data: entity, error: entityError } = await supabase
            .from(table)
            .insert(filteredEntityData)
            .select()
            .single()

        if (entityError) {
            console.error(`Error creating ${table}:`, entityError)
            const errorMessages = getTableErrorMessages(table)
            return NextResponse.json(
                { error: errorMessages.create },
                { status: 500 }
            )
        }

        // If relationships are provided, create them
        if (relationships && Array.isArray(relationships) && relationships.length > 0) {
            const relationshipData = relationships.map((rel: any) => {
                if (table === 'immobilien') {
                    return {
                        immobilien_id: entity.id,
                        kontakt_id: rel.kontakt_id,
                        art: rel.art,
                        startdatum: rel.startdatum,
                        enddatum: rel.enddatum
                    }
                } else if (table === 'kontakte') {
                    return {
                        immobilien_id: rel.immobilien_id,
                        kontakt_id: entity.id,
                        art: rel.art,
                        startdatum: rel.startdatum,
                        enddatum: rel.enddatum
                    }
                }
                return rel
            })

            const { error: relationshipsError } = await supabase
                .from('beziehungen')
                .insert(relationshipData)

            if (relationshipsError) {
                console.error('Error creating relationships:', relationshipsError)
                // Note: We don't rollback the entity creation here as it might be useful
                // In a production environment, you might want to implement proper transaction rollback
                return NextResponse.json(
                    {
                        error: 'Entity created but relationships failed to create',
                        entity,
                        relationshipError: relationshipsError.message
                    },
                    { status: 207 } // 207 Multi-Status
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