import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DogDetailsPage from './pages/DogDetailsPage';
import AllFiltersPage from './pages/AllFiltersPage';
import Header from './components/Header';
import RegisterPetShopPage from './pages/RegisterPetShopPage';
import LoginPage from './pages/LoginPage';
import PetShopsPage from './pages/PetShopsPage';
import PetShopDetailsPage from './pages/PetShopDetailsPage';

function App() {
  return (
    <Router>
      <Header />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dogs/:id" element={<DogDetailsPage />} />
          <Route path="/filters" element={<AllFiltersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-pet-shop" element={<RegisterPetShopPage />} />
          <Route path="/pet-shops" element={<PetShopsPage />} />
          <Route path="/pet-shops/:id" element={<PetShopDetailsPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;