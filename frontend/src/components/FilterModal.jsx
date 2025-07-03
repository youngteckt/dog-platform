import React, { useState, useEffect } from 'react';

const FilterModal = ({ isOpen, onClose, title, items, selectedItems, onApply }) => {
  // Internal state to manage checkbox selections before applying
  const [currentSelection, setCurrentSelection] = useState(selectedItems);

  // Sync internal state if the parent's state changes
  useEffect(() => {
    setCurrentSelection(selectedItems);
  }, [selectedItems, isOpen]);

  if (!isOpen) {
    return null;
  }

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

  return (
    // Semi-transparent backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end" onClick={onClose}>
      {/* Modal Content - slides in from the right */}
      <div 
        className="bg-white w-full max-w-md h-full shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out" 
        onClick={(e) => e.stopPropagation()}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10zM15 10a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2a1 1 0 01-1-1v-4z"></path></svg>
            Filters
          </h2>
          <button onClick={onClose} className="text-2xl font-light">&times;</button>
        </div>

        {/* Sub-Header */}
        <div className="flex items-center p-4 flex-shrink-0">
            <button onClick={onClose} className="mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h3 className="font-semibold">{title}</h3>
        </div>

        {/* Checkbox List - This area will now grow and scroll correctly */}
        <div className="p-4 overflow-y-auto flex-grow pb-24">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                {items.map(item => (
                    <label key={item} className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-400 text-brand-blue focus:ring-brand-blue"
                            checked={currentSelection.includes(item)}
                            onChange={() => handleCheckboxChange(item)}
                        />
                        <span className="select-none">{item}</span>
                    </label>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t bg-white flex-shrink-0">
          <button onClick={handleClear} className="text-brand-blue font-semibold hover:underline">Clear Selection</button>
          <button onClick={handleApply} className="bg-gray-900 text-white font-bold py-3 px-10 rounded-full hover:bg-gray-700 transition-colors">Apply</button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;