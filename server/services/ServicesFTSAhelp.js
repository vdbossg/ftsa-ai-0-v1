//FTSA_AI_0.v1\server\services\ServicesFTSAhelp.js
const FTSAHelp = require("../models/ModelsFTSAhelp");

/**
 * Generate unique ticket ID
 */
const generateTicketId = (name) => {
  const initials = name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  const now = new Date();
  const timestamp =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "-" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  return `#001A-${timestamp}-${initials}`;
};

/**
 * CREATE SUPPORT TICKET
 */
const createSupportTicket = async (payload) => {
  const ticketId = generateTicketId(payload.name);

  const ticket = await FTSAHelp.create({
    userId: payload.userId || null,
    ticketId,
    name: payload.name,
    email: payload.email,
    category: payload.category,
    message: payload.message
  });

  return ticket;
};

/**
 * GET ALL TICKETS (AI / Admin use)
 */
const getAllTickets = async () => {
  return await FTSAHelp.find().sort({ createdAt: -1 });
};

module.exports = {
  createSupportTicket,
  getAllTickets
};
