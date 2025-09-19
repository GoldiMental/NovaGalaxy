import React, { useState } from 'react';
import { API_URL } from './dev.jsx';
import './Styles/Login.css'; // Verwende dieselben Styles für eine konsistente Optik

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) {
      setError('Bitte gib deine E-Mail-Adresse ein.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.msg); // Erfolgreiche Nachricht anzeigen
      } else {
        setError(data.msg || 'Fehler beim Senden der Anfrage.'); // Fehlermeldung anzeigen
      }
    } catch (err) {
      setError('Netzwerkfehler. Konnte nicht zum Server verbinden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-container'>
      <div className='login-title'>Passwort vergessen?</div>
      <form onSubmit={handleSubmit}>
        <div className='login-label-container'>
          <div className='label-group'>
            <label htmlFor='email'>E-Mail-Adresse:</label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className='error-message'>{error}</p>}
          </div>
        </div>
        {loading && <p>Sende E-Mail...</p>}
        {message && <p className='success-message'>{message}</p>}
        <button type='submit' disabled={loading}>Link senden</button>
      </form>
      <button type='button' onClick={onBackToLogin}>Zurück zum Login</button>
    </div>
  );
};

export default ForgotPassword;