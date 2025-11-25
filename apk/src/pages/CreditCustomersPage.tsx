import { useState } from 'react';
import { useMobileStore } from '../store/mobileStore';
import { ArrowLeft, Search, UserPlus, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreditCustomersPage = () => {
  const { creditCustomers, addCreditCustomer, updateCreditCustomer } = useMobileStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showPay, setShowPay] = useState<string | null>(null); // ID of customer to pay
  const [search, setSearch] = useState('');

  // Add Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Pay Form State
  const [payAmount, setPayAmount] = useState('');

  const filtered = creditCustomers.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleAdd = () => {
      if (!newName || !newPhone) return;
      addCreditCustomer({
          id: `CC${Date.now()}`,
          name: newName,
          phone: newPhone,
          balance: 0
      });
      setNewName('');
      setNewPhone('');
      setShowAdd(false);
  };

  const handlePay = () => {
      if (!showPay || !payAmount) return;
      const amount = parseFloat(payAmount);
      const customer = creditCustomers.find(c => c.id === showPay);
      if (customer && amount > 0) {
          updateCreditCustomer(customer.id, {
              balance: customer.balance - amount
          });
      }
      setPayAmount('');
      setShowPay(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <Link to="/pos" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Credit Customers</h1>
            <div className="ml-auto">
                <button
                    onClick={() => setShowAdd(true)}
                    className="p-2 bg-sky-600 rounded-lg text-white"
                >
                    <UserPlus className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="p-4 bg-slate-800/50 sticky top-0 backdrop-blur-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search customers..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-sky-500"
                />
            </div>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
             {filtered.length === 0 ? (
                 <div className="text-center text-slate-500 mt-10">No customers found</div>
             ) : (
                 filtered.map(c => (
                     <div key={c.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                         <div>
                             <div className="font-bold text-lg">{c.name}</div>
                             <div className="text-slate-400 text-sm flex items-center gap-1">
                                 <Phone className="w-3 h-3" /> {c.phone}
                             </div>
                         </div>
                         <div className="text-right">
                             <div className={`font-bold text-lg ${c.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                 Ksh {c.balance.toLocaleString()}
                             </div>
                             {c.balance > 0 && (
                                 <button
                                    onClick={() => setShowPay(c.id)}
                                    className="text-xs bg-sky-600/20 text-sky-400 px-2 py-1 rounded mt-1"
                                 >
                                     Pay Debt
                                 </button>
                             )}
                         </div>
                     </div>
                 ))
             )}
        </div>

        {/* Add Modal */}
        {showAdd && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
                    <h2 className="text-xl font-bold">New Customer</h2>
                    <input
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white"
                        placeholder="Name"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                    />
                    <input
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white"
                        placeholder="Phone Number"
                        value={newPhone}
                        onChange={e => setNewPhone(e.target.value)}
                    />
                    <div className="flex gap-3">
                        <button onClick={() => setShowAdd(false)} className="flex-1 p-3 bg-slate-700 rounded-lg">Cancel</button>
                        <button onClick={handleAdd} className="flex-1 p-3 bg-sky-600 rounded-lg">Add</button>
                    </div>
                </div>
            </div>
        )}

        {/* Pay Modal */}
        {showPay && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
                    <h2 className="text-xl font-bold">Record Payment</h2>
                    <p className="text-slate-400">Reduce debt for {creditCustomers.find(c => c.id === showPay)?.name}</p>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">Ksh</span>
                        <input
                            type="number"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 p-3 text-white"
                            placeholder="Amount"
                            value={payAmount}
                            onChange={e => setPayAmount(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowPay(null)} className="flex-1 p-3 bg-slate-700 rounded-lg">Cancel</button>
                        <button onClick={handlePay} className="flex-1 p-3 bg-green-600 rounded-lg">Confirm Payment</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default CreditCustomersPage;
