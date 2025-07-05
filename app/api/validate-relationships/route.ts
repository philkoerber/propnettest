import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

interface ValidationRequest {
    relationships: Array<{
        immobilien_id?: string
        kontakt_id?: string
        art: string
        startdatum?: string
        enddatum?: string
        dienstleistungen?: string
    }>
    entityType: 'immobilien' | 'kontakte'
    entityId: string
}

export async function POST(request: Request) {
    try {
        const body: ValidationRequest = await request.json()
        const { relationships, entityType, entityId } = body

        // Check each relationship for conflicts
        for (const newRelationship of relationships) {
            if (newRelationship.art === 'Mieter' && newRelationship.startdatum && newRelationship.enddatum) {
                const startDate = new Date(newRelationship.startdatum)
                const endDate = new Date(newRelationship.enddatum)

                // Fetch existing Mieter relationships from database
                const { data: existingRelationships, error } = await supabase
                    .from('beziehungen')
                    .select('*')
                    .eq('art', 'Mieter')
                    .eq(entityType === 'immobilien' ? 'immobilien_id' : 'kontakt_id', entityId)

                if (error) {
                    console.error('Error fetching existing relationships:', error)
                    return NextResponse.json(
                        { error: 'Fehler beim Abrufen bestehender Beziehungen' },
                        { status: 500 }
                    )
                }

                // Check for conflicts
                const conflicts = existingRelationships?.some(rel => {
                    if (!rel.startdatum || !rel.enddatum) return false
                    const relStart = new Date(rel.startdatum)
                    const relEnd = new Date(rel.enddatum)

                    // Check for date overlap
                    return (startDate <= relEnd && endDate >= relStart)
                })

                if (conflicts) {
                    return NextResponse.json(
                        {
                            isValid: false,
                            error: 'Mieter ist in diesem Zeitraum schon zur Miete'
                        },
                        { status: 400 }
                    )
                }
            }
        }

        return NextResponse.json({ isValid: true })
    } catch (error) {
        console.error('Validation error:', error)
        return NextResponse.json(
            { error: 'Validierungsfehler' },
            { status: 500 }
        )
    }
} 