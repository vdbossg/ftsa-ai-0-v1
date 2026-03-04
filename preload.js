// preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Log when preload script is loaded
console.log("Preload script loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  // Existing generic send
  send: (channel, data) => {
    const validChannels = ["log", "request-data"];
    if (validChannels.includes(channel)) {
      console.log(`[Preload] Sending channel: ${channel}`, data);
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`[Preload] Attempted to send invalid channel: ${channel}`);
    }
  },

  // Existing generic receive
  receive: (channel, func) => {
    const validChannels = ["from-backend", "brain-update"];
    if (validChannels.includes(channel)) {
      console.log(`[Preload] Listening on channel: ${channel}`);
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    } else {
      console.warn(`[Preload] Attempted to listen to invalid channel: ${channel}`);
    }
  },

  // ================================
  // MT5 EXE IPC handlers
  // ================================
  fetchMT5Trades: async (credentials) => {
    try {
      const result = await ipcRenderer.invoke("fetch-mt5-trades", credentials);
      return result;
    } catch (err) {
      console.error("[Preload] fetchMT5Trades error:", err);
      return { error: err.toString() };
    }
  },

  fetchMT5Summary: async (credentials) => {
    try {
      const result = await ipcRenderer.invoke("fetch-mt5-summary", credentials);
      return result;
    } catch (err) {
      console.error("[Preload] fetchMT5Summary error:", err);
      return { error: err.toString() };
    }
  },
});