import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from 'lucide-react';

export function AdminProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updateData, setUpdateData] = useState({
        firstName: '',
        lastName: '',
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/v1/admin/profile', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("admintoken")}`
                }
            });
            setProfile(response.data);
            setUpdateData({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                currentPassword: '',
                newPassword: ''
            });
            setLoading(false);
        } catch (error) {
            setError("Error fetching profile");
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const dataToUpdate = {
                firstName: updateData.firstName,
                lastName: updateData.lastName
            };

            if (updateData.newPassword) {
                dataToUpdate.currentPassword = updateData.currentPassword;
                dataToUpdate.newPassword = updateData.newPassword;
            }

            await axios.put(
                'http://localhost:3000/api/v1/admin/profile/update',
                dataToUpdate,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            await fetchProfile();
            setIsEditing(false);
            setUpdateData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: ''
            }));
        } catch (error) {
            setError(error.response?.data?.message || "Error updating profile");
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
        <div className="p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                        {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {profile?.firstName} {profile?.lastName}
                        </h1>
                        <p className="text-gray-600">{profile?.username}</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">First Name</label>
                                <p className="font-medium">{profile?.firstName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Last Name</label>
                                <p className="font-medium">{profile?.lastName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Email</label>
                                <p className="font-medium">{profile?.username}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Role</label>
                                <p className="font-medium capitalize">{profile?.role}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Edit Profile Modal */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                            <form onSubmit={handleUpdate}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            value={updateData.firstName}
                                            onChange={(e) => setUpdateData({...updateData, firstName: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input
                                            type="text"
                                            value={updateData.lastName}
                                            onChange={(e) => setUpdateData({...updateData, lastName: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                        <input
                                            type="password"
                                            value={updateData.currentPassword}
                                            onChange={(e) => setUpdateData({...updateData, currentPassword: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                                        <input
                                            type="password"
                                            value={updateData.newPassword}
                                            onChange={(e) => setUpdateData({...updateData, newPassword: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 