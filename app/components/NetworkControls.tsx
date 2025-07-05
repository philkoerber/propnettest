'use client'

interface NetworkControlsProps {
    linkDistance: number
    repulsivity: number
    centeringStrength: number
    onLinkDistanceChange: (value: number) => void
    onRepulsivityChange: (value: number) => void
    onCenteringStrengthChange: (value: number) => void
    onReset: () => void
}

export default function NetworkControls({
    linkDistance,
    repulsivity,
    centeringStrength,
    onLinkDistanceChange,
    onRepulsivityChange,
    onCenteringStrengthChange,
    onReset
}: NetworkControlsProps) {
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Visualisierung anpassen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Verbindungsabstand: {linkDistance}
                    </label>
                    <input
                        type="range"
                        min="20"
                        max="150"
                        value={linkDistance}
                        onChange={(e) => onLinkDistanceChange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Abstoßung: {repulsivity}
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={repulsivity}
                        onChange={(e) => onRepulsivityChange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Zentrierung: {centeringStrength}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={centeringStrength}
                        onChange={(e) => onCenteringStrengthChange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
            <div className="mt-3">
                <button
                    onClick={onReset}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                    Zurücksetzen
                </button>
            </div>
        </div>
    )
} 