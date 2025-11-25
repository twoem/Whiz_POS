import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { X, CreditCard, Smartphone, Wallet, CheckCircle } from 'lucide-react';
import CreditCustomerModal from './CreditCustomerModal';

/**
 * Modal component for handling the checkout process.
 * Allows selecting payment method (Cash, M-Pesa, Credit) and completing the transaction.
 */
export default function CheckoutModal() {
  const { isCheckoutOpen, closeCheckout, cart, completeTransaction } = usePosStore();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'credit'>('cash');
  const [creditCustomer, setCreditCustomer] = useState('');
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0; // Tax is set to 0 as per user instruction
  const total = subtotal + tax;

  if (!isCheckoutOpen) return null;

  /**
   * Finalizes the transaction.
   * Validates credit customer selection if payment method is credit.
   */
  const handleComplete = () => {
    if (paymentMethod === 'credit' && !creditCustomer.trim()) {
      alert('Please select a customer for credit payment');
      return;
    }
    completeTransaction(paymentMethod, paymentMethod === 'credit' ? creditCustomer : undefined);
  };

  /**
   * Callback when a customer is selected from the CreditCustomerModal.
   * @param customerName - The name of the selected customer.
   */
  const handleSelectCustomer = (customerName: string) => {
    setCreditCustomer(customerName);
    setIsCreditModalOpen(false);
  };

  /**
   * Updates the selected payment method.
   * Opens the credit customer selection modal if 'credit' is chosen.
   */
  const handlePaymentMethodChange = (method: 'cash' | 'mpesa' | 'credit') => {
    setPaymentMethod(method);
    if (method === 'credit') {
      setIsCreditModalOpen(true);
    }
  };

  /**
   * Reusable button component for payment methods.
   */
  const PaymentButton = ({ method, current, setMethod, icon, label }: any) => {
    const isSelected = method === current;
    return (
        <button
          onClick={() => handlePaymentMethodChange(method)}
          className={`w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
            isSelected
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {icon}
          <span className="font-semibold text-lg ml-4">{label}</span>
          {isSelected && <CheckCircle className="w-6 h-6 text-blue-500 ml-auto" />}
        </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
            <button
              onClick={closeCheckout}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between text-md">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">KES {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-md">
                <span className="text-gray-600">VAT (0%)</span>
                <span className="font-medium">KES {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-gray-800 pt-3 border-t-2 border-dashed">
                <span>Total</span>
                <span className="text-blue-600">KES {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-2 text-lg">Payment Method</h3>

              <PaymentButton
                  method="cash"
                  current={paymentMethod}
                  setMethod={setPaymentMethod}
                  icon={<Wallet className="w-8 h-8 text-green-500" />}
                  label="Cash"
              />

              <PaymentButton
                  method="mpesa"
                  current={paymentMethod}
                  setMethod={setPaymentMethod}
                  icon={<Smartphone className="w-8 h-8 text-blue-500" />}
                  label="M-Pesa"
              />

              <PaymentButton
                  method="credit"
                  current={paymentMethod}
                  setMethod={setPaymentMethod}
                  icon={<CreditCard className="w-8 h-8 text-orange-500" />}
                  label="Credit"
              />
            </div>

            {paymentMethod === 'credit' && (
              <div className="mt-6">
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Customer
                </label>
                <button
                  onClick={() => setIsCreditModalOpen(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left"
                >
                  {creditCustomer || 'Select a customer'}
                </button>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button
                onClick={closeCheckout}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      </div>
      <CreditCustomerModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        onSelectCustomer={handleSelectCustomer}
      />
    </>
  );
}
