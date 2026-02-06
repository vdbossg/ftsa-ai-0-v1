const express = require("express");
const multer = require("multer");
const {
  getAffiliateData,
  registerAffiliate,
  requestWithdrawal,
} = require("../controllers/affiliateController");


const router = express.Router();

// ---------------- Multer setup ----------------
const upload = multer({ dest: "uploads/" });
const registrationUpload = upload.fields([
  { name: "docFront", maxCount: 1 },
  { name: "docBack", maxCount: 1 },
]);

// ---------------- Routes ----------------
router.post("/register", registrationUpload, registerAffiliate);
router.post("/request-withdrawal", requestWithdrawal);
router.get("/:userId", getAffiliateData);


module.exports = router;
