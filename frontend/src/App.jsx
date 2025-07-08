import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PetShopsPage from './pages/PetShopsPage';
import RegisterPetShopPage from './pages/RegisterPetShopPage';
import AllFiltersPage from './pages/AllFiltersPage';
import LoginPage from './pages/LoginPage';
import DogDetailsPage from './pages/DogDetailsPage';
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
          <Route path="/pet-shops" element={<PetShopsPage />} />
          <Route path="/filters" element={<AllFiltersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPetShopPage />} />
          <Route path="/dog/:id" element={<DogDetailsPage />} />
          <Route path="/pet-shop/:id" element={<PetShopDetailsPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;