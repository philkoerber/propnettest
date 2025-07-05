export default function NetworkLegend() {
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Legende</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <h4 className="font-medium text-gray-700 mb-2">Knoten</h4>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            <span className="text-gray-600">Immobilien</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <span className="text-gray-600">Kontakte</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="font-medium text-gray-700 mb-2">Beziehungen</h4>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-0.5 bg-red-500"></div>
                            <span className="text-gray-600">Eigentümer</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-0.5 bg-orange-500"></div>
                            <span className="text-gray-600">Mieter</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-0.5 bg-purple-500"></div>
                            <span className="text-gray-600">Dienstleister</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
                <p>💡 Tipp: Auf Verbindung klicken, um zu bearbeiten. (Achtung: Nur im Premium-Tier verfügbar!!1!)</p>
            </div>
        </div>
    )
} 