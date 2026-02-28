const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { spawn } = require("child_process");


let mainWindow;
let serverProcess;

// Kill backend if Electron exits
process.on("exit", () => serverProcess?.kill());
process.on("SIGINT", () => serverProcess?.kill());
process.on("uncaughtException", () => serverProcess?.kill());

// Start the backend server (optional)
function startServer() {
  const serverPath = path.join(__dirname, "server", "server.js");
  serverProcess = spawn("node", [serverPath], {
    stdio: "inherit",
    shell: true,
  });

  serverProcess.on("close", (code) => {
    console.log(`Backend server exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
  preload: path.join(__dirname, "preload.js"),
  nodeIntegration: true,
  contextIsolation: false,
},
    icon: path.join(
      __dirname,
      "assets",
      "icons",
      process.platform === "win32"
        ? "icon.ico"
        : process.platform === "darwin"
        ? "icon.icns"
        : "icon.png"
    ),
  });

  // ← ADD THIS LINE TO REMOVE THE DEFAULT MENU
  mainWindow.setMenu(null);



// Inside createWindow()
if (isDev) {
  mainWindow.loadURL("http://localhost:3000");
} else {
  const indexPath = path.join(__dirname, "dist", "index.html");
  mainWindow.loadFile(indexPath)
    .then(() => console.log("Loaded React frontend"))
    .catch((err) => console.error("Failed to load React frontend:", err));
}

  mainWindow.webContents.openDevTools(); // keep this for debugging

  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", () => {
  startServer();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
  if (serverProcess) serverProcess.kill();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});