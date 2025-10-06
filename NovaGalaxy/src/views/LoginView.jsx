import React, { useState } from 'react';
import { CognitoAuthService } from '../services/CognitoAuthService'; 

// Um die Konfiguration vor dem Login zu prüfen
const authServiceInstance = new CognitoAuthService();
const poolData = authServiceInstance.getPoolData();

export const LoginView = ({ login, onCreateAccount, onForgotPassword }) => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Prüfen, ob Cognito konfiguriert ist
        if (poolData.UserPoolId.includes('YOUR_COGNITO')) {
             setMessage('Bitte konfigurieren Sie zuerst die Cognito IDs in der CognitoAuthService.js!');
             setLoading(false);
             return;
        }

        const result = await login(usernameOrEmail, password);

        if (!result.success) {
            setMessage(`Anmeldung fehlgeschlagen: ${result.msg}`);
        }
        setLoading(false);
    };

    const inputClasses = "w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500";
    const buttonClasses = "w-full p-3 font-semibold text-white rounded-lg transition duration-150 shadow";
    const linkClasses = "text-indigo-600 hover:text-indigo-800 text-sm mt-3 block text-center";

    return (
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Anmelden bei NovaGalaxy</h2>
            
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    value={usernameOrEmail} 
                    onChange={(e) => setUsernameOrEmail(e.target.value)} 
                    placeholder="Benutzername oder E-Mail" 
                    className={inputClasses}
                    required 
                />
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Passwort" 
                    className={inputClasses}
                    required 
                />
                
                {message && (
                    <p className="text-red-500 text-sm mb-4 text-center">{message}</p>
                )}

                <button 
                    type="submit" 
                    className={`${buttonClasses} ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`} 
                    disabled={loading}
                >
                    {loading ? 'Logge ein...' : 'Einloggen'}
                </button>
            </form>
            
            <button type="button" onClick={onForgotPassword} className={linkClasses}>
                Passwort vergessen?
            </button>
            <button type="button" onClick={onCreateAccount} className={`${linkClasses} mt-1`}>
                Noch kein Konto? Jetzt registrieren.
            </button>
        </div>
    );
};