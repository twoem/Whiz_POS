import React from 'react';
import { usePosStore } from '../store/posStore';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function OrderArea() {
  const { cart, removeFromCart, updateQuantity, clearCart, openCheckout } = usePosStore();

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + tax;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Current Order</h2>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No items in cart</p>
        ) : (
          cart.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{item.product.name}</h4>
                <p className="text-sm text-gray-600">KES {item.product.price} each</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <span className="w-12 text-center font-medium">{item.quantity}</span>
                
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center ml-2"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
              
              <div className="ml-4 text-right">
                <p className="font-semibold text-gray-800">
                  KES {item.product.price * item.quantity}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">KES {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">VAT (16%)</span>
          <span className="font-medium">KES {tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
          <span>Total</span>
          <span className="text-blue-600">KES {total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={openCheckout}
        disabled={cart.length === 0}
        className="w-full mt-4 bg-green-500 text-white rounded-lg py-3 font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Checkout
      </button>
    </div>
  );
}
