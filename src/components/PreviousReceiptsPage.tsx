import React from 'react';
import { usePosStore } from '../store/posStore';
import { useNavigate } from 'react-router-dom';

const PreviousReceiptsPage: React.FC = () => {
  const transactions = usePosStore((state) => state.transactions);
  const reprintTransaction = usePosStore((state) => state.reprintTransaction);
  const navigate = useNavigate();

  const handleReprint = (transactionId: string) => {
    reprintTransaction(transactionId);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Previous Receipts</h1>
          <button
            onClick={() => navigate(-1)} // Go back to the previous page
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Back
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Receipt ID</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Cashier</th>
                <th scope="col" className="px-6 py-3">Total</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{tx.id}</td>
                    <td className="px-6 py-4">{new Date(tx.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4">{tx.cashier}</td>
                    <td className="px-6 py-4">Ksh. {tx.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleReprint(tx.id)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Reprint
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PreviousReceiptsPage;
