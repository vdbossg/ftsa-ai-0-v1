const { getAllFaqs } = require('../services/servicesFtsaFaqs');

const getFaqsController = async (req, res) => {
  try {
    const faqs = await getAllFaqs();
    res.status(200).json({ faqs });
  } catch (err) {
    console.error('Failed to fetch FAQs:', err.message);
    res.status(500).json({ message: 'Failed to fetch FAQs' });
  }
};

module.exports = { getFaqsController };
