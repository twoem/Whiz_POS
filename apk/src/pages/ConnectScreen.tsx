import { useState, useEffect, useRef } from 'react';
import { useMobileStore } from '../store/mobileStore';
import { QrCode, Wifi, Loader2, Server, Camera, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera as CapCamera } from '@capacitor/camera';

const ConnectScreen = () => {
  const { setConnection, checkConnection, syncWithServer } = useMobileStore();
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleConnect = async () => {
    if (!url || !key) {
        setError("Please enter URL and API Key");
        return;
    }

    setLoading(true);
    setError('');

    setConnection(url, key);

    const success = await checkConnection();
    if (success) {
        await syncWithServer();
    } else {
        setError("Could not connect to Desktop POS. Check IP and Network.");
    }
    setLoading(false);
  };

  const startScanner = async () => {
    setError('');
    try {
        // Request permissions
        await CapCamera.requestPermissions();

        setShowScanner(true);

        // Slight delay to ensure DOM is ready
        setTimeout(() => {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    try {
                        const data = JSON.parse(decodedText);
                        if (data.apiUrl && data.apiKey) {
                            setUrl(data.apiUrl);
                            setKey(data.apiKey);
                            stopScanner();
                        } else {
                            alert("Invalid QR Code format");
                        }
                    } catch (e) {
                        alert("Not a valid WHIZ POS QR Code");
                    }
                },
                () => { /* ignore parse errors */ }
            ).catch(() => {
                setError("Could not start camera. Please ensure permissions are granted.");
                setShowScanner(false);
            });
        }, 100);

    } catch (e) {
        setError("Camera permission is required to use the scanner.");
        setShowScanner(false);
    }
  };

  const stopScanner = () => {
      if (scannerRef.current) {
          scannerRef.current.stop().then(() => {
              scannerRef.current?.clear();
              setShowScanner(false);
          }).catch(err => console.error(err));
      } else {
          setShowScanner(false);
      }
  };

  // Cleanup
  useEffect(() => {
      return () => {
          if (scannerRef.current && scannerRef.current.isScanning) {
              scannerRef.current.stop();
          }
      };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-sky-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {showScanner && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
              <div className="p-4 flex justify-between items-center bg-black/50 backdrop-blur-sm absolute top-0 w-full z-10">
                  <h2 className="font-bold text-lg">Scan QR Code</h2>
                  <button onClick={stopScanner} className="p-2 bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <div id="reader" className="w-full h-full bg-black"></div>
              <div className="absolute bottom-10 left-0 w-full text-center text-slate-400 p-4">
                  Point camera at the QR code on Desktop POS
              </div>
          </div>
      )}

      <div className="w-full max-w-md animate-fade-in z-10">
        <div className="text-center mb-8 space-y-2">
            <div className="w-20 h-20 bg-gradient-to-tr from-sky-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-sky-500/20 rotate-3">
                <Wifi className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Connect Device
            </h1>
            <p className="text-slate-400">Pair this device with your Desktop POS</p>
        </div>

        <div className="glass-card p-8 space-y-6">

            <button
                onClick={startScanner}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
            >
                <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-sky-400" />
                </div>
                <span className="text-sm font-medium text-sky-400">Scan QR Code</span>
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500">Or Manual Entry</span>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Server URL</label>
                    <div className="relative group">
                        <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                        <input
                            type="text"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="http://192.168.1.x:3000"
                            className="glass-input w-full pl-14"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Sync Key</label>
                    <div className="relative group">
                        <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                        <input
                            type="text"
                            value={key}
                            onChange={e => setKey(e.target.value)}
                            placeholder="Enter Key"
                            className="glass-input w-full pl-14"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-xl text-center flex items-center justify-center gap-2 animate-pulse">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {error}
                </div>
            )}

            <button
                onClick={handleConnect}
                disabled={loading}
                className="glass-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Connect Now'}
            </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
            WHIZ POS Mobile v1.0 • Secure Local Sync
        </p>
      </div>
    </div>
  );
};

export default ConnectScreen;
