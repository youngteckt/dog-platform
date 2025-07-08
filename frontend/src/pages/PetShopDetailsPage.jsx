import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PuppyCard from '../components/PuppyCard';
import { apiFetch } from '../utils/api';

const PetShopDetailsPage = () => {
  const { id } = useParams();
  const [petShop, setPetShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPetShopDetails = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/pet-shops/${id}`);
        setPetShop(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPetShopDetails();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  if (!petShop) {
    return <div className="text-center py-10">Pet shop not found.</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">{petShop.name}</h1>
        
        <img 
          src={petShop.shopPhotoUrl || '/shop-placeholder.png'} 
          alt={petShop.name} 
          className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-lg mb-8"
        />

        {/* Company Description */}
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-bold text-blue-600 mb-3">Company:</h2>
          <p className="text-gray-700 leading-relaxed">{petShop.description || 'No description available.'}</p>
        </div>

        {/* Available Puppies */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Available Puppies</h2>
          {petShop.puppies && petShop.puppies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {petShop.puppies.map(puppy => (
                <PuppyCard key={puppy._id} puppy={puppy} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">This shop has no puppies available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetShopDetailsPage;