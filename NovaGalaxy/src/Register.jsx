import React, { useState } from 'react';
import { API_URL } from './dev.jsx';
import './Styles/Register.css';

const Register = ({onBackToLogin}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreedToAGB, setAgreedToAGB] = useState(false);
  const [agreedToDSE, setAgreedToDSE] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleUsernameChange = (event) => {setUsername(event.target.value);};

  const handleEmailChange = (event) => {setEmail(event.target.value);};

  const handlePasswordChange = (event) => {setPassword(event.target.value);};

  const handlePasswordConfirmChange = (event) => {setPasswordConfirm(event.target.value);};

  const handleAgreedToAGBChange = (event) => {setAgreedToAGB(event.target.checked);};

  const handleAgreedToDSEChange = (event) => {setAgreedToDSE(event.target.checked);};

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Offline-Validation
    let validationErrors = {};
    if(!username) {validationErrors.username = 'Der Username fehlt!';}
    if(!email.includes('@')) {validationErrors.email = "E-Mail-Adresse ungültig!";}
    if(password.length < 6){validationErrors.password = "Passwort zu kurz!";}
    if(password !== passwordConfirm) {validationErrors.passwordConfirm = "Passwörter stimmen nicht überein!";}
    if (!agreedToAGB || !agreedToDSE) {validationErrors.terms = "AGB oder Datenschutzerklärung nicht zugestimmt!";}
    setErrors(validationErrors);
    //Server-Communication
    if(Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await fetch(API_URL+'/register', {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify({username, email, password, agreedToAGB, agreedToDSE,}),
        });
        const data = await response.json();
        if(response.ok){
          onBackToLogin();
        } else {
          setServerError(data.msg || 'Registrierung fehlgeschlagen!');
        }
      } catch (error) {
        console.error('Fetch-Fehler:', error);
        setServerError('Netzwerkfehler. Bitter versuchen Sie es später erneut.')
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className='register-container'>
      <div className='register-title'>Konto erstellen</div>
      <form onSubmit={handleSubmit}>
        <div className='register-label-container'>
          <div className='label-group'>
            <label htmlFor='username'>Benutzername:</label>
            <input type='text' id='username' value={username} onChange={handleUsernameChange} />
            {errors.username && <p className='error-message'>{errors.username}</p>}
          </div>
          <div className='label-group'>
            <label htmlFor='email'>Email-Adresse:</label>
            <input type='email' id='email' value={email} onChange={handleEmailChange} autoComplete='email' />
            {errors.email && <p className='error-message'>{errors.email}</p>}
          </div>
          <div className='label-group'>
            <label htmlFor='password'>Passwort:</label>
            <input type='password' id='password' value={password} onChange={handlePasswordChange} autoComplete='new-password'/>
            {errors.password && <p className='error-message'>{errors.password}</p>}
          </div>
          <div className='label-group'>
            <label htmlFor='passwordConfirm'>Passwort wiederholen:</label>
            <input type='password' id="passwordConfirm" value={passwordConfirm} onChange={handlePasswordConfirmChange} autoComplete='new-password' />
            {errors.passwordConfirm && <p className='error-message'>{errors.passwordConfirm}</p>}
          </div>
          <div className='checkbox-group'>
            <label htmlFor='agreedToAGB'>
              <input type='checkbox' id='agreedToAGB' checked={agreedToAGB} onChange={handleAgreedToAGBChange} />Ich habe die <a target='_blank' href="agb.html">AGB von GoldiMental</a> gelesen und akzeptiere sie.
            </label>
            <label htmlFor='agreedToDSE'>
              <input type='checkbox' id='agreedToDSE' checked={agreedToDSE} onChange={handleAgreedToDSEChange} />Ich habe die <a target='_blank' href="datenschutz.html">Datenschutzerklärung zu Nova Galaxy</a> gelesen und akzeptiere sie.
            </label>
            {errors.terms && <p className='error-message'>{errors.terms}</p>}
          </div>
        </div>
        {loading && <p>Registrierung wird verarbeitet...</p>}
        {serverError && <p className='error-message'>{serverError}</p>}
        <button type='submit' disabled={loading}>{loading ? 'Lädt...' : 'Erstellen'}</button>
      </form>
      <button type='button' onClick={onBackToLogin}>Einloggen</button>
    </div>
  );
};

export default Register;