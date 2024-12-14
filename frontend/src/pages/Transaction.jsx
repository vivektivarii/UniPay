import { useState, useEffect } from 'react';
import axios from 'axios';

export const Transaction = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [searchQuery]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/user/bulk?filter=${searchQuery}`, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            });
            setUsers(response.data.user);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleTransfer = async (to) => {
        if (!amount || loading) return;
        
        setLoading(true);
        try {
            await axios.post(
                "http://localhost:3000/api/v1/account/transfer",
                { amount: parseFloat(amount), to },
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token")
                    }
                }
            );
            alert("Transfer successful!");
            setAmount('');
            setSelectedUser(null);
        } catch (error) {
            alert(error.response?.data?.message || "Error transferring money");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Send Money</h1>
                    
                    {/* Search Input */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Users List */}
                    <div className="space-y-4">
                        {users.map((user) => (
                            <div 
                                key={user._id}
                                className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors
                                    ${selectedUser?._id === user._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800">
                                            {user.firstName} {user.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-600">{user.username}</p>
                                    </div>
                                    
                                    {selectedUser?._id === user._id ? (
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="number"
                                                placeholder="Amount"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <button
                                                onClick={() => handleTransfer(user._id)}
                                                disabled={loading || !amount}
                                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                {loading ? "Sending..." : "Send"}
                                            </button>
                                            <button
                                                onClick={() => setSelectedUser(null)}
                                                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md shadow-sm transition-colors duration-200"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors duration-200"
                                        >
                                            Send Money
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};