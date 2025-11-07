// server/routes/propAccountRoutes.js
const express = require("express");
const router = express.Router();
const {
  getPropAccount,
  connectPropAccount,
  deletePropAccount,
} = require("../controllers/propAccountController.js");

// Optional auth middleware
const authMiddleware = (req, res, next) => next();

// ✅ Routes for Prop MT5 accounts
router.get("/", authMiddleware, getPropAccount);
router.post("/", authMiddleware, connectPropAccount); // ✅ added to match frontend
router.post("/connect", authMiddleware, connectPropAccount); // keep old one (compatibility)
router.delete("/:login", authMiddleware, deletePropAccount);

module.exports = router;
