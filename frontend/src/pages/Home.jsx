import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Home = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/signin');
            return;
        }

        // Fetch user profile and balance
        const fetchUserData = async () => {
            try {
                const userResponse = await axios.get("http://localhost:3000/api/v1/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserData(userResponse.data);

                const balanceResponse = await axios.get("http://localhost:3000/api/v1/account/balance", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setBalance(balanceResponse.data.balance);
            } catch (error) {
                console.error("Error fetching user data:", error);
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate('/signin');
                }
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate('/signin');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
            <div className="p-6 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Welcome to UniPay</h1>
                            {userData && (
                                <p className="text-xl gray-600">
                                    Hello, {userData.firstName} {userData.lastName}
                                </p>
                            )}
                        </div>
                       
                    </div>
                    <p className="text-lg text-gray-700">Manage your university payments with ease and convenience.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-white rounded-lg shadow-lg p-6 transition-transform hover:scale-105 border border-gray-100">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Quick Pay</h2>
                            <p className="text-gray-600">Make a payment in seconds</p>
                        </div>
                        <button 
                            onClick={() => navigate('/fees')}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            Pay Now
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 transition-transform hover:scale-105 border border-gray-100">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Account Balance</h2>
                            <p className="text-gray-600">Your current account status</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">₹{balance.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 transition-transform hover:scale-105 border border-gray-100">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Upcoming Deadlines</h2>
                            <p className="text-gray-600">Don't miss important dates</p>
                        </div>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Semester Fees: December 15, 2024</li>
                            <li>Hostel Fees: January 1, 2025</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 transition-transform hover:scale-105 border border-gray-100">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Need Help?</h2>
                            <p className="text-gray-600">We're here to assist you</p>
                        </div>
                        <button className="w-full border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-gray-700">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}