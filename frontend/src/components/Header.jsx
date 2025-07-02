import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Import the logo
import { AiOutlineMenu } from 'react-icons/ai'; // Import hamburger icon
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
            <Link to="/pet-shops" className="text-white text-sm md:text-lg font-semibold whitespace-nowrap transition-all duration-300 hover:text-yellow-300 hover:[text-shadow:0_0_8px_#fde047]">
              Discover Pet Shops
            </Link>
            <button onClick={toggleMenu} className="text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
              <AiOutlineMenu size={28} />
            </button>
          </div>
        </div>
      </header>
      <SideMenu isOpen={isMenuOpen} onClose={toggleMenu} />
    </>
  );
};

export default Header;
