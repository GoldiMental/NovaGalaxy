import React, { useState } from 'react';
import { API_URL } from './dev.jsx';
import './Styles/Login.css'

const Login = ({onCreateAccount}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleUsernameOrEmailChange = (event) => {setUsernameOrEmail(event.target.value);};
  const handlePasswordChange = (event) => {setPassword(event.target.value);};

  const handleSubmit = async (event) => {
    //Offline-Validation
    event.preventDefault();
    let validationErrors = {};
    if(!usernameOrEmail) {
      validationErrors.usernameOrEmail = 'Der Username fehlt!';
    }
    if(!password){
      validationErrors.password = "Passwort fehlt!";
    }
    setErrors(validationErrors);
    setServerError('');
    //Server-Communication
    if(Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernameOrEmail, password }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Login erfolgreich!', data.msg);
        } else {
          setServerError(data.msg || 'Login fehlgeschlagen.');
        }
      } catch (error) {
        console.error('Fetch-Fehler:', error);
        setServerError('Netzwerkfehler. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className='login-container'>
      <div className='login-title'>Login</div>
      <form onSubmit={handleSubmit}>
        <div className='login-label-container'>
          <div className='label-group'>
            <label htmlFor='usernameOrEmail'>Username/Email:</label>
            <input type='text' id='usernameOrEmail' value={usernameOrEmail} onChange={handleUsernameOrEmailChange} autoComplete='username'/>
            {errors.usernameOrEmail && <p className='error-message'>{errors.usernameOrEmail}</p>}
          </div>
          <div className='label-group'>  
            <label htmlFor='password'>Passwort:</label>
            <input type='password' id='password' value={password} onChange={handlePasswordChange} autoComplete="current-password" />
            {errors.password && <p className='error-message'>{errors.password}</p>}
          </div>
        </div>
        {loading && <p>Anmeldung wird verarbeitet...</p>}
        {serverError && <p className='error-message'>{serverError}</p>}
        <button type='submit'>Einloggen</button>
      </form>
      <button type='button'>Passwort?</button>
      <button type='button' onClick={onCreateAccount}>Registrieren</button>
    </div>
  );
};

export default Login;