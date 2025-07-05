'use client'

import { useEffect } from 'react'

export default function LinksPage() {
    useEffect(() => {
        const fetchBeziehungen = async () => {
            try {
                const response = await fetch('/api/beziehungen')
                const data = await response.json()
                console.log('Beziehungen API Response:', data)
            } catch (error) {
                console.error('Error fetching beziehungen:', error)
            }
        }

        fetchBeziehungen()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-serif text-gray-900">Links</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Verwalten Sie die Beziehungen zwischen Immobilien und Kontakten.
                </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Beziehungen Verwaltung</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Hier werden die Beziehungen zwischen Immobilien und Kontakten verwaltet.
                    </p>
                </div>
            </div>
        </div>
    );
} 