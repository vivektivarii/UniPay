import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    scheduledFor: '',
    expiresAt: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/admin/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setNotifications(response.data.notifications);
      setLoading(false);
    } catch (error) {
      setError("Error fetching notifications");
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!newNotification.title.trim()) {
        setError("Title is required");
        return;
    }
    if (!newNotification.message.trim()) {
        setError("Message is required");
        return;
    }
    if (!newNotification.expiresAt) {
        setError("Expiration date is required");
        return;
    }

    // Validate dates
    const now = new Date();
    // Reset time part to start of the current day for comparison
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const expiresAt = new Date(newNotification.expiresAt);
    const scheduledFor = newNotification.scheduledFor ? new Date(newNotification.scheduledFor) : now;

    // Check if expiration date is at least today
    if (expiresAt < startOfToday) {
        setError("Expiration date cannot be in the past");
        return;
    }

    // If scheduled date is provided, it should be today or later
    if (newNotification.scheduledFor && scheduledFor < startOfToday) {
        setError("Schedule date cannot be in the past");
        return;
    }

    // Expiration should be after or equal to scheduled date
    if (expiresAt < scheduledFor) {
        setError("Expiration date must be after or equal to the scheduled date");
        return;
    }

    try {
        await axios.post(
            'http://localhost:3000/api/v1/admin/notifications',
            {
                ...newNotification,
                scheduledFor: scheduledFor.toISOString(),
                expiresAt: expiresAt.toISOString()
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        
        setShowModal(false);
        setNewNotification({
            title: '',
            message: '',
            scheduledFor: '',
            expiresAt: ''
        });
        fetchNotifications();
    } catch (error) {
        console.error("Error creating notification:", error);
        setError(error.response?.data?.message || 
                error.response?.data?.errors?.[0]?.message || 
                "Error creating notification");
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/admin/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      fetchNotifications(); // Refresh the list
    } catch (error) {
      setError("Error deleting notification");
      console.error("Error deleting notification:", error);
    }
  };

  // Add this function to format date for datetime-local input
  const formatDateForInput = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications Management</h1>
        <button 
          onClick={() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            setNewNotification({
              title: '',
              message: '',
              scheduledFor: formatDateForInput(now),
              expiresAt: formatDateForInput(tomorrow)
            });
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Notification
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Notifications Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled For</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notifications.map((notification) => (
              <tr key={notification._id}>
                <td className="px-6 py-4 whitespace-nowrap">{notification.title}</td>
                <td className="px-6 py-4">{notification.message}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    notification.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : notification.status === 'Scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {notification.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(notification.scheduledFor).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(notification.expiresAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Create New Notification</h3>
              {error && (
                  <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                  </div>
              )}
              <form onSubmit={handleCreateNotification}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Message
                  </label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Schedule For
                  </label>
                  <input
                    type="datetime-local"
                    value={newNotification.scheduledFor}
                    onChange={(e) => setNewNotification({...newNotification, scheduledFor: e.target.value})}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={newNotification.expiresAt}
                    onChange={(e) => setNewNotification({...newNotification, expiresAt: e.target.value})}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 