const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const License = require("../models/License");

// Paths
const TEMPLATE_DIR = path.join(__dirname, "../../mql5/templates");
const TEMP_DIR = path.join(__dirname, "../../temp");

// Make sure temp folder exists
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
exports.generateEA = async (req, res) => {
  try {
    const { licenseKey } = req.body;
    const license = await License.findOne({ licenseKey });

    if (!license) return res.status(403).json({ success: false, error: "License not found" });

    
    // Check if subscription is active
if (!license.endDate || new Date(license.endDate) < new Date()) {
  return res.status(403).json({ success: false, error: "Subscription expired or inactive" });
}


    // Paths
    const userEAPath = path.join(TEMP_DIR, `${license.userId}_FTSA_EA.mq5`);
    const outputFile = userEAPath.replace(/\.mq5$/, ".ex5");
    const configPath = path.join(TEMP_DIR, `${license.userId}_license_Config.json`);

    // If .ex5 already exists, skip compilation and return file
    if (fs.existsSync(outputFile)) {
      return res.json({ success: true, filename: path.basename(outputFile) });
    }

    // Read EA template
    const templatePath = path.join(TEMPLATE_DIR, "EA_Template.mq5");
    if (!fs.existsSync(templatePath)) throw new Error("EA template not found");

    let code = fs.readFileSync(templatePath, "utf8");

    // Inject license info
    code = code
      .replace("{BROKER}", license.broker)
      .replace("{LOGIN}", license.mtLogin || license.login)
      .replace("{EXPIRY}", new Date(license.endDate).toISOString())
      .replace("{LICENSE_KEY}", license.licenseKey);

    // Save user-specific EA file
    fs.writeFileSync(userEAPath, code, "utf8");

    // Update license_Config.json for reference
    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          broker: license.broker,
          login: license.mtLogin || license.login,
          expiry: new Date(license.endDate).toISOString(),
          license_key: license.licenseKey,
        },
        null,
        2
      ),
      "utf8"
    );

    // Compile EA using MetaEditor
const metaEditorPath = "C:\\Program Files\\MetaTrader 5\\MetaEditor.exe"; // your confirmed path

exec(
  `"${metaEditorPath}" /compile:"${userEAPath}" /log:"${userEAPath}.log"`,
  (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ success: false, error: "EA compilation failed" });
    }

    res.json({ success: true, filename: path.basename(outputFile) });
  }
);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "EA generation failed" });
  }
};
