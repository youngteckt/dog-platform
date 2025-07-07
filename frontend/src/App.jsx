import React from 'react';

// Simple test component
const TestRegisterPage = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '400px' }}>
      <h1 style={{ color: 'red', fontSize: '32px' }}>🚨 NO ROUTER TEST: Register Pet Shop</h1>
      <p style={{ color: 'black', fontSize: '20px' }}>This bypasses React Router entirely</p>
      <p style={{ color: 'green', fontSize: '16px' }}>If you see this, Router was the problem!</p>
      <div style={{ backgroundColor: 'orange', padding: '10px', marginTop: '20px' }}>
        <strong>🎯 ROUTER REMOVED TEST</strong><br/>
        If you can see this orange box, React Router was causing the issue!
      </div>
    </div>
  );
};

// Import other pages
import HomePage from './pages/HomePage';
import DogDetailsPage from './pages/DogDetailsPage';
import AllFiltersPage from './pages/AllFiltersPage';
import LoginPage from './pages/LoginPage';
import PetShopsPage from './pages/PetShopsPage';
import PetShopDetailsPage from './pages/PetShopDetailsPage';

function App() {
  return (
    <div>
      <div style={{ backgroundColor: 'yellow', padding: '10px', textAlign: 'center' }}>
        <strong>🚨 ROUTER TEMPORARILY REMOVED FOR DEBUGGING</strong>
      </div>
      <main style={{ 
        position: 'relative',
        top: '0',
        left: '0',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
        padding: '20px',
        zIndex: '1'
      }}>
        <TestRegisterPage />
      </main>
    </div>
  );
}

export default App;