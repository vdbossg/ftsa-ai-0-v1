const FTSAService = require("../services/ServicesFTSAhelp");

/**
 * POST api/supportticket/Ftsa
 */
const createTicket = async (req, res) => {
  try {
    const { name, email, category, message, userId } = req.body;

    if (!name || !email || !category || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const ticket = await FTSAService.createSupportTicket({
      name,
      email,
      category,
      message,
      userId
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticketId: ticket.ticketId
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create support ticket",
      error: error.message
    });
  }
};

/**
 * GET api/supportticket/Ftsaai
 */
const getTicketsForAI = async (req, res) => {
  try {
    const tickets = await FTSAService.getAllTickets();

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message
    });
  }
};

module.exports = {
  createTicket,
  getTicketsForAI
};
