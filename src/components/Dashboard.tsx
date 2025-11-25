import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Calendar, AlertTriangle, Activity, Target } from 'lucide-react';

interface DashboardMetric {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
}

interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export default function Dashboard() {
  const { transactions, products, expenses, currentCashier } = usePosStore();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentTransactions, setRecentTransactions] = useState(transactions.slice(0, 5));

  // Calculate date range filter
  const getDateFilter = () => {
    const now = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { start, end: now };
  };

  // Filter transactions by date range
  const getFilteredTransactions = () => {
    const { start, end } = getDateFilter();
    return transactions.filter(t => {
      const transactionDate = new Date(t.timestamp);
      return transactionDate >= start && transactionDate <= end;
    });
  };

  // Calculate metrics
  useEffect(() => {
    const filteredTransactions = getFilteredTransactions();
    const previousFilteredTransactions = transactions.filter(t => {
      const { start, end } = getDateFilter();
      const prevStart = new Date(start);
      const prevEnd = new Date(end);
      
      // Adjust for previous period
      switch (timeRange) {
        case 'today':
          prevStart.setDate(prevStart.getDate() - 1);
          prevEnd.setDate(prevEnd.getDate() - 1);
          break;
        case 'week':
          prevStart.setDate(prevStart.getDate() - 7);
          prevEnd.setDate(prevEnd.getDate() - 7);
          break;
        case 'month':
          prevStart.setMonth(prevStart.getMonth() - 1);
          prevEnd.setMonth(prevEnd.getMonth() - 1);
          break;
        case 'year':
          prevStart.setFullYear(prevStart.getFullYear() - 1);
          prevEnd.setFullYear(prevEnd.getFullYear() - 1);
          break;
      }
      
      const transactionDate = new Date(t.timestamp);
      return transactionDate >= prevStart && transactionDate <= prevEnd;
    });

    const totalRevenue = filteredTransactions.reduce((sum, t) => 
      sum + (t.total || t.items.reduce((itemSum, item) => itemSum + (item.product.price * item.quantity), 0)), 0
    );
    
    const previousRevenue = previousFilteredTransactions.reduce((sum, t) => 
      sum + (t.total || t.items.reduce((itemSum, item) => itemSum + (item.product.price * item.quantity), 0)), 0
    );

    const totalOrders = filteredTransactions.length;
    const previousOrders = previousFilteredTransactions.length;
    
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const previousAverageOrderValue = previousOrders > 0 ? previousRevenue / previousOrders : 0;

    const totalCustomers = new Set(filteredTransactions.map(t => t.customerName || 'Walk-in')).size;
    const previousCustomers = new Set(previousFilteredTransactions.map(t => t.customerName || 'Walk-in')).size;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    const newDashboardMetrics: DashboardMetric[] = [
      {
        title: 'Total Revenue',
        value: `KES ${totalRevenue.toFixed(2)}`,
        change: previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0,
        icon: <DollarSign className="w-6 h-6" />,
        color: totalRevenue >= previousRevenue ? 'green' : 'red'
      },
      {
        title: 'Total Orders',
        value: totalOrders,
        change: previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0,
        icon: <ShoppingCart className="w-6 h-6" />,
        color: totalOrders >= previousOrders ? 'green' : 'red'
      },
      {
        title: 'Average Order Value',
        value: `KES ${averageOrderValue.toFixed(2)}`,
        change: previousAverageOrderValue > 0 ? ((averageOrderValue - previousAverageOrderValue) / previousAverageOrderValue) * 100 : 0,
        icon: <Target className="w-6 h-6" />,
        color: averageOrderValue >= previousAverageOrderValue ? 'green' : 'red'
      },
      {
        title: 'Total Customers',
        value: totalCustomers,
        change: previousCustomers > 0 ? ((totalCustomers - previousCustomers) / previousCustomers) * 100 : 0,
        icon: <Users className="w-6 h-6" />,
        color: totalCustomers >= previousCustomers ? 'green' : 'red'
      },
      {
        title: 'Net Profit',
        value: `KES ${netProfit.toFixed(2)}`,
        change: 0, // Would need previous period expenses for comparison
        icon: <TrendingUp className="w-6 h-6" />,
        color: netProfit >= 0 ? 'green' : 'red'
      },
      {
        title: 'Active Products',
        value: products.filter(p => p.available).length,
        change: 0,
        icon: <Package className="w-6 h-6" />,
        color: 'blue'
      }
    ];

    setMetrics(newDashboardMetrics);
  }, [transactions, products, expenses, timeRange]);

  // Calculate top products
  useEffect(() => {
    const filteredTransactions = getFilteredTransactions();
    const productSales = new Map<string, { quantity: number; revenue: number; name: string }>();

    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const existing = productSales.get(item.product.id) || { 
          quantity: 0, 
          revenue: 0, 
          name: item.product.name 
        };
        productSales.set(item.product.id, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.product.price * item.quantity),
          name: existing.name
        });
      });
    });

    const top = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setTopProducts(top);
  }, [transactions, timeRange]);

  // Update recent transactions
  useEffect(() => {
    setRecentTransactions(transactions.slice(0, 5));
  }, [transactions]);

  const getMetricColor = (color: DashboardMetric['color']) => {
    switch (color) {
      case 'green': return 'bg-green-50 text-green-600 border-green-200';
      case 'red': return 'bg-red-50 text-red-600 border-red-200';
      case 'blue': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'yellow': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'purple': return 'bg-purple-50 text-purple-600 border-purple-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Business Dashboard</h1>
                <p className="text-gray-600">Real-time analytics and insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                  {metric.change !== 0 && (
                    <div className={`flex items-center text-sm mt-1 ${
                      metric.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change > 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(metric.change).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-full ${getMetricColor(metric.color)}`}>
                  {metric.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Top Products</h2>
            </div>
            <div className="p-6">
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.quantity} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">KES {product.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No sales data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
            </div>
            <div className="p-6">
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {transaction.customerName || 'Walk-in Customer'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          KES {(transaction.total || transaction.items.reduce((itemSum, item) => itemSum + (item.product.price * item.quantity), 0)).toFixed(2)}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                          transaction.paymentMethod === 'mpesa' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {transaction.paymentMethod}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors">
              <DollarSign className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-medium text-blue-800">Process Sale</p>
              <p className="text-sm text-blue-600">Start new transaction</p>
            </button>
            
            <button className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-left transition-colors">
              <Package className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-medium text-green-800">Manage Inventory</p>
              <p className="text-sm text-green-600">Update stock levels</p>
            </button>
            
            <button className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition-colors">
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium text-purple-800">View Reports</p>
              <p className="text-sm text-purple-600">Analytics & insights</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
