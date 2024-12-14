import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function AdminFees() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/account/transactions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setTransactions(response.data.transactions);
      setLoading(false);
    } catch (error) {
      setError("Error fetching transactions");
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId) => {
    try {
      await axios.post(
        `http://localhost:3000/api/v1/account/approve-fees/${transactionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      // Refresh the transactions list after approval
      fetchTransactions();
    } catch (error) {
      setError("Error approving transaction");
      console.error("Error approving transaction:", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fees Management</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td className="px-6 py-4 whitespace-nowrap">{transaction._id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.sender?.firstName} {transaction.sender?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">₹{transaction.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : transaction.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(transaction._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                    >
                      Approve
                    </button>
                  )}
                  {transaction.status === 'approved' && (
                    <span className="text-green-600">Approved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 