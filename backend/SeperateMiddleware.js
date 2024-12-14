// Middleware function to verify role
const authorizeRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next(); // Allow access if the role matches
        } else {
            res.status(403).json({ message: "Access forbidden: Insufficient privileges" });
        }
    };
};

module.exports = {
  authorizeRole
};
