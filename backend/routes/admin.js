const { Router } = require("express");
const { JWT_SECRET } = require("../config.js");
const jwt = require('jsonwebtoken');
const { Admin } = require('../db.js');
const crypto = require('crypto');
const z = require('zod');

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
    try {
        const validatedData = adminSignupSchema.parse(req.body);
        
        const existingAdmin = await Admin.findOne({
            username: validatedData.username
        });

        if (existingAdmin) {
            return res.status(400).json({
                message: "Admin already exists"
            });
        }

        const hashedPassword = hashPassword(validatedData.password);
        
        const newAdmin = await Admin.create({
            username: validatedData.username,
            password: hashedPassword,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            role: 'admin'
        });

        const token = jwt.sign(
            { id: newAdmin._id, role: 'admin' },
            JWT_SECRET
        );

        res.status(201).json({
            message: "Admin created successfully",
            token
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Error creating admin",
            error: error.message
        });
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
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        res.json({
            username: admin.username,
            role: admin.role
        });

    } catch (error) {
        res.status(401).json({
            message: "Invalid token"
        });
    }
});

module.exports = router;