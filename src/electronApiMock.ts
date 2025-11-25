// src/electronApiMock.ts

/**
 * Mocks the Electron `window.electron` API for browser-based testing (Playwright).
 * This allows the Zustand store to "load" data from the public folder by fetching it,
 * mimicking the behavior of the Electron main process reading files from disk.
 */
export const setupElectronMock = () => {
  if (process.env.NODE_ENV === 'development' && !window.electron) {
    console.log('Setting up mock Electron API for browser environment.');

    window.electron = {
      saveData: async (fileName, data) => {
        console.log(`[Mock] saveData(${fileName}):`, data);
        return { success: true };
      },
      readData: async (fileName) => {
        try {
          const response = await fetch(`/data/${fileName}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch mock data: ${fileName}`);
          }
          const data = await response.json();
          console.log(`[Mock] readData(${fileName}):`, data);
          return { success: true, data };
        } catch (error) {
          console.error(`[Mock] Error reading data ${fileName}:`, error);
          // Return success:true with undefined data to mimic file-not-found scenario without breaking the app
          return { success: true, data: undefined };
        }
      },
      printReceipt: (transaction, businessSetup, isReprint) => {
        console.log('[Mock] printReceipt:', { transaction, businessSetup, isReprint });
      },
      saveImage: async (tempPath) => {
        console.log('[Mock] saveImage:', tempPath);
        return { success: true, path: `mock/path/to/${tempPath}`, fileName: tempPath };
      },
      printClosingReport: (reportData, businessSetup) => {
        console.log('[Mock] printClosingReport:', { reportData, businessSetup });
      },
      printBusinessSetup: (businessSetup, adminUser) => {
        console.log('[Mock] printBusinessSetup:', { businessSetup, adminUser });
      },
      getApiConfig: async () => {
        console.log('[Mock] getApiConfig');
        return {
          apiUrl: 'http://localhost:3001/api',
          apiKey: 'mock-api-key',
          qrCodeDataUrl: 'mock-qr-code-data-url',
        };
      },
      uploadImage: async (filePath, apiUrl, apiKey) => {
        console.log('[Mock] uploadImage:', { filePath, apiUrl, apiKey });
        // Return a placeholder image URL for browser-based testing
        return { imageUrl: 'https://via.placeholder.com/150' };
      },
    };
  }
};
