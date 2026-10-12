// Safe bridge between the Electron main process and the React page.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("screenBoard", {
  onOverlayMode: (cb) => ipcRenderer.on("overlay:mode", (_e, mode) => cb(mode)),
  onOverlayClear: (cb) => ipcRenderer.on("overlay:clear", () => cb()),
});
