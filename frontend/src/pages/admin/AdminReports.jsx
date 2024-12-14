import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, BarChart } from 'lucide-react';

export function AdminReports() {
    const [reportType, setReportType] = useState('transactions');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                'http://localhost:3000/api/v1/admin/generate-report',
                {
                    startDate,
                    endDate,
                    reportType
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setReportData(response.data.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Error generating report');
        } finally {
            setLoading(false);
        }
    };

    const renderReportTable = () => {
        if (!reportData || reportData.length === 0) return null;

        switch (reportType) {
            case 'transactions':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">{item._id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.count}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">₹{item.totalAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'fees':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Collected</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction Count</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students Count</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {`${item._id.year}-${String(item._id.month).padStart(2, '0')}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">₹{item.totalCollected}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.transactionCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.students.length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'students':
                return (
                    <div>
                        <div className="mb-4 grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                                <p className="text-2xl font-semibold">{reportData[0]?.totalStudents || 0}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-sm font-medium text-gray-500">Average Balance</h3>
                                <p className="text-2xl font-semibold">
                                    ₹{Math.round(reportData[0]?.averageBalance || 0)}
                                </p>
                            </div>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData[0]?.students.map((student, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">₹{student.balance}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{student.joinedDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'signups':
                return (
                    <div>
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-sm font-medium text-gray-500">Total Signups</h3>
                                <p className="text-2xl font-semibold">
                                    {reportData.reduce((acc, curr) => acc + curr.count, 0)}
                                </p>
                            </div>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signups</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {`${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.count}</td>
                                        <td className="px-6 py-4">
                                            <ul className="list-disc pl-5">
                                                {item.users.map((user, idx) => (
                                                    <li key={idx} className="text-sm text-gray-600">
                                                        {user.name} ({user.email})
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'payments':
                return (
                    <div>
                        <div className="mb-4 grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
                                <p className="text-2xl font-semibold">
                                    {reportData.reduce((acc, curr) => acc + curr.count, 0)}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                                <p className="text-2xl font-semibold">
                                    ₹{reportData.reduce((acc, curr) => acc + curr.totalAmount, 0)}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-sm font-medium text-gray-500">Average Amount</h3>
                                <p className="text-2xl font-semibold">
                                    ₹{Math.round(reportData.reduce((acc, curr) => acc + curr.avgAmount, 0) / reportData.length)}
                                </p>
                            </div>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">{item._id.status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item._id.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">₹{item.totalAmount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">₹{Math.round(item.avgAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Reports</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Report Type
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="transactions">Transactions Report</option>
                            <option value="fees">Fees Collection Report</option>
                            <option value="students">Students Report</option>
                            <option value="signups">Signups Report</option>
                            <option value="payments">Payments Report</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <button
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {loading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded mb-6">
                    {error}
                </div>
            )}

            {reportData && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Report Results</h2>
                    <div className="overflow-x-auto">
                        {renderReportTable()}
                    </div>
                </div>
            )}
        </div>
    );
} 