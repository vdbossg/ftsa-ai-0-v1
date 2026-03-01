// main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let serverProcess;

// Kill backend if Electron exits
process.on("exit", () => {
  if (serverProcess) serverProcess.kill();
});
process.on("SIGINT", () => {
  if (serverProcess) serverProcess.kill();
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  if (serverProcess) serverProcess.kill();
});

// Start the backend server (optional)
function startServer() {
  const serverPath = path.join(__dirname, "server", "server.js");
  console.log("Starting backend server:", serverPath);

  serverProcess = spawn("node", [serverPath], {
    stdio: "inherit",
    shell: true,
  });

  serverProcess.on("close", (code) => {
    console.log(`Backend server exited with code ${code}`);
  });

  serverProcess.on("error", (err) => {
    console.error("Backend server failed to start:", err);
  });
}

function createWindow() {
  const isDev = !app.isPackaged;
  console.log("Creating main window. isDev =", isDev);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(
      __dirname,
      "assets",
      "icons",
      process.platform === "win32"
        ? "ChatGPT Image Mar 1, 2026, 11_24_59 AM.ico"
        : process.platform === "darwin"
        ? "icon.icns"
        : "icon.png"
    ),
  });

  // Remove default menu
  mainWindow.setMenu(null);

  if (isDev) {
    console.log("Loading localhost:3000 for development");
    mainWindow.loadURL("http://localhost:3000").catch((err) => {
      console.error("Failed to load localhost:", err);
    });
  } else {
    const indexPath = path.join(__dirname, "dist", "index.html");
    console.log("Loading production frontend:", indexPath);

    mainWindow
      .loadFile(indexPath)
      .then(() => console.log("Loaded React frontend"))
      .catch((err) => console.error("Failed to load React frontend:", err));
  }

  // Keep DevTools open for debugging (optional)
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    console.log("Main window closed");
    mainWindow = null;
  });
}

// Electron app lifecycle
app.on("ready", () => {
  console.log("App is ready");
  startServer();
  createWindow();
});

app.on("window-all-closed", () => {
  console.log("All windows closed");
  if (process.platform !== "darwin") app.quit();
  if (serverProcess) serverProcess.kill();
});

app.on("activate", () => {
  console.log("App activated");
  if (mainWindow === null) createWindow();
});