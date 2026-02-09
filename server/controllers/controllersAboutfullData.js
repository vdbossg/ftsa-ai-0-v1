const { getAboutFullData } = require("../services/servicesAboutfullData");

const fetchAboutFullData = async (req, res) => {
  try {
    const data = await getAboutFullData();
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch about data:", err.message);
    res.status(500).json({ error: "Failed to fetch about data" });
  }
};

module.exports = { fetchAboutFullData };
