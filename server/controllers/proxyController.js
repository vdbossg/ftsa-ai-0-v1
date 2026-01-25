const fs = require("fs");
const path = require("path");
const { startDeviceProxy } = require("../services/proxymyidaccountService");

exports.getMyProxyStatus = async (req, res) => {
  const sessionFile = path.join(__dirname, "../userSession.json");

  if (!fs.existsSync(sessionFile)) {
    return res.json({ message: "Not logged in, log in please." });
  }

  const session = JSON.parse(fs.readFileSync(sessionFile, "utf8"));
  const userId = session.userId;
  const email = session.email;

  // Start proxy silently
  await startDeviceProxy();

  res.json({
    userId,
    email,
    message: "Proxy started for this user. EA will be generated automatically when a new license appears."
  });
};
