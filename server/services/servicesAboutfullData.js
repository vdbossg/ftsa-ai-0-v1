const connectAdminDB = require("../config/adminDb");
const AboutAdmin = require("../models/modelsAboutfullData");

const getAboutFullData = async () => {
  const adminConn = await connectAdminDB();
  const AboutModel = adminConn.model("AboutAdmin", AboutAdmin.schema);

  const aboutData = await AboutModel.findOne().lean();

  return {
    criticalNotices: aboutData?.criticalNotices || [],
    keyFeatures: aboutData?.keyFeatures || [],
    offices: aboutData?.offices || [],
    team: aboutData?.team?.length ? aboutData.team : [{ name: "", role: "", photo: "" }],
    roadmap: aboutData?.roadmap || [],
    whyExist: aboutData?.whyExist || "",
  };
};

module.exports = { getAboutFullData };
