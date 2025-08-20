const express = require("express");
const axios = require("axios");
const router = express.Router();

const shortCode = process.env.MPESA_SHORTCODE;
const passkey = process.env.MPESA_PASSKEY;
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const mpesaEnv = process.env.MPESA_ENV || "sandbox";

const baseURL =
  mpesaEnv === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

// Helper to get timestamp
const getTimestamp = () => {
  const date = new Date();
  return (
    date.getFullYear().toString() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2)
  );
};

// 🔑 Get OAuth Token
const getToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await axios.get(
    `${baseURL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
};

// 📲 STK Push route
router.post("/stkpush", async (req, res) => {
  const { amount, phoneNumber } = req.body;

  if (!amount || !phoneNumber) {
    return res.status(400).json({ error: "Amount and phone number are required" });
  }

  const timestamp = getTimestamp();
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

  try {
    const token = await getToken(); // ✅ get fresh token

    const response = await axios.post(
      `${baseURL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.MPESA_NOTIFICATION_URL,
        AccountReference: "FTSA",
        TransactionDesc: "Payment for FTSA",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("STK Push error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: "STK Push failed", details: err.response?.data || err.message });
  }
});
// ✅ Mpesa callback route
router.post("/callback", (req, res) => {
  console.log("✅ Mpesa Callback received:", JSON.stringify(req.body, null, 2));


  // Later: save to DB or check if payment successful
  res.json({ message: "Callback received successfully" });
});

module.exports = router;
