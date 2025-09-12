import express from "express";
import {
  createTicket,
  getTickets,
  updateTicketStatus,
  replyTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/tickets", createTicket);
router.get("/tickets", getTickets);
router.patch("/tickets/:id/status", updateTicketStatus);
router.post("/tickets/:id/reply", replyTicket);

export default router;
