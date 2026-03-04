const path = require("path");
const { spawn } = require("child_process");

// 🔥 FORCE absolute root-based path
const exeDir = path.resolve(process.cwd(), "..", "resources", "mt5");

console.log("📂 EXE DIRECTORY:", exeDir);

// Helper function to call MT5/PropFirm EXEs and return parsed output
const runMT5Exe = (exeName, args = []) =>
  new Promise((resolve, reject) => {
    const exePath = path.join(exeDir, exeName);
    const proc = spawn(exePath, args);

    let output = "";
    proc.stdout.on("data", (data) => (output += data.toString()));
    proc.stderr.on("data", (err) => reject(err.toString()));

    proc.on("close", () => {
      try {
        resolve(JSON.parse(output.trim()));
      } catch (e) {
        reject("Invalid JSON from " + exeName + ": " + output);
      }
    });
  });

module.exports = { runMT5Exe };