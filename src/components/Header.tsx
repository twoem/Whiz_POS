import React from 'react';
import { usePosStore } from '../store/posStore';
import { User, LogOut } from 'lucide-react';

/**
 * Header component for the application.
 * Displays the current logged-in cashier and a logout button.
 */
const Header = () => {
  const { currentCashier, logout } = usePosStore();

  /**
   * Handles the logout action by clearing the current user from the store.
   */
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm p-4 flex justify-end items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <User className="w-6 h-6 text-gray-600" />
          <span className="text-gray-800 font-medium">{currentCashier?.name || 'Cashier'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
