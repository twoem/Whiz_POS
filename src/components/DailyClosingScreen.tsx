import React, { useState, useEffect } from 'react';
import { usePosStore, ClosingReportData } from '../store/posStore';
import { Calendar, Printer, Download, User, Hash, Clock, CreditCard as CreditCardIcon, Briefcase } from 'lucide-react';

export default function DailyClosingScreen() {
  const { getDailyClosingReport, setCurrentPage, businessSetup } = usePosStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<ClosingReportData | null>(null);

  useEffect(() => {
    const generatedReport = getDailyClosingReport(selectedDate);
    setReport(generatedReport);
  }, [selectedDate, getDailyClosingReport]);

  const handlePrint = () => {
    if (report && businessSetup && window.electron) {
      window.electron.printClosingReport(report, businessSetup);
    }
  };

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 print:hidden">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <button onClick={() => setCurrentPage('pos')} className="text-gray-600 hover:text-gray-800">
                &larr; Back to POS
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Closing Report</h1>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Printer size={18} />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg printable-area">
          {/* Report Header */}
          <div className="text-center mb-8 border-b pb-4">
            <h2 className="text-3xl font-bold">{businessSetup?.businessName || 'WHIZ POS'}</h2>
            <p className="text-gray-600">End of Day Report for {new Date(selectedDate).toDateString()}</p>
          </div>

          {/* Cashier Breakdown */}
          {report.cashiers.map((cashier) => (
            <div key={cashier.cashierName} className="mb-8 last:mb-0">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <User className="mr-2 text-blue-500" />
                  Cashier: {cashier.cashierName}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-2"><Hash size={14} className="inline mr-1" />Receipt ID</th>
                      <th className="text-left p-2"><Clock size={14} className="inline mr-1" />Time</th>
                      <th className="text-left p-2"><Briefcase size={14} className="inline mr-1" />Payment Mode</th>
                      <th className="text-left p-2"><User size={14} className="inline mr-1" />Credit Customer</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashier.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b">
                        <td className="p-2 font-mono">{tx.id.slice(-6)}</td>
                        <td className="p-2">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                        <td className="p-2 capitalize">{tx.paymentMethod}</td>
                        <td className="p-2">{tx.creditCustomer || 'N/A'}</td>
                        <td className="text-right p-2 font-semibold">Ksh. {tx.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cashier Totals */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-800 font-bold">CASH</p>
                  <p className="font-semibold text-blue-900">Ksh. {cashier.cashTotal.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-800 font-bold">MPESA</p>
                  <p className="font-semibold text-purple-900">Ksh. {cashier.mpesaTotal.toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-orange-800 font-bold">CREDIT</p>
                  <p className="font-semibold text-orange-900">Ksh. {cashier.creditTotal.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-800 font-bold">TOTAL</p>
                  <p className="font-semibold text-green-900">Ksh. {cashier.totalSales.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Grand Totals */}
          <div className="mt-12 border-t-2 pt-6">
            <h3 className="text-2xl font-bold text-center mb-4">Grand Totals for the Day</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-sm font-bold text-blue-800">TOTAL CASH</p>
                <p className="text-xl font-extrabold text-blue-900">Ksh. {report.totalCash.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg">
                <p className="text-sm font-bold text-purple-800">TOTAL MPESA</p>
                <p className="text-xl font-extrabold text-purple-900">Ksh. {report.totalMpesa.toFixed(2)}</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-lg">
                <p className="text-sm font-bold text-orange-800">TOTAL CREDIT</p>
                <p className="text-xl font-extrabold text-orange-900">Ksh. {report.totalCredit.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-sm font-bold text-green-800">GRAND TOTAL</p>
                <p className="text-xl font-extrabold text-green-900">Ksh. {report.grandTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
