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
        Object.keys(filteredEntityData).forEach(key => {
            if (filteredEntityData[key] !== currentData[key]) {
                changedFields[key] = filteredEntityData[key]
            }
        })

        let updatedEntity = currentData

        // Update the entity if there are changes
        if (Object.keys(changedFields).length > 0) {
            const { data, error } = await supabase
                .from(table)
                .update(changedFields)
                .eq('id', id)
                .select()
                .single()

            if (error) {
                console.error(`Error updating ${table}:`, error)
                const errorMessages = getTableErrorMessages(table)
                return NextResponse.json(
                    { error: errorMessages.update },
                    { status: 500 }
                )
            }

            updatedEntity = data
        }

        // Handle relationships if provided
        if (relationships !== undefined) {
            // Delete existing relationships for this entity
            const deleteCondition = table === 'immobilien'
                ? { immobilien_id: id }
                : { kontakt_id: id }

            const { error: deleteError } = await supabase
                .from('beziehungen')
                .delete()
                .match(deleteCondition)

            if (deleteError) {
                console.error('Error deleting existing relationships:', deleteError)
                return NextResponse.json(
                    {
                        error: 'Entity updated but relationships failed to update',
                        entity: updatedEntity,
                        relationshipError: deleteError.message
                    },
                    { status: 207 }
                )
            }

            // Create new relationships if provided
            if (Array.isArray(relationships) && relationships.length > 0) {
                const relationshipData = relationships.map((rel: any) => {
                    // Helper function to convert empty strings to null for date fields
                    const sanitizeDateField = (value: any) => {
                        return value === '' || value === null || value === undefined ? null : value
                    }

                    if (table === 'immobilien') {
                        return {
                            immobilien_id: id,
                            kontakt_id: rel.kontakt_id,
                            art: rel.art,
                            startdatum: sanitizeDateField(rel.startdatum),
                            enddatum: sanitizeDateField(rel.enddatum)
                        }
                    } else if (table === 'kontakte') {
                        return {
                            immobilien_id: rel.immobilien_id,
                            kontakt_id: id,
                            art: rel.art,
                            startdatum: sanitizeDateField(rel.startdatum),
                            enddatum: sanitizeDateField(rel.enddatum)
                        }
                    }
                    return rel
                })

                const { error: relationshipsError } = await supabase
                    .from('beziehungen')
                    .insert(relationshipData)

                if (relationshipsError) {
                    console.error('Error creating new relationships:', relationshipsError)
                    return NextResponse.json(
                        {
                            error: 'Entity updated but new relationships failed to create',
                            entity: updatedEntity,
                            relationshipError: relationshipsError.message
                        },
                        { status: 207 }
                    )
                }
            }
        }

        return NextResponse.json(updatedEntity)
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: COMMON_ERROR_MESSAGES.internalServerError },
            { status: 500 }
        )
    }
} 