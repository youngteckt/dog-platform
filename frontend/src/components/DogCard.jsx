import React from 'react';
import { Link } from 'react-router-dom';

const DogCard = ({ dog }) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dog.price || 0);

  return (
    <Link to={`/dogs/${dog._id}`} className="block bg-white rounded-2xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 no-glow">
      <img
        src={`${dog.image}?w=400&h=400&c=fill&q=80`}
        alt={dog.name}
        className="aspect-square w-full object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-baseline gap-2">
          <h3 className="font-bold text-lg text-gray-800 truncate">{dog.name}</h3>
          {dog.age && (
            <p className="text-xs text-gray-600 whitespace-nowrap flex-shrink-0">{dog.age} months</p>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-2">{dog.breed}</p>
        <p className="font-semibold text-gray-900">{formattedPrice}</p>
      </div>
    </Link>
  );
};

export default DogCard;
