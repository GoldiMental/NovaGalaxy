import React, { useState } from 'react';
import { useAuth } from './authContext.jsx';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './Login.jsx'
import Register from './Register.jsx'
import Dashboard from './Dashboard.jsx';
import ForgotPassword from './ForgotPassword.jsx';
import ResetPassword from './ResetPassword.jsx';
import './Styles/App.css';

const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
  FORGOT_PASSWORD: 'forgot_password',
}

function App() {
  const {user, logout, loading} = useAuth();
  const [currentView, setCurrentView] = useState(VIEWS.LOGIN);

  console.log('App.jsx rendert. Aktueller Benutzerstatus:', user);
  if(loading){
    return <div>Wird geladen...</div>;
  }
  const AppContent = () => {
  if (user) {
    return (
      <div className='App'>
        <Dashboard />
        <button onClick={logout}>Abmelden</button>
      </div>
    );
  }

  return (
    <>
      <div className='App'>
        <header className='App-header'>
          <h1>NovaGalaxy<sup>®</sup></h1>
          {currentView === VIEWS.LOGIN ? (
            <Login 
              onCreateAccount={() => setCurrentView(VIEWS.REGISTER)}
              onForgotPassword={() => setCurrentView(VIEWS.FORGOT_PASSWORD)}
            />
          ) : currentView === VIEWS.REGISTER ? (
            <Register onBackToLogin={() => setCurrentView(VIEWS.LOGIN)} />
          ) : (
            <ForgotPassword onBackToLogin={()=> setCurrentView(VIEWS.LOGIN)} />
          )}
        </header>
      </div>
    </>
  )
};

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
