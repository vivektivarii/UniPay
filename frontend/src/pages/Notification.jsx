import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Calendar, Clock } from 'lucide-react';

export const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(
                'http://localhost:3000/api/v1/user/notifications',
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            setNotifications(response.data.notifications);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setError("Failed to load notifications");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Bell className="w-6 h-6 mr-2 text-blue-500" />
                <h1 className="text-2xl font-semibold">Notifications</h1>
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                        {notification.title}
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        {notification.message}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            <span>Posted: {new Date(notification.scheduledFor).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            <span>Expires: {new Date(notification.expiresAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm ${
                                        notification.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}
                                >
                                    {notification.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};