import React, { useState } from 'react';
import { loginUser } from './services/CognitoAuthService';
import './Styles/Login.css'

const Login = ({ onCreateAccount, onForgotPassword, onLoginSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleUsernameOrEmailChange = (event) => { setUsernameOrEmail(event.target.value); };
  const handlePasswordChange = (event) => { setPassword(event.target.value); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let validationErrors = {};
    if (!usernameOrEmail) {
      validationErrors.usernameOrEmail = 'Der Username fehlt!';
    }
    if (!password) {
      validationErrors.password = "Passwort fehlt!";
    }
    setErrors(validationErrors);
    setServerError('');

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);

      const result = await loginUser(usernameOrEmail, password);

      if (!result.success) {
        setServerError(result.msg);
      } else {
        console.log('Login erfolgreich!');
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
      setLoading(false);
    }
  };

  return (
    <div className='login-container'>
      <div className='login-title'>Login</div>
      <form onSubmit={handleSubmit}>
        <div className='login-label-container'>
          <div className='label-group'>
            <label htmlFor='usernameOrEmail'>Username/Email:</label>
            <input type='text' id='usernameOrEmail' value={usernameOrEmail} onChange={handleUsernameOrEmailChange} autoComplete='username' />
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
      <button type='button' onClick={onForgotPassword}>Passwort?</button>
      <button type='button' onClick={onCreateAccount}>Registrieren</button>
    </div>
  );
};

export default Login;