import React, { useState, useRef, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { Product } from '../types';
import { Camera, Search, X, Zap, Package } from 'lucide-react';

export default function BarcodeScanner() {
  const { products, addToCart } = usePosStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load scan history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('whiz-pos-scan-history');
    if (savedHistory) {
      try {
        setScanHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load scan history:', error);
      }
    }
  }, []);

  // Save scan history to localStorage
  useEffect(() => {
    if (scanHistory.length > 0) {
      localStorage.setItem('whiz-pos-scan-history', JSON.stringify(scanHistory.slice(-20))); // Keep last 20 scans
    }
  }, [scanHistory]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setCameraError('');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const simulateBarcodeScan = () => {
    // Simulate barcode scanning with random product codes
    const mockBarcodes = ['123456789', '987654321', '555666777', '111222333'];
    const randomCode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    
    setScannedCode(randomCode);
    addToScanHistory(randomCode);
    
    // Find product by barcode (simulated)
    const product = products.find(p => 
      p.id === randomCode || (p.name || '').toLowerCase().includes(randomCode.slice(0, 3))
    );
    
    if (product) {
      setFoundProduct(product);
      setTimeout(() => {
        addToCart(product);
        setFoundProduct(null);
        setScannedCode('');
      }, 1500);
    } else {
      setTimeout(() => {
        setScannedCode('');
        alert('Product not found for this barcode');
      }, 2000);
    }
  };

  const handleManualSearch = () => {
    const product = products.find(p => 
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id === manualCode ||
      (p.name || '').toLowerCase().includes(manualCode.toLowerCase())
    );
    
    if (product) {
      setFoundProduct(product);
      setTimeout(() => {
        addToCart(product);
        setFoundProduct(null);
        setSearchTerm('');
        setManualCode('');
      }, 1000);
    } else {
      alert('Product not found');
    }
  };

  const addToScanHistory = (code: string) => {
    setScanHistory(prev => [...prev.slice(-9), code]); // Keep last 10 scans
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('whiz-pos-scan-history');
  };

  const filteredProducts = products.filter(product =>
    (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Camera className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Barcode Scanner</h1>
                <p className="text-gray-600">Quick product lookup and scanning</p>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="space-y-6">
            {/* Camera View */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Camera Scanner</h2>
              
              {!isScanning ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Camera is not active</p>
                    <button
                      onClick={startCamera}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Start Camera</span>
                    </button>
                  </div>
                  
                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">{cameraError}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '300px' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-32 border-2 border-red-500 rounded-lg">
                        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-red-500 animate-pulse"></div>
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-500 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={simulateBarcodeScan}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Zap className="w-5 h-5" />
                      <span>Simulate Scan</span>
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      <span>Stop Camera</span>
                    </button>
                  </div>
                  
                  {scannedCode && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 font-medium">Scanned: {scannedCode}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manual Entry */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Manual Entry</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or code..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={handleManualSearch}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Search className="w-5 h-5" />
                      <span>Search</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Code</label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter product code or barcode..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  onClick={() => {
                    if (manualCode) {
                      const product = products.find(p => p.id === manualCode);
                      if (product) {
                        addToCart(product);
                        setManualCode('');
                        alert(`Added ${product.name} to cart`);
                      } else {
                        alert('Product not found');
                      }
                    }
                  }}
                  disabled={!manualCode}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Scan History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Scan History</h2>
                <button
                  onClick={clearHistory}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Clear History
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {scanHistory.length > 0 ? (
                  scanHistory.slice().reverse().map((code, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-mono text-sm text-gray-700">{code}</span>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No scan history yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Found Product */}
            {foundProduct && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={foundProduct.image}
                    alt={foundProduct.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://picsum.photos/seed/${foundProduct.name}/64/64.jpg`;
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800">{foundProduct.name}</h3>
                    <p className="text-green-600">KES {foundProduct.price.toFixed(2)}</p>
                    <p className="text-sm text-green-600">Adding to cart...</p>
                  </div>
                  <Package className="w-8 h-8 text-green-600" />
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchTerm && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Search Results</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          addToCart(product);
                          setSearchTerm('');
                          alert(`Added ${product.name} to cart`);
                        }}
                        className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://picsum.photos/seed/${product.name}/48/48.jpg`;
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{product.name}</p>
                            <p className="text-gray-600">KES {product.price.toFixed(2)}</p>
                            {product.stock !== undefined && (
                              <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                            )}
                          </div>
                          <div className="text-green-600">
                            <Package className="w-5 h-5" />
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No products found</p>
                      <p className="text-sm text-gray-400">Try different search terms</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">How to Use</h2>
              <div className="space-y-3 text-sm text-blue-700">
                <div className="flex items-start space-x-2">
                  <span className="font-bold">1.</span>
                  <p>Click "Start Camera" to activate the barcode scanner</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">2.</span>
                  <p>Position barcode within the red scanning frame</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">3.</span>
                  <p>Use "Simulate Scan" to test without a real barcode</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">4.</span>
                  <p>Search manually by product name or enter product code</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">5.</span>
                  <p>Click on any product to add it directly to cart</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
