const { Admin } = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const adminMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authorization = req.headers.authorization;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Authorization token required"
            });
        }

        const token = authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if it's an admin
        const admin = await Admin.findOne({
            _id: decoded.id,
            role: 'admin'
        });

        if (!admin) {
            return res.status(403).json({
                message: "Access denied. Admin privileges required."
            });
        }

        // Add admin info to request
        req.user = {
            _id: admin._id,
            username: admin.username,
            role: admin.role
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: "Invalid token"
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token expired"
            });
        }
        res.status(500).json({
            message: "Authentication error",
            error: error.message
        });
    }
};

module.exports = {
    adminMiddleware
}; 