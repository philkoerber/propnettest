'use client'

import React from 'react'
import Autocomplete from 'react-google-autocomplete'

interface AddressAutocompleteProps {
    name: string
    value: string
    onChange: (name: string, value: string) => void
    placeholder?: string
    required?: boolean
    className?: string
    disabled?: boolean
}

export default function AddressAutocomplete({
    name,
    value,
    onChange,
    placeholder = 'Adresse suchen...',
    required = false,
    className = '',
    disabled = false
}: AddressAutocompleteProps) {
    const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
        // Extract the formatted address
        const address = place.formatted_address || ''
        onChange(name, address)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(name, e.target.value)
    }

    return (
        <Autocomplete
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            onPlaceSelected={handlePlaceSelected}
            onChange={handleInputChange}
            value={value}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
            options={{
                types: ['address'],
                componentRestrictions: { country: 'de' }, // Restrict to Germany
                fields: ['formatted_address', 'geometry', 'place_id']
            }}
        />
    )
} 