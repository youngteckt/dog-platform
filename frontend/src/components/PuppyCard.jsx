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
    <Link to={`/dogs/${puppy._id}`} className="block bg-white rounded-2xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 no-glow">
      <div className="relative">
        <img
          src={`${puppy.image}?w=400&h=300&c=fill&q=80`}
          alt={puppy.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold text-lg text-gray-800 truncate">{puppy.name}</h3>
            {puppy.age && (
              <p className="text-sm text-gray-600 whitespace-nowrap">{puppy.age} months old</p>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-2">{puppy.breed}</p>
          <p className="font-semibold text-gray-900">{formattedPrice}</p>
        </div>
      </div>
    </Link>
  );
};

export default PuppyCard;
