import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the Electron API that will be exposed on the window object
declare global {
  interface Window {
    /**
     * The Electron interface exposed via `preload.js`.
     * Provides secure access to native functionality.
     */
    electron: {
      /**
       * Saves data to a local JSON file.
       * @param fileName Name of the file (e.g., 'products.json').
       * @param data The JSON data to save.
       */
      saveData: (fileName: string, data: any) => Promise<{ success: boolean; error?: any }>;

      /**
       * Reads data from a local JSON file.
       * @param fileName Name of the file to read.
       */
      readData: (fileName: string) => Promise<{ success: boolean; data?: any; error?: any }>;

      /**
       * Prints a transaction receipt.
       */
      printReceipt: (transaction: Transaction, businessSetup: BusinessSetup, isReprint: boolean) => void;

      /**
       * Saves a temporary image to the persistent local storage.
       */
      saveImage: (tempPath: string) => Promise<{ success: boolean; path?: string; fileName?: string; error?: any }>;

      /**
       * Prints the daily closing report.
       */
      printClosingReport: (reportData: ClosingReportData, businessSetup: BusinessSetup) => void;

      /**
       * Prints the initial business setup sheet.
       */
      printBusinessSetup: (businessSetup: BusinessSetup, adminUser: User) => void;

      /**
       * Retrieves the local API configuration (URL, Key, QR).
       */
      getApiConfig: () => Promise<{ apiUrl: string, apiKey: string, qrCodeDataUrl: string }>;

      /**
       * Uploads an image to the remote Back Office server.
       */
      uploadImage: (filePath: string, apiUrl: string, apiKey: string) => Promise<{ imageUrl: string }>;

      /**
       * Gets list of printers.
       */
      getPrinters: () => Promise<any[]>;
    };
  }
}

// Helper function for saving data via Electron's main process
const saveDataToFile = async (fileName: string, data: any) => {
  if (window.electron) {
    return await window.electron.saveData(fileName, data);
  } else {
    console.warn('Electron API not available. Data not saved to disk.');
    return { success: true }; // Prevent crashes in a pure web environment
  }
};

// Helper function for reading data via Electron's main process
const readDataFromFile = async (fileName: string) => {
  if (window.electron) {
    return await window.electron.readData(fileName);
  } else {
    console.error('Electron API is not available. This application is designed to run in Electron.');
    return { success: false, error: 'Electron API not available' };
  }
};

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  localImage?: string;
  available: boolean;
  stock?: number;
  minStock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'mpesa' | 'credit';
  cashier: string;
  creditCustomer?: string;
  status: 'completed' | 'pending' | 'refunded';
}

export interface CreditSale {
  transactionId: string;
  amount: number;
  paidAmount: number;
  status: 'unpaid' | 'partially-paid' | 'paid';
}

export interface CreditCustomer {
  id: string;
  name: string;
  phone: string;
  totalCredit: number;
  paidAmount: number;
  balance: number;
  transactions: string[]; // Store transaction IDs
  createdAt: string;
  lastUpdated: string;
}

export interface User {
  id: string;
  name: string;
  pin: string;
  role: 'admin' | 'manager' | 'cashier';
  isActive: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  timestamp: string;
  cashier: string;
  receipt?: string;
}

export interface BusinessSetup {
  businessName: string;
  businessId?: string;
  apiUrl?: string;
  apiKey?: string;
  backOfficeUrl?: string;
  backOfficeApiKey?: string;
  address: string;
  phone?: string;
  email?: string;
  taxRate?: number;
  currency?: string;
  receiptHeader?: string;
  receiptFooter?: string;
  printerType: 'thermal' | 'standard';
  selectedPrinter?: string;
  showPrintPreview?: boolean;
  onScreenKeyboard?: boolean;
  isSetup: boolean;
  isLoggedIn: boolean; // Added for login state
  createdAt: string;
  servedByLabel: string;
  mpesaPaybill: string;
  mpesaTill: string;
  mpesaAccountNumber: string;
  tax: number;
  subtotal: number;
}

export interface CreditTransaction {
  customerName: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'partially-paid';
}

