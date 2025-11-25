import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { User } from '../types';
import { Store, Lock, User as UserIcon } from 'lucide-react';

export default function LoginScreen() {
  const { login, users, businessSetup } = usePosStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    console.log('LoginScreen rendered');
  }, []);

  if (!businessSetup) return null;

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setPin('');
    setLoginError('');
  };

  const handleLogin = () => {
    if (!selectedUserId || pin.length !== 4) {
      setLoginError('Please select a user and enter 4-digit PIN');
      return;
    }

    const selectedUser = users.find(u => u.id === selectedUserId);

    if (selectedUser && selectedUser.pin === pin) {
      login(selectedUser);
    } else {
      setLoginError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleKeyPress = (key: string) => {
    if (pin.length < 4) {
      setPin(pin + key);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setLoginError('');
  };

  const getSelectedUser = () => {
    if (!selectedUserId) return null;
    return users.find(u => u.id === selectedUserId);
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex">
          {/* Left Panel - User Selection */}
          <div className="w-1/2 bg-gray-50 p-8 border-r">
            <div className="flex items-center space-x-3 mb-6">
              <Store className="w-8 h-8 text-sky-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{businessSetup.businessName}</h2>
                <p className="text-gray-600">Select Cashier</p>
              </div>
            </div>

            <div className="space-y-3">
              <select
                onChange={(e) => handleUserSelect(e.target.value)}
                className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 bg-white"
              >
                <option value="">Select a user</option>
                {users
                  .filter(user => user.isActive)
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
              </select>
            </div>

            {users.filter(user => user.isActive).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No active users found</p>
                <p className="text-sm text-gray-400 mt-2">Please contact your administrator</p>
              </div>
            )}
          </div>

          {/* Right Panel - PIN Entry */}
          <div className="w-1/2 p-8">
            <div className="text-center mb-8">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">Enter PIN</h3>
              {selectedUserId && (
                <p className="text-gray-600 mt-2">{getSelectedUser()?.name}</p>
              )}
            </div>

            {/* PIN Display */}
            <div className="mb-8">
              <div className="flex justify-center space-x-2 mb-4">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full ${
                      index < pin.length ? 'bg-sky-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              {loginError && (
                <div className="text-red-500 text-sm text-center animate-pulse">
                  {loginError}
                </div>
              )}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-semibold transition-colors"
                >
                  {num}
                </button>
              ))}
              
              <button
                onClick={handleClear}
                className="p-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
              
              <button
                onClick={() => handleKeyPress('0')}
                className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-semibold transition-colors"
              >
                0
              </button>
              
              <button
                onClick={handleBackspace}
                className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ←
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={!selectedUserId || pin.length !== 4}
              className="w-full py-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
