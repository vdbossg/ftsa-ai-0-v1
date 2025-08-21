// server/middlewares/adminAuthMiddleware.js

// Middleware to check if the user is an admin
function adminAuth(req, res, next) {
  // Safety: ensure req.user exists
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({ message: "Access denied: Admins only" });
}

module.exports = adminAuth;
