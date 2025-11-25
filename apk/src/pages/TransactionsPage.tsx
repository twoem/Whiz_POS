import { useMobileStore } from '../store/mobileStore';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const TransactionsPage = () => {
  const { recentTransactions, businessSetup, apiUrl, apiKey } = useMobileStore();

  const handleReprint = async (transaction: any) => {
      if (businessSetup && apiUrl && apiKey) {
          try {
             await fetch(`${apiUrl}/api/print-receipt`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                 body: JSON.stringify({ transaction, businessSetup })
             });
             alert("Reprint sent!");
          } catch(e) {
              alert("Failed to send reprint command.");
          }
      } else {
          alert("Cannot reprint: Not connected or setup missing.");
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <Link to="/pos" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Recent Transactions</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {recentTransactions.length === 0 ? (
                <div className="text-center text-slate-500 mt-10">No recent transactions</div>
            ) : (
                recentTransactions.map(tx => (
                    <div key={tx.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-lg">Ksh {tx.total.toLocaleString()}</div>
                                <div className="text-xs text-slate-400">{new Date(tx.timestamp).toLocaleString()}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 uppercase font-bold">
                                {tx.paymentMethod}
                            </span>
                        </div>
                        <div className="text-sm text-slate-300">
                            {tx.items.map(item => `${item.quantity}x ${item.product.name}`).join(', ')}
                        </div>
                        <div className="pt-2 border-t border-slate-700 flex justify-end">
                            <button
                                onClick={() => handleReprint(tx)}
                                className="text-sky-400 text-sm font-medium flex items-center gap-1 active:opacity-70"
                            >
                                <RefreshCcw className="w-3 h-3" /> Reprint Receipt
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default TransactionsPage;
