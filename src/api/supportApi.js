import axios from "axios";

// Use Vite's import.meta.env system instead of process.env
const API_BASE = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "https://ftsa-ai-backend.onrender.com/api";


/**
 * Generate a special ticket number based on type and current date.
 * Format:
 *   Email: #001AAA-Emailftsa-help-DD/MM/YYYY
 *   SMS:   #001AAA-smsftsa-help-DD/MM/YYYY
 */
const generateTicketNumber = (type) => {
  const prefix = "#001AAA"; // can be made dynamic in backend for auto-increment
  const typeCode = type.toLowerCase() === "email" ? "Emailftsa-help" : "smsftsa-help";
  const date = new Date();
  const dateStr = `${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear()}`;
  return `${prefix}-${typeCode}-${dateStr}`;
};

// Fetch all FAQs
export const fetchFAQs = async () => {
  const res = await axios.get(`${API_BASE}/faqs`);
  return res.data;
};

// Fetch support channels and contact info
export const fetchSupportChannels = async () => {
  const res = await axios.get(`${API_BASE}/support/channels`);
  return res.data;
};

// Create a new ticket with special ticket number
export const createTicket = async (ticketData) => {
  const ticketNumber = generateTicketNumber(ticketData.type);
  const res = await axios.post(`${API_BASE}/support/tickets`, { ...ticketData, ticketNumber });
  return res.data; // returns { number: "#001AAA-smsftsa-help-20/09/2025" }
};
export async function fetchTicketCategories() {
  const response = await fetch("/api/support/categories");
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

// Get all tickets
export const getTickets = async () => {
  const res = await axios.get(`${API_BASE}/support/tickets`);
  return res.data;
};

// Reply to a ticket (admin)
export const replyTicket = async (ticketId, message) => {
  const res = await axios.post(`${API_BASE}/support/tickets/${ticketId}/reply`, {
    message,
    sender: "admin"
  });
  return res.data;
};

// Update ticket status (admin)
export const updateTicketStatus = async (ticketId, status) => {
  const res = await axios.patch(`${API_BASE}/support/tickets/${ticketId}/status`, { status });
  return res.data;
};
