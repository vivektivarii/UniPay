const { Router } = require("express");
const { JWT_SECRET } = require("../config.js");
const jwt = require('jsonwebtoken');
const { Admin, Account, Transaction, User, Payment, Notification } = require('../db.js');
const crypto = require('crypto');
const z = require('zod');
const mongoose = require('mongoose');
const { AuthMiddleWare } = require('../middleware');

// Update validation schemas
const adminSignupSchema = z.object({
    username: z.string().email(),
    password: z.string().min(6),
    firstName: z.string(),
    lastName: z.string()
});

const adminLoginSchema = z.object({
    username: z.string().email(),
    password: z.string()
});

// Password hashing functions
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

const verifyPassword = (password, hashedPassword) => {
    const [salt, originalHash] = hashedPassword.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
};

const router = Router();

router.post('/signup', async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const validatedData = adminSignupSchema.parse(req.body);
        
        const existingAdmin = await Admin.findOne({
            username: validatedData.username
        }).session(session);

        if (existingAdmin) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Admin already exists"
            });
        }

        const hashedPassword = hashPassword(validatedData.password);
        
        // Create admin user
        const newAdmin = await Admin.create([{
            username: validatedData.username,
            password: hashedPassword,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            role: 'admin'
        }], { session });

        // Create admin account
        await Account.create([{
            userId: newAdmin[0]._id,
            balance: 0,
            isAdminAccount: true // Mark this as an admin account
        }], { session });

        const token = jwt.sign(
            { id: newAdmin[0]._id, role: 'admin' },
            JWT_SECRET
        );

        await session.commitTransaction();

        res.status(201).json({
            message: "Admin created successfully",
            token
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Error creating admin",
            error: error.message
        });
    } finally {
        session.endSession();
    }
});

router.post('/login', async (req, res) => {
    try {
        const validatedData = adminLoginSchema.parse(req.body);
        
        const admin = await Admin.findOne({ 
            username: validatedData.username,
            role: 'admin'
        });

        if (!admin) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const validPassword = verifyPassword(validatedData.password, admin.password);
        
        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            JWT_SECRET
        );

        res.json({
            message: "Login successful",
            token,
            admin: {
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Error logging in",
            error: error.message
        });
    }
});

// Test route to verify authentication


// Add this temporary rout

// Add this route to view all pending transactions
router.get('/pending-transactions', AuthMiddleWare, async (req, res) => {
    try {
        // Find all pending transactions with user details
        const pendingTransactions = await Transaction.find({ status: 'pending' })
            .populate('sender', 'username firstName lastName') // Get user details
            .sort({ createdAt: -1 }); // Sort by newest first

        // Calculate total pending amount
        const totalPendingAmount = pendingTransactions.reduce(
            (sum, transaction) => sum + transaction.amount, 
            0
        );

        res.json({
            count: pendingTransactions.length,
            totalPendingAmount,
            transactions: pendingTransactions.map(transaction => ({
                transactionId: transaction._id,
                amount: transaction.amount,
                sender: {
                    id: transaction.sender._id,
                    username: transaction.sender.username,
                    name: `${transaction.sender.firstName} ${transaction.sender.lastName}`
                },
                createdAt: transaction.createdAt
            }))
        });
    } catch (error) {
        console.error("Error fetching pending transactions:", error);
        res.status(500).json({ 
            message: "Error fetching pending transactions",
            error: error.message 
        });
    }
});

// Add a route to get transaction details by ID
router.get('/transaction/:transactionId', AuthMiddleWare, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.transactionId)) {
            return res.status(400).json({ message: "Invalid transaction ID" });
        }

        const transaction = await Transaction.findById(req.params.transactionId)
            .populate('sender', 'username firstName lastName');

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({
            transactionId: transaction._id,
            amount: transaction.amount,
            status: transaction.status,
            sender: {
                id: transaction.sender._id,
                username: transaction.sender.username,
                name: `${transaction.sender.firstName} ${transaction.sender.lastName}`
            },
            createdAt: transaction.createdAt,
            approvedAt: transaction.approvedAt
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching transaction details",
            error: error.message 
        });
    }
});

