import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useMobileStore } from './store/mobileStore';
import ConnectScreen from './pages/ConnectScreen';
import LoginScreen from './pages/LoginScreen';
import MobilePOS from './pages/MobilePOS';
import ExpensesPage from './pages/ExpensesPage';
import CreditCustomersPage from './pages/CreditCustomersPage';
import ClosingPage from './pages/ClosingPage';
import SettingsPage from './pages/SettingsPage';
import TransactionsPage from './pages/TransactionsPage';

const App = () => {
  const { isConnected, currentUser, checkConnection, syncWithServer } = useMobileStore();

  // Attempt auto-reconnect on mount
  useEffect(() => {
      checkConnection();
  }, []);

  // Periodically sync (Pull)
  useEffect(() => {
      const interval = setInterval(() => {
          if (isConnected && currentUser) {
              syncWithServer();
          }
      }, 30000); // Every 30s
      return () => clearInterval(interval);
  }, [isConnected, currentUser]);

  if (!isConnected) {
    return <ConnectScreen />;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/pos" />} />
        <Route path="/pos" element={<MobilePOS />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/credit" element={<CreditCustomersPage />} />
        <Route path="/closing" element={<ClosingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="*" element={<Navigate to="/pos" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
