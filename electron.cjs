const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const crypto = require('crypto');
const os = require('os');
const { generateReceipt, generateClosingReport, generateBusinessSetup } = require(path.join(__dirname, 'print-jobs.cjs'));

/**
 * Main Electron Process Script.
 * Handles application lifecycle, window management, IPC communication, and a local API server for mobile printing.
 */

// Define paths for storing user data and assets.
const userDataPath = path.join(app.getPath('userData'), 'data');
const productImagesPath = path.join(app.getPath('userData'), 'assets', 'product_images');

/**
 * Ensures that the necessary application directories exist.
 * Creates 'data' and 'assets/product_images' directories in the user data path.
 */
async function ensureAppDirs() {
  try {
    await fs.mkdir(userDataPath, { recursive: true });
    await fs.mkdir(productImagesPath, { recursive: true });
  } catch (error) {
    console.error('Failed to create application directories:', error);
  }
}

/**
 * Ensures that the initial JSON data files exist in the user data directory.
 * If a file is missing, it is created with a default empty structure.
 */
async function ensureDataFilesExist() {
  const dataFiles = {
    'business-setup.json': { isSetup: false },
    'users.json': [],
    'products.json': [],
    'transactions.json': [],
    'expenses.json': [],
    'credit-customers.json': [],
  };

  for (const [fileName, content] of Object.entries(dataFiles)) {
    const filePath = path.join(userDataPath, fileName);
    try {
      await fs.access(filePath);
    } catch {
      // File does not exist, so create it
      await fs.writeFile(filePath, JSON.stringify(content, null, 2));
    }
  }
}

/**
 * Loads a URL into a BrowserWindow with retry logic.
 * Useful for development when the Vite server might not be ready immediately.
 *
 * @param {BrowserWindow} win - The window to load the URL into.
 * @param {string} url - The URL to load.
 */
const loadUrlWithRetries = (win, url) => {
  win.loadURL(url).catch(() => {
    console.log('Vite server not ready, retrying in 2 seconds...');
    setTimeout(() => {
      loadUrlWithRetries(win, url);
    }, 2000);
  });
};

/**
 * Creates the main application window.
 * Configures size, preferences, and loads the application content.
 */
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // contextIsolation is true by default and is a security best practice.
    },
  });

  // Remove the default menu bar
  mainWindow.setMenu(null);

  // In development, load from the Vite dev server
  if (!app.isPackaged) {
    const url = process.argv[2] || 'http://localhost:5174';
    loadUrlWithRetries(mainWindow, url);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the static build
    mainWindow.loadURL('file://' + path.join(__dirname, 'dist/index.html'));
  }
}

// Enable remote debugging for Playwright
app.commandLine.appendSwitch('remote-debugging-port', '9222');

let apiKey = null;
let server = null;

/**
 * Gets the local IPv4 address of the machine.
 * Used for generating the connection URL for the mobile app.
 *
 * @returns {string} The local IP address.
 */
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

/**
 * Helper to safely read JSON file
 */
async function readJsonFile(filename) {
    try {
        const data = await fs.readFile(path.join(userDataPath, filename), 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return []; // Default to empty array or object depending on usage, but array is safer for lists
    }
}

/**
 * Helper to safely write JSON file
 */
async function writeJsonFile(filename, data) {
    await fs.writeFile(path.join(userDataPath, filename), JSON.stringify(data, null, 2));
}

/**
 * Starts the local Express API server.
 * This server allows the Mobile App to send print jobs to the Desktop App.
 */
function startApiServer() {
    const apiApp = express();

    // Increase body limit to support large sync payloads
    apiApp.use(express.json({ limit: '50mb' }));
    apiApp.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Enable CORS for all routes
    apiApp.use(cors());

    // Serve product images statically
    apiApp.use('/assets', express.static(productImagesPath));

    const authMiddleware = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    };

    apiApp.get('/api/status', (req, res) => {
        res.json({ status: 'ok' });
    });

    apiApp.get('/api/config', (req, res) => {
      if (!apiKey) {
        apiKey = crypto.randomBytes(32).toString('hex');
      }
      const ipAddress = getLocalIpAddress();
      const address = server ? server.address() : null;
      const port = (address && typeof address === 'object' && address.port) ? address.port : 3000;
      res.json({ apiKey, apiUrl: `http://${ipAddress}:${port}` });
    });

    // GET /api/products - Legacy endpoint
    apiApp.get('/api/products', authMiddleware, async (req, res) => {
        const products = await readJsonFile('products.json');
        res.json(products);
    });

    // GET /api/users - For Mobile Login
    apiApp.get('/api/users', authMiddleware, async (req, res) => {
        const users = await readJsonFile('users.json');
        res.json(users);
    });

    // GET /api/sync - Full state for Mobile Pull
    apiApp.get('/api/sync', authMiddleware, async (req, res) => {
        try {
            const [products, users, expenses, creditCustomers, businessSetup, transactions] = await Promise.all([
                readJsonFile('products.json'),
                readJsonFile('users.json'),
                readJsonFile('expenses.json'),
                readJsonFile('credit-customers.json'),
                readJsonFile('business-setup.json').then(d => Array.isArray(d) ? d[0] : d), // Handle potential array wrapper
                readJsonFile('transactions.json')
            ]);

            // Filter transactions? Mobile might not need ALL history.
            // But for now, sending last 100 might be safer to avoid huge payloads.
            // posStore handles partial updates.
            const limitedTransactions = Array.isArray(transactions) ? transactions.slice(0, 200) : [];

            // Rewrite image URLs to be accessible via HTTP
            const ipAddress = getLocalIpAddress();
            const address = server ? server.address() : null;
            const port = (address && typeof address === 'object' && address.port) ? address.port : 3000;
            const baseUrl = `http://${ipAddress}:${port}`;

            const productsWithUrls = products.map(p => {
                if (p.localImage && !p.image.startsWith('http')) {
                    // Assuming localImage is absolute path, we need to extract filename
                    const filename = path.basename(p.localImage);
                    return { ...p, image: `${baseUrl}/assets/${filename}` };
                }
                return p;
            });

            res.json({
                products: productsWithUrls,
                users,
                expenses,
                creditCustomers,
                businessSetup,
                transactions: limitedTransactions
            });
        } catch (error) {
            console.error('Sync GET error:', error);
            res.status(500).json({ error: 'Sync failed' });
        }
    });

    // POST /api/sync - Handle Push Operations
    apiApp.post('/api/sync', authMiddleware, async (req, res) => {
        const operations = req.body;
        if (!Array.isArray(operations)) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        try {
            // Process operations sequentially
            for (const op of operations) {
                const { type, data } = op;

                if (type === 'new-transaction') {
                    const transactions = await readJsonFile('transactions.json');
                    transactions.unshift(data);
                    await writeJsonFile('transactions.json', transactions);

                    // Also notify renderer to update UI if it's showing recent transactions
                    const win = BrowserWindow.getAllWindows()[0];
                    if (win) win.webContents.send('sync-update', { type, data });

                } else if (type === 'add-credit-customer') {
                    const customers = await readJsonFile('credit-customers.json');
                    customers.push(data);
                    await writeJsonFile('credit-customers.json', customers);

                } else if (type === 'update-credit-customer') {
                    const customers = await readJsonFile('credit-customers.json');
                    const idx = customers.findIndex(c => c.id === data.id);
                    if (idx !== -1) {
                        customers[idx] = { ...customers[idx], ...data.updates };
                        await writeJsonFile('credit-customers.json', customers);
                    }

                } else if (type === 'add-expense') {
                    const expenses = await readJsonFile('expenses.json');
                    // Ensure cashier field is set if present (Back-Office logic parity)
                    if (data.cashier && !data.recordedBy) {
                        data.recordedBy = data.cashier;
                    }
                    expenses.unshift(data);
                    await writeJsonFile('expenses.json', expenses);

                } else if (type === 'add-product') {
                    const products = await readJsonFile('products.json');
                    // Check for duplicate
                    const exists = products.find(p => p.productId === data.id || p.productId === data.productId);
                    if (!exists) {
                        const newProduct = { ...data, productId: data.id || data.productId };
                        delete newProduct.id;
                        products.push(newProduct);
                        await writeJsonFile('products.json', products);
                    }

                } else if (type === 'update-product') {
                    const products = await readJsonFile('products.json');
                    const prodId = data.id || data.productId;
                    const idx = products.findIndex(p => p.productId === prodId);
                    if (idx !== -1) {
                        const updates = data.updates || data; // Handle both wrapper and direct updates
                        delete updates.id;
                        products[idx] = { ...products[idx], ...updates };
                        await writeJsonFile('products.json', products);
                    }

                } else if (type === 'delete-product') {
                    const products = await readJsonFile('products.json');
                    const prodId = data.id || data.productId;
                    const newProducts = products.filter(p => p.productId !== prodId);
                    await writeJsonFile('products.json', newProducts);

                } else if (type === 'add-user') {
                    const users = await readJsonFile('users.json');
                    const newUser = { ...data, userId: data.id || data.userId };
                    delete newUser.id;
                    // Generate username if missing (Back-Office logic)
                    if (!newUser.username && newUser.name) {
                        newUser.username = newUser.name.toLowerCase().replace(/\s+/g, '');
                    }
                    users.push(newUser);
                    await writeJsonFile('users.json', users);

                } else if (type === 'update-user') {
                    const users = await readJsonFile('users.json');
                    const userId = data.id || data.userId;
                    const idx = users.findIndex(u => u.userId === userId);
                    if (idx !== -1) {
                        const updates = data.updates || data;
                        delete updates.id;
                        users[idx] = { ...users[idx], ...updates };
                        await writeJsonFile('users.json', users);
                    }

                } else if (type === 'delete-user') {
                    const users = await readJsonFile('users.json');
                    const userId = data.id || data.userId;
                    const newUsers = users.filter(u => u.userId !== userId);
                    await writeJsonFile('users.json', newUsers);
                }
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Sync POST error:', error);
            res.status(500).json({ error: 'Sync processing failed' });
        }
    });

    apiApp.post('/api/transactions', authMiddleware, async (req, res) => {
        const newTransaction = req.body;
        try {
            const transactions = await readJsonFile('transactions.json');
            transactions.unshift(newTransaction);
            await writeJsonFile('transactions.json', transactions);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to save transaction' });
        }
    });

    apiApp.post('/api/print-receipt', authMiddleware, (req, res) => {
        const { transaction, businessSetup } = req.body;
        const mainWindow = BrowserWindow.getAllWindows()[0];
        // Add a flag or small modification to indicate remote print if needed
        mainWindow.webContents.send('print-receipt-from-api', transaction, businessSetup);
        res.json({ success: true });
    });

    server = apiApp.listen(3000, '0.0.0.0', () => {
        console.log('API server started on port 3000');
    });
}

app.whenReady().then(async () => {
  await ensureAppDirs();
  await ensureDataFilesExist();
  startApiServer();

  // Register a custom protocol to serve images from the assets directory
  protocol.registerFileProtocol('local-asset', (request, callback) => {
    const url = request.url.substr(14); // Remove 'local-asset://'
    const filePath = path.join(productImagesPath, url);
    callback({ path: path.normalize(filePath) });
  });

  createWindow();

  /**
   * IPC Handler: 'save-image'
   * Saves an image from a temporary path to the application's persistent storage.
   *
   * @param {Electron.IpcMainInvokeEvent} event
   * @param {string} tempPath - The path to the temporary image file.
   * @returns {Promise<{success: boolean, path?: string, fileName?: string, error?: string}>}
   */
  ipcMain.handle('save-image', async (event, tempPath) => {
    if (!tempPath || typeof tempPath !== 'string') {
      console.error('Invalid or missing tempPath for save-image');
      return { success: false, error: 'Invalid or missing file path' };
    }
    try {
      const fileName = `${Date.now()}-${path.basename(tempPath)}`;
      const permanentPath = path.join(productImagesPath, fileName);
      await fs.copyFile(tempPath, permanentPath);
      return { success: true, path: permanentPath, fileName: fileName };
    } catch (error) {
      console.error('Failed to save image:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: 'save-data'
   * Writes JSON data to a file in the user data directory.
   *
   * @param {Electron.IpcMainInvokeEvent} event
   * @param {string} fileName - The name of the file to save.
   * @param {any} data - The data to serialize and save.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  ipcMain.handle('save-data', async (event, fileName, data) => {
    try {
      const filePath = path.join(userDataPath, fileName);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return { success: true };
    } catch (error) {
      console.error(`Failed to save data to ${fileName}:`, error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: 'read-data'
   * Reads JSON data from a file in the user data directory.
   * If the file is missing, attempts to seed it from default data.
   *
   * @param {Electron.IpcMainInvokeEvent} event
   * @param {string} fileName - The name of the file to read.
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  ipcMain.handle('read-data', async (event, fileName) => {
    const filePath = path.join(userDataPath, fileName);
    try {
      // Always try to read from the userData path first.
      const data = await fs.readFile(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    } catch (error) {
      if (error.code === 'ENOENT') {
        // If the file doesn't exist in userData, *then* try to seed it from public.
        try {
          // Determine the correct seed path based on whether the app is packaged.
          // In production (app.isPackaged), resources are typically in the 'resources' folder or bundled.
          // We assume 'public/data' is copied to the resources directory or kept relative in dev.
          // For electron-builder with extraResources:
          let seedPath;
          if (app.isPackaged) {
             // Adjust this path based on your specific electron-builder config.
             // Often it's in process.resourcesPath or app.getAppPath().
             // Here we assume the 'public' folder is copied to the root of the app bundle.
             seedPath = path.join(app.getAppPath(), 'data', fileName);
             // Note: You might need to adjust 'data' folder location in build config.
             // Fallback attempt if not found there:
             try {
                 await fs.access(seedPath);
             } catch {
                 seedPath = path.join(process.resourcesPath, 'data', fileName);
             }
          } else {
             seedPath = path.join(__dirname, 'public', 'data', fileName);
          }

          const seedData = await fs.readFile(seedPath, 'utf-8');
          await fs.writeFile(filePath, seedData); // Copy seed data to userData path
          return { success: true, data: JSON.parse(seedData) };
        } catch (seedError) {
          // If there's no seed file, it's not a critical error (unless it's essential config).
          // The app should handle the absence of data.
          // console.log(`No seed data found for ${fileName} at ${seedPath}`);
          return { success: true, data: null };
        }
      }
      // For any other errors, log them.
      console.error(`Failed to read data from ${fileName}:`, error);
      return { success: false, error: error.message };
    }
  });

  // --- Printing Logic ---
  /**
   * Creates a hidden BrowserWindow to render HTML content and triggers the print dialog.
   *
   * @param {string} htmlContent - The HTML string to print.
   * @param {Object} options - Electron print options.
   */
  const printHtml = (htmlContent, options = {}) => {
    const printWindow = new BrowserWindow({ show: false, webPreferences: { contextIsolation: false, nodeIntegration: true } });

    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    printWindow.webContents.on('did-finish-load', () => {
        printWindow.webContents.print(options, (success, errorType) => {
            if (!success) console.error('Print failed:', errorType);
            else console.log('Print job sent successfully');
            printWindow.close();
        });
    });
  };

  /**
   * IPC Listener: 'print-receipt'
   * Generates and prints a transaction receipt.
   */
  ipcMain.on('print-receipt', async (event, transaction, businessSetup, isReprint = false) => {
      const htmlContent = await generateReceipt(transaction, businessSetup, isReprint);
      printHtml(htmlContent);
  });

  /**
   * IPC Listener: 'print-receipt-from-api'
   * Generates and prints a receipt requested via the local API (e.g., from Mobile App).
   */
  ipcMain.on('print-receipt-from-api', async (event, transaction, businessSetup) => {
      const htmlContent = await generateReceipt(transaction, businessSetup, true);
      printHtml(htmlContent);
  });

  /**
   * IPC Listener: 'print-business-setup'
   * Generates and prints the initial business setup invoice.
   */
  ipcMain.on('print-business-setup', async (event, businessSetup, adminUser) => {
      const htmlContent = await generateBusinessSetup(businessSetup, adminUser);
      printHtml(htmlContent, { copies: 2 });
  });

  /**
   * IPC Listener: 'print-closing-report'
   * Generates and prints the daily closing report.
   */
  ipcMain.on('print-closing-report', async (event, reportData, businessSetup) => {
      const htmlContent = await generateClosingReport(reportData, businessSetup);
      printHtml(htmlContent);
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

/**
 * IPC Handler: 'get-api-config'
 * Retrieves or generates the API Key and connection details for the local API server.
 * Returns a QR code data URL for easy mobile connection.
 *
 * @returns {Promise<{apiKey: string, apiUrl: string, qrCodeDataUrl: string}>}
 */
ipcMain.handle('get-api-config', async () => {
    if (!apiKey) {
        apiKey = crypto.randomBytes(32).toString('hex');
    }
    const ipAddress = getLocalIpAddress();
    const address = server ? server.address() : null;
    const port = (address && typeof address === 'object' && address.port) ? address.port : 3000;
    const config = {
        apiKey,
        apiUrl: `http://${ipAddress}:${port}`
    };
    const qrCodeDataUrl = await qrcode.toDataURL(JSON.stringify(config));
    return { ...config, qrCodeDataUrl };
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if(server) server.close();
    app.quit();
  }
});