// Add a route to get transaction statistics
router.get('/transaction-stats', AuthMiddleWare, async (req, res) => {
    try {
        const [pendingCount, approvedCount, totalAmount] = await Promise.all([
            Transaction.countDocuments({ status: 'pending' }),
            Transaction.countDocuments({ status: 'approved' }),
            Transaction.aggregate([
                {
                    $group: {
                        _id: '$status',
                        total: { $sum: '$amount' }
                    }
                }
            ])
        ]);

        const stats = {
            pending: pendingCount,
            approved: approvedCount,
            amounts: {
                pending: totalAmount.find(item => item._id === 'pending')?.total || 0,
                approved: totalAmount.find(item => item._id === 'approved')?.total || 0
            }
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching transaction statistics",
            error: error.message 
        });
    }
});

// Get admin profile
router.get('/profile', AuthMiddleWare, async (req, res) => {
    try {
        const admin = await Admin.findById(req.userId)
            .select('-password'); // Exclude password from response
        
        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        res.json(admin);
    } catch (error) {
        console.error("Error fetching admin profile:", error);
        res.status(500).json({
            message: "Error fetching profile",
            error: error.message
        });
    }
});

// Update admin profile
router.put('/profile/update', AuthMiddleWare, async (req, res) => {
    try {
        const { firstName, lastName, currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.userId);

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        // If updating password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    message: "Current password is required to update password"
                });
            }

            // Verify current password
            const validPassword = verifyPassword(currentPassword, admin.password);
            if (!validPassword) {
                return res.status(401).json({
                    message: "Current password is incorrect"
                });
            }

            // Hash new password
            admin.password = hashPassword(newPassword);
        }

        // Update name fields if provided
        if (firstName) admin.firstName = firstName;
        if (lastName) admin.lastName = lastName;

        await admin.save();

        // Return updated admin without password
        const updatedAdmin = await Admin.findById(req.userId)
            .select('-password');

        res.json(updatedAdmin);
    } catch (error) {
        console.error("Error updating admin profile:", error);
        res.status(500).json({
            message: "Error updating profile",
            error: error.message
        });
    }
});

// Add validation schema for profile update
const adminProfileUpdateSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6).optional()
}).refine(data => {
    // If newPassword is provided, currentPassword must also be provided
    if (data.newPassword && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: "Current password is required when setting new password"
});

// Add validation middleware for profile update
router.put('/profile/update', AuthMiddleWare, async (req, res) => {
    try {
        const validatedData = adminProfileUpdateSchema.parse(req.body);
        // ... rest of the update logic
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Invalid input",
                errors: error.errors
            });
        }
        throw error;
    }
});

// Add validation schema for admin creating a user
const adminCreateUserSchema = z.object({
    username: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string(),
    initialBalance: z.number().nonnegative().optional()
});

// Route for admin to create a new user
router.post('/create-user', AuthMiddleWare, async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // Validate input
        const validatedData = adminCreateUserSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await User.findOne({
            username: validatedData.username
        }).session(session);

        if (existingUser) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        // Create user
        const newUser = await User.create([{
            username: validatedData.username,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            password: validatedData.password
        }], { session });

        // Create account with initial balance
        const initialBalance = validatedData.initialBalance || (1 + Math.random() * 100000);
        await Account.create([{
            userId: newUser[0]._id,
            balance: initialBalance
        }], { session });

        await session.commitTransaction();

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser[0]._id,
                username: newUser[0].username,
                firstName: newUser[0].firstName,
                lastName: newUser[0].lastName
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Error creating user:", error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Invalid input",
                errors: error.errors
            });
        }

        res.status(500).json({
            message: "Error creating user",
            error: error.message
        });
    } finally {
        session.endSession();
    }
});

// Route to get all users with pagination and search
router.get('/users', AuthMiddleWare, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const skip = (page - 1) * limit;

        const searchQuery = {
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ]
        };

        const [users, total] = await Promise.all([
            User.find(searchQuery)
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            User.countDocuments(searchQuery)
        ]);

        // Get account balances for all users
        const userIds = users.map(user => user._id);
        const accounts = await Account.find({ userId: { $in: userIds } });
        const balanceMap = accounts.reduce((map, acc) => {
            map[acc.userId.toString()] = acc.balance;
            return map;
        }, {});

        const usersWithBalance = users.map(user => ({
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            balance: balanceMap[user._id.toString()] || 0,
            createdAt: user.createdAt
        }));

        res.json({
            users: usersWithBalance,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            message: "Error fetching users",
            error: error.message
        });
    }
});

// Route to get specific user details
router.get('/users/:userId', AuthMiddleWare, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const account = await Account.findOne({ userId: user._id });
        const payments = await Payment.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: user.createdAt
            },
            account: {
                balance: account ? account.balance : 0
            },
            recentPayments: payments.map(payment => ({
                id: payment._id,
                amount: payment.amount,
                status: payment.status,
                createdAt: payment.createdAt
            }))
        });

    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({
            message: "Error fetching user details",
            error: error.message
        });
    }
});

// Add this validation schema with the other schemas
const notificationSchema = z.object({
    title: z.string().min(1).max(100),
    message: z.string().min(1).max(500),
    scheduledFor: z.string().datetime().optional(),
    expiresAt: z.string().datetime()
});

// Create a new notification
router.post('/notifications', AuthMiddleWare, async (req, res) => {
    try {
        const validatedData = notificationSchema.parse(req.body);
        
        // Get admin ID from the middleware
        const adminId = req.userId; // Make sure this matches your AuthMiddleware's property name

        const notification = await Notification.create({
            title: validatedData.title,
            message: validatedData.message,
            createdBy: adminId,
            scheduledFor: validatedData.scheduledFor || new Date(),
            expiresAt: validatedData.expiresAt,
            status: validatedData.scheduledFor ? 'Scheduled' : 'Active'
        });

        // Populate the createdBy field
        await notification.populate('createdBy', 'firstName lastName');

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification
        });

    } catch (error) {
        console.error("Error creating notification:", error);
        if (error.name === 'ZodError') {
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors
            });
        }
        res.status(500).json({
            message: "Error creating notification",
            error: error.message
        });
    }
});

// Get all notifications with pagination and filters
router.get('/notifications', AuthMiddleWare, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const skip = (page - 1) * limit;

        const query = {};
        if (status) {
            query.status = status;
        }

        const [notifications, total] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('createdBy', 'firstName lastName'),
            Notification.countDocuments(query)
        ]);

        res.json({
            notifications,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            message: "Error fetching notifications",
            error: error.message
        });
    }
});

// Update a notification
router.put('/notifications/:id', AuthMiddleWare, async (req, res) => {
    try {
        const validatedData = notificationSchema.partial().parse(req.body);
        
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { 
                ...validatedData,
                status: validatedData.scheduledFor ? 'Scheduled' : 'Active'
            },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({
            message: "Notification updated successfully",
            notification
        });

    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({
            message: "Error updating notification",
            error: error.message
        });
    }
});

// Delete a notification
router.delete('/notifications/:id', AuthMiddleWare, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({
            message: "Notification deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({
            message: "Error deleting notification",
            error: error.message
        });
    }
});

// Update the ReportSchema to include more report types
const ReportSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    reportType: z.enum(['transactions', 'fees', 'students', 'signups', 'payments'])
});

// Generate report endpoint
router.post('/generate-report', AuthMiddleWare, async (req, res) => {
    try {
        const validatedData = ReportSchema.parse(req.body);
        const { startDate, endDate, reportType } = validatedData;

        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);
        
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);

        let reportData;
        switch (reportType) {
            case 'transactions':
                reportData = await Transaction.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: startDateTime,
                                $lte: endDateTime
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'sender',
                            foreignField: '_id',
                            as: 'senderInfo'
                        }
                    },
                    {
                        $unwind: '$senderInfo'
                    },
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                            totalAmount: { $sum: "$amount" },
                            transactions: {
                                $push: {
                                    amount: "$amount",
                                    status: "$status",
                                    senderName: {
                                        $concat: ["$senderInfo.firstName", " ", "$senderInfo.lastName"]
                                    },
                                    createdAt: "$createdAt"
                                }
                            }
                        }
                    }
                ]);
                break;

            case 'fees':
                reportData = await Transaction.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: startDateTime,
                                $lte: endDateTime
                            },
                            status: 'approved'
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'sender',
                            foreignField: '_id',
                            as: 'studentInfo'
                        }
                    },
                    {
                        $unwind: '$studentInfo'
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" }
                            },
                            totalCollected: { $sum: "$amount" },
                            transactionCount: { $sum: 1 },
                            students: {
                                $addToSet: {
                                    id: "$studentInfo._id",
                                    name: {
                                        $concat: ["$studentInfo.firstName", " ", "$studentInfo.lastName"]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $sort: {
                            "_id.year": 1,
                            "_id.month": 1
                        }
                    }
                ]);
                break;

            case 'students':
                reportData = await User.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: startDateTime,
                                $lte: endDateTime
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: '_id',
                            foreignField: 'userId',
                            as: 'accountInfo'
                        }
                    },
                    {
                        $unwind: '$accountInfo'
                    },
                    {
                        $group: {
                            _id: null,
                            totalStudents: { $sum: 1 },
                            averageBalance: { $avg: '$accountInfo.balance' },
                            students: {
                                $push: {
                                    name: {
                                        $concat: ["$firstName", " ", "$lastName"]
                                    },
                                    email: "$username",
                                    balance: "$accountInfo.balance",
                                    joinedAt: "$createdAt"
                                }
                            }
                        }
                    }
                ]);
                break;

            case 'signups':
                reportData = await User.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: startDateTime,
                                $lte: endDateTime
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                                day: { $dayOfMonth: "$createdAt" }
                            },
                            count: { $sum: 1 },
                            users: {
                                $push: {
                                    name: { $concat: ["$firstName", " ", "$lastName"] },
                                    email: "$username",
                                    joinedAt: "$createdAt"
                                }
                            }
                        }
                    },
                    {
                        $sort: {
                            "_id.year": 1,
                            "_id.month": 1,
                            "_id.day": 1
                        }
                    }
                ]);
                break;

            case 'payments':
                reportData = await Transaction.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: startDateTime,
                                $lte: endDateTime
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'sender',
                            foreignField: '_id',
                            as: 'senderInfo'
                        }
                    },
                    {
                        $unwind: '$senderInfo'
                    },
                    {
                        $group: {
                            _id: {
                                status: "$status",
                                type: "$type"
                            },
                            count: { $sum: 1 },
                            totalAmount: { $sum: "$amount" },
                            avgAmount: { $avg: "$amount" },
                            payments: {
                                $push: {
                                    amount: "$amount",
                                    status: "$status",
                                    type: "$type",
                                    studentName: {
                                        $concat: ["$senderInfo.firstName", " ", "$senderInfo.lastName"]
                                    },
                                    date: "$createdAt"
                                }
                            }
                        }
                    },
                    {
                        $sort: {
                            "_id.status": 1,
                            "_id.type": 1
                        }
                    }
                ]);
                break;

            default:
                return res.status(400).json({
                    message: "Invalid report type"
                });
        }

        res.json({
            success: true,
            data: reportData,
            metadata: {
                reportType,
                startDate: startDateTime,
                endDate: endDateTime,
                totalRecords: reportData?.length || 0
            }
        });

    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({
            message: "Error generating report",
            error: error.message
        });
    }
});

module.exports = router;