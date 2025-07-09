import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { FaSearch, FaUserPlus, FaSignInAlt, FaHome } from 'react-icons/fa';
import logo from '../assets/logo.png'; // Import the logo
import SideMenu from './SideMenu'; // Import the new side menu

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="bg-brand-blue px-4 py-1 shadow-md">
        <div className="container mx-auto grid grid-cols-3 items-center">
          {/* Left Spacer */}
          <div></div>

          {/* Centered Logo */}
          <Link to="/" className="justify-self-center">
            <img src={logo} alt="Singapore Dog Platform Logo" className="h-20" />
          </Link>

          {/* Right Aligned Items */}
          <div className="justify-self-end flex items-center space-x-4 md:space-x-6">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/pet-shops" className="text-white hover:text-yellow-300 transition-colors">
                Discover Pet Shops
              </Link>
            </nav>

            {/* Mobile Navigation - Hamburger Icon */}
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <AiOutlineMenu size={28} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Side Panel) */}
        <div className={`fixed top-0 right-0 h-full bg-blue-700 w-64 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-40 shadow-xl`}>
          <div className="absolute top-0 right-0 p-5">
            <button onClick={toggleMenu} className="text-white">
              <AiOutlineClose size={28} />
            </button>
          </div>
          <div className="p-5 pt-20">
            <Link to="/" className="flex items-center text-white py-3 hover:text-yellow-300 transition-colors" onClick={() => setIsMenuOpen(false)}>
              <FaHome className="mr-3" />
              Home
            </Link>
            <Link to="/pet-shops" className="flex items-center text-white py-3 hover:text-yellow-300 transition-colors" onClick={() => setIsMenuOpen(false)}>
              <FaSearch className="mr-3" />
              Discover Pet Shops
            </Link>
            <Link to="/register" className="flex items-center text-white py-3 hover:text-yellow-300 transition-colors" onClick={() => setIsMenuOpen(false)}>
              <FaUserPlus className="mr-3" />
              Register as a Pet Shop
            </Link>
            <Link to="/login" className="flex items-center text-white py-3 hover:text-yellow-300 transition-colors" onClick={() => setIsMenuOpen(false)}>
              <FaSignInAlt className="mr-3" />
              Login
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
