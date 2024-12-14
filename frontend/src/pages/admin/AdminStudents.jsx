import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newStudent, setNewStudent] = useState({
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        initialBalance: 1000
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/v1/admin/users', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setStudents(response.data.users);
        } catch (error) {
            setError("Error fetching students");
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:3000/api/v1/admin/create-user',
                newStudent,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            setStudents([...students, response.data.user]);
            setShowModal(false);
            setNewStudent({
                username: '',
                firstName: '',
                lastName: '',
                password: '',
                initialBalance: 1000
            });
            fetchStudents(); // Refresh the list
        } catch (error) {
            setError(error.response?.data?.message || "Error creating student");
            console.error("Error creating student:", error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Students Management</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add New Student
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {student.firstName} {student.lastName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {student.username}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    ₹{student.balance.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(student.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                                    <button className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal for creating new student */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">Add New Student</h2>
                        <form onSubmit={handleCreateStudent}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={newStudent.username}
                                    onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={newStudent.firstName}
                                    onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={newStudent.lastName}
                                    onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={newStudent.password}
                                    onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Initial Balance
                                </label>
                                <input
                                    type="number"
                                    value={newStudent.initialBalance}
                                    onChange={(e) => setNewStudent({...newStudent, initialBalance: Number(e.target.value)})}
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
                                    Create Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 