export interface CashierReport {
  cashierName: string;
  transactions: Transaction[];
  totalSales: number;
  cashTotal: number;
  mpesaTotal: number;
  creditTotal: number;
  creditTransactions: CreditTransaction[];
}

export interface ClosingReportData {
  date: string;
  cashiers: CashierReport[];
  grandTotal: number;
  totalCash: number;
  totalMpesa: number;
  totalCredit: number;
}

interface PosState {
  // Data
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  creditCustomers: CreditCustomer[];
  users: User[];
  expenses: Expense[];
  businessSetup: BusinessSetup | null;
  
  // UI State
  isDataLoaded: boolean;
  currentCashier: User | null;
  isCheckoutOpen: boolean;
  isSetupWizardOpen: boolean;
  isLoginOpen: boolean;
  isKeyboardOpen: boolean;
  activeInput: HTMLInputElement | HTMLTextAreaElement | null;
  keyboardInput: string;
  currentPage: 'pos' | 'reports' | 'customers' | 'settings' | 'closing' | 'dashboard' | 'inventory' | 'loyalty' | 'scanner' | 'sync' | 'register' | 'backoffice';
  // Settings
  isOnline: boolean;
  syncQueue: any[];
  lastSyncTime: string | null;
  
  // Enhanced features state
  inventoryProducts: Product[];
  loyaltyCustomers: any[];
  syncHistory: any[];
  lastClosingReportDate: string | null;

  // Actions
  login: (user: User) => void;
  logout: () => void;
  setProducts: (products: Product[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  
  setCurrentCashier: (user: User | null) => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openSetupWizard: () => void;
  closeSetupWizard: () => void;
  openLogin: () => void;
  closeLogin: () => void;
  openKeyboard: (inputElement: HTMLInputElement | HTMLTextAreaElement) => void;
  closeKeyboard: () => void;
  updateKeyboardTargetValue: (value: string) => void;
  setKeyboardInput: (value: string) => void;
  setCurrentPage: (page: PosState['currentPage']) => void;

  completeTransaction: (paymentMethod: 'cash' | 'mpesa' | 'credit', creditCustomer?: string) => void;
  reprintTransaction: (transactionId: string) => void;
  saveTransaction: (transaction: Transaction) => void;
  saveCreditCustomer: (customer: CreditCustomer) => void;
  updateCreditCustomer: (id: string, updates: Partial<CreditCustomer>) => void;
  deleteCreditCustomer: (id: string) => void;
  saveExpense: (expense: Expense) => void;
  saveBusinessSetup: (setup: BusinessSetup) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Sync operations
  addToSyncQueue: (operation: any) => void;
  processSyncQueue: () => void;
  syncFromServer: () => void;
  setOnlineStatus: (isOnline: boolean) => void;

  // Reports
  getDailySales: (date: string) => { cash: number; mpesa: number; credit: number; total: number };
  getDailyClosingReport: (date: string) => ClosingReportData;
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getUnpaidCredits: () => CreditCustomer[];

  // Enhanced features actions
  addProduct: (product: Product) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  addLoyaltyCustomer: (customer: any) => void;
  updateLoyaltyCustomer: (id: string, updates: any) => void;
  addSyncHistoryItem: (item: any) => void;
  loadInitialData: () => void;
  autoPrintClosingReport: () => void;
  finishSetup: (businessData: Omit<BusinessSetup, 'createdAt'>, adminUser: Omit<User, 'createdAt' | 'isActive'>) => Promise<void>;
  pushDataToServer: () => Promise<void>;
}

/**
 * Main Zustand store for the POS application.
 * Handles all state management including products, transactions, users, cart, and sync.
 * Persists data to local storage via 'zustand/middleware'.
 */
export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      // Initial state
      products: [],
      cart: [],
      transactions: [],
      creditCustomers: [],
      users: [],
      expenses: [],
      businessSetup: null,
      currentCashier: null,
      isDataLoaded: false,
      isCheckoutOpen: false,
      isSetupWizardOpen: true,
      isLoginOpen: true,
      isKeyboardOpen: false,
      activeInput: null,
      keyboardInput: '',
      currentPage: 'pos',
      isOnline: navigator.onLine,
      syncQueue: [],
      lastSyncTime: null,
      lastClosingReportDate: null,

      /**
       * Logs in a user and updates the session state.
       */
      login: (user) => {
        set((state) => ({
          currentCashier: user,
          businessSetup: state.businessSetup ? { ...state.businessSetup, isLoggedIn: true } : null,
        }));
      },

      /**
       * Logs out the current user.
       */
      logout: () => {
        set((state) => ({
          currentCashier: null,
          businessSetup: state.businessSetup ? { ...state.businessSetup, isLoggedIn: false } : null,
        }));
      },

      // Product operations
      setProducts: (products) => set({ products }),

      /**
       * Adds a product to the shopping cart.
       * Increments quantity if product already exists.
       */
      addToCart: (product) => {
        set((state) => {
          const existingItem = state.cart.find(item => item.product.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            };
          }
          return {
            cart: [...state.cart, { product, quantity: 1 }]
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter(item => item.product.id !== productId)
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          cart: state.cart.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        }));
      },

      clearCart: () => set({ cart: [] }),

      // User operations
      setCurrentCashier: (user) => set({ currentCashier: user }),

      // UI operations
      openCheckout: () => set({ isCheckoutOpen: true }),
      closeCheckout: () => set({ isCheckoutOpen: false }),
      openSetupWizard: () => set({ isSetupWizardOpen: true }),
      closeSetupWizard: () => set({ isSetupWizardOpen: false }),
      openLogin: () => set({ isLoginOpen: true }),
      closeLogin: () => set({ isLoginOpen: false }),
      openKeyboard: (inputElement) => set({ isKeyboardOpen: true, activeInput: inputElement }),
      closeKeyboard: () => set({ isKeyboardOpen: false, activeInput: null }),

      /**
       * Updates the value of the active input field based on on-screen keyboard input.
       * Dispatches a native 'input' event to ensure React state updates.
       */
      updateKeyboardTargetValue: (value) => {
        const { activeInput, closeKeyboard } = get();
        if (!activeInput) return;

        if (value === 'enter') {
          closeKeyboard();
          return;
        }

        const { selectionStart, selectionEnd, value: currentValue } = activeInput;
        const start = selectionStart || 0;
        const end = selectionEnd || 0;

        let newValue;
        let newCursorPos = start;

        if (value === 'backspace') {
          if (start === end && start > 0) {
            newValue = currentValue.slice(0, start - 1) + currentValue.slice(end);
            newCursorPos = start - 1;
          } else {
            newValue = currentValue.slice(0, start) + currentValue.slice(end);
            newCursorPos = start;
          }
        } else {
          newValue = currentValue.slice(0, start) + value + currentValue.slice(end);
          newCursorPos = start + value.length;
        }

        activeInput.value = newValue;
        const event = new Event('input', { bubbles: true });
        activeInput.dispatchEvent(event);
        activeInput.selectionStart = activeInput.selectionEnd = newCursorPos;
      },
      setKeyboardInput: (value) => set({ keyboardInput: value }),
      setCurrentPage: (page) => set({ currentPage: page }),

      // Transaction operations
      /**
       * Completes a transaction, saves it, updates credit if needed, and prints receipt.
       */
      completeTransaction: (paymentMethod, creditCustomerName) => {
        const state = get();
        if (!state.currentCashier) return;

        const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const tax = 0; // Assuming tax is handled elsewhere or is 0
        const total = subtotal + tax;

        const transaction: Transaction = {
          id: `TXN${Date.now()}`,
          timestamp: new Date().toISOString(),
          items: [...state.cart],
          subtotal,
          tax,
          total,
          paymentMethod,
          cashier: state.currentCashier.name,
          creditCustomer: creditCustomerName,
          status: 'completed'
        };

        state.saveTransaction(transaction);
        state.addToSyncQueue({ type: 'new-transaction', data: transaction });

        // Handle credit customer
        if (paymentMethod === 'credit' && creditCustomerName) {
            const existingCustomer = state.creditCustomers.find(c => c.name === creditCustomerName);

            if (existingCustomer) {
                const updatedCustomer: Partial<CreditCustomer> = {
                    totalCredit: (existingCustomer.totalCredit || 0) + total,
                    balance: (existingCustomer.balance || 0) + total,
                    transactions: [...(existingCustomer.transactions || []), transaction.id],
                    lastUpdated: new Date().toISOString(),
                };
                state.updateCreditCustomer(existingCustomer.id, updatedCustomer);
            } else {
                // If the customer does not exist, this function should ideally not be called.
                // A new customer should be created through a separate UI flow first.
                // However, to prevent data loss, we can create a new one.
                const newCustomer: CreditCustomer = {
                    id: `CUST${Date.now()}`,
                    name: creditCustomerName,
                    phone: '', // Phone should be added via an "Add Customer" form
                    totalCredit: total,
                    paidAmount: 0,
                    balance: total,
                    transactions: [transaction.id],
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                };
                state.saveCreditCustomer(newCustomer);
            }
        }

        state.clearCart();
        state.closeCheckout();

        if (window.electron && state.businessSetup) {
          window.electron.printReceipt(transaction, state.businessSetup, false);
        }
      },

      reprintTransaction: (transactionId) => {
        const state = get();
        const transaction = state.transactions.find(t => t.id === transactionId);
        if (transaction && window.electron && state.businessSetup) {
          window.electron.printReceipt(transaction, state.businessSetup, true);
        }
      },

      saveTransaction: (transaction) => {
        set((state) => {
          const updatedTransactions = [transaction, ...state.transactions];
          saveDataToFile('transactions.json', updatedTransactions);
          return { transactions: updatedTransactions };
        });
      },

      saveCreditCustomer: (customer) => {
        set((state) => {
          const updatedCustomers = [...state.creditCustomers, customer];
          saveDataToFile('credit-customers.json', updatedCustomers);
          state.addToSyncQueue({ type: 'add-credit-customer', data: customer });
          return { creditCustomers: updatedCustomers };
        });
      },

      updateCreditCustomer: (id, updates) => {
        set((state) => {
            const updatedCustomers = state.creditCustomers.map(customer =>
                customer.id === id ? { ...customer, ...updates, lastUpdated: new Date().toISOString() } : customer
            );
            saveDataToFile('credit-customers.json', updatedCustomers);
            state.addToSyncQueue({ type: 'update-credit-customer', data: { id, updates } });
            return { creditCustomers: updatedCustomers };
        });
      },

      addCreditPayment: (customerId: string, amount: number) => {
        const state = get();
        const customer = state.creditCustomers.find(c => c.id === customerId);
        if (!customer) return;

        const newPaidAmount = (customer.paidAmount || 0) + amount;
        const newBalance = (customer.balance || 0) - amount;

        state.updateCreditCustomer(customerId, {
            paidAmount: newPaidAmount,
            balance: Math.max(0, newBalance), // Ensure balance doesn't go negative
        });
      },

      deleteCreditCustomer: (id) => {
        set((state) => {
          const updatedCustomers = state.creditCustomers.filter(customer => customer.id !== id);
          saveDataToFile('credit-customers.json', updatedCustomers);
          state.addToSyncQueue({ type: 'delete-credit-customer', data: { id } });
          return { creditCustomers: updatedCustomers };
        });
      },

      saveExpense: (expense) => {
        set((state) => {
          const updatedExpenses = [expense, ...state.expenses];
          saveDataToFile('expenses.json', updatedExpenses);
          state.addToSyncQueue({ type: 'add-expense', data: expense });
          return { expenses: updatedExpenses };
        });
      },

      saveBusinessSetup: (setup) => {
        saveDataToFile('business-setup.json', setup);
        set((state) => {
            state.addToSyncQueue({ type: 'update-business-setup', data: setup });
            return { businessSetup: setup };
        });
      },

      // Sync operations
      addToSyncQueue: (operation) => {
        set((state) => ({
          syncQueue: [...state.syncQueue, operation]
        }));
        // Trigger sync immediately for real-time updates
        get().processSyncQueue();
      },

      processSyncQueue: async () => {
        const state = get();
        const apiUrl = (state.businessSetup?.apiUrl || state.businessSetup?.backOfficeUrl)?.replace(/\/$/, '');
        const apiKey = state.businessSetup?.apiKey || state.businessSetup?.backOfficeApiKey;

        if (!state.isOnline || state.syncQueue.length === 0 || !apiUrl || !apiKey) return;

        const queue = [...state.syncQueue];
        set({ syncQueue: [] }); // Optimistically clear queue

        try {
          const response = await fetch(`${apiUrl}/api/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(queue)
          });

          if (!response.ok) {
            throw new Error(`Sync failed with status: ${response.status}`);
          }

          // Sync successful, update time and trigger a pull to get any updates
          set({ lastSyncTime: new Date().toISOString() });
          get().syncFromServer();

        } catch (error) {
          console.error('Sync failed:', error);
          // On total failure (network), put items back in queue
          set((state) => ({
            syncQueue: [...queue, ...state.syncQueue]
          }));
        }
      },

      syncFromServer: async () => {
        const state = get();
        const apiUrl = (state.businessSetup?.apiUrl || state.businessSetup?.backOfficeUrl)?.replace(/\/$/, '');
        const apiKey = state.businessSetup?.apiKey || state.businessSetup?.backOfficeApiKey;

        // Add debug logging for diagnosis
        if (!state.isOnline) { console.debug("Sync skipped: Offline"); return; }
        if (!apiUrl) { console.debug("Sync skipped: No API URL"); return; }
        if (!apiKey) { console.debug("Sync skipped: No API Key"); return; }

        try {
          console.debug(`Syncing from server: ${apiUrl}/api/sync`);
          const response = await fetch(`${apiUrl}/api/sync`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`
            }
          });

          if (!response.ok) {
             console.error(`Sync fetch failed: ${response.status} ${response.statusText}`);
             return;
          }

          const serverData = await response.json();
          console.debug("Sync data received:", {
             products: serverData.products?.length,
             users: serverData.users?.length
          });
          const lastSync = state.lastSyncTime ? new Date(state.lastSyncTime) : new Date(0);

          const mergeData = (local, server) => {
            // Filter out items with invalid IDs to prevent sync errors
            const validServerItems = server.filter(item => item.id != null);
            const serverDataById = new Map(validServerItems.map(item => [item.id, item]));
            const localDataById = new Map(local.map(item => [item.id, item]));

            const merged = local.map(localItem => {
              const serverItem = serverDataById.get(localItem.id);
              if (serverItem) {
                const serverTimestamp = new Date(serverItem.updatedAt || serverItem.createdAt);
                const localTimestamp = new Date(localItem.updatedAt || localItem.createdAt);

                // Conflict Resolution:
                // If Server data is strictly newer than Local data, accept Server data.
                // This handles the case where Back Office makes a change (e.g. updates User PIN).
                if (serverTimestamp.getTime() > localTimestamp.getTime()) {
                     return serverItem;
                }
                // Otherwise, keep local data (Client Wins / Unchanged)
                return localItem;
              }
              return localItem; // Exists locally but not on server (yet)
            });

            // Add items that exist on Server but not Locally (Downstream Sync)
            validServerItems.forEach(serverItem => {
              if (!localDataById.has(serverItem.id)) {
                merged.push(serverItem);
              }
            });
            return merged;
          };

          const newProducts = mergeData(state.products, serverData.products || []);
          const newUsers = mergeData(state.users, serverData.users || []);
          const newExpenses = mergeData(state.expenses, serverData.expenses || []);
          const newCreditCustomers = mergeData(state.creditCustomers, serverData.creditCustomers || []);

          let newBusinessSetup = state.businessSetup;
          if (serverData.businessSetup) {
            const serverTimestamp = new Date(serverData.businessSetup.updatedAt || serverData.businessSetup.createdAt);
            const localTimestamp = state.businessSetup ? new Date(state.businessSetup.updatedAt || state.businessSetup.createdAt) : new Date(0);
            // If server data is newer, update local
            if (serverTimestamp > localTimestamp) {
              newBusinessSetup = { ...state.businessSetup, ...serverData.businessSetup };
            }
          }

          set({
            products: newProducts,
            users: newUsers,
            expenses: newExpenses,
            creditCustomers: newCreditCustomers,
            businessSetup: newBusinessSetup,
          });

          saveDataToFile('products.json', newProducts);
          saveDataToFile('users.json', newUsers);
          saveDataToFile('expenses.json', newExpenses);
          saveDataToFile('credit-customers.json', newCreditCustomers);
          saveDataToFile('business-setup.json', newBusinessSetup);

        } catch (error) {
          console.error('Failed to sync from server:', error);
        }
      },

      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        if (isOnline) {
          get().processSyncQueue();
          get().syncFromServer(); // Also pull data when coming online
        }
      },

      // Reports
      getDailySales: (date) => {
        const state = get();
        const dayTransactions = state.transactions.filter(t =>
          t.timestamp.startsWith(date) && t.status === 'completed'
        );

        const cash = dayTransactions
          .filter(t => t.paymentMethod === 'cash')
          .reduce((sum, t) => sum + t.total, 0);

        const mpesa = dayTransactions
          .filter(t => t.paymentMethod === 'mpesa')
          .reduce((sum, t) => sum + t.total, 0);

        const credit = dayTransactions
          .filter(t => t.paymentMethod === 'credit')
          .reduce((sum, t) => sum + t.total, 0);

        return { cash, mpesa, credit, total: cash + mpesa + credit };
      },

      getDailyClosingReport: (date) => {
        const state = get();
        const dayTransactions = state.transactions.filter(t =>
          t.timestamp.startsWith(date) && t.status === 'completed'
        );

        const cashierNames = [...new Set(dayTransactions.map(t => t.cashier))];

        const cashiers: CashierReport[] = cashierNames.map(name => {
          const transactions = dayTransactions.filter(t => t.cashier === name);
          const cashTotal = transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0);
          const mpesaTotal = transactions.filter(t => t.paymentMethod === 'mpesa').reduce((sum, t) => sum + t.total, 0);
          const creditTotal = transactions.filter(t => t.paymentMethod === 'credit').reduce((sum, t) => sum + t.total, 0);

          const creditTransactions: CreditTransaction[] = transactions
            .filter(t => t.paymentMethod === 'credit' && t.creditCustomer)
            .map(t => {
              const customer = state.creditCustomers.find(c => c.name === t.creditCustomer);
              // If the customer has paid their balance or if we implement partial payment logic later
              // For now, if balance > 0, we consider recent transactions as part of that unpaid balance
              const isPaid = (customer?.balance || 0) <= 0;
              return {
                customerName: t.creditCustomer || 'N/A',
                amount: t.total,
                status: isPaid ? 'paid' : 'unpaid',
              };
            });

          return {
            cashierName: name,
            transactions,
            totalSales: cashTotal + mpesaTotal + creditTotal,
            cashTotal,
            mpesaTotal,
            creditTotal,
            creditTransactions,
          };
        });

        const totalCash = cashiers.reduce((sum, c) => sum + c.cashTotal, 0);
        const totalMpesa = cashiers.reduce((sum, c) => sum + c.mpesaTotal, 0);
        const totalCredit = cashiers.reduce((sum, c) => sum + c.creditTotal, 0);

        return {
          date,
          cashiers,
          grandTotal: totalCash + totalMpesa + totalCredit,
          totalCash,
          totalMpesa,
          totalCredit,
        };
      },

      getTransactionsByDateRange: (startDate, endDate) => {
        const state = get();
        return state.transactions.filter(t => {
          const date = new Date(t.timestamp);
          return date >= new Date(startDate) && date <= new Date(endDate);
        });
      },

      getUnpaidCredits: () => {
        const state = get();
        return state.creditCustomers.filter(customer => (customer.balance || 0) > 0);
      },

      addUser: (user) => {
        set((state) => {
          const updatedUsers = [...state.users, user];
          saveDataToFile('users.json', updatedUsers);
          state.addToSyncQueue({ type: 'add-user', data: user });
          return { users: updatedUsers };
        });
      },

      addProduct: async (product) => {
        const state = get();
        if (product.image && !product.image.startsWith('http')) {
          try {
            const { path: localPath } = await window.electron.saveImage(product.image);
            product.localImage = localPath;

            if (state.isOnline) {
              const { imageUrl } = await window.electron.uploadImage(product.image, state.businessSetup.apiUrl, state.businessSetup.apiKey);
              product.image = imageUrl;
            } else {
              product.image = '';
              state.addToSyncQueue({ type: 'upload-image', data: { productId: product.id, path: product.image } });
            }
          } catch (error) {
            console.error('Image handling failed:', error);
            product.image = '';
          }
        }

        set((state) => {
          const updatedProducts = [...state.products, product];
          saveDataToFile('products.json', updatedProducts);
          state.addToSyncQueue({ type: 'add-product', data: product });
          return { products: updatedProducts };
        });
      },

      updateProduct: async (id, updates) => {
        const state = get();
        if (updates.image && !updates.image.startsWith('http')) {
          try {
            const { path: localPath } = await window.electron.saveImage(updates.image);
            updates.localImage = localPath;

            if (state.isOnline) {
              const { imageUrl } = await window.electron.uploadImage(updates.image, state.businessSetup.apiUrl, state.businessSetup.apiKey);
              updates.image = imageUrl;
            } else {
              updates.image = '';
              state.addToSyncQueue({ type: 'upload-image', data: { productId: id, path: updates.image } });
            }
          } catch (error) {
            console.error('Image handling failed:', error);
            updates.image = '';
          }
        }

        set((state) => {
          const updatedProducts = state.products.map(product =>
            product.id === id ? { ...product, ...updates } : product
          );
          saveDataToFile('products.json', updatedProducts);
          state.addToSyncQueue({ type: 'update-product', data: { id, updates } });
          return { products: updatedProducts };
        });
      },

      deleteProduct: (id) => {
        set((state) => {
          const updatedProducts = state.products.filter(product => product.id !== id);
          saveDataToFile('products.json', updatedProducts);
          state.addToSyncQueue({ type: 'delete-product', data: { id } });
          return { products: updatedProducts };
        });
      },

      updateUser: (id, updates) => {
        set((state) => {
          const updatedUsers = state.users.map(user =>
            user.id === id ? { ...user, ...updates } : user
          );
          saveDataToFile('users.json', updatedUsers);
          state.addToSyncQueue({ type: 'update-user', data: { id, updates } });
          return { users: updatedUsers };
        });
      },

      deleteUser: (id) => {
        set((state) => {
          const updatedUsers = state.users.filter(user => user.id !== id);
          saveDataToFile('users.json', updatedUsers);
          state.addToSyncQueue({ type: 'delete-user', data: { id } });
          return { users: updatedUsers };
        });
      },

      loadInitialData: async () => {
        try {
          // Prioritize loading business setup first.
          const { data: businessSetupData } = await readDataFromFile('business-setup.json');
          let isSetup = false;
          if (businessSetupData && businessSetupData.isSetup) {
            // Check if we have env vars to override/set defaults for Back Office
            const updatedBusinessSetup = { ...businessSetupData };
            if (!updatedBusinessSetup.backOfficeUrl && import.meta.env.VITE_BACK_OFFICE_URL) {
                updatedBusinessSetup.backOfficeUrl = import.meta.env.VITE_BACK_OFFICE_URL;
            }
            if (!updatedBusinessSetup.backOfficeApiKey && import.meta.env.VITE_BACK_OFFICE_API_KEY) {
                updatedBusinessSetup.backOfficeApiKey = import.meta.env.VITE_BACK_OFFICE_API_KEY;
            }

            set({ businessSetup: updatedBusinessSetup });
            isSetup = true;
          } else if (businessSetupData && !businessSetupData.isSetup) {
             // Pre-fill setup data if available from env, even if not setup
              const prefillSetup = { ...businessSetupData };
              if (import.meta.env.VITE_BACK_OFFICE_URL) prefillSetup.backOfficeUrl = import.meta.env.VITE_BACK_OFFICE_URL;
              if (import.meta.env.VITE_BACK_OFFICE_API_KEY) prefillSetup.backOfficeApiKey = import.meta.env.VITE_BACK_OFFICE_API_KEY;
              set({ businessSetup: prefillSetup });
          }

          const fileNames = ['products.json', 'users.json', 'transactions.json', 'credit-customers.json', 'expenses.json'];
          const dataMap = {
            'products.json': 'products',
            'users.json': 'users',
            'transactions.json': 'transactions',
            'credit-customers.json': 'creditCustomers',
            'expenses.json': 'expenses'
          };

          for (const fileName of fileNames) {
            const { data } = await readDataFromFile(fileName);
            if (data) {
              set({ [dataMap[fileName]]: data });
            }
          }

        } catch (error) {
          console.error("Failed to load initial data:", error);
          // Handle error appropriately, maybe set an error state
        } finally {
          set({ isDataLoaded: true });
        }
      },

      autoPrintClosingReport: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (state.lastClosingReportDate !== yesterday && state.lastClosingReportDate !== today) {
          const reportData = state.getDailyClosingReport(yesterday);
          if (reportData.grandTotal > 0 && window.electron && state.businessSetup) {
            window.electron.printClosingReport(reportData, state.businessSetup);
            set({ lastClosingReportDate: yesterday });
          }
        }
      },

      finishSetup: async (businessData, adminUser) => {
        const fullBusinessData: BusinessSetup = {
          ...businessData,
          receiptFooter: 'Developed and Managed by Whiz Tech\nContact: 0740-841-168',
          printerType: businessData.printerType || 'thermal', // Default to thermal
          createdAt: new Date().toISOString(),
        };

        const fullAdminUser: User = {
          ...adminUser,
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        // 1. Save the business setup and the first admin user.
        await saveDataToFile('business-setup.json', fullBusinessData);
        await saveDataToFile('users.json', [fullAdminUser]);

        // 2. Update the store's state to reflect that setup is complete.
        set({
          businessSetup: fullBusinessData,
          users: [fullAdminUser],
          products: [],
          transactions: [],
          expenses: [],
          creditCustomers: [],
        });

        // 3. Trigger the business setup printout.
        const printWithRetry = (retries = 5) => {
          if (window.electron && window.electron.printBusinessSetup) {
            window.electron.printBusinessSetup(fullBusinessData, fullAdminUser);
          } else if (retries > 0) {
            setTimeout(() => printWithRetry(retries - 1), 500);
          } else {
            console.error("Failed to print business setup: Electron API not available.");
          }
        };
        printWithRetry();
      },

      pushDataToServer: async () => {
        const state = get();
        // Use backOfficeUrl if available, fallback to apiUrl (legacy)
        const rawUrl = state.businessSetup?.backOfficeUrl || state.businessSetup?.apiUrl;
        const apiKey = state.businessSetup?.backOfficeApiKey || state.businessSetup?.apiKey;

        const apiUrl = rawUrl?.replace(/\/$/, '');

        if (!state.isOnline) {
            console.error("Cannot push data: App is offline");
            return;
        }
        if (!apiUrl) {
            console.error("Cannot push data: No Back Office URL configured");
            return;
        }
        if (!apiKey) {
            console.error("Cannot push data: No Back Office API Key configured");
            return;
        }

        try {
            const payload = {
                products: state.products,
                users: state.users,
                expenses: state.expenses,
                customers: state.creditCustomers,
                transactions: state.transactions,
                businessSetup: state.businessSetup
            };

            const response = await fetch(`${apiUrl}/api/sync/full`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'X-API-KEY': apiKey
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Full sync failed');
            }
            console.log("Full sync successful");
            set({ lastSyncTime: new Date().toISOString() });
        } catch (error) {
            console.error('Full sync error:', error);
        }
      },
    }),
    {
      name: 'pos-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.businessSetup = { ...state.businessSetup, isLoggedIn: false };
        }
      },
      partialize: (state) => ({
        businessSetup: state.businessSetup,
        currentCashier: state.currentCashier,
        transactions: state.transactions ? state.transactions.slice(-100) : [],
        creditCustomers: state.creditCustomers,
        users: state.users,
        expenses: state.expenses ? state.expenses.slice(-50) : [],
        lastSyncTime: state.lastSyncTime,
        products: state.products ? state.products.slice(-100) : [],
        inventoryProducts: state.inventoryProducts,
        loyaltyCustomers: state.loyaltyCustomers,
        syncHistory: state.syncHistory ? state.syncHistory.slice(-50) : []
      })
    }
  )
);

// Initial data will be loaded in the main App component.

// Sync intervals are now managed in App.tsx to ensure proper lifecycle and state access
