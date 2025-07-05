import { RelationshipType } from './columnDefinitions'

export interface Relationship {
    id?: string
    immobilien_id?: string | number
    kontakt_id?: string | number
    art: RelationshipType
    startdatum?: string
    enddatum?: string
    dienstleistungen?: string
    immobilien_titel?: string
    kontakt_name?: string
}

export interface ValidationError {
    field: string
    message: string
}

export interface ValidationResult {
    isValid: boolean
    errors: ValidationError[]
}

// Validation rules for relationships
export class RelationshipValidator {
    private errors: ValidationError[] = []

    // Validate required fields
    validateRequiredFields(relationship: Relationship): boolean {
        if (!relationship.art) {
            this.errors.push({ field: 'art', message: 'Beziehungstyp ist erforderlich.' })
            return false
        }

        if (!relationship.immobilien_id && !relationship.kontakt_id) {
            this.errors.push({ field: 'entity', message: 'Kontakt/Immobilie ist erforderlich.' })
            return false
        }

        return true
    }

    // Validate Dienstleister services
    validateDienstleisterServices(relationship: Relationship): boolean {
        if (relationship.art === 'Dienstleister' &&
            (!relationship.dienstleistungen || relationship.dienstleistungen.trim() === '')) {
            this.errors.push({
                field: 'dienstleistungen',
                message: 'Dienstleistungen sind für Dienstleister-Beziehungen erforderlich.'
            })
            return false
        }
        return true
    }

    // Validate Mieter conflicts against form relationships
    validateMieterConflictsInForm(
        newRelationship: Relationship,
        existingRelationships: Relationship[],
        relationshipType: 'immobilien' | 'kontakte'
    ): boolean {
        if (newRelationship.art !== 'Mieter' || !newRelationship.startdatum || !newRelationship.enddatum) {
            return true
        }

        const startDate = new Date(newRelationship.startdatum)
        const endDate = new Date(newRelationship.enddatum)

        // Check for conflicts with existing Mieter relationships in the form
        const conflicts = existingRelationships.filter(rel =>
            rel.art === 'Mieter' &&
            rel.id !== newRelationship.id &&
            ((relationshipType === 'immobilien' && rel.immobilien_id === newRelationship.immobilien_id) ||
                (relationshipType === 'kontakte' && rel.kontakt_id === newRelationship.kontakt_id))
        ).some(rel => {
            if (!rel.startdatum || !rel.enddatum) return false
            const relStart = new Date(rel.startdatum)
            const relEnd = new Date(rel.enddatum)

            // Check for date overlap
            return (startDate <= relEnd && endDate >= relStart)
        })

        if (conflicts) {
            this.errors.push({
                field: 'general',
                message: 'Mieter ist in diesem Zeitraum schon zur Miete'
            })
            return false
        }

        return true
    }

    // Validate Mieter conflicts against database relationships
    validateMieterConflictsInDatabase(
        newRelationship: Relationship,
        databaseRelationships: Relationship[],
        relationshipType: 'immobilien' | 'kontakte'
    ): boolean {
        if (newRelationship.art !== 'Mieter' || !newRelationship.startdatum || !newRelationship.enddatum) {
            return true
        }

        const startDate = new Date(newRelationship.startdatum)
        const endDate = new Date(newRelationship.enddatum)

        // Check for conflicts with existing Mieter relationships in the database
        const conflicts = databaseRelationships.filter(rel =>
            rel.art === 'Mieter' &&
            rel.id !== newRelationship.id &&
            ((relationshipType === 'immobilien' && rel.immobilien_id === newRelationship.immobilien_id) ||
                (relationshipType === 'kontakte' && rel.kontakt_id === newRelationship.kontakt_id))
        ).some(rel => {
            if (!rel.startdatum || !rel.enddatum) return false
            const relStart = new Date(rel.startdatum)
            const relEnd = new Date(rel.enddatum)

            // Check for date overlap
            return (startDate <= relEnd && endDate >= relStart)
        })

        if (conflicts) {
            this.errors.push({
                field: 'general',
                message: 'Mieter ist in diesem Zeitraum schon zur Miete'
            })
            return false
        }

        return true
    }

    // Validate date logic
    validateDateLogic(relationship: Relationship): boolean {
        if (relationship.startdatum && relationship.enddatum) {
            const startDate = new Date(relationship.startdatum)
            const endDate = new Date(relationship.enddatum)

            if (startDate > endDate) {
                this.errors.push({
                    field: 'enddatum',
                    message: 'Enddatum muss nach dem Startdatum liegen.'
                })
                return false
            }
        }
        return true
    }

    // Main validation method
    validate(
        relationship: Relationship,
        existingRelationships: Relationship[] = [],
        relationshipType: 'immobilien' | 'kontakte' = 'immobilien'
    ): ValidationResult {
        this.errors = []

        const validations = [
            () => this.validateRequiredFields(relationship),
            () => this.validateDienstleisterServices(relationship),
            () => this.validateMieterConflictsInForm(relationship, existingRelationships, relationshipType),
            () => this.validateDateLogic(relationship)
        ]

        const isValid = validations.every(validation => validation())

        return {
            isValid,
            errors: this.errors
        }
    }

    // Get errors by field
    getErrorsByField(): Record<string, string> {
        const errorsByField: Record<string, string> = {}
        this.errors.forEach(error => {
            errorsByField[error.field] = error.message
        })
        return errorsByField
    }
}

// Utility function to check if a field should be shown based on conditional rules
export function shouldShowField(
    field: { conditional?: { field: string; value: string } },
    formData: Record<string, unknown>
): boolean {
    if (!field.conditional) return true

    const { field: conditionalField, value: conditionalValue } = field.conditional
    return formData[conditionalField] === conditionalValue
} 