// FTSA_AI_0.v1/preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Expose a secure API to the renderer (React frontend)
contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel, data) => {
    // Only allow certain channels
    const validChannels = ["log", "request-data"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ["from-backend", "brain-update"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});