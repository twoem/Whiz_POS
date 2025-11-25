import { useState, useEffect, useRef } from 'react';
import { useMobileStore } from '../store/mobileStore';
import { User as UserIcon, ChevronRight, LogOut, UserCheck, QrCode, X, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const LoginScreen = () => {
  const { users, login, setConnection, rememberedUser, forgetUser, checkConnection, syncWithServer } = useMobileStore();
  const [selectedUser, setSelectedUser] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // If there is a remembered user, default to them
  useEffect(() => {
      if (rememberedUser) {
          setSelectedUser(rememberedUser.id);
      }
  }, [rememberedUser]);

  const handleLogin = () => {
    const user = users.find(u => u.id === selectedUser);
    if (!user) {
        setError("Select a user");
        return;
    }
    if (user.pin !== pin) {
        setError("Incorrect PIN");
        return;
    }
    login(user);
  };

  const handleDisconnect = () => {
      if(confirm("Disconnect from server?")) {
          setConnection('', '');
          window.location.reload();
      }
  };

  const handleSwitchUser = () => {
      forgetUser();
      setSelectedUser('');
      setPin('');
      setError('');
  };

  const handleNumPad = (num: string) => {
      if (pin.length < 4) setPin(prev => prev + num);
  };

  const handleBackspace = () => {
      setPin(prev => prev.slice(0, -1));
  };

  // --- QR Scanner Logic ---
  const startScanner = () => {
    setShowScanner(true);
    setError('');

    setTimeout(() => {
        const html5QrCode = new Html5Qrcode("login-reader");
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start(
            { facingMode: "environment" },
            config,
            async (decodedText) => {
                // Handle Scan
                try {
                    // 1. Check if it's a Connection QR (re-connect)
                    try {
                        const data = JSON.parse(decodedText);
                        if (data.apiUrl && data.apiKey) {
                            stopScanner();
                            if (confirm("Update Server Connection?")) {
                                setConnection(data.apiUrl, data.apiKey);
                                await checkConnection();
                                await syncWithServer();
                                alert("Connection Updated!");
                            }
                            return;
                        }
                        // 2. Check if it's a User Badge JSON { "userId": "...", "pin": "..." }
                        if (data.userId) {
                            const user = users.find(u => u.id === data.userId || u.name === data.userId);
                            if (user) {
                                stopScanner();
                                if (data.pin && data.pin === user.pin) {
                                    login(user); // Auto login
                                } else {
                                    // Just select user
                                    setSelectedUser(user.id);
                                    if (data.pin) setPin(data.pin); // Pre-fill if matches?
                                    // Or just prompt for PIN
                                }
                                return;
                            }
                        }
                    } catch (e) {
                        // Not JSON, treat as raw User ID or PIN?
                    }

                    // 3. Fallback: Treat as PIN or User ID
                    const user = users.find(u => u.id === decodedText || u.name === decodedText);
                    if (user) {
                        stopScanner();
                        setSelectedUser(user.id);
                        return;
                    }

                    // If it matches a PIN of the selected user?
                    if (selectedUser) {
                        const u = users.find(u => u.id === selectedUser);
                        if (u && u.pin === decodedText) {
                            stopScanner();
                            setPin(decodedText);
                            login(u);
                            return;
                        }
                    }

                    // alert(`Scanned: ${decodedText}`);

                } catch (e) {
                    console.error("Scan error", e);
                }
            },
            () => { }
        ).catch(() => {
            setError("Camera error");
            setShowScanner(false);
        });
    }, 100);
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

  useEffect(() => {
      return () => {
          if (scannerRef.current && scannerRef.current.isScanning) {
              scannerRef.current.stop();
          }
      };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-6 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-[-10%] right-[-20%] w-[400px] h-[400px] bg-sky-600/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Scanner Overlay */}
        {showScanner && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
              <div className="p-4 flex justify-between items-center bg-black/50 backdrop-blur-sm absolute top-0 w-full z-10">
                  <h2 className="font-bold text-lg">Scan Badge / QR</h2>
                  <button onClick={stopScanner} className="p-2 bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <div id="login-reader" className="w-full h-full bg-black"></div>
              <div className="absolute bottom-10 left-0 w-full text-center text-slate-400 p-4">
                  Scan User Badge or Connection QR
              </div>
          </div>
        )}

        <div className="flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-sky-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-white text-xs">WP</span>
                </div>
                <span className="font-bold tracking-tight">WHIZ POS</span>
            </div>
            <div className="flex gap-2">
                <button onClick={startScanner} className="text-sky-400 p-2 hover:text-sky-300 transition-colors bg-white/5 rounded-full">
                    <QrCode className="w-5 h-5" />
                </button>
                <button onClick={handleDisconnect} className="text-slate-500 p-2 hover:text-white transition-colors">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-8 z-10">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Welcome Back</h1>
                {rememberedUser ? (
                    <p className="text-slate-400">Enter PIN for <span className="text-sky-400 font-semibold">{rememberedUser.name}</span></p>
                ) : (
                    <p className="text-slate-400">Sign in to start your shift</p>
                )}
            </div>

            <div className="glass-card p-6 space-y-6">

                {/* If no remembered user, show dropdown */}
                {!rememberedUser && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">Select User</label>
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                            <select
                                value={selectedUser}
                                onChange={e => setSelectedUser(e.target.value)}
                                className="glass-input w-full pl-12 appearance-none cursor-pointer"
                            >
                                <option value="">-- Choose Profile --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 rotate-90" />
                        </div>
                    </div>
                )}

                {/* Show User Info if Remembered */}
                {rememberedUser && (
                    <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                        <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-sky-900/20">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-lg">{rememberedUser.name}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide">{rememberedUser.role}</div>
                        </div>
                        <button
                            onClick={handleSwitchUser}
                            className="text-xs bg-white/5 hover:bg-white/10 text-sky-400 px-3 py-1.5 rounded-full font-medium transition-colors border border-white/5"
                        >
                            Switch
                        </button>
                    </div>
                )}

                {/* PIN Display */}
                <div className="flex justify-center gap-4 py-4">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > i ? 'bg-sky-500 scale-110 shadow-[0_0_10px_rgba(14,165,233,0.5)]' : 'bg-slate-700'}`} />
                    ))}
                </div>

                {error && <div className="text-red-400 text-sm text-center animate-bounce">{error}</div>}

                {/* NumPad */}
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleNumPad(num.toString())}
                            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 text-xl font-medium transition-colors border border-white/5"
                        >
                            {num}
                        </button>
                    ))}
                    <div />
                    <button
                        onClick={() => handleNumPad("0")}
                        className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 text-xl font-medium transition-colors border border-white/5"
                    >
                        0
                    </button>
                    <button
                        onClick={handleBackspace}
                        className="h-16 rounded-2xl bg-white/5 hover:bg-red-500/20 active:bg-red-500/30 text-slate-400 hover:text-red-400 transition-colors flex items-center justify-center border border-white/5"
                    >
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                </div>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={startScanner}
                        className="glass-button bg-slate-800 text-slate-400 w-16 flex items-center justify-center !from-slate-800 !to-slate-700 hover:!from-slate-700 hover:!to-slate-600 shadow-none border border-white/5"
                    >
                        <Camera className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleLogin}
                        disabled={!selectedUser || pin.length < 4}
                        className="glass-button flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Login <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoginScreen;
