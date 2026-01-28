// services/ServicesEaDownload.js
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");

//const baseFolder = path.join(__dirname, "..", "mql5", "MyLicensed_ex5");
const baseFolder = path.join(__dirname, "..", "..", "mql5", "MyLicensed_ex5");


// Helper: read license file and extract info
const parseLicenseFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const getValue = (key) => {
    const match = content.match(new RegExp(`${key}:\\s*(.*)`));
    return match ? match[1].trim() : "N/A";
  };
  return {
    licenseKey: getValue("License Key"),
    userId: getValue("User ID"),
    mtLogin: getValue("MT5 Login"),
    plan: getValue("Plan"),
    broker: getValue("Broker"),
    startDate: getValue("Start Date"),
    endDate: getValue("End Date"),
    status: getValue("Status"),
    linkedAt: getValue("Linked At"),
  };
};

// Scan all subfolders and return license list
const getAllLicenses = () => {
  const licenses = [];
  if (!fs.existsSync(baseFolder)) return licenses;

  const subfolders = fs.readdirSync(baseFolder).filter((f) =>
    fs.statSync(path.join(baseFolder, f)).isDirectory()
  );

  subfolders.forEach((folder) => {
    const folderPath = path.join(baseFolder, folder);
    const files = fs.readdirSync(folderPath);

    const eaFile = files.find((f) => f.endsWith(".ex5") && !f.toLowerCase().includes("copy"));
    const licenseFile = files.find((f) => f.includes(".ex5+license") && f.endsWith(".txt"));

    if (eaFile && licenseFile) {
      const licenseData = parseLicenseFile(path.join(folderPath, licenseFile));
      const today = new Date();
      const endDate = new Date(licenseData.endDate);
      licenseData.status = endDate >= today ? "active" : "inactive";
      licenseData.filename = eaFile;
      licenseData.folderPath = folderPath;
      licenses.push(licenseData);
    }
  });

  return licenses;
};

// Watch folder for changes
const watchFolder = (onChange) => {
  const watcher = chokidar.watch(baseFolder, { ignoreInitial: true, depth: 2 });
  watcher.on("addDir", () => onChange(getAllLicenses()));
  watcher.on("add", () => onChange(getAllLicenses()));
  watcher.on("unlink", () => onChange(getAllLicenses()));
};

module.exports = { getAllLicenses, watchFolder };
