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
    // Semi-transparent backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-2" onClick={onClose}>
      {/* Modal Content - Simple centered approach */}
      <div 
        className="bg-white w-full max-w-md h-[98vh] rounded-lg shadow-xl flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Minimal size */}
        <div className="flex justify-between items-center p-3 border-b flex-shrink-0">
          <h2 className="text-base font-semibold">
            {title}
          </h2>
          <button onClick={onClose} className="text-xl font-light">&times;</button>
        </div>

        {/* Checkbox List: Takes up most space */}
        <div className="overflow-y-auto flex-1 min-h-0">
            <div className="p-3 pb-32">
                <div className="grid grid-cols-1 gap-y-3">
                    {items.map(item => (
                        <label key={item} className="flex items-center space-x-3 cursor-pointer py-1">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-400 text-brand-blue focus:ring-brand-blue"
                                checked={currentSelection.includes(item)}
                                onChange={() => handleCheckboxChange(item)}
                            />
                            <span className="select-none text-sm">{item}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>

        {/* Footer: Minimal size */}
        <div className="flex justify-between items-center p-3 border-t bg-white flex-shrink-0">
          <button onClick={handleClear} className="text-brand-blue font-semibold hover:underline text-sm">Clear</button>
          <button onClick={handleApply} className="bg-gray-900 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-700 transition-colors text-sm">Apply</button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;