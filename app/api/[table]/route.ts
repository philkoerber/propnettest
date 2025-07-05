import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import {
    isValidTable,
    getTableErrorMessages,
    COMMON_ERROR_MESSAGES
} from '../../../lib/errorMessages'

export async function GET(
    request: Request,
    { params }: { params: { table: string } }
) {
    try {
        const { table } = params

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
    { params }: { params: { table: string } }
) {
    try {
        const { table } = params

        if (!isValidTable(table)) {
            return NextResponse.json(
                { error: COMMON_ERROR_MESSAGES.invalidTable },
                { status: 400 }
            )
        }

        const body = await request.json()

        const { data, error } = await supabase
            .from(table)
            .insert(body)
            .select()

        if (error) {
            console.error(`Error creating ${table}:`, error)
            const errorMessages = getTableErrorMessages(table)
            return NextResponse.json(
                { error: errorMessages.create },
                { status: 500 }
            )
        }

        return NextResponse.json(data[0], { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: COMMON_ERROR_MESSAGES.internalServerError },
            { status: 500 }
        )
    }
} 