import { useState, useMemo } from 'react';
import { useMobileStore } from '../store/mobileStore';
import defaultImage from '../assets/cart.png';
import {
    Search, ShoppingCart, Plus, Minus, LogOut, RefreshCw, MoreHorizontal, FileText,
    CreditCard, DollarSign, X, ArrowLeft, GripVertical
} from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

const MobilePOS = () => {
    const {
        products, cart, addToCart, updateQuantity, processTransaction, logout,
        isConnected, syncWithServer, currentUser, creditCustomers
    } = useMobileStore();

    const [view, setView] = useState<'grid' | 'cart'>('grid');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [processing, setProcessing] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'credit'>('cash');
    const [mpesaPhone, setMpesaPhone] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            (p.name.toLowerCase().includes(search.toLowerCase())) &&
            (category === 'All' || p.category === category)
        );
    }, [products, search, category]);

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleConfirmCheckout = async () => {
        if (processing || cart.length === 0) return;
        if (paymentMethod === 'credit' && !selectedCustomer) {
            alert("Please select a credit customer");
            return;
        }
        setProcessing(true);
        const transaction = {
            id: `MTXN${Date.now()}`,
            timestamp: new Date().toISOString(),
            items: [...cart],
            subtotal: cartTotal,
            tax: 0,
            total: cartTotal,
            paymentMethod,
            cashier: currentUser?.name || 'Mobile',
            creditCustomer: selectedCustomer || undefined,
            status: 'completed' as const
        };
        await processTransaction(transaction);
        setProcessing(false);
        setShowCheckout(false);
        setView('grid');
        alert("Transaction Completed!");
    };

    return (
        <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden font-sans">
            {/* Header */}
            <header className="bg-black/20 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center justify-between shrink-0 z-20 relative">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-tr from-sky-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="font-bold text-lg">{currentUser?.name.charAt(0)}</span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Welcome back,</p>
                        <h1 className="font-bold text-lg text-white">{currentUser?.name}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => syncWithServer()} className="p-3 bg-white/5 rounded-full text-slate-300 active:bg-white/10">
                        <RefreshCw className={clsx("w-5 h-5", isConnected ? "text-green-400" : "text-red-400")} />
                    </button>
                    <button onClick={() => setShowMenu(o => !o)} className="p-3 bg-white/5 rounded-full text-slate-300 active:bg-white/10">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
                {showMenu && (
                    <div className="absolute top-full right-2 glass-card mt-2 w-56 p-2 flex flex-col z-30 animate-in fade-in slide-in-from-top-2">
                        <AppMenuLink to="/transactions" icon={FileText}>Recent Sales</AppMenuLink>
                        <AppMenuLink to="/expenses" icon={DollarSign}>Expenses</AppMenuLink>
                        <AppMenuLink to="/credit" icon={CreditCard}>Credit</AppMenuLink>
                        <AppMenuLink to="/closing" icon={FileText}>Closing Report</AppMenuLink>
                        <div className="h-px bg-white/10 my-1" />
                        <AppMenuLink to="/settings" icon={GripVertical}>Settings</AppMenuLink>
                        <button onClick={logout} className="px-3 py-2.5 hover:bg-red-500/10 text-red-400 flex items-center gap-3 text-sm font-medium w-full text-left rounded-lg">
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative">
                {/* Product Grid View */}
                <div className={clsx("absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out", view === 'cart' ? "-translate-x-full" : "translate-x-0")}>
                    <div className="p-4 space-y-4 bg-slate-950/80 backdrop-blur-sm border-b border-white/5 z-10">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="glass-input w-full pl-12"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={clsx(
                                        "px-4 py-2 rounded-full text-sm whitespace-nowrap font-semibold transition-all duration-200",
                                        category === cat ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "bg-white/5 text-slate-300 hover:bg-white/10"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start pb-24">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="glass-card p-3 flex flex-col gap-3 active:scale-95 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <div className="aspect-square bg-black/20 rounded-xl w-full overflow-hidden relative">
                                    <img src={product.image || defaultImage} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = defaultImage; }} />
                                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {product.stock}
                                    </div>
                                </div>
                                <div className="text-left w-full">
                                    <p className="font-semibold text-sm line-clamp-1 text-white">{product.name}</p>
                                    <p className="text-sky-400 font-bold">Ksh {product.price}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cart View */}
                <div className={clsx("absolute inset-0 bg-slate-950 flex flex-col transition-transform duration-300 ease-in-out", view === 'grid' ? "translate-x-full" : "translate-x-0")}>
                    <header className="p-4 flex items-center gap-4 border-b border-white/10 shrink-0">
                        <button onClick={() => setView('grid')} className="p-2 bg-white/5 rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold">Current Order</h2>
                    </header>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                                <ShoppingCart className="w-20 h-20" />
                                <p className="text-lg">Your cart is empty</p>
                                <button onClick={() => setView('grid')} className="text-sky-400 font-semibold">Start adding items</button>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.product.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl">
                                    <div className="w-16 h-16 bg-black/20 rounded-lg overflow-hidden shrink-0">
                                        <img src={item.product.image || defaultImage} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = defaultImage; }}/>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold line-clamp-1">{item.product.name}</p>
                                        <p className="text-sky-400 font-bold">Ksh {item.product.price * item.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-black/20 rounded-full p-1">
                                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full active:bg-slate-700">
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-bold w-5 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full active:bg-slate-700">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {cart.length > 0 && (
                        <footer className="p-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-sm space-y-4 pb-safe">
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span>Ksh {cartTotal.toLocaleString()}</span>
                            </div>
                            <button onClick={() => setShowCheckout(true)} className="w-full py-4 bg-sky-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-transform">
                                Proceed to Payment
                            </button>
                        </footer>
                    )}
                </div>
            </main>

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 animate-in fade-in slide-in-from-bottom-10">
                    <div className="glass-card w-full max-w-md sm:rounded-2xl rounded-t-2xl p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Confirm Sale</h2>
                            <button onClick={() => setShowCheckout(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="text-center py-4 bg-black/20 rounded-xl">
                            <p className="text-sm text-slate-400 uppercase">Total Amount</p>
                            <p className="text-4xl font-bold text-sky-400">Ksh {cartTotal.toLocaleString()}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <PaymentMethodButton method="cash" current={paymentMethod} set={setPaymentMethod} />
                            <PaymentMethodButton method="mpesa" current={paymentMethod} set={setPaymentMethod} />
                            <PaymentMethodButton method="credit" current={paymentMethod} set={setPaymentMethod} />
                        </div>

                        {paymentMethod === 'mpesa' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number (Optional)</label>
                                <input type="tel" value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} placeholder="07..." className="glass-input w-full" />
                            </div>
                        )}
                        {paymentMethod === 'credit' && (
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Select Customer</label>
                                <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="glass-input w-full">
                                    <option value="">-- Choose Customer --</option>
                                    {creditCustomers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        )}

                        <button onClick={handleConfirmCheckout} disabled={processing} className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            {processing ? 'Processing...' : 'Confirm & Print'}
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Nav */}
            <footer className="bg-black/20 backdrop-blur-sm border-t border-white/5 px-6 py-3 flex justify-around shrink-0 pb-safe z-10">
                <NavButton label="Menu" icon={GripVertical} active={view === 'grid'} onClick={() => setView('grid')} />
                <NavButton label="Cart" icon={ShoppingCart} active={view === 'cart'} onClick={() => setView('cart')} count={cartItemCount} />
            </footer>
        </div>
    );
};

const NavButton = ({ label, icon: Icon, active, onClick, count }: any) => (
    <button onClick={onClick} className={clsx("relative flex flex-col items-center gap-1 w-20 transition-colors", active ? "text-sky-400" : "text-slate-400 hover:text-white")}>
        <Icon className="w-6 h-6" />
        <span className="text-xs font-bold">{label}</span>
        {count > 0 && (
            <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {count}
            </span>
        )}
    </button>
);

const PaymentMethodButton = ({ method, current, set }: any) => (
    <button
        onClick={() => set(method)}
        className={clsx(
            "py-3 rounded-lg font-semibold border-2 transition-all",
            current === method ? "bg-sky-500 border-sky-400 text-white" : "bg-white/5 border-transparent hover:border-white/20 text-slate-300"
        )}
    >
        {method.toUpperCase()}
    </button>
);

const AppMenuLink = ({ to, icon: Icon, children }: any) => (
    <Link to={to} className="px-3 py-2.5 hover:bg-white/5 flex items-center gap-3 text-sm font-medium text-slate-200 rounded-lg">
        <Icon className="w-4 h-4 text-slate-400" /> {children}
    </Link>
);


export default MobilePOS;
