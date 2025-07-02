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
      <div className="py-4 border-b">
        <h3 className="font-semibold mb-3">{title}</h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
          {items.map(item => (
            <label key={item} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-400 text-brand-blue focus:ring-brand-blue"
                checked={selectedItems.includes(item)}
                onChange={() => handleToggle(item)}
              />
              <span className="select-none text-sm">{item}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="text-2xl font-light">&times;</button>
        <h2 className="text-lg font-semibold">Filters</h2>
        <button onClick={handleClear} className="text-brand-blue font-semibold hover:underline">Clear All</button>
      </div>

      {/* Filter Sections */}
      <div className="p-4">
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

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 border-t bg-white z-10">
        <button onClick={handleApply} className="bg-gray-900 text-white font-bold py-3 w-full max-w-md rounded-full hover:bg-gray-700 transition-colors">Apply Filters</button>
      </div>
    </div>
  );
};

export default AllFiltersPage;
