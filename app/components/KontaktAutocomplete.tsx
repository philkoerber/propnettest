'use client'

import { useState, useEffect, useRef } from 'react'

interface Kontakt {
    id: number
    name: string
    adresse: string
}

interface KontaktAutocompleteProps {
    name: string
    onChange: (name: string, value: string | number) => void
    required?: boolean
    placeholder?: string
}

export default function KontaktAutocomplete({
    name,
    onChange,
    required = false,
    placeholder = 'Kontakt suchen...'
}: KontaktAutocompleteProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [kontakte, setKontakte] = useState<Kontakt[]>([])
    const [filteredKontakte, setFilteredKontakte] = useState<Kontakt[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Fetch kontakte data
    useEffect(() => {
        const fetchKontakte = async () => {
            setLoading(true)
            try {
                const response = await fetch('/api/kontakte')
                if (response.ok) {
                    const data = await response.json()
                    setKontakte(data)
                    setFilteredKontakte(data)
                }
            } catch (error) {
                console.error('Error fetching kontakte:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchKontakte()
    }, [])

    // Filter kontakte based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredKontakte(kontakte)
            return
        }

        const filtered = kontakte.filter(kontakt => {
            const searchLower = searchTerm.toLowerCase()
            return (
                kontakt.id.toString().includes(searchLower) ||
                kontakt.name.toLowerCase().includes(searchLower) ||
                kontakt.adresse.toLowerCase().includes(searchLower)
            )
        })
        setFilteredKontakte(filtered)
    }, [searchTerm, kontakte])

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

    const handleSelectKontakt = (kontakt: Kontakt) => {
        setSearchTerm(`${kontakt.name} - ${kontakt.adresse}`)
        onChange(name, kontakt.id)
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

            {isOpen && filteredKontakte.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredKontakte.map((kontakt) => (
                        <div
                            key={kontakt.id}
                            onClick={() => handleSelectKontakt(kontakt)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                            <div className="font-medium text-gray-900">
                                {kontakt.name}
                            </div>
                            <div className="text-sm text-gray-600">
                                ID: {kontakt.id} • {kontakt.adresse}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isOpen && !loading && filteredKontakte.length === 0 && searchTerm.trim() && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="px-3 py-2 text-gray-500">
                        Keine Kontakte gefunden
                    </div>
                </div>
            )}
        </div>
    )
} 