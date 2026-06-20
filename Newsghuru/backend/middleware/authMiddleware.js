const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Check header for token (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized to access this route. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_super_secret_key");

    // Check if user still exists
    const currentUser = await User.findById(decoded.userId).select("-password");
    if (!currentUser) {
      return res.status(401).json({ message: "The user belonging to this token does no longer exist." });
    }

    // Grant access to protected route
    req.user = currentUser;

    // Update lastActiveAt in the background (non-blocking) for "Login Users" tracking
    User.findByIdAndUpdate(decoded.userId, { lastActiveAt: new Date() }).catch(
      (err) => console.error("Failed to update lastActiveAt:", err)
    );

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please log in again." });
    }
    return res.status(401).json({ message: "Not authorized. Invalid token." });
  }
};

// Middleware to restrict access based on roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role (${req.user?.role}) is not allowed to access this resource.` });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
