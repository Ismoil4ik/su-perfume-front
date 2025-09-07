import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import biglogo from "../assets/logo.png";
import search from "../assets/search.png";
import korzina from "../assets/korzina.png";
import favourite from '../assets/heart.png';

const Navbar = ({ setSearchQuery, currentView, setCurrentView, favoritesCount, cartCount }) => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUserName(parsedUser.name || "USER");
      } else {
        setUserName("USER");
      }
    } catch (e) {
      console.error("Failed to load user from localStorage", e);
      setUserName("USER");
    }
  }, []);

  const handleSearchChange = (e) => {
    if (setSearchQuery && currentView === 'products') {
      setSearchQuery(e.target.value);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");  // Clear user data from local storage
    localStorage.removeItem("accessToken");  // Clear access token from local storage
    setUserName("USER");  // Reset the user name state
    window.location.reload();  // Reload the page after logout
  };

  return (
    <div className="fixed flex flex-col sm:flex-row justify-between items-center px-3 sm:px-4 md:px-8 lg:px-[60px] py-3 sm:py-4 lg:py-[20px] top-0 left-0 w-full bg-white shadow-md z-50">
      {/* Left section - User info and logout */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto justify-between sm:justify-start">
        <button 
          onClick={handleLogout} 
          className="text-xs sm:text-sm w-[60px] sm:w-[70px] text-white h-[30px] sm:h-[35px] bg-red-600 rounded-[8px] sm:rounded-[10px] touch-manipulation"
        >
          Logout
        </button>
        <p className="text-sm sm:text-base lg:text-[18px] font-[600] truncate">Hello, {userName}</p>
        
        {/* Logo on mobile - moved to left section for better layout */}
        <img 
          src={biglogo} 
          alt="logo" 
          className="w-[60px] h-[45px] sm:hidden" 
        />
      </div>

      {/* Center section - Logo (desktop only) */}
      <img 
        src={biglogo} 
        alt="logo" 
        className="hidden sm:block w-[70px] h-[55px] md:w-[85px] md:h-[65px] lg:w-[100px] lg:h-[75px]" 
      />

      {/* Right section - Search and actions */}
      <div className="flex justify-center items-center gap-3 sm:gap-4 lg:gap-[24px] w-full sm:w-auto mt-2 sm:mt-0">
        {currentView === 'products' && (
          <div className="relative flex-1 sm:flex-none">
            <img 
              src={search} 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-[12px] h-[12px] sm:w-[15px] sm:h-[15px]" 
              alt="search" 
            />
            <input
              type="text"
              placeholder="Поиск..."
              onChange={handleSearchChange}
              className="pl-6 sm:pl-8 pr-3 py-1 sm:py-2 border-b border-gray-300 outline-none text-xs sm:text-sm w-full sm:w-[150px] md:w-[180px] lg:w-[200px] rounded-[8px] sm:rounded-[10px]"
            />
          </div>
        )}

        <button
          onClick={() => setCurrentView('favorites')}
          className="relative touch-manipulation"
        >
          <img
            src={favourite}
            className={`w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] lg:w-[25px] lg:h-[25px] ${currentView === 'favorites' ? 'filter brightness-0 saturate-100' : ''}`}
            alt="favorites"
          />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
              {favoritesCount > 99 ? '99+' : favoritesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentView('cart')}
          className="relative touch-manipulation"
        >
          <img 
            src={korzina} 
            className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] lg:w-[25px] lg:h-[25px]" 
            alt="cart" 
          />
          {cartCount > 0 && (
            <span className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Navbar;