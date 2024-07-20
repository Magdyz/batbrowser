const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  performSessionCleanup: () => ipcRenderer.invoke("perform-session-cleanup"),
});
