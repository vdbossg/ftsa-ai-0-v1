const connectAdminDB = require('../config/adminDb');
const faqSchema = require('../models/modelsFtsaFaqs');

let FaqModel;

const getFaqDocument = async () => {
  const adminConn = await connectAdminDB();
  if (!FaqModel) FaqModel = adminConn.model('Faq', faqSchema);

  let doc = await FaqModel.findOne();
  if (!doc) doc = await FaqModel.create({ faqs: [] });
  return doc;
};

const getAllFaqs = async () => {
  const doc = await getFaqDocument();
  return doc.faqs;
};

module.exports = { getAllFaqs };
