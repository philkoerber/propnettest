'use client'

import { useState, useEffect, useRef } from 'react'

interface Immobilie {
    id: number
    titel: string
    adresse: string
    beschreibung?: string
}

interface ImmobilienAutocompleteProps {
    name: string
    onChange: (name: string, value: string | number) => void
    required?: boolean
    placeholder?: string
}

export default function ImmobilienAutocomplete({
    name,
    onChange,
    required = false,
    placeholder = 'Immobilie suchen...'
}: ImmobilienAutocompleteProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [immobilien, setImmobilien] = useState<Immobilie[]>([])
    const [filteredImmobilien, setFilteredImmobilien] = useState<Immobilie[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Fetch immobilien data
    useEffect(() => {
        const fetchImmobilien = async () => {
            setLoading(true)
            try {
                const response = await fetch('/api/immobilien')
                if (response.ok) {
                    const data = await response.json()
                    setImmobilien(data)
                    setFilteredImmobilien(data)
                }
            } catch (error) {
                console.error('Error fetching immobilien:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchImmobilien()
    }, [])

    // Filter immobilien based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredImmobilien(immobilien)
            return
        }

        const filtered = immobilien.filter(immobilie => {
            const searchLower = searchTerm.toLowerCase()
            return (
                immobilie.id.toString().includes(searchLower) ||
                immobilie.titel.toLowerCase().includes(searchLower) ||
                immobilie.adresse.toLowerCase().includes(searchLower)
            )
        })
        setFilteredImmobilien(filtered)
    }, [searchTerm, immobilien])

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setSearchTerm(newValue)
        setIsOpen(true)

        // Clear the form value if user is typing
        if (!newValue.trim()) {
            onChange(name, '')
        }
    }

    const handleSelectImmobilie = (immobilie: Immobilie) => {
        setSearchTerm(`${immobilie.titel} - ${immobilie.adresse}`)
        onChange(name, immobilie.id)
        setIsOpen(false)
    }

    const handleInputFocus = () => {
        setIsOpen(true)
    }

    const handleInputBlur = () => {
        // Delay closing to allow for click on dropdown items
        setTimeout(() => setIsOpen(false), 150)
    }

    return (
        <div ref={wrapperRef} className="relative">
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
            )}

            {isOpen && filteredImmobilien.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredImmobilien.map((immobilie) => (
                        <div
                            key={immobilie.id}
                            onClick={() => handleSelectImmobilie(immobilie)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                            <div className="font-medium text-gray-900">
                                {immobilie.titel}
                            </div>
                            <div className="text-sm text-gray-600">
                                ID: {immobilie.id} • {immobilie.adresse}
                            </div>
                            {immobilie.beschreibung && (
                                <div className="text-xs text-gray-500 truncate">
                                    {immobilie.beschreibung}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isOpen && !loading && filteredImmobilien.length === 0 && searchTerm.trim() && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="px-3 py-2 text-gray-500">
                        Keine Immobilien gefunden
                    </div>
                </div>
            )}
        </div>
    )
} 