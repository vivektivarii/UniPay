import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../components/Button1";

export const Fees = () => {
    const [balance, setBalance] = useState(0);
    const [processingFees, setProcessingFees] = useState({});
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [paidFees, setPaidFees] = useState(() => {
        const savedPaidFees = localStorage.getItem('paidFees');
        return savedPaidFees ? JSON.parse(savedPaidFees) : {};
    });
    const [paymentDates, setPaymentDates] = useState(() => {
        const savedDates = localStorage.getItem('paymentDates');
        return savedDates ? JSON.parse(savedDates) : {};
    });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        upiId: '',
        bankName: ''
    });

    const feeStructure = [
        { type: "Semester Fees", amount: 50000 },
        { type: "Transapotation Fees", amount: 60000 },
        { type: "Hostel Fees", amount: 30000 },
        { type: "Exam Fees", amount: 5000 }
    ];

    useEffect(() => {
        fetchBalance();
        fetchPendingTransactions();
        fetchPaymentStatus();
    }, []);

    const fetchBalance = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/v1/account/balance", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            });
            setBalance(response.data.balance);
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    const fetchPendingTransactions = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/v1/account/pending-transactions", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            });
            setPendingTransactions(response.data.transactions);
        } catch (error) {
            console.error("Error fetching pending transactions:", error);
        }
    };

    const fetchPaymentStatus = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/v1/account/payment-status", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            });
            
            if (response.data.paidFees) {
                setPaidFees(response.data.paidFees);
                localStorage.setItem('paidFees', JSON.stringify(response.data.paidFees));
            }
            
            if (response.data.paymentDates) {
                setPaymentDates(response.data.paymentDates);
                localStorage.setItem('paymentDates', JSON.stringify(response.data.paymentDates));
            }
        } catch (error) {
            console.error("Error fetching payment status:", error);
        }
    };

    const handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method);
    };

    const initiatePayment = async (amount, feeType) => {
        setSelectedFee({ amount, type: feeType });
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFee) return;

        setProcessingFees(prev => ({ ...prev, [selectedFee.type]: true }));

        try {
            const paymentData = {
                amount: selectedFee.amount,
                feeType: selectedFee.type,
                paymentMethod,
                paymentDetails: {
                    ...(paymentMethod === 'card' && {
                        cardNumber: paymentDetails.cardNumber,
                        cardHolder: paymentDetails.cardHolder,
                        expiryDate: paymentDetails.expiryDate,
                    }),
                    ...(paymentMethod === 'upi' && {
                        upiId: paymentDetails.upiId
                    }),
                    ...(paymentMethod === 'netbanking' && {
                        bankName: paymentDetails.bankName
                    })
                }
            };

            const response = await axios.post(
                "http://localhost:3000/api/v1/account/pay-fees",
                paymentData,
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token")
                    }
                }
            );

        
            await fetchBalance();
            await fetchPendingTransactions();
            
            const newPaidFees = {
                ...paidFees,
                [selectedFee.type]: response.data.transactionId
            };
            const newPaymentDates = {
                ...paymentDates,
                [selectedFee.type]: new Date().toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            setPaidFees(newPaidFees);
            setPaymentDates(newPaymentDates);
            localStorage.setItem('paidFees', JSON.stringify(newPaidFees));
            localStorage.setItem('paymentDates', JSON.stringify(newPaymentDates));

            setShowPaymentModal(false);
            setSelectedFee(null);
            setPaymentMethod('');
            setPaymentDetails({
                cardNumber: '',
                cardHolder: '',
                expiryDate: '',
                cvv: '',
                upiId: '',
                bankName: ''
            });

            alert(`Fee payment initiated successfully. Transaction ID: ${response.data.transactionId}`);
        } catch (error) {
            alert(error.response?.data?.message || "Error paying fees");
        } finally {
            setProcessingFees(prev => ({ ...prev, [selectedFee.type]: false }));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
            <div className="p-6 space-y-8">
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                    <div className="mb-4">
                        <h1 className="text-4xl pb-2 font-bold text-gray-800">Fee Payment</h1>
                        <p className="text-xl text-gray-600">Current Balance: ₹{balance.toFixed(2)}</p>
                    </div>
                </div>

                {pendingTransactions.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Transactions</h2>
                        <div className="space-y-4">
                            {pendingTransactions.map((transaction) => (
                                <div key={transaction._id} className="p-4 bg-yellow-50 rounded-lg">
                                    <p className="text-lg text-gray-800">Amount: ₹{transaction.amount}</p>
                                    <p className="text-lg text-gray-600">Status: {transaction.status}</p>
                                    <p className="text-lg text-gray-600">Date: {new Date(transaction.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg border border-gray-100">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    Fee Type
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {feeStructure.map((fee) => (
                                <tr key={fee.type} className="hover:bg-gray-50">
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className="text-lg font-medium text-gray-900">
                                            {fee.type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className="text-lg text-gray-900">
                                            ₹{fee.amount.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 whitespace-nowrap text-right">
                                        {paidFees[fee.type] ? (
                                            <div className="text-green-600">
                                                <div className="font-medium text-base">
                                                    Paid
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {paidFees[fee.type]}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {paymentDates[fee.type]}
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="primary" 
                                                onClick={() => initiatePayment(fee.amount, fee.type)}
                                                disabled={processingFees[fee.type] || balance < fee.amount}
                                                className="px-6 py-3 disabled:bg-gray-400 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white cursor-pointer rounded text-lg"
                                            >
                                                {processingFees[fee.type] ? "Processing..." : "Pay Now"}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Pay College Fees</h2>
                        <p className="mb-4">Amount: ₹{selectedFee?.amount}</p>

                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Select Payment Method</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['card', 'upi', 'netbanking'].map((method) => (
                                    <button
                                        key={method}
                                        onClick={() => handlePaymentMethodSelect(method)}
                                        className={`p-2 border rounded ${
                                            paymentMethod === method 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-300'
                                        }`}
                                    >
                                        {method.charAt(0).toUpperCase() + method.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {paymentMethod && (
                            <form onSubmit={handlePaymentSubmit}>
                                {paymentMethod === 'card' && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Card Number"
                                            value={paymentDetails.cardNumber}
                                            onChange={(e) => setPaymentDetails({
                                                ...paymentDetails,
                                                cardNumber: e.target.value
                                            })}
                                            className="w-full mb-2 p-2 border rounded"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Card Holder Name"
                                            value={paymentDetails.cardHolder}
                                            onChange={(e) => setPaymentDetails({
                                                ...paymentDetails,
                                                cardHolder: e.target.value
                                            })}
                                            className="w-full mb-2 p-2 border rounded"
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                value={paymentDetails.expiryDate}
                                                onChange={(e) => setPaymentDetails({
                                                    ...paymentDetails,
                                                    expiryDate: e.target.value
                                                })}
                                                className="p-2 border rounded"
                                                required
                                            />
                                            <input
                                                type="password"
                                                placeholder="CVV"
                                                value={paymentDetails.cvv}
                                                onChange={(e) => setPaymentDetails({
                                                    ...paymentDetails,
                                                    cvv: e.target.value
                                                })}
                                                className="p-2 border rounded"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {paymentMethod === 'upi' && (
                                    <input
                                        type="text"
                                        placeholder="UPI ID"
                                        value={paymentDetails.upiId}
                                        onChange={(e) => setPaymentDetails({
                                            ...paymentDetails,
                                            upiId: e.target.value
                                        })}
                                        className="w-full mb-4 p-2 border rounded"
                                        required
                                    />
                                )}

                                {paymentMethod === 'netbanking' && (
                                    <select
                                        value={paymentDetails.bankName}
                                        onChange={(e) => setPaymentDetails({
                                            ...paymentDetails,
                                            bankName: e.target.value
                                        })}
                                        className="w-full mb-4 p-2 border rounded"
                                        required
                                    >
                                        <option value="">Select Bank</option>
                                        <option value="sbi">State Bank of India</option>
                                        <option value="hdfc">HDFC Bank</option>
                                        <option value="icici">ICICI Bank</option>
                                        <option value="axis">Axis Bank</option>
                                    </select>
                                )}

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPaymentModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Pay ₹{selectedFee?.amount}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};