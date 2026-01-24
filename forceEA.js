// forceEA.js
const mongoose = require("mongoose");
const CFAAccount = require("./server/services/cfaAccount");
const License = require("./server/models/License");

require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Pick your test license
  const license = await License.findOne({ licenseKey: "LIC_TEST_STEP_02" });
  if (!license) return console.log("❌ License not found");

  console.log("⏳ Forcing EA generation for:", license.licenseKey);

  await CFAAccount.generateEA(license.userId, license.licenseKey);

  console.log("✅ EA should now be generated in mql5/Licensed_mq5");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
