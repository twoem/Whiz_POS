import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, User, CartItem, Transaction, BusinessSetup } from '../types';

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    recordedBy: string;
    date: string;
    cashier?: string;
}

interface CreditCustomer {
    id: string;
    name: string;
    phone: string;
    balance: number;
}

interface MobileState {
  // Connection Settings
  apiUrl: string;
  apiKey: string;
  isConnected: boolean;

  // Data
  products: Product[];
  users: User[];
  expenses: Expense[];
  creditCustomers: CreditCustomer[];
  recentTransactions: Transaction[];
  cart: CartItem[];
  businessSetup: BusinessSetup | null;

  // Session
  currentUser: User | null;
  rememberedUser: User | null; // User who logged in last (for PIN-only login)

  // Sync
  syncQueue: any[];
  isOnline: boolean;

  // Actions
  setConnection: (url: string, key: string) => void;
  checkConnection: () => Promise<boolean>;

  login: (user: User) => void;
  logout: () => void;
  forgetUser: () => void;

  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;

  processTransaction: (transaction: Transaction) => Promise<void>;
  addExpense: (expense: Expense) => void;
  addCreditCustomer: (customer: CreditCustomer) => void;
  updateCreditCustomer: (id: string, updates: Partial<CreditCustomer>) => void;

  syncWithServer: () => Promise<void>;
}

export const useMobileStore = create<MobileState>()(
  persist(
    (set, get) => ({
      apiUrl: '',
      apiKey: '',
      isConnected: false,

      products: [],
      users: [],
      expenses: [],
      creditCustomers: [],
      recentTransactions: [],
      cart: [],
      businessSetup: null,
      currentUser: null,
      rememberedUser: null,
      syncQueue: [],
      isOnline: true,

      setConnection: (url, key) => {
        // Normalize URL
        const normalizedUrl = url.replace(/\/$/, '');
        const finalUrl = normalizedUrl.startsWith('http') ? normalizedUrl : `http://${normalizedUrl}`;
        set({ apiUrl: finalUrl, apiKey: key });
      },

      checkConnection: async () => {
        const { apiUrl, apiKey } = get();
        if (!apiUrl || !apiKey) return false;

        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(`${apiUrl}/api/status`, { signal: controller.signal });
          clearTimeout(id);

          if (res.ok) {
            set({ isConnected: true });
            return true;
          }
        } catch (e) {
          console.error("Connection check failed", e);
        }
        set({ isConnected: false });
        return false;
      },

      login: (user) => set({ currentUser: user, rememberedUser: user }),
      logout: () => set({ currentUser: null }),
      forgetUser: () => set({ rememberedUser: null, currentUser: null }),

      addToCart: (product) => set((state) => {
        const existing = state.cart.find(item => item.product.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            )
          };
        }
        return { cart: [...state.cart, { product, quantity: 1 }] };
      }),

      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(item => item.product.id !== id)
      })),

      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeFromCart(id);
          return;
        }
        set((state) => ({
          cart: state.cart.map(item => item.product.id === id ? { ...item, quantity: qty } : item)
        }));
      },

      clearCart: () => set({ cart: [] }),

      processTransaction: async (transaction) => {
        // 1. Optimistic Update (Local)
        set((s) => ({
            recentTransactions: [transaction, ...s.recentTransactions],
            cart: []
        }));

        // 2. Queue Operation
        const operation = { type: 'new-transaction', data: transaction };
        set((s) => ({ syncQueue: [...s.syncQueue, operation] }));

        // 3. Trigger Sync (which handles push/print)
        get().syncWithServer();
      },

      addExpense: (expense) => {
        set(state => ({
            expenses: [expense, ...state.expenses],
            syncQueue: [...state.syncQueue, { type: 'add-expense', data: expense }]
        }));
        get().syncWithServer();
      },

      addCreditCustomer: (customer) => {
        set(state => ({
            creditCustomers: [...state.creditCustomers, customer],
            syncQueue: [...state.syncQueue, { type: 'add-credit-customer', data: customer }]
        }));
        get().syncWithServer();
      },

      updateCreditCustomer: (id, updates) => {
        set(state => ({
            creditCustomers: state.creditCustomers.map(c => c.id === id ? { ...c, ...updates } : c),
            syncQueue: [...state.syncQueue, { type: 'update-credit-customer', data: { id, updates } }]
        }));
        get().syncWithServer();
      },

      syncWithServer: async () => {
        const state = get();
        if (!state.apiUrl || !state.apiKey) return;

        try {
            // 1. Push Queue
            if (state.syncQueue.length > 0) {
                const res = await fetch(`${state.apiUrl}/api/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.apiKey}` },
                    body: JSON.stringify(state.syncQueue)
                });

                if (res.ok) {
                    set({ syncQueue: [] });

                    // Trigger print for any transactions in the queue we just pushed?
                    // Actually, the server handles printing if we just pushed?
                    // No, server doesn't auto-print on sync unless specifically told.
                    // But in our previous code we sent a separate print request.

                    // Let's iterate queue and send print requests for transactions
                    state.syncQueue.forEach(op => {
                        if (op.type === 'new-transaction' && state.businessSetup) {
                             fetch(`${state.apiUrl}/api/print-receipt`, {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.apiKey}` },
                                 body: JSON.stringify({ transaction: op.data, businessSetup: state.businessSetup })
                             }).catch(e => console.error("Print error", e));
                        }
                    });
                }
            }

            // 2. Pull Data
            const res = await fetch(`${state.apiUrl}/api/sync`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${state.apiKey}` }
            });

            if (res.ok) {
                const data = await res.json();
                set({
                    products: data.products || [],
                    users: data.users || [],
                    expenses: data.expenses || [],
                    creditCustomers: data.creditCustomers || [],
                    // transactions: data.transactions || [], // Don't overwrite local transactions entirely? Maybe append?
                    // For now, let's keep recent transactions from server if we want history
                    recentTransactions: data.transactions || [],
                    businessSetup: data.businessSetup || state.businessSetup,
                    isConnected: true
                });
            }
        } catch (e) {
            console.error("Sync failed", e);
            set({ isConnected: false });
        }
      }
    }),
    {
      name: 'whiz-mobile-storage',
      partialize: (state) => ({
          apiUrl: state.apiUrl,
          apiKey: state.apiKey,
          syncQueue: state.syncQueue,
          products: state.products,
          users: state.users,
          expenses: state.expenses,
          creditCustomers: state.creditCustomers,
          businessSetup: state.businessSetup,
          rememberedUser: state.rememberedUser
      })
    }
  )
);
