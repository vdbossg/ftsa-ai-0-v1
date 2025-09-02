import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const fetchFAQs = async () => {
  const res = await axios.get(`${API_BASE}/faqs`);
  return res.data;
};

export const fetchSupportChannels = async () => {
  // Example: fetch available channels + categories
  const res = await axios.get(`${API_BASE}/support/channels`);
  return res.data;
};

export const createTicket = async (ticketData) => {
  const res = await axios.post(`${API_BASE}/support/tickets`, ticketData);
  return res.data; // returns { number: "TICKET-12345" }
};

export const getTickets = async () => {
  const res = await axios.get(`${API_BASE}/support/tickets`);
  return res.data;
};

export const replyTicket = async (ticketId, message) => {
  const res = await axios.post(`${API_BASE}/support/tickets/${ticketId}/reply`, { message, sender: "admin" });
  return res.data;
};

export const updateTicketStatus = async (ticketId, status) => {
  const res = await axios.patch(`${API_BASE}/support/tickets/${ticketId}/status`, { status });
  return res.data;
};
