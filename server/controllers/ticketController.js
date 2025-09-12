import Ticket from "../models/Ticket.js";

// --- Helper: Generate unique ticket number ---
const generateTicketNumber = (type) => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const serial = `${Math.floor(Math.random() * 900 + 100)}${String.fromCharCode(
    65 + Math.floor(Math.random() * 26)
  )}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

  const typeCode =
    type.toLowerCase() === "email"
      ? "Emailftsa-help"
      : type.toLowerCase() === "sms"
      ? "SMSftsa-help"
      : "Otherftsa-help";

  return `#${serial}-${typeCode}-${day}/${month}/${year}`;
};

// --- Create Ticket ---
export const createTicket = async (req, res) => {
  try {
    const { userId, type, category, message } = req.body;
    if (!userId || !type || !category || !message)
      return res.status(400).json({ error: "All fields are required" });

    let ticketNumber = generateTicketNumber(type);

    // Ensure uniqueness in DB
    while (await Ticket.findOne({ ticketNumber })) {
      ticketNumber = generateTicketNumber(type);
    }

    const ticket = await Ticket.create({
      ticketNumber,
      userId,
      type,
      category,
      message,
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

// --- Get all tickets ---
export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate("userId", "fullName email").sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

// --- Update Ticket Status ---
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(id, { status }, { new: true });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update ticket" });
  }
};

// --- Reply to Ticket ---
export const replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { sender, message } = req.body;
    if (!sender || !message) return res.status(400).json({ error: "Sender and message are required" });

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.replies.push({ sender, message });
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reply to ticket" });
  }
};
