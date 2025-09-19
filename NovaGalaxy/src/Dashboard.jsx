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
        if (!user || !user.token) {
          setError('Nicht authentifiziert. Kein Token gefunden.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/protected/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': user.token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          const errData = await response.json();
          setError(errData.msg || 'Fehler beim Abrufen der Daten.');
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
    <div>
      <h2>Willkommen im Dashboard!</h2>
      <p>Ihre Benutzer-ID: {userData ? userData._id : 'Unbekannt'}</p>
      <p>Ihr Benutzername: {userData ? userData.username : 'Unbekannt'}</p>
      <p>Ihre E-Mail: {userData ? userData.email : 'Unbekannt'}</p>
    </div>
  );
};

export default Dashboard;