import React, { useState, useEffect } from 'react';

export const FilterModal = ({ isOpen, onClose, title, items, selectedItems, onApply }) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={onClose}>
      {/* Modal Content - Simple centered approach */}
      <div 
        className="bg-white w-full max-w-md max-h-[90vh] rounded-lg shadow-xl flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Fixed size */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10zM15 10a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2a1 1 0 01-1-1v-4z"></path></svg>
            {title}
          </h2>
          <button onClick={onClose} className="text-2xl font-light">&times;</button>
        </div>

        {/* Checkbox List: Simple scrollable area */}
        <div className="overflow-y-auto flex-1 min-h-0">
            <div className="p-4">
                <div className="grid grid-cols-1 gap-y-4">
                    {items.map(item => (
                        <label key={item} className="flex items-center space-x-3 cursor-pointer py-2">
                            <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-400 text-brand-blue focus:ring-brand-blue"
                                checked={currentSelection.includes(item)}
                                onChange={() => handleCheckboxChange(item)}
                            />
                            <span className="select-none text-sm">{item}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>

        {/* Footer: Fixed size */}
        <div className="flex justify-between items-center p-4 border-t bg-white flex-shrink-0">
          <button onClick={handleClear} className="text-brand-blue font-semibold hover:underline">Clear</button>
          <button onClick={handleApply} className="bg-gray-900 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-700 transition-colors">Apply</button>
        </div>
      </div>
    </div>
  );
};