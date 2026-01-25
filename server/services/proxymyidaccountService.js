const fs = require("fs");
const path = require("path");
const License = require("../models/License");
const Elimq5Service = require("./Elimq5Service");

let proxyInterval = null;

async function startDeviceProxy() {
  const sessionFile = path.join(__dirname, "../userSession.json");

  if (!fs.existsSync(sessionFile)) {
    console.log("❌ No user logged in. Proxy will not start.");
    return;
  }

  const session = JSON.parse(fs.readFileSync(sessionFile, "utf8"));
  const userId = session.userId;
  console.log(`🚀 Device proxy starting for user ${userId}`);

  let lastLicenseKey = "";
  let lastMtLogin = "";
  let lastBroker = "";

  proxyInterval = setInterval(async () => {
    try {
      const latestLicense = await License.findOne({ userId }).sort({ createdAt: -1 });
      if (!latestLicense) return;

      if (
        latestLicense.licenseKey !== lastLicenseKey ||
        latestLicense.mtLogin !== lastMtLogin ||
        latestLicense.broker !== lastBroker
      ) {
        console.log(`✅ New license detected for user ${userId}. Generating EA...`);

        await Elimq5Service.injectLatestLicense(userId);

        lastLicenseKey = latestLicense.licenseKey;
        lastMtLogin = latestLicense.mtLogin;
        lastBroker = latestLicense.broker;
      }
    } catch (err) {
      console.error(`❌ Proxy error for user ${userId}:`, err);
    }
  }, 3000); // every 3 seconds
}

function stopDeviceProxy() {
  if (proxyInterval) clearInterval(proxyInterval);
  console.log("🛑 Device proxy stopped.");
}

module.exports = { startDeviceProxy, stopDeviceProxy };
