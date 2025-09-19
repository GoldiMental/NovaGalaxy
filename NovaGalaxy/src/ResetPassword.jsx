import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from './dev.jsx';
import './Styles/Login.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_URL}/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.msg + ' Zurück zur Anmeldung...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.msg || 'Fehler beim Zurücksetzen des Passworts.');
      }
    } catch (err) {
      setError('Netzwerkfehler. Konnte nicht zum Server verbinden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-container'>
      <div className='login-title'>Neues Passwort</div>
      <form onSubmit={handleSubmit}>
        <div className='login-label-container'>
          <div className='label-group'>
            <label htmlFor='new-password'>Neues Passwort:</label>
            <input
              type='password'
              id='new-password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className='label-group'>
            <label htmlFor='confirm-password'>Passwort bestätigen:</label>
            <input
              type='password'
              id='confirm-password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p className='error-message'>{error}</p>}
          </div>
        </div>
        {loading && <p>Passwort wird zurückgesetzt...</p>}
        {message && <p className='success-message'>{message}</p>}
        <button type='submit' disabled={loading}>Passwort zurücksetzen</button>
      </form>
    </div>
  );
};

export default ResetPassword;