import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route} from 'react-router-dom';

// WICHTIG: Die Import-Pfade müssen in Ihrem lokalen Projekt korrekt sein.
import { CognitoAuthService } from './services/CognitoAuthService'; 
import { useCognitoAuth } from './hooks/useCognitoAuth';
import { DashboardView } from './views/DashboardView';
import { LoginView } from './views/LoginView';

const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard', 
  FORGOT_PASSWORD: 'forgot_password',
  RESET_PASSWORD: 'reset_password', 
}

// Platzhalter-Komponente für unvollständige Ansichten
const PlaceholderView = ({ viewName, onBackToLogin }) => (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Ansicht: {viewName}</h2>
        <p className="text-gray-500 mb-6">Die Logik für diese Ansicht müsste implementiert werden.</p>
        <button 
            onClick={onBackToLogin} 
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
            Zurück zum Login
        </button>
    </div>
);


function App() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [authService, setAuthService] = useState(null);
  const [sdkLoadError, setSdkLoadError] = useState(false);

  // 1. DYNAMISCHES LADEN DES AWS COGNITO SDKS
  useEffect(() => {
    const sdkUrl = 'https://unpkg.com/amazon-cognito-identity-js@latest/dist/amazon-cognito-identity.min.js';
    
    // Prüfen, ob das SDK bereits geladen ist (lokaler Workaround)
    if (window.CognitoUserPool) {
        setSdkLoaded(true);
        return;
    }

    const script = document.createElement('script');
    script.src = sdkUrl;
    script.onload = () => {
        console.log('Cognito SDK erfolgreich geladen.');
        setSdkLoaded(true);
    };
    script.onerror = () => {
        console.error('Fehler beim Laden des Cognito SDKs von CDN.');
        setSdkLoadError(true);
    };
    document.head.appendChild(script);

    return () => {
        document.head.removeChild(script);
    };
  }, []);
  
  // 2. INITIALISIERUNG DES AUTH SERVICE, SOBALD DAS SDK BEREIT IST
  useEffect(() => {
    if (sdkLoaded && !authService) {
        // Service wird initialisiert, sobald das SDK und die Klasse verfügbar sind
        setAuthService(new CognitoAuthService());
    }
  }, [sdkLoaded, authService]);

  
  // 3. Verwende den Hook mit dem initialisierten Service
  const auth = useCognitoAuth(authService);
  const {user, logout, loading, login} = auth;
  const [currentView, setCurrentView] = useState(VIEWS.LOGIN);

  
  const AppContent = () => {
    
    if (sdkLoadError) {
        return <div className="text-center p-12 text-red-600 font-bold">FEHLER: Das Cognito SDK konnte nicht geladen werden.</div>;
    }

    if (!sdkLoaded || loading) {
        // Zeige den Ladezustand an, solange das SDK lädt ODER der Session-Check läuft
        return (
             <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans'>
                <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="mt-4 text-gray-700">Wird geladen...</div>
             </div>
        );
    }
    
    if (user) { 
      return (
        <DashboardView userToken={user} logout={logout} />
      );
    }

    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans'>
        <header className='mb-8'>
          <h1 className="text-4xl font-extrabold text-gray-900">NovaGalaxy<sup className="text-indigo-600">®</sup></h1>
        </header>
        
        {/* Haupt-Switch für die verschiedenen Ansichten */}
        {currentView === VIEWS.LOGIN ? (
          <LoginView 
            login={login} 
            onCreateAccount={() => setCurrentView(VIEWS.REGISTER)}
            onForgotPassword={() => setCurrentView(VIEWS.FORGOT_PASSWORD)}
          />
        ) : currentView === VIEWS.REGISTER ? (
            <PlaceholderView viewName="Registrieren" onBackToLogin={() => setCurrentView(VIEWS.LOGIN)} />
        ) : currentView === VIEWS.FORGOT_PASSWORD ? (
            <PlaceholderView viewName="Passwort vergessen" onBackToLogin={() => setCurrentView(VIEWS.LOGIN)} />
        ) : (
             <PlaceholderView viewName="Unbekannte Ansicht" onBackToLogin={() => setCurrentView(VIEWS.LOGIN)} />
        )}
      </div>
    )
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/reset-password/:token" element={<PlaceholderView viewName={VIEWS.RESET_PASSWORD} onBackToLogin={() => setCurrentView(VIEWS.LOGIN)} />} />
        <Route path="/" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
/*

### Nächste Schritte:

1.  **Dateien einfügen:** Erstellen Sie die entsprechenden Ordner (`src/services`, `src/hooks`, `src/views`) und speichern Sie die Dateien an den angegebenen Pfaden.
2.  **Konfigurieren:** Tragen Sie Ihre **Cognito IDs** in `src/services/CognitoAuthService.js` und Ihre **API Gateway URL** in `src/views/DashboardView.jsx` ein.
3.  **Abhängigkeiten:** Stellen Sie sicher, dass Sie alle notwendigen NPM-Pakete (`react`, `react-router-dom`) installiert haben und das AWS Cognito SDK (z.B. über ein `<script>`-Tag in Ihrer `index.html` oder via `npm install amazon-cognito-identity-js`) verfügbar ist, damit die `window.CognitoUserPool` Variable korrekt gesetzt wird.

*/