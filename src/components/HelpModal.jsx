// src/components/HelpModal.jsx
import React, { useState, useEffect } from "react";

const HelpModal = ({ onClose, type, user }) => {
  const [ticketNumber, setTicketNumber] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Generate unique ticket number
    const unique = `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setTicketNumber(unique);

    // Fetch categories from admin panel
    async function fetchCategories() {
      try {
        const res = await fetch("/api/support/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setSendSuccess(null);

    try {
      await fetch("/api/support/create-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketNumber,
          userId: user?.id,
          type,
          category,
          message,
        }),
      });
      setSendSuccess(true);
      setMessage("");
      setCategory("");
    } catch (err) {
      console.error(err);
      setSendSuccess(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-[#1F2833] text-black dark:text-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">Support Ticket ({type})</h2>
        <p className="mb-2">Ticket Number: <strong>{ticketNumber}</strong></p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full p-2 rounded border border-gray-300"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            Message
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe your issue..."
              required
              className="w-full p-2 rounded border border-gray-300"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sending ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
        {sendSuccess && (
          <p className="mt-2 text-green-600">Your ticket is submitted and in queue. Our support will contact you shortly.</p>
        )}
        {sendSuccess === false && (
          <p className="mt-2 text-red-600">Failed to submit ticket. Please try again.</p>
        )}
      </div>
    </div>
  );
};

export default HelpModal;
