//\FTSA_AI_0.v1\main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { spawn } = require("child_process");

let mainWindow;
let serverProcess;

process.on("exit", () => serverProcess?.kill());
process.on("SIGINT", () => serverProcess?.kill());
process.on("uncaughtException", () => serverProcess?.kill());
// Start the backend server
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

// Create the main Electron window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
  preload: path.join(__dirname, "preload.js"),
  nodeIntegration: false,       // DISABLE for security
  contextIsolation: true,       // ENABLE for security
},
    
    icon: path.join(__dirname, "assets", "icons", 
      process.platform === "win32"
        ? "icon.ico"
        : process.platform === "darwin"
        ? "icon.icns"
        : "icon.png"
    ),
  });

  // Load React frontend
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173"); // Vite dev server
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html")); // Production build
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App lifecycle
app.on("ready", () => {
  startServer();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  if (serverProcess) serverProcess.kill();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});