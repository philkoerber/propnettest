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