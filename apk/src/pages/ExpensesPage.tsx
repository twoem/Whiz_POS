import { useState } from 'react';
import { useMobileStore } from '../store/mobileStore';
import { ArrowLeft, Plus, DollarSign, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExpensesPage = () => {
  const { expenses, addExpense, currentUser } = useMobileStore();
  const [showAdd, setShowAdd] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');

  const handleAdd = () => {
      if (!description || !amount) return;

      const newExpense = {
          id: `EXP${Date.now()}`,
          description,
          amount: parseFloat(amount),
          category,
          recordedBy: currentUser?.name || 'Mobile',
          date: new Date().toISOString()
      };

      addExpense(newExpense);

      setDescription('');
      setAmount('');
      setCategory('General');
      setShowAdd(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <Link to="/pos" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Expenses</h1>
            <div className="ml-auto">
                <button
                    onClick={() => setShowAdd(true)}
                    className="p-2 bg-sky-600 rounded-lg text-white"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
             {expenses.length === 0 ? (
                 <div className="text-center text-slate-500 mt-10">No recent expenses</div>
             ) : (
                 expenses.map(exp => (
                     <div key={exp.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                         <div className="flex justify-between items-start">
                             <div>
                                 <div className="font-bold">{exp.description}</div>
                                 <div className="text-xs text-slate-400">{new Date(exp.date).toLocaleDateString()} • {exp.category}</div>
                             </div>
                             <div className="font-bold text-red-400">
                                 - Ksh {exp.amount.toLocaleString()}
                             </div>
                         </div>
                     </div>
                 ))
             )}
        </div>

        {showAdd && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
                    <h2 className="text-xl font-bold">Add Expense</h2>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 p-3 outline-none focus:border-sky-500"
                                placeholder="e.g., Milk, Transport"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 p-3 outline-none focus:border-sky-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                        <select
                             value={category}
                             onChange={e => setCategory(e.target.value)}
                             className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none focus:border-sky-500 text-white"
                        >
                            <option>General</option>
                            <option>Supplies</option>
                            <option>Transport</option>
                            <option>Utilities</option>
                            <option>Salary</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={() => setShowAdd(false)}
                            className="p-3 rounded-lg bg-slate-700 text-slate-300 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            className="p-3 rounded-lg bg-sky-600 text-white font-medium"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ExpensesPage;
