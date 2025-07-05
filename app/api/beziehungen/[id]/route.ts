import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid ID format' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('beziehungen')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting beziehungen:', error)
            return NextResponse.json(
                { error: 'Failed to delete beziehungen' },
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
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const id = parseInt(params.id)

        // Get the current entry to compare with new data
        const { data: currentData, error: fetchError } = await supabase
            .from('beziehungen')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError) {
            console.error('Error fetching current beziehung:', fetchError)
            return NextResponse.json(
                { error: 'Failed to fetch current beziehung data' },
                { status: 500 }
            )
        }

        if (!currentData) {
            return NextResponse.json(
                { error: 'Beziehung not found' },
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
            .from('beziehungen')
            .update(changedFields)
            .eq('id', id)
            .select()

        if (error) {
            console.error('Error updating beziehung:', error)
            return NextResponse.json(
                { error: 'Failed to update beziehung' },
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