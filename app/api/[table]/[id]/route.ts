import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

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
            create: 'Failed to create kontakte',
            update: 'Failed to update kontakt',
            delete: 'Failed to delete kontakte',
            notFound: 'Kontakt not found'
        },
        immobilien: {
            fetch: 'Failed to fetch immobilien data',
            create: 'Failed to create immobilien',
            update: 'Failed to update immobilien',
            delete: 'Failed to delete immobilien',
            notFound: 'Immobilien not found'
        },
        beziehungen: {
            fetch: 'Failed to fetch beziehungen data',
            create: 'Failed to create beziehungen',
            update: 'Failed to update beziehung',
            delete: 'Failed to delete beziehungen',
            notFound: 'Beziehung not found'
        }
    }
    return messages[table]
}

export async function DELETE(
    request: Request,
    { params }: { params: { table: string; id: string } }
) {
    try {
        const { table, id } = params

        if (!isValidTable(table)) {
            return NextResponse.json(
                { error: 'Invalid table name' },
                { status: 400 }
            )
        }

        const idNum = parseInt(id)

        if (isNaN(idNum)) {
            return NextResponse.json(
                { error: 'Invalid ID format' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', idNum)

        if (error) {
            console.error(`Error deleting ${table}:`, error)
            const errorMessages = getTableErrorMessages(table)
            return NextResponse.json(
                { error: errorMessages.delete },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { table: string; id: string } }
) {
    try {
        const { table, id } = params

        if (!isValidTable(table)) {
            return NextResponse.json(
                { error: 'Invalid table name' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const idNum = parseInt(id)

        if (isNaN(idNum)) {
            return NextResponse.json(
                { error: 'Invalid ID format' },
                { status: 400 }
            )
        }

        // Get the current entry to compare with new data
        const { data: currentData, error: fetchError } = await supabase
            .from(table)
            .select('*')
            .eq('id', idNum)
            .single()

        if (fetchError) {
            console.error(`Error fetching current ${table}:`, fetchError)
            const errorMessages = getTableErrorMessages(table)
            return NextResponse.json(
                { error: `Failed to fetch current ${table} data` },
                { status: 500 }
            )
        }

        if (!currentData) {
            const errorMessages = getTableErrorMessages(table)
            return NextResponse.json(
                { error: errorMessages.notFound },
                { status: 404 }
            )
        }

        // Only include fields that have actually changed
        const changedFields: any = {}
        Object.keys(body).forEach(key => {
            if (body[key] !== currentData[key]) {
                changedFields[key] = body[key]
            }
        })

        // If no fields have changed, return the current data
        if (Object.keys(changedFields).length === 0) {
            return NextResponse.json(currentData)
        }

        // Update only the changed fields
        const { data, error } = await supabase
            .from(table)
            .update(changedFields)
            .eq('id', idNum)
            .select()

        if (error) {
            console.error(`Error updating ${table}:`, error)
            const errorMessages = getTableErrorMessages(table)
            return NextResponse.json(
                { error: errorMessages.update },
                { status: 500 }
            )
        }

        return NextResponse.json(data[0])
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 