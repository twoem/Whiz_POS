import React from 'react';
import { usePosStore } from '../store/posStore';
import { Plus } from 'lucide-react';
// The cart image is in the root assets folder, but for Vite to bundle it, it's better to move it to src/assets
// or reference it via absolute public path if it's in public/.
// However, based on previous file listings, assets/cart.png is in root.
// Let's try using the one from 'public' if available, or assume it will be copied.
// Since we cannot import from outside src easily in Vite without configuration,
// I will use a relative path that assumes the assets are served statically or I will fix the import.

// Ideally, we should move cart.png to src/assets or public/assets.
// Checking file list: assets/cart.png exists in root.
// I will copy it to public/assets so it can be referenced as /assets/cart.png
// For now, I'll use a direct string path which avoids the import error, assuming it is served correctly at runtime.

const CART_PLACEHOLDER = '/assets/cart.png';

/**
 * Component for displaying the grid of products.
 * Allows searching and adding products to the cart.
 */
export default function ProductGrid() {
  const { products, addToCart } = usePosStore();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredProducts = products.filter((product) =>
    (product.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="product-grid" className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Products</h2>
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-gray-50 rounded-lg p-4 hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 flex flex-col justify-between"
            onClick={() => addToCart(product)}
          >
            <div>
              <div className="aspect-square bg-gray-200 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                <img
                  // Prioritize remote URL, then local file path, then placeholder
                  src={product.image || product.localImage || CART_PLACEHOLDER}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Fallback to placeholder on error
                    if (target.src !== CART_PLACEHOLDER) {
                         target.src = CART_PLACEHOLDER;
                    }
                  }}
                />
              </div>
              <h3 className="font-medium text-gray-800 text-sm mb-1">{product.name}</h3>
              <p className="text-lg font-bold text-blue-600">KES {product.price}</p>
            </div>
            <button className="mt-3 w-full bg-blue-500 text-white rounded-lg py-2.5 px-4 hover:bg-blue-600 transition-colors flex items-center justify-center text-sm font-semibold">
              <Plus className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
