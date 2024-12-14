const { Router } = require('express');
const routes = Router();
const { Account, Admin, Transaction } = require('../db.js');
const { AuthMiddleWare } = require('../middleware');
const mongoose = require('mongoose');


routes.get("/balance", AuthMiddleWare, async (req, res) => {
    try {
        console.log(req.userId);
        const account = await Account.findOne({ userId: req.userId });
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.json({ balance: account.balance });
    } catch (error) {
        res.status(500).json({ message:error.message });
    }
});

routes.post('/transfer', AuthMiddleWare, async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { amount, to } = req.body; // Assuming you're passing these in the body
        const account = await Account.findOne({ userId: req.userId }).session(session);
        if (!account || account.balance < amount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Invalid transaction" });
        }

        const toAccount = await Account.findOne({ userId: to }).session(session);
        if (!toAccount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Recipient account not found" });
        }

        await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
        await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

        await session.commitTransaction();
        res.json({ message: "Transfer successful" });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: "Internal server error" });
    } finally {
        session.endSession();
    }
});

routes.post('/pay-fees', AuthMiddleWare, async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { amount } = req.body;
        
        // Validate amount
        if (!amount || amount <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid amount" });
        }

        // Check user's account
        const userAccount = await Account.findOne({ userId: req.userId }).session(session);
        if (!userAccount || userAccount.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // Find admin account with logging
        const admin = await Admin.findOne({ role: 'admin' }).session(session);
        console.log("Found admin:", admin); // Debug log

        if (!admin) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Admin not found" });
        }

        // Check if admin account exists
        const adminAccount = await Account.findOne({ 
            userId: admin._id,
            isAdminAccount: true 
        }).session(session);
        console.log("Found admin account:", adminAccount); // Debug log

        if (!adminAccount) {
            // Create admin account if it doesn't exist
            await Account.create([{
                userId: admin._id,
                balance: 0,
                isAdminAccount: true
            }], { session });
        }

        // Create transaction record
        const transaction = await Transaction.create([{
            sender: req.userId,
            receiver: admin._id,
            amount: amount,
            status: 'pending'
        }], { session });

        // Deduct amount from user's balance
        userAccount.balance -= amount;
        await userAccount.save({ session });

        await session.commitTransaction();
        res.status(200).json({ 
            message: "Fee payment initiated successfully", 
            transactionId: transaction[0]._id,
            remainingBalance: userAccount.balance,
            adminId: admin._id // Include this for debugging
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Fee payment error:", error); // Debug log
        res.status(500).json({ 
            message: "Error processing fee payment",
            error: error.message 
        });
    } finally {
        session.endSession();
    }
});

// Add this route to approve transactions (for admin use)
routes.post('/approve-fees/:transactionId', AuthMiddleWare, async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        console.log("Transaction ID:", req.params.transactionId); // Debug log

        const transaction = await Transaction.findOne({
            _id: new mongoose.Types.ObjectId(req.params.transactionId),
            status: 'pending'
        }).session(session);

        console.log("Found transaction:", transaction); // Debug log

        if (!transaction) {
            await session.abortTransaction();
            return res.status(404).json({ 
                message: "Transaction not found or already processed" 
            });
        }

        // Find admin account with logging
        const adminAccount = await Account.findOne({ 
            userId: transaction.receiver,
            isAdminAccount: true
        }).session(session);

        console.log("Found admin account:", adminAccount); // Debug log

        if (!adminAccount) {
            // Try to find admin and create account
            const admin = await Admin.findById(transaction.receiver);
            if (admin) {
                await Account.create([{
                    userId: admin._id,
                    balance: 0,
                    isAdminAccount: true
                }], { session });
            } else {
                await session.abortTransaction();
                return res.status(404).json({ 
                    message: "Admin account not found and unable to create one" 
                });
            }
        }

        // Update admin's balance
        adminAccount.balance += transaction.amount;
        await adminAccount.save({ session });

        // Update transaction status
        transaction.status = 'approved';
        transaction.approvedAt = new Date();
        await transaction.save({ session });

        await session.commitTransaction();
        res.json({ 
            message: "Fee payment approved successfully",
            transaction,
            adminAccount
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Approval Error:", error);
        res.status(500).json({ 
            message: "Error approving fee payment",
            error: error.message 
        });
    } finally {
        session.endSession();
    }
});

// Add this new route to get payment status
routes.get("/payment-status", AuthMiddleWare, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            sender: req.userId,
            status: { $in: ['approved', 'pending'] }
        }).sort({ createdAt: -1 });

        const paidFees = {};
        const paymentDates = {};

        transactions.forEach(transaction => {
            if (transaction.status === 'approved' && !paidFees[transaction.feeType]) {
                paidFees[transaction.feeType] = transaction._id;
                paymentDates[transaction.feeType] = transaction.approvedAt || transaction.createdAt;
            }
        });

        res.json({ 
            paidFees,
            paymentDates
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching payment status" });
    }
});

// Add this new route to get transaction history
routes.get("/transactions", AuthMiddleWare, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [
                { sender: req.userId },
                { receiver: req.userId }
            ]
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'firstName lastName username')
        .populate('receiver', 'firstName lastName username');
        
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions" });
    }
});

module.exports = routes;
