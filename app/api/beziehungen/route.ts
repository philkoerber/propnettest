import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('beziehungen')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching beziehungen:', error)
            return NextResponse.json(
                { error: 'Failed to fetch beziehungen data' },
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
            .from('beziehungen')
            .insert(body)
            .select()

        if (error) {
            console.error('Error creating beziehungen:', error)
            return NextResponse.json(
                { error: 'Failed to create beziehungen' },
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