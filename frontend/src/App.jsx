import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

// Simple test components (inline, no imports)
const TestHomePage = () => <div style={{padding: '20px', backgroundColor: 'lightgreen'}}>✅ HOME PAGE WORKS</div>;
const TestRegisterPage = () => (
  <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '400px' }}>
    <h1 style={{ color: 'red', fontSize: '32px' }}>🎉 ROUTER WORKS! Register Pet Shop</h1>
    <p style={{ color: 'black', fontSize: '20px' }}>React Router is working with simple components!</p>
    <p style={{ color: 'green', fontSize: '16px' }}>The issue was with imported page components, not Router itself.</p>
    <div style={{ backgroundColor: 'orange', padding: '10px', marginTop: '20px' }}>
      <strong>🎯 ROUTER + SIMPLE COMPONENTS TEST</strong><br/>
      Now we know one of the imported page components has a critical error!
    </div>
  </div>
);
const TestFiltersPage = () => <div style={{padding: '20px', backgroundColor: 'lightyellow'}}>✅ FILTERS PAGE WORKS</div>;
const TestLoginPage = () => <div style={{padding: '20px', backgroundColor: 'lightcoral'}}>✅ LOGIN PAGE WORKS</div>;

function App() {
  return (
    <Router>
      <div style={{ backgroundColor: 'yellow', padding: '10px', textAlign: 'center' }}>
        <strong>🚨 TESTING ROUTER WITH SIMPLE COMPONENTS</strong>
      </div>
      
      {/* Simple Navigation Menu */}
      <nav style={{ backgroundColor: '#333', padding: '10px', textAlign: 'center' }}>
        <Link to="/" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>🏠 Home</Link>
        <Link to="/register-pet-shop" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>📝 Register Pet Shop</Link>
        <Link to="/filters" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>🔍 Filters</Link>
        <Link to="/login" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>🔐 Login</Link>
      </nav>
      
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
          <Route path="/register-pet-shop" element={<TestRegisterPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;