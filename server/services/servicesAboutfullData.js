// FTSA_AI_0.v1\server\services\servicesAboutfullData.js
const axios = require("axios");

const getAboutFullData = async () => {
  try {
    // Fetch directly from App A
    const { data } = await axios.get("http://localhost:5001/api/aboutData");
    return data; // return exactly what App A sends
  } catch (err) {
    console.error("❌ Failed to fetch AboutData from App A:", err.message);
    throw err;
  }
};

module.exports = { getAboutFullData };
