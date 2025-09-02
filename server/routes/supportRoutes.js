const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper to generate unique ticket numbers
const generateTicketNumber = () => {
  return `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// GET all tickets (for admin panel)
router.get("/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "name email") // ensures ticket.user.name/email exist
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// POST create new ticket (from user app)
router.post("/tickets", async (req, res) => {
  try {
    const { userId, type, category, message, subject } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create ticket
    const ticket = new Ticket({
      ticketNumber: generateTicketNumber(), // backend generates unique number
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

// POST reply to a ticket (admin or user)
router.post("/tickets/:id/reply", async (req, res) => {
  try {
    const { message, sender } = req.body;
    const { id } = req.params;

    if (!message || !sender) {
      return res.status(400).json({ message: "Message and sender are required" });
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

// PATCH update ticket status (open, pending, resolved)
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

export default router;
