import { useMobileStore } from '../store/mobileStore';
import { ArrowLeft, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClosingPage = () => {
  const { recentTransactions } = useMobileStore();

  const handlePrint = async () => {
      // Logic to trigger print on server
      // Since we can't easily modify electron.cjs to add new endpoints safely without risking breaking existing sync logic
      // (and the user asked for APK fixes), I will focus on what the APK can do.
      alert("Please perform Closing Report on the Main Desktop POS for full accuracy.");
  };

  // Calculate local totals
  const today = new Date().toISOString().split('T')[0];
  const todaysTransactions = recentTransactions.filter(t => t.timestamp.startsWith(today));

  const totalSales = todaysTransactions.reduce((acc, t) => acc + t.total, 0);
  const cashSales = todaysTransactions.filter(t => t.paymentMethod === 'cash').reduce((acc, t) => acc + t.total, 0);
  const mpesaSales = todaysTransactions.filter(t => t.paymentMethod === 'mpesa').reduce((acc, t) => acc + t.total, 0);
  const creditSales = todaysTransactions.filter(t => t.paymentMethod === 'credit').reduce((acc, t) => acc + t.total, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <Link to="/pos" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Closing Report</h1>
        </div>

        <div className="flex-1 p-6 space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center space-y-2">
                <div className="text-slate-400">Total Sales (Local)</div>
                <div className="text-4xl font-bold text-sky-400">Ksh {totalSales.toLocaleString()}</div>
                <div className="text-sm text-slate-500">For {today}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase mb-1">Cash</div>
                    <div className="text-xl font-bold">Ksh {cashSales.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase mb-1">M-Pesa</div>
                    <div className="text-xl font-bold">Ksh {mpesaSales.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 col-span-2">
                    <div className="text-slate-400 text-xs uppercase mb-1">Credit</div>
                    <div className="text-xl font-bold">Ksh {creditSales.toLocaleString()}</div>
                </div>
            </div>

            <div className="bg-yellow-500/10 text-yellow-200 p-4 rounded-lg text-sm border border-yellow-500/20">
                Note: This summary only includes transactions synced to this device. For the official business closing report, please use the Desktop POS.
            </div>

            <button
                onClick={handlePrint}
                className="w-full py-4 bg-sky-600 hover:bg-sky-500 rounded-xl font-bold flex items-center justify-center gap-2"
            >
                <Printer className="w-5 h-5" />
                Print Summary
            </button>
        </div>
    </div>
  );
};

export default ClosingPage;
