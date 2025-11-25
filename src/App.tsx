import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { usePosStore } from './store/posStore';
import CheckoutModal from './components/CheckoutModal';
import MainNavigator from './pages/MainNavigator';
import BusinessRegistrationPage from './pages/BusinessRegistrationPage';
import LoginScreen from './components/LoginScreen';
import OnScreenKeyboard from './components/OnScreenKeyboard';
import ErrorBoundary from './components/ErrorBoundary';
import { useEffect } from 'react';

function App() {
  const { businessSetup, loadInitialData, autoPrintClosingReport, isDataLoaded } = usePosStore(state => ({
    businessSetup: state.businessSetup,
    loadInitialData: state.loadInitialData,
    autoPrintClosingReport: state.autoPrintClosingReport,
    isDataLoaded: state.isDataLoaded,
  }));

  useEffect(() => {
    const init = async () => {
      await loadInitialData();
      autoPrintClosingReport();
    };
    init();
  }, [loadInitialData, autoPrintClosingReport]);

  // Periodic Sync (Every 10 seconds)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const state = usePosStore.getState();
      const apiUrl = state.businessSetup?.apiUrl || state.businessSetup?.backOfficeUrl;
      const apiKey = state.businessSetup?.apiKey || state.businessSetup?.backOfficeApiKey;

      if (state.isOnline && apiUrl && apiKey) {
        // 1. Push pending changes
        if (state.syncQueue.length > 0) {
          console.log('Auto-sync: Processing Sync Queue (PUSH)...');
          state.processSyncQueue();
        }

        // 2. Pull updates from server
        console.log('Auto-sync: Fetching updates from server (PULL)...');
        state.syncFromServer();
      } else {
        // Debug log to help diagnose why sync isn't running
        if (!state.isOnline) console.log('Auto-sync skipped: Offline');
        else if (!apiUrl) console.log('Auto-sync skipped: No API URL configured');
        else if (!apiKey) console.log('Auto-sync skipped: No API Key');
      }
    }, 10000);

    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const { businessSetup, openKeyboard } = usePosStore.getState();
      if (businessSetup?.onScreenKeyboard && (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        if ((event.target as HTMLInputElement).type === 'file') {
          return;
        }
        openKeyboard(event.target as HTMLInputElement | HTMLTextAreaElement);
      }
    };

    window.addEventListener('focusin', handleFocus);

    return () => {
      window.removeEventListener('focusin', handleFocus);
    };
  }, []);

  if (!isDataLoaded) {
    return <div>Loading...</div>;
  }

  if (!businessSetup || !businessSetup.isSetup) {
    return <BusinessRegistrationPage />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-100">
          {!businessSetup.isLoggedIn ? <LoginScreen /> : <MainNavigator />}

          {/* Global Modals */}
          <CheckoutModal />
          <OnScreenKeyboard />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
