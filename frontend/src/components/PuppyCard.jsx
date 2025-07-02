import React from 'react';
import { Link } from 'react-router-dom';

const PuppyCard = ({ puppy }) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(puppy.price || 0);

  return (
    <Link to={`/dogs/${puppy._id}`} className="block bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-[0_0_20px_5px_rgba(203,255,0,0.8)]">
      <img 
        src={puppy.image || '/dog-placeholder.png'}
        alt={puppy.name}
        className="w-full h-40 object-contain"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800">{puppy.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{puppy.breed}</p>
        <p className="font-semibold text-gray-900">{formattedPrice}</p>
      </div>
    </Link>
  );
};

export default PuppyCard;
