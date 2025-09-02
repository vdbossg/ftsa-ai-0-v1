import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Message subdocument schema
const messageSchema = new Schema({
  sender: { type: String, enum: ["user", "admin"], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Ticket schema
const ticketSchema = new Schema(
  {
    ticketNumber: { type: String, required: true, unique: true }, // backend generates
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true }, // for populate()
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    subject: { type: String, required: true },
    type: { type: String, enum: ["WhatsApp", "SMS", "Email"], default: "Email" }, // optional type
    category: { type: String, required: true },
    status: { type: String, enum: ["new", "open", "pending", "resolved"], default: "new" },
    messages: [messageSchema],
    assignedTo: { type: mongoose.Types.ObjectId, ref: "User", default: null }, // support employee
    expiresAt: { type: Date }, // auto-close after X hours
  },
  { timestamps: true }
);

// Auto-set ticket expiry (5 hours from creation) if not provided
ticketSchema.pre("save", function (next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours
  }
  next();
});

export default model("Ticket", ticketSchema);
