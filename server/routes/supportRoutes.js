const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const mongoose = require("mongoose");

// --- Helper: Generate ticket number in frontend format ---
const generateTicketNumber = (type) => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  // Unique serial: 001AAA
  const serial = `${Math.floor(Math.random() * 900 + 100)}${String.fromCharCode(
    65 + Math.floor(Math.random() * 26)
  )}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

  const typeCode =
    type?.toLowerCase() === "email"
      ? "Emailftsa-help"
      : type?.toLowerCase() === "sms"
      ? "SMSftsa-help"
      : "Otherftsa-help";

  return `#${serial}-${typeCode}-${day}/${month}/${year}`;
};

// --- GET all tickets ---
router.get("/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// --- POST create new ticket ---
router.post("/tickets", async (req, res) => {
  try {
    const { userId, type, category, message, subject } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!category || !message) {
      return res.status(400).json({ message: "Category and message are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ticket = new Ticket({
      ticketNumber: generateTicketNumber(type),
      user: userId,
      userName: user.name,
      userEmail: user.email,
      subject: subject || `Support Request - ${new Date().toLocaleString()}`,
      type,
      category,
      messages: [{ sender: "user", message }],
      status: "new",
    });

    await ticket.save();
    const populatedTicket = await ticket.populate("user", "name email");
    res.status(201).json(populatedTicket);
  } catch (err) {
    console.error("Failed to create ticket:", err);
    res.status(500).json({ message: "Failed to create ticket" });
  }
});

// --- POST reply to a ticket ---
router.post("/tickets/:id/reply", async (req, res) => {
  try {
    const { message, sender } = req.body;
    const { id } = req.params;

    if (!message || !sender || !["user", "admin"].includes(sender)) {
      return res.status(400).json({ message: "Message and valid sender are required" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.messages.push({ sender, message });
    await ticket.save();

    const populatedTicket = await ticket.populate("user", "name email");
    res.json(populatedTicket);
  } catch (err) {
    console.error("Failed to reply to ticket:", err);
    res.status(500).json({ message: "Failed to reply to ticket" });
  }
});

// --- PATCH update ticket status ---
router.patch("/tickets/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["new", "open", "pending", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.json(ticket);
  } catch (err) {
    console.error("Failed to update ticket status:", err);
    res.status(500).json({ message: "Failed to update ticket status" });
  }
});

module.exports = router;
