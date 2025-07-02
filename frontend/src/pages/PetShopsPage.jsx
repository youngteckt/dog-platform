import React, { useState, useEffect } from 'react';
import PetShopCard from '../components/PetShopCard';
import { apiFetch } from '../utils/api';

const PetShopsPage = () => {
  const [petShops, setPetShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPetShops = async () => {
      setLoading(true);
      try {
        const data = await apiFetch('/pet-shops');
        setPetShops(data);
      } catch (error) {
        console.error('Failed to fetch pet shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPetShops();
  }, []);

  const handleViewAllClick = () => {
    const directoryRef = document.getElementById('directory');
    directoryRef?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <p className="text-center mt-8">Loading pet shops...</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-16 md:py-24 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Explore all pet shops in Singapore</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Discover the best pet shops across Singapore. From premium pet supplies to professional grooming services, find everything your furry friends need.
        </p>
        <button 
          onClick={handleViewAllClick}
          className="bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors"
        >
          View All Shops
        </button>
      </div>

      {/* Pet Shops Directory */}
      <div id="directory" className="max-w-6xl mx-auto p-4 md:p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Pet Shops Directory</h2>
        <p className="text-gray-500 mb-8">{petShops.length} shops found</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {petShops.map(shop => (
            <PetShopCard key={shop._id} petShop={shop} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PetShopsPage;
