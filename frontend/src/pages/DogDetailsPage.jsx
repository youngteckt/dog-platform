import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaWhatsapp, FaStoreAlt } from 'react-icons/fa';
import { apiFetch } from '../utils/api';

const DogDetailsPage = () => {
  const { id } = useParams();
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchDogDetails = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/dogs/${id}`);
        setDog(data);
        // Set the main image from the 'photos' field, with fallback to 'image'
        if (data.photos && data.photos.length > 0) {
          setSelectedImage(data.photos[0].url);
        } else if (data.image) {
          setSelectedImage(data.image);
        }
      } catch (error) {
        console.error('Failed to load dog details page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDogDetails();
  }, [id]);

  // Use 'photos' from Airtable if available, otherwise fallback to 'image'
  const images = dog && dog.photos && dog.photos.length > 0
    ? dog.photos.map(p => p.url)
    : (dog && dog.image ? [dog.image] : []);

  if (loading) {
    return <p className="text-center mt-8">Loading details...</p>;
  }

  if (!dog) {
    return <p className="text-center mt-8 text-red-500">Could not load dog details.</p>;
  }

  const DetailRow = ({ label, value }) => (
    <div className="flex justify-between py-3 border-b border-gray-200">
      <p className="text-gray-600">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      {/* Title for Mobile */}
      <h1 className="text-4xl font-bold text-center my-4 lg:hidden">{dog.name}</h1>

      {/* Main Grid for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
        {/* Left Column: Image Gallery (Sticky on Desktop) */}
        <div className="lg:sticky top-4 self-start">
          <div className="mb-6">
            <img src={selectedImage} alt={dog.name} className="w-full h-auto object-cover rounded-2xl shadow-lg mb-4" />
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${dog.name} thumbnail ${index + 1}`}
                  onClick={() => setSelectedImage(img)}
                  className={`w-full h-24 object-cover rounded-lg cursor-pointer transition-all duration-200 border-4 ${
                    selectedImage === img ? 'border-brand-blue' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Background of Puppy Section */}
          {dog.description && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Background of Puppy:</h3>
              <p className="text-gray-700 whitespace-pre-line">{dog.description}</p>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div>
          {/* Title for Desktop */}
          <h1 className="text-4xl font-bold text-left my-4 lg:block hidden">{dog.name}</h1>

          {/* Puppy Details Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Puppy Details</h2>
            <DetailRow label="Dog Breed" value={dog.breed || 'N/A'} />
            <DetailRow label="Price" value={dog.price ? `$${dog.price.toLocaleString()}` : 'N/A'} />
            <DetailRow label="Age" value={dog.age ? `${dog.age} years` : 'N/A'} />
            <DetailRow label="Gender" value={dog.gender || 'Coming Soon'} />
            <DetailRow label="ID Code" value={dog.idCode || 'N/A'} />
            <DetailRow label="Vaccinated" value={dog.vaccinated || 'Coming Soon'} />
          </div>

          {/* Pet Shop Details Card - Updated to match design */}
          {dog.petShop && (
            <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
              <div className="flex items-center mb-4">
                <FaStoreAlt className="text-blue-600 mr-3 text-2xl" />
                <h2 className="text-xl font-bold text-gray-800">Shop Details</h2>
              </div>

              <div className="flex items-start gap-4">
                <img 
                  src={dog.petShop.image || '/shop-placeholder.png'} 
                  alt={dog.petShop.name} 
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="text-sm">
                  <p className="font-bold text-gray-800">{dog.petShop.name}</p>
                  <p className="text-gray-600 mt-1">{dog.petShop.location}</p>
                  <p className="text-gray-600 mt-1">Phone: {dog.petShop.contact}</p>
                  <p className="text-gray-600 mt-1">Email: {dog.petShop.email || 'N/A'}</p>
                </div>
              </div>

              {dog.contactNumber && (
                <a
                  href={`https://wa.me/${dog.contactNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-md"
                >
                  <FaWhatsapp className="mr-2" />
                  Whatsapp Shop
                </a>
              )}
            </div>
          )}

          {/* WhatsApp Button */}
          {dog.contactNumber && (
            <div className="mt-8 text-center">
              <a
                href={`https://wa.me/${dog.contactNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center text-lg"
              >
                <FaWhatsapp className="mr-3" />
                Whatsapp Shop
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DogDetailsPage;