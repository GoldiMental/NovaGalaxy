import { useState } from 'react'
import Login from './Login.jsx'
import Register from './Register.jsx'
import './Styles/Landing-Page.css'

function App() {
  const [currentView, setCurrentView] = useState('login');

  const handleCreateAccountClick = () => {
    setCurrentView('register');
  };
  const handleBackToLoginClick = () => {
    setCurrentView('login');
  };

  return (
    <>
      <div className='App'>
        <header className='App-header'>
          <h1>NovaGalaxy<sup>®</sup></h1>
          {currentView === 'login' ? (
            <Login onCreateAccount={handleCreateAccountClick} />
          ):(
            <Register onBackToLogin={handleBackToLoginClick} />
          )}
        </header>
      </div>
    </>
  )
}

export default App
