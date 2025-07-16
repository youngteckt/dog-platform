import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiFetch from '../api/ApiFetch';
import DogCard from '../components/DogCard';
import FilterModal from '../components/FilterModal';
import PriceFilterModal from '../components/PriceFilterModal';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(20); // Start by showing 20 items

  // State for individual modals
  const [isBreedModalOpen, setIsBreedModalOpen] = useState(false);
  const [isPetShopModalOpen, setIsPetShopModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  // State for filter selections
  const [selectedBreeds, setSelectedBreeds] = useState([]);
  const [selectedPetShops, setSelectedPetShops] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/dogs');
        setDogs(data);
      } catch (error) {
        console.error('Failed to fetch dogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDogs();
  }, []);

  // When filters change, reset the number of displayed dogs
  useEffect(() => {
    setDisplayCount(20);
  }, [searchTerm, selectedBreeds, selectedPetShops, selectedPriceRanges]);

  // Listen for state changes from the AllFiltersPage
  useEffect(() => {
    if (location.state) {
      setSelectedBreeds(location.state.selectedBreeds || []);
      setSelectedPetShops(location.state.selectedPetShops || []);
      setSelectedPriceRanges(location.state.selectedPriceRanges || []);
    }
  }, [location.state]);

  const uniqueBreeds = useMemo(() => [...new Set(dogs.map(dog => dog.breed))], [dogs]);
  const uniquePetShops = useMemo(() => [...new Set(dogs.map(dog => dog.petShop?.name).filter(Boolean))], [dogs]);

  const filteredDogs = useMemo(() => {
    return dogs.filter(dog => {
      const searchMatch = searchTerm
        ? dog.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dog.petShop?.name && dog.petShop.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;

      const breedMatch = selectedBreeds.length > 0
        ? selectedBreeds.includes(dog.breed)
        : true;

      const petShopMatch = selectedPetShops.length > 0
        ? selectedPetShops.includes(dog.petShop?.name)
        : true;

      const priceMatch = selectedPriceRanges.length === 0 ? true : selectedPriceRanges.some(range => {
        switch (range) {
          case '$1000 - $1999':
            return dog.price >= 1000 && dog.price <= 1999;
          case '$2000 - $2999':
            return dog.price >= 2000 && dog.price <= 2999;
          case '$3000 - $3999':
            return dog.price >= 3000 && dog.price <= 3999;
          case '$4000 and above':
            return dog.price >= 4000;
          default:
            return false;
        }
      });

      return searchMatch && breedMatch && petShopMatch && priceMatch;
    });
  }, [dogs, searchTerm, selectedBreeds, selectedPetShops, selectedPriceRanges]);

  const displayedDogs = filteredDogs.slice(0, displayCount);
  const hasMoreItems = filteredDogs.length > displayCount;

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedBreeds([]);
    setSelectedPetShops([]);
    setSelectedPriceRanges([]);
  };

  // Handlers for individual modals
  const handleApplyBreedFilters = (breeds) => setSelectedBreeds(breeds);
  const handleApplyPetShopFilters = (shops) => setSelectedPetShops(shops);
  const handleApplyPriceFilters = (ranges) => setSelectedPriceRanges(ranges);

  const handleOpenAllFilters = () => {
    navigate('/filters', {
      state: {
        breeds: selectedBreeds,
        petShops: selectedPetShops,
        priceRanges: selectedPriceRanges,
        allBreeds: uniqueBreeds,
        allPetShops: uniquePetShops,
      },
    });
  };

  const handleLoadMore = () => {
    setDisplayCount(prevCount => prevCount + 20);
  };

  // Calculate active filter count
  const activeFilterCount = selectedBreeds.length + selectedPetShops.length + selectedPriceRanges.length;

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center my-10">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Discover All Puppies for Sale in Singapore</h1>
        <p className="mt-4 text-lg text-gray-600">Compare breeds, prices, and pet shops—all in one easy place</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by breed or pet shop..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-full shadow-sm focus:ring-brand-blue focus:border-brand-blue"
        />
      </div>

      {/* Filter Controls */}
      <div className="py-2 mb-4 sticky top-0 bg-white z-10 shadow-sm rounded-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Individual Filter Buttons */}
            <button onClick={() => setIsBreedModalOpen(true)} className="flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-100">
              Dog Breed
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <button onClick={() => setIsPetShopModalOpen(true)} className="flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-100">
              Pet Shop
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <button onClick={() => setIsPriceModalOpen(true)} className="flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-100">
              Price
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            
            {/* All Filters Button */}
            <button 
              onClick={handleOpenAllFilters}
              className="flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-100 relative"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V18a1 1 0 01-1 1h-2a1 1 0 01-1-1v-4.586L2.293 7.707A1 1 0 012 7V4z"></path></svg>
              All Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={handleClearFilters} className="text-sm font-semibold text-brand-blue hover:underline">Clear All</button>
          )}
        </div>
      </div>

      {/* Dog Listings */}
      {loading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedDogs.map((dog) => (
            <DogCard key={dog._id} dog={dog} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMoreItems && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={handleLoadMore}
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Load More Puppies
          </button>
        </div>
      )}

      {/* Modals */}
      <FilterModal
        isOpen={isBreedModalOpen}
        onClose={() => setIsBreedModalOpen(false)}
        title="Dog Breed"
        items={uniqueBreeds}
        selectedItems={selectedBreeds}
        onApply={handleApplyBreedFilters}
      />
      <FilterModal
        isOpen={isPetShopModalOpen}
        onClose={() => setIsPetShopModalOpen(false)}
        title="Pet Shop"
        items={uniquePetShops}
        selectedItems={selectedPetShops}
        onApply={handleApplyPetShopFilters}
      />
      <PriceFilterModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        selectedRanges={selectedPriceRanges}
        onApply={handleApplyPriceFilters}
      />
    </div>
  );
};

export default HomePage;
