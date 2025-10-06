import React, { useState, useEffect } from 'react';
import { useAuth } from './authContext.jsx';
import { API_URL } from './dev.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = user?.token || sessionStorage.getItem('novaGalaxyJWT');

        if (!token) {
          setError('Nicht authentifiziert. Kein Token gefunden.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/protected/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          if (response.status === 401) {
            setError('Autorisierung fehlgeschlagen. Token ungültig oder abgelaufen (401).');
          } else {
            const errData = await response.json();
            setError(errData.msg || `Fehler beim Abrufen der Daten. Status: ${response.status}`);
          }
        }
      } catch (err) {
        console.error('Fetch-Fehler:', err);
        setError('Netzwerkfehler. Konnte nicht zum Server verbinden.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return <p>Lade Benutzerdaten...</p>;
  }

  if (error) {
    return <p className="error-message">Fehler: {error}</p>;
  }

  return (
    <div className="p-8 max-w-lg mx-auto bg-gray-800 text-white rounded-xl shadow-2xl mt-10">
      <h2 className="text-3xl font-bold mb-4 border-b border-gray-700 pb-2">Willkommen im Nova Galaxy Dashboard!</h2>
      {userData ? (
        <div className="space-y-3">
          <p className="text-lg">
            **Benutzer-ID:** <span className="font-mono text-sm bg-gray-700 p-1 rounded">{userData._id}</span>
          </p>
          <p className="text-lg">
            **Benutzername:** <span className="text-yellow-400 font-semibold">{userData.username}</span>
          </p>
          <p className="text-lg">
            **E-Mail:** <span>{userData.email}</span>
          </p>
          <p className="text-green-400 mt-4">**Status:** Geschützte Daten erfolgreich aus der MongoDB abgerufen!</p>
        </div>
      ) : (
        <p>Daten werden geladen oder sind nicht verfügbar.</p>
      )}
    </div>
  );
};

export default Dashboard;
