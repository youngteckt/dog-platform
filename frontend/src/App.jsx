import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import RegisterPetShopPage from './pages/RegisterPetShopPage';

// Simple test components for other routes (keep these working)
const TestHomePage = () => <div style={{padding: '20px', backgroundColor: 'lightgreen'}}>✅ HOME PAGE WORKS</div>;
const TestFiltersPage = () => <div style={{padding: '20px', backgroundColor: 'lightyellow'}}>✅ FILTERS PAGE WORKS</div>;
const TestLoginPage = () => <div style={{padding: '20px', backgroundColor: 'lightcoral'}}>✅ LOGIN PAGE WORKS</div>;

function App() {
  return (
    <Router>
      <Header />
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
        <Routes>
          <Route path="/" element={<TestHomePage />} />
          <Route path="/filters" element={<TestFiltersPage />} />
          <Route path="/login" element={<TestLoginPage />} />
          <Route path="/register-pet-shop" element={<RegisterPetShopPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;