import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('immobilien')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching immobilien:', error)
            return NextResponse.json(
                { error: 'Failed to fetch immobilien data' },
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

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const { data, error } = await supabase
            .from('immobilien')
            .insert(body)
            .select()

        if (error) {
            console.error('Error creating immobilien:', error)
            return NextResponse.json(
                { error: 'Failed to create immobilien' },
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