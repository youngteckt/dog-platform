import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Define the price ranges as a source of truth
const PRICE_RANGES = [
  { label: '$1000 - $1999' },
  { label: '$2000 - $2999' },
  { label: '$3000 - $3999' },
  { label: '$4000 and above' },
];

const AllFiltersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Get initial filter state from the homepage navigation
  const initialState = location.state || {
    breeds: [],
    petShops: [],
    priceRanges: [],
    allBreeds: [],
    allPetShops: [],
  };

  const [selectedBreeds, setSelectedBreeds] = useState(initialState.breeds);
  const [selectedPetShops, setSelectedPetShops] = useState(initialState.petShops);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState(initialState.priceRanges);

  // Animate in when component mounts
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => navigate(-1), 300); // Wait for animation to complete
  };

  const handleApply = () => {
    // Navigate back to the homepage, passing the selected filters in the state
    navigate('/', {
      state: {
        selectedBreeds,
        selectedPetShops,
        selectedPriceRanges,
      },
    });
  };

  const handleClear = () => {
    setSelectedBreeds([]);
    setSelectedPetShops([]);
    setSelectedPriceRanges([]);
  };

  const CheckboxGroup = ({ title, items, selectedItems, setSelectedItems }) => {
    const handleToggle = (item) => {
      setSelectedItems(prev =>
        prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
      );
    };

    return (
      <div className="py-4 border-b border-gray-200">
        <h3 className="font-semibold mb-4 text-base">{title}</h3>
        <div className="space-y-3">
          {items.map(item => (
            <label key={item} className="flex items-center space-x-3 cursor-pointer py-2 px-2 rounded-lg hover:bg-gray-50 active:bg-gray-100">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                checked={selectedItems.includes(item)}
                onChange={() => handleToggle(item)}
              />
              <span className="select-none text-base">{item}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '95vh' }}
      >
        {/* Handle bar for visual feedback */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 pt-4 pb-4 border-b">
          <h2 className="text-base font-semibold">All Filters</h2>
          <div className="flex items-center space-x-6">
            <button onClick={handleClear} className="text-blue-600 font-medium hover:text-blue-700 active:text-blue-800">
              Clear All
            </button>
            <button 
              onClick={handleClose} 
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <div className="px-4 py-4 pb-24">
            <CheckboxGroup 
              title="Dog Breed"
              items={initialState.allBreeds}
              selectedItems={selectedBreeds}
              setSelectedItems={setSelectedBreeds}
            />
            <CheckboxGroup 
              title="Pet Shop"
              items={initialState.allPetShops}
              selectedItems={selectedPetShops}
              setSelectedItems={setSelectedPetShops}
            />
            <CheckboxGroup 
              title="Price"
              items={PRICE_RANGES.map(r => r.label)}
              selectedItems={selectedPriceRanges}
              setSelectedItems={setSelectedPriceRanges}
            />
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t bg-white px-4 py-3 flex justify-center">
          <button 
            onClick={handleApply} 
            className="bg-blue-600 text-white font-semibold py-3 w-full max-w-md rounded-full hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default AllFiltersPage;
