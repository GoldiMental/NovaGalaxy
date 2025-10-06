import React, { useState, useEffect } from 'react';

// Simulierter API Endpunkt (Muss konfiguriert werden)
// ACHTUNG: Hier muss Ihr API Gateway Endpunkt rein!
const API_URL = 'https://your-api-gateway-id.execute-api.eu-central-1.amazonaws.com/dev'; 

export const DashboardView = ({ userToken, logout }) => {
    const [userData, setUserData] = useState(null);
    const [message, setMessage] = useState("Lade Benutzerdaten...");

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userToken) {
                setMessage("Fehlender Token.");
                return;
            }
            if (API_URL.includes('your-api-gateway-id')) {
                setMessage("API-URL nicht konfiguriert! Prüfe nur den Authentifizierungsfluss.");
                return;
            }

            try {
                // Aufruf des geschützten Endpunkts mit JWT als Bearer Token
                const response = await fetch(`${API_URL}/protected/user`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`, // Hinzufügen des Tokens
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    setMessage("Daten erfolgreich abgerufen (Status 200).");
                } else if (response.status === 401) {
                    setMessage("Autorisierungsfehler (401). Token abgelehnt.");
                } else {
                    setMessage(`Fehler beim Abrufen der Daten: Status ${response.status}`);
                }
            } catch (error) {
                setMessage("Netzwerkfehler: Konnte API nicht erreichen.");
            }
        };

        fetchUserData();
    }, [userToken]);


    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <h2 className="text-3xl font-bold mb-6 text-indigo-700">NovaGalaxy Dashboard</h2>
            <div className="bg-white p-6 rounded-xl shadow-2xl border border-indigo-200">
                <p className="mb-4 text-sm font-medium text-gray-700">
                    Status: <span className="text-green-600 font-semibold">{message}</span>
                </p>
                
                <h3 className="text-xl font-semibold mb-2 mt-4">Abgerufene Daten:</h3>
                {userData ? (
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm text-gray-800">
                        {JSON.stringify(userData, null, 2)}
                    </pre>
                ) : (
                    <p className="text-sm text-gray-500">Warte auf Daten...</p>
                )}

                <h3 className="text-xl font-semibold mt-6 mb-2">Ihr JWT-Token:</h3>
                <p className="break-all text-xs bg-yellow-100 p-3 rounded-lg text-gray-700">
                    {userToken || "Token nicht verfügbar"}
                </p>
            </div>
            <button 
                onClick={logout} 
                className="mt-8 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition duration-150"
            >
                Abmelden
            </button>
        </div>
    );
};