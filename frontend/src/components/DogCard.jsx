import React from 'react';
import { Link } from 'react-router-dom';

const DogCard = ({ dog }) => {
  if (!dog) {
    return null;
  }

  return (
    <div key={dog._id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group hover:shadow-[0_0_20px_5px_rgba(203,255,0,0.8)]">
      <Link to={`/dogs/${dog._id}`}>
        <div className="p-2">
          <img
            src={dog.image}
            alt={dog.name}
            className="w-full h-48 object-contain rounded-xl group-hover:opacity-80 transition-opacity"
          />
        </div>
        <div className="p-4 pt-2">
          <h2 className="text-lg font-bold text-gray-800 truncate" title={dog.name}>{dog.name}</h2>
          <p className="text-sm text-gray-600 truncate">{dog.breed}</p>
          <p className="text-base font-medium text-gray-900 mt-2">${dog.price.toLocaleString()}</p>
        </div>
      </Link>
    </div>
  );
};

export default DogCard;
