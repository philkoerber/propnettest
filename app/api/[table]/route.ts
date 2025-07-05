import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

// Define allowed table names
const ALLOWED_TABLES = ['kontakte', 'immobilien', 'beziehungen'] as const
type AllowedTable = typeof ALLOWED_TABLES[number]

// Helper function to validate table name
function isValidTable(table: string): table is AllowedTable {
    return ALLOWED_TABLES.includes(table as AllowedTable)
}

// Helper function to get table-specific error messages
function getTableErrorMessages(table: AllowedTable) {
    const messages = {
        kontakte: {
            fetch: 'Failed to fetch kontakte data',
            create: 'Failed to create kontakt',


            notFound: 'Kontakt not found'
        },
        immobilien: {
            fetch: 'Failed to fetch immobilien data',
            create: 'Failed to create immobilien',


            notFound: 'Immobilien not found'
        },
        beziehungen: {
            fetch: 'Failed to fetch beziehungen data',
            create: 'Failed to create beziehungen',


            notFound: 'Beziehung not found'
        }
    }
    return messages[table]
}

export async function GET(
    request: Request,
    { params }: { params: { table: string } }
) {
    try {
        const { table } = params

        if (!isValidTable(table)) {
            return NextResponse.json(
                { error: 'Invalid table name' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('created_at', { ascending: false })

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
            { error: 'Internal server error' },
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
                { error: 'Invalid table name' },
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
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 