import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';

// Simple test component
const TestRegisterPage = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '400px' }}>
      <h1 style={{ color: 'red', fontSize: '32px' }}>🚨 DIRECT TEST: Register Pet Shop</h1>
      <p style={{ color: 'black', fontSize: '20px' }}>This is a direct test in App.jsx</p>
      <p style={{ color: 'green', fontSize: '16px' }}>If you see this, routing works but RegisterPetShopPage component has issues</p>
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
          <Route path="/" element={<HomePage />} />
          <Route path="/dogs/:id" element={<DogDetailsPage />} />
          <Route path="/filters" element={<AllFiltersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-pet-shop" element={<TestRegisterPage />} />
          <Route path="/pet-shops" element={<PetShopsPage />} />
          <Route path="/pet-shops/:id" element={<PetShopDetailsPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;