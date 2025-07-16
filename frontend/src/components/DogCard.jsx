import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DogCard = ({ dog }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!dog || !dog.image) {
    return null;
  }

  // --- Image Optimization with Cloudinary ---
  const cloudName = 'ddkyuhxmd';
  // Transformations: f_auto (auto format), q_auto (auto quality), w_400 (width 400px), c_limit (don't scale up)
  const transformations = 'f_auto,q_auto,w_400,c_limit';
  const optimizedImageUrl = `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${encodeURIComponent(dog.image)}`;

  return (
    <div key={dog._id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group hover:shadow-[0_0_20px_5px_rgba(203,255,0,0.8)]">
      <Link to={`/dog/${dog._id}`}>
        <div className="p-2 relative">
          {/* Loading placeholder */}
          {!imageLoaded && !imageError && (
            <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          
          {/* Error placeholder */}
          {imageError && (
            <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-xs">Image unavailable</p>
              </div>
            </div>
          )}
          
          {/* Actual image */}
          <img
            src={optimizedImageUrl}
            alt={dog.name}
            loading="lazy"
            className={`w-full h-48 object-contain rounded-xl group-hover:opacity-80 transition-opacity ${
              imageLoaded ? 'block' : 'hidden'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
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
