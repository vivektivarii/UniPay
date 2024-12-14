import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CreditCard, Clock, Check } from 'lucide-react';

export function AdminDashboard() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFeesCollected: 0,
        pendingApprovals: 0
    });
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const [usersResponse, transactionsResponse] = await Promise.all([
                axios.get('http://localhost:3000/api/v1/admin/users', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:3000/api/v1/admin/pending-transactions', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setStats({
                totalStudents: usersResponse.data.pagination.total || 0,
                totalFeesCollected: transactionsResponse.data.totalPendingAmount || 0,
                pendingApprovals: transactionsResponse.data.count || 0
            });
            setPendingTransactions(transactionsResponse.data.transactions || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleApprove = async (transactionId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/api/v1/account/approve-fees/${transactionId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh dashboard data after approval
            fetchDashboardData();
        } catch (error) {
            console.error('Error approving transaction:', error);
            alert('Failed to approve transaction');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                {error}
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Students',
            value: stats.totalStudents,
            icon: Users,
            color: 'bg-blue-500',
            textColor: 'text-blue-600'
        },
        {
            title: 'Total Fees Collected',
            value: `₹${stats.totalFeesCollected.toLocaleString()}`,
            icon: CreditCard,
            color: 'bg-green-500',
            textColor: 'text-green-600'
        },
        {
            title: 'Pending Approvals',
            value: stats.pendingApprovals,
            icon: Clock,
            color: 'bg-yellow-500',
            textColor: 'text-yellow-600'
        }
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {cards.map((card, index) => (
                    <div 
                        key={index}
                        className="bg-white rounded-lg shadow-lg p-6 transition-transform duration-300 hover:transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-full ${card.color} bg-opacity-10`}>
                                <card.icon className={`w-6 h-6 ${card.textColor}`} />
                            </div>
                        </div>
                        <h2 className="text-gray-600 text-sm font-medium">
                            {card.title}
                        </h2>
                        <p className={`text-2xl font-bold ${card.textColor} mt-2`}>
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Pending Transactions Table */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Pending Fee Approvals</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingTransactions.map((transaction) => (
                                <tr key={transaction._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {transaction.sender.firstName} {transaction.sender.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {transaction.sender.username}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            ₹{transaction.amount.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(transaction.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleApprove(transaction._id)}
                                            className="flex items-center px-4 py-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors duration-200"
                                        >
                                            <Check size={16} className="mr-2" />
                                            Approve Fees
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {pendingTransactions.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        No pending transactions
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 