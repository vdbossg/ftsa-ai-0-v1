const express = require("express");
const router = express.Router();
const {
  getMTAccount,
  connectMT,
  deleteMT,
} = require("../controllers/mtaccountController.js");

// Optional auth middleware
const authMiddleware = (req, res, next) => next();

// ✅ Use controller functions directly
router.get("/", authMiddleware, getMTAccount);
router.post("/connect", authMiddleware, connectMT);
router.delete("/:login", authMiddleware, deleteMT);


module.exports = router;
