import React, { useState, useMemo } from 'react';
import { usePosStore } from '../store/posStore';
import { CreditCustomer } from '../store/posStore'; // Import from store directly
import { Users, Phone, DollarSign, CheckCircle, Clock, Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function CreditCustomersPage() {
  const { 
    creditCustomers, 
    transactions, 
    setCurrentPage, 
    saveCreditCustomer, 
    updateCreditCustomer,
    deleteCreditCustomer,
    getUnpaidCredits,
    addCreditPayment
  } = usePosStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CreditCustomer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const filteredCustomers = useMemo(() => {
    return creditCustomers.filter(customer =>
      (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.toString().includes(searchTerm))
    );
  }, [creditCustomers, searchTerm]);

  const unpaidCredits = useMemo(() => {
    return getUnpaidCredits();
  }, [getUnpaidCredits]);

  const totalUnpaid = useMemo(() => {
    return unpaidCredits.reduce((sum, customer) => sum + (customer.balance || 0), 0);
  }, [unpaidCredits]);

  const handleAddCustomer = () => {
    if (!formData.name.trim()) return;

    const newCustomer: CreditCustomer = {
      id: `CUST${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      totalCredit: 0,
      paidAmount: 0,
      balance: 0,
      transactions: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    saveCreditCustomer(newCustomer);
    setFormData({ name: '', phone: '' });
    setShowAddForm(false);
  };

  const handleEditCustomer = (customer: CreditCustomer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
    });
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomer || !formData.name.trim()) return;

    updateCreditCustomer(editingCustomer.id, {
      name: formData.name,
      phone: formData.phone,
      lastUpdated: new Date().toISOString(),
    });

    setEditingCustomer(null);
    setFormData({ name: '', phone: '' });
  };

  const handlePayment = (customerId: string, amount: number) => {
    if (amount <= 0) return;
    addCreditPayment(customerId, amount);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCreditCustomer(customerId);
    }
  };

  const getCustomerTransactions = (customer: CreditCustomer) => {
    if (!customer || !customer.transactions) {
      return [];
    }
    return transactions.filter(t => customer.transactions.includes(t.id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('pos')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back to POS
              </button>
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">Credit Customers</h1>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-800">{creditCustomers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unpaid Credits</p>
                <p className="text-2xl font-bold text-gray-800">{unpaidCredits.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Unpaid</p>
                <p className="text-2xl font-bold text-gray-800">KES {totalUnpaid.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customers by name or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Customer</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Phone</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Total Credit</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Paid</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Balance</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{customer.name}</div>
                          <div className="text-sm text-gray-500">
                            {getCustomerTransactions(customer).length} transactions
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{customer.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium">
                      KES {(customer.totalCredit || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 font-medium text-green-600">
                      KES {(customer.paidAmount || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${
                        (customer.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        KES {(customer.balance || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {(customer.balance || 0) > 0 ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Unpaid</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" />
                          <span>Paid</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {(customer.balance || 0) > 0 && (
                          <button
                            onClick={() => handlePayment(customer.id, customer.balance || 0)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredCustomers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No customers found</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Add your first customer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {(showAddForm || editingCustomer) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter customer name"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCustomer(null);
                    setFormData({ name: '', phone: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCustomer ? 'Update' : 'Add Customer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
