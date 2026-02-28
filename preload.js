// preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Log when preload script is loaded
console.log("Preload script loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel, data) => {
    const validChannels = ["log", "request-data"];
    if (validChannels.includes(channel)) {
      console.log(`[Preload] Sending channel: ${channel}`, data);
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`[Preload] Attempted to send invalid channel: ${channel}`);
    }
  },

  receive: (channel, func) => {
    const validChannels = ["from-backend", "brain-update"];
    if (validChannels.includes(channel)) {
      console.log(`[Preload] Listening on channel: ${channel}`);
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    } else {
      console.warn(`[Preload] Attempted to listen to invalid channel: ${channel}`);
    }
  },
});