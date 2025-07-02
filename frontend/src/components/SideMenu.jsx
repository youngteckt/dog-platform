import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai';
import { FaRegUserCircle } from 'react-icons/fa'; // User icon
import { BsShop } from 'react-icons/bs'; // Shop icon
import logo from '../assets/logo.png'; // App logo

const SideMenu = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      ></div>

      {/* Menu Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50">
        {/* Menu Header */}
        <div className="grid grid-cols-3 items-center p-6 bg-[#2853db]">
          {/* Empty Spacer */}
          <div></div>
          {/* Centered Logo */}
          <img src={logo} alt="Logo" className="h-12 justify-self-center" />
          {/* Close Button */}
          <button onClick={onClose} className="text-white hover:text-gray-200 justify-self-end">
            <AiOutlineClose size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-6">
          <ul>
            <li className="mb-4">
              <Link
                to="/login" // New login route
                onClick={onClose}
                className="flex items-center py-3 px-4 text-lg text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <FaRegUserCircle className="mr-3 text-gray-500" />
                Login
              </Link>
            </li>
            <li className="mb-4">
              <Link
                to="/register-pet-shop"
                onClick={onClose}
                className="flex items-center py-3 px-4 text-lg text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <BsShop className="mr-3 text-gray-500" />
                Register as a Pet Shop
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SideMenu;
