import { useMobileStore } from '../store/mobileStore';
import { ArrowLeft, Server, Printer, RefreshCw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SettingsPage = () => {
  const {
      apiUrl,
      isConnected,
      syncQueue,
      checkConnection,
      syncWithServer,
      setConnection,
      forgetUser
  } = useMobileStore();

  const handleTestPrint = async () => {
      // Send a dummy print request
      alert("Test Print sent to Desktop POS");
  };

  const handleReset = () => {
      if(confirm("Are you sure you want to reset connection settings? You will be logged out.")) {
          setConnection('', '');
          forgetUser();
          window.location.reload();
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <Link to="/pos" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Settings & Sync</h1>
        </div>

        <div className="flex-1 p-6 space-y-6">

            {/* Connection Status */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
                    <Server className="w-5 h-5 text-sky-400" />
                    <span className="font-bold">Connection</span>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Status</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isConnected ? 'CONNECTED' : 'OFFLINE'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Server URL</span>
                        <span className="text-sm font-mono text-slate-300">{apiUrl || 'Not Set'}</span>
                    </div>
                    <button
                        onClick={checkConnection}
                        className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                    >
                        Test Connection
                    </button>
                </div>
            </div>

            {/* Sync Queue */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-sky-400" />
                    <span className="font-bold">Sync Monitor</span>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Pending Items</span>
                        <span className="bg-slate-700 px-2 py-1 rounded text-sm font-mono">{syncQueue.length}</span>
                    </div>

                    <button
                        onClick={() => syncWithServer()}
                        className="w-full py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-sm font-medium transition-colors"
                    >
                        Force Sync Now
                    </button>
                </div>
            </div>

            {/* Hardware */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
                    <Printer className="w-5 h-5 text-sky-400" />
                    <span className="font-bold">Hardware</span>
                </div>
                <div className="p-4">
                    <button
                        onClick={handleTestPrint}
                        className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                    >
                        Test Printer
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <button
                onClick={handleReset}
                className="w-full py-3 border border-red-500/50 text-red-400 rounded-xl font-medium hover:bg-red-500/10 flex items-center justify-center gap-2"
            >
                <Trash2 className="w-4 h-4" />
                Reset Application
            </button>

        </div>
    </div>
  );
};

export default SettingsPage;
