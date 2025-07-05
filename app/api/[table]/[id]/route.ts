import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { validateUUID } from '../../../../lib/uuidValidator'
import {
    isValidTable,
    getTableErrorMessages,
    COMMON_ERROR_MESSAGES,
    AllowedTable
} from '../../../../lib/errorMessages'

// Helper function to handle database errors
const handleDatabaseError = (error: unknown, table: string, operation: 'fetch' | 'create' | 'update' | 'delete') => {
    console.error(`Error ${operation} ${table}:`, error)
    const errorMessages = getTableErrorMessages(table as AllowedTable)
    return NextResponse.json(
        { error: errorMessages[operation] || 'Unknown error' },
        { status: 500 }
    )
}



// Helper function to filter virtual fields from entity data
const filterVirtualFields = (entityData: Record<string, unknown>) => {
    const virtualFields = ['mieter', 'eigentümer', 'dienstleister', 'associated_immobilien']
    const filteredEntityData: Record<string, unknown> = {}

    Object.keys(entityData).forEach(key => {
        if (!virtualFields.includes(key)) {
            filteredEntityData[key] = entityData[key]
        }
    })

    return filteredEntityData
}

// Helper function to sanitize date fields
const sanitizeDateField = (value: unknown) => {
    return value === '' || value === null || value === undefined ? null : value
}

// Helper function to create relationship data for updates
const createRelationshipDataForUpdate = (relationships: Record<string, unknown>[], table: string, entityId: string) => {
    return relationships.map((rel: Record<string, unknown>) => {
        if (table === 'immobilien') {
            return {
                immobilien_id: entityId,
                kontakt_id: rel.kontakt_id,
                art: rel.art,
                startdatum: sanitizeDateField(rel.startdatum),
                enddatum: sanitizeDateField(rel.enddatum)
            }
        } else if (table === 'kontakte') {
            return {
                immobilien_id: rel.immobilien_id,
                kontakt_id: entityId,
                art: rel.art,
                startdatum: sanitizeDateField(rel.startdatum),
                enddatum: sanitizeDateField(rel.enddatum)
            }
        }
        return rel
    })
}

// Helper function to format date for input fields
const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
}

// Helper function to fetch entity with relationships
const fetchEntityWithRelationships = async (table: string, id: string) => {
    // First, get the entity data
    const { data: entity, error: entityError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()

    if (entityError) {
        throw entityError
    }

    // If this is an immobilien or kontakt entity, fetch the relationships
    if (table === 'immobilien' || table === 'kontakte') {
        const { data: relationshipsData, error: relationshipsError } = await supabase
            .from('beziehungen')
            .select(`
                id,
                immobilien_id,
                kontakt_id,
                art,
                startdatum,
                enddatum,
                immobilien:immobilien_id(titel),
                kontakt:kontakt_id(name)
            `)
            .eq(table === 'immobilien' ? 'immobilien_id' : 'kontakt_id', id)

        if (relationshipsError) {
            throw relationshipsError
        }

        // Format the relationships data
        const formattedRelationships = (relationshipsData || []).map((rel: Record<string, unknown>) => ({
            id: rel.id,
            immobilien_id: rel.immobilien_id,
            kontakt_id: rel.kontakt_id,
            art: rel.art,
            startdatum: formatDateForInput(rel.startdatum as string | null),
            enddatum: formatDateForInput(rel.enddatum as string | null),
            immobilien_titel: (rel.immobilien as Record<string, unknown>)?.titel,
            kontakt_name: (rel.kontakt as Record<string, unknown>)?.name
        }))

        return {
            ...entity,
            relationships: formattedRelationships
        }
    }

    return entity
}

export async function GET(
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

        const entityWithRelationships = await fetchEntityWithRelationships(table, id)

        return NextResponse.json(entityWithRelationships)
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: COMMON_ERROR_MESSAGES.internalServerError },
            { status: 500 }
        )
    }
}

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
            return handleDatabaseError(error, table, 'delete')
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

        // Validate UUID format
        const uuidValidation = validateUUID(id)
        if (!uuidValidation.isValid) {
            return NextResponse.json(
                { error: COMMON_ERROR_MESSAGES.invalidUUID },
                { status: 400 }
            )
        }

        // Extract relationships from the request body if they exist
        const { relationships, ...entityData } = body
        const filteredEntityData = filterVirtualFields(entityData)

        // Get the current entry to compare with new data
        const { data: currentData, error: fetchError } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError) {
            return handleDatabaseError(fetchError, table, 'fetch')
        }

        if (!currentData) {
            const errorMessages = getTableErrorMessages(table as AllowedTable)
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
                return handleDatabaseError(error, table, 'update')
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
                const relationshipData = createRelationshipDataForUpdate(relationships, table, id)

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