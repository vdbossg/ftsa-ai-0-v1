const { Schema } = require('mongoose');

// NOTE: Do NOT call mongoose.model here, use connection from admin DB
const faqItemSchema = new Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true }
}, { _id: true });

const faqSchema = new Schema({
  faqs: { type: [faqItemSchema], default: [] }
}, { timestamps: true });

module.exports = faqSchema;
