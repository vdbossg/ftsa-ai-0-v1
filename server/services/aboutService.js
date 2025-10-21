// server/services/aboutService.js
const About = require("../models/About");

const getAbout = async () => {
  const about = await About.findOne();
  if (!about) {
    return {
      criticalNotices: [],
      keyFeatures: [],
      whyExist: "",
      poweredBy: "",
      offices: [],
      team: [],
      roadmap: [],
    };
  }
  return about;
};

const createAbout = async (data) => {
  const about = new About(data);
  await about.save();
  return about;
};

const updateAbout = async (id, data) => {
  const updated = await About.findByIdAndUpdate(id, data, { new: true });
  return updated;
};

const deleteAbout = async (id) => {
  const deleted = await About.findByIdAndDelete(id);
  return deleted;
};

module.exports = {
  getAbout,
  createAbout,
  updateAbout,
  deleteAbout,
};
