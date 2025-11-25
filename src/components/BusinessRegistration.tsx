import React, { useState } from 'react';
import { usePosStore } from '../store/posStore';
import { Building2, Mail, Phone, Globe, CheckCircle, AlertCircle } from 'lucide-react';

export default function BusinessRegistration() {
  console.log('BusinessRegistration component rendering');
  const { finishSetup, isDataLoaded, businessSetup } = usePosStore(state => ({
    finishSetup: state.finishSetup,
    isDataLoaded: state.isDataLoaded,
    businessSetup: state.businessSetup,
  }));
  console.log('isDataLoaded:', isDataLoaded);
  console.log('businessSetup:', businessSetup);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    pin: '1234', // Default PIN for the admin user
    servedByLabel: 'Cashier',
    mpesaPaybill: '',
    mpesaTill: '',
    mpesaAccountNumber: '',
    tax: 0,
    subtotal: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    const businessData = {
      businessName: formData.businessName,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      servedByLabel: formData.servedByLabel,
      mpesaPaybill: formData.mpesaPaybill,
      mpesaTill: formData.mpesaTill,
      mpesaAccountNumber: formData.mpesaAccountNumber,
      tax: formData.tax,
      subtotal: formData.subtotal,
      isSetup: true,
      isLoggedIn: false, // Ensure login is required after setup
    };

    const adminUser = {
      id: `USR${Date.now()}`,
      name: formData.ownerName,
      pin: formData.pin,
      role: 'admin' as const,
    };

    try {
      await finishSetup(businessData, adminUser);
      setSubmitMessage('Business registered successfully! You can now start using WHIZ POS.');
    } catch (error) {
      console.error('Failed to finish setup:', error);
      setSubmitMessage('An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900">Register Your Business</h1>
          <p className="text-xl text-gray-600">Join thousands of businesses using WHIZ POS</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={handleInputChange('businessName')}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={handleInputChange('ownerName')}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Business owner name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="business@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+254 XXX XXX XXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={handleInputChange('address')}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Business Street, City, Country"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  "Served By" Label
                </label>
                <input
                  type="text"
                  value={formData.servedByLabel}
                  onChange={handleInputChange('servedByLabel')}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Cashier, Server"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Paybill
                </label>
                <input
                  type="text"
                  value={formData.mpesaPaybill}
                  onChange={handleInputChange('mpesaPaybill')}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Paybill number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Till
                </label>
                <input
                  type="text"
                  value={formData.mpesaTill}
                  onChange={handleInputChange('mpesaTill')}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Till number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Account Number
              </label>
              <input
                type="text"
                value={formData.mpesaAccountNumber}
                onChange={handleInputChange('mpesaAccountNumber')}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Account number"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5" />
                    <span>Register Business</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {submitMessage && (
            <div className={`mt-6 p-4 rounded-lg ${submitMessage.includes('successfully') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center space-x-3">
                {submitMessage.includes('successfully') ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <p className={`text-lg font-medium ${submitMessage.includes('successfully') ? 'text-green-800' : 'text-red-800'}`}>
                  {submitMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
