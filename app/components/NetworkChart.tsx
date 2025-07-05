'use client'

import { ResponsiveNetwork } from '@nivo/network'
import { useMemo } from 'react'

interface Relationship {
    id: string
    immobilien_id: string
    kontakt_id: string
    art: string
    startdatum: string
    enddatum?: string
    immobilien_summary?: string
    kontakt_summary?: string
}

interface NetworkChartProps {
    data: Relationship[]
    loading: boolean
    error: string | null
}

export default function NetworkChart({
    data,
    loading,
    error
}: NetworkChartProps) {
    const networkData = useMemo(() => {
        console.log('NetworkChart received data:', data)

        if (!data || data.length === 0) {
            console.log('No data provided to NetworkChart')
            return { nodes: [], links: [] }
        }

        const getRelationshipColor = (art: string) => {
            switch (art) {
                case 'Eigentümer':
                    return '#ef4444' // Red
                case 'Mieter':
                    return '#f59e0b' // Orange
                case 'Dienstleister':
                    return '#8b5cf6' // Purple
                default:
                    return '#6b7280' // Gray
            }
        }

        const nodes: any[] = []
        const links: any[] = []
        const nodeIds = new Set<string>()

        // Process relationships to create nodes and links
        data.forEach((relationship) => {
            const immobilienId = `immobilien_${relationship.immobilien_id}`
            const kontaktId = `kontakt_${relationship.kontakt_id}`

            // Add immobilien node if not already added
            if (!nodeIds.has(immobilienId)) {
                nodes.push({
                    id: immobilienId,
                    size: 24,
                    color: '#3b82f6' // Blue for immobilien
                })
                nodeIds.add(immobilienId)
            }

            // Add kontakt node if not already added
            if (!nodeIds.has(kontaktId)) {
                nodes.push({
                    id: kontaktId,
                    size: 20,
                    color: '#10b981' // Green for kontakte
                })
                nodeIds.add(kontaktId)
            }

            // Add link between immobilien and kontakt
            links.push({
                source: immobilienId,
                target: kontaktId,
                color: getRelationshipColor(relationship.art),
                distance: 80,
                art: relationship.art,
                startdatum: relationship.startdatum,
                enddatum: relationship.enddatum,
            })
        })

        const result = { nodes, links }
        console.log('Processed networkData:', result)
        return result
    }, [data])



    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-gray-600">Lade Beziehungen...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-red-600">Fehler beim Laden: {error}</div>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-gray-600">Keine Beziehungen gefunden</div>
            </div>
        )
    }

    console.log('Rendering ResponsiveNetwork with data:', networkData)

    return (
        <div className="w-full h-96 border border-gray-200 rounded-lg overflow-hidden">
            <ResponsiveNetwork
                data={networkData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                centeringStrength={0.3}
                repulsivity={6}
                nodeSize={n => n.size}
                nodeColor={n => n.color}
                linkThickness={2}
                linkColor="#999999"
            />
        </div>
    )
} 