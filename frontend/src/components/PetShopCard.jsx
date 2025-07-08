import React from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';

const PetShopCard = ({ petShop }) => {
  return (
    <Link to={`/pet-shop/${petShop._id}`} className="block bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_5px_rgba(203,255,0,0.8)]">
      {petShop.shopPhotoUrl && (
        <img 
          src={petShop.shopPhotoUrl}
          alt={petShop.name} 
          className="w-full h-56 object-cover"
        />
      )}
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{petShop.name}</h3>
        <div className="flex items-center text-gray-500 mb-3">
          <IoLocationOutline className="mr-2" />
          <span>{petShop.location}</span>
        </div>
        <p className="text-gray-600 text-sm">{petShop.description}</p>
      </div>
    </Link>
  );
};

export default PetShopCard;
