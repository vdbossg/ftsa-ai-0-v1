// Middleware to check if the user is logged in
module.exports = function authMiddleware(req, res, next) {
  if (req.user) { // assumes req.user is set after login
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
