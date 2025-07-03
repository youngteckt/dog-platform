import React, { useState, useEffect } from 'react';

const FilterModal = ({ isOpen, onClose, title, items, selectedItems, onApply }) => {
  const [currentSelection, setCurrentSelection] = useState(selectedItems || []);

  useEffect(() => {
    setCurrentSelection(selectedItems || []);
  }, [selectedItems, isOpen]);

  const handleCheckboxChange = (item) => {
    setCurrentSelection(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item) // Uncheck
        : [...prev, item] // Check
    );
  };

  const handleApply = () => {
    onApply(currentSelection); // Send the final selection to the parent
    onClose(); // Close the modal
  };

  const handleClear = () => {
    setCurrentSelection([]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle bar for visual feedback */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 pb-3 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          <div className="px-4 py-4">
            <div className="space-y-4">
              {items.map(item => (
                <label key={item} className="flex items-center space-x-3 cursor-pointer py-2 px-2 rounded-lg hover:bg-gray-50 active:bg-gray-100">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    checked={currentSelection.includes(item)}
                    onChange={() => handleCheckboxChange(item)}
                  />
                  <span className="select-none text-base">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t bg-white px-4 py-4 flex justify-between items-center">
          <button 
            onClick={handleClear} 
            className="text-blue-600 font-medium hover:text-blue-700 active:text-blue-800"
          >
            Clear All
          </button>
          <button 
            onClick={handleApply} 
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterModal;