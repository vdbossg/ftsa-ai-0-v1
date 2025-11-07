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
router.post("/connect", authMiddleware, connectPropAccount);
router.delete("/:login", authMiddleware, deletePropAccount);

module.exports = router;
