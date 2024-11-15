import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../components/Button1";

export const Fees = () => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);

    const feeStructure = [
        { type: "Tuition Fee", amount: 50000 },
        { type: "Library Fee", amount: 2000 },
        { type: "Laboratory Fee", amount: 3000 },
        { type: "Development Fee", amount: 5000 }
    ];

    useEffect(() => {
        fetchBalance();
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

    const handlePayFees = async (amount, feeType) => {
        if (loading || balance < amount) return;
        
        setLoading(true);
        try {
            await axios.post(
                "http://localhost:3000/api/v1/account/pay-fees",
                { amount, feeType },
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token")
                    }
                }
            );
            await fetchBalance();
            alert(`Successfully paid ${feeType}`);
        } catch (error) {
            alert(error.response?.data?.message || "Error paying fees");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
            <div className="p-6 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                    <div className="mb-4">
                        <h1 className="text-3xl font-bold text-gray-800">Fee Payment</h1>
                        <p className="text-gray-600">Current Balance: ₹{balance.toFixed(2)}</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {feeStructure.map((fee) => (
                        <div key={fee.type} className="bg-white rounded-lg shadow-lg p-6 transition-transform hover:scale-105 border border-gray-100">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-800">{fee.type}</h2>
                                <p className="text-gray-600">Amount: ₹{fee.amount}</p>
                            </div>
                            <Button
                                variant="primary" 
                                onClick={() => handlePayFees(fee.amount, fee.type)}
                                disabled={loading || balance < fee.amount}
                                className="w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? "Processing..." : "Pay Now"}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};