'use client'

import { useState } from 'react'

interface SearchBarProps {
    placeholder?: string
    value?: string
    onChange?: (value: string) => void
    className?: string
    onSearch?: (searchTerm: string) => void
}

export default function SearchBar({
    placeholder = "Suchen...",
    value,
    onChange,
    className = '',
    onSearch
}: SearchBarProps) {
    const [internalValue, setInternalValue] = useState('')

    // Use controlled value if provided, otherwise use internal state
    const displayValue = value !== undefined ? value : internalValue

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInternalValue(newValue)
        onChange?.(newValue)
        onSearch?.(newValue)
    }

    return (
        <div className={`relative ${className}`}>
            <input
                type="text"
                placeholder={placeholder}
                value={displayValue}
                onChange={handleChange}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>
    )
} 