import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import RegisterPetShopPage from './pages/RegisterPetShopPage';
import HomePage from './pages/HomePage';
import FiltersPage from './pages/FiltersPage';
import LoginPage from './pages/LoginPage';

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
          <Route path="/filters" element={<FiltersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPetShopPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;