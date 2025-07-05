import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { validateUUID } from '../../../../lib/uuidValidator'
import {
    isValidTable,
    getTableErrorMessages,
    COMMON_ERROR_MESSAGES
} from '../../../../lib/errorMessages'

export async function DELETE(
    request: Request,
    context: { params: Promise<{ table: string; id: string }> }
) {
    try {
        const { table, id } = await context.params

        if (!isValidTable(table)) {
            return NextResponse.json(
                { error: COMMON_ERROR_MESSAGES.invalidTable },
                { status: 400 }
            )
        }

        // Validate UUID format
        const uuidValidation = validateUUID(id)
        if (!uuidValidation.isValid) {
            return NextResponse.json(
                { error: COMMON_ERROR_MESSAGES.invalidUUID },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id)

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
            { error: COMMON_ERROR_MESSAGES.internalServerError },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: Request,
    context: { params: Promise<{ table: string; id: string }> }
) {
    try {
        const { table, id } = await context.params

        if (!isValidTable(table)) {
            return NextResponse.json(
                { error: COMMON_ERROR_MESSAGES.invalidTable },
                { status: 400 }
            )
        }

        const body = await request.json()

        // Validate UUID format (passt das format)
        const uuidValidation = validateUUID(id)
        if (!uuidValidation.isValid) {
            return NextResponse.json(
                { error: COMMON_ERROR_MESSAGES.invalidUUID },
                { status: 400 }
            )
        }

        // Get the current entry to compare with new data
        const { data: currentData, error: fetchError } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError) {
            console.error(`Error fetching current ${table}:`, fetchError)
            const errorMessages = getTableErrorMessages(table)
            return NextResponse.json(
                { error: errorMessages.fetchCurrent },
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
        const changedFields: Record<string, unknown> = {}
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
            .eq('id', id)
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
            { error: COMMON_ERROR_MESSAGES.internalServerError },
            { status: 500 }
        )
    }
} 