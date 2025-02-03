import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SearchIcon, MenuVerticalIcon, LoadingCircle } from "./Icons";
import useOutsideClick from "../hooks/useOutsideClick";
import { useOrbis, User, UserPopup } from "@orbisclub/components";
import LeftSidebar from './LeftSidebar';
import { useTheme } from '../contexts/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';

const Header = () => {
  const { orbis, user, connecting, setConnectModalVis } = useOrbis();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);
  const { darkMode, toggleDarkMode } = useTheme();

  useOutsideClick(menuRef, () => setShowUserMenu(false));

  const goToProfile = () => {
    if (user?.did) {
      router.push(`/profile/${user.did}`);
      setShowUserMenu(false);
    }
  };

  const logout = async () => {
    await orbis.logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <header className="w-full z-30 bg-white dark:bg-dark-primary border-b border-gray-100 dark:border-dark-border fixed top-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section with logo and menu */}
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-secondary focus:outline-none"
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            <Link href="/" className="flex items-center">
              <img src="/logo-blue.svg" alt="Logo" className="h-10 w-10" />
            </Link>
            
            {/* Search bar */}
            <div className="hidden sm:block">
              <SearchBar />
            </div>
          </div>

          {/* Center navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/home" 
              className="text-gray-700 dark:text-dark-primary hover:text-gray-900 dark:hover:text-white font-medium"
            >
              Home
            </Link>
            <Link 
              href="/explore" 
              className="text-gray-700 dark:text-dark-primary hover:text-gray-900 dark:hover:text-white font-medium"
            >
              Explore
            </Link>
            <Link 
              href="/more" 
              className="text-gray-700 dark:text-dark-primary hover:text-gray-900 dark:hover:text-white font-medium"
            >
              More
            </Link>
          </nav>

          {/* Right section with auth buttons */}
          <div className="flex items-center gap-4">
            {/* Theme toggle button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-secondary"
            >
              {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>

            {!user ? (
              <div className="flex items-center gap-3">
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-full transition-colors hover:bg-blue-600"
                  onClick={() => setConnectModalVis(true)}
                >
                  {connecting ? (
                    <div className="flex items-center">
                      <LoadingCircle />
                      <span className="ml-2">Connecting</span>
                    </div>
                  ) : (
                    "Connect"
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <User details={user} height={32} />
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <MenuVerticalIcon />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Menu</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close menu</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <LeftSidebar />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User menu dropdown */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50" ref={menuRef}>
          <div className="px-4 py-3">
            <p className="text-sm text-gray-900 font-medium truncate">
              {user?.details?.profile?.username || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500 truncate mt-1">
              {user?.details?.metadata?.address}
            </p>
          </div>
          
          <div className="border-t border-gray-100">
            <button
              onClick={goToProfile}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              View Profile
            </button>
            <button
              onClick={() => {
                setShowUserPopup(true);
                setShowUserMenu(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Profile Settings
            </button>
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showUserPopup && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowUserPopup(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full">
              <UserPopup details={user} hide={() => setShowUserPopup(false)} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// SearchBar component with dark mode support
function SearchBar() {
  const [search, setSearch] = useState("");
  
  return (
    <div className="relative flex-1 max-w-lg">
      <div className="relative">
        <input
          type="text"
          className="w-full bg-gray-100 dark:bg-dark-secondary border-none rounded-full pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-dark-primary placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
    </div>
  );
}

export default Header;