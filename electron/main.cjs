// Electron main process: one normal whiteboard window + one transparent overlay window.
const { app, BrowserWindow, globalShortcut, screen } = require("electron");
const path = require("path");

const DEV_URL = process.env.VITE_DEV_SERVER_URL;
const isMac = process.platform === "darwin";

let boardWin = null;
let overlayWin = null;
let overlayDrawing = true; // true = overlay catches the mouse; false = clicks pass through

function load(win, mode) {
  if (DEV_URL) {
    win.loadURL(`${DEV_URL}?mode=${mode}`);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"), { query: { mode } });
  }
}

function createBoardWindow() {
  boardWin = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "Excalidraw",
    backgroundColor: "#121212",
    webPreferences: { preload: path.join(__dirname, "preload.cjs") },
  });
  load(boardWin, "board");
  boardWin.on("closed", () => (boardWin = null));
}

// Resize the overlay to exactly cover the display the mouse is currently on.
function fitOverlayToScreen() {
  if (!overlayWin) return;
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());

  if (isMac) {
    // The macOS menu bar always draws on top, so start just below it and
    // stretch to the very bottom of the screen (covering the Dock area).
    const { x, y, width, height } = display.bounds;
    const menuBarHeight = display.workArea.y - y;
    overlayWin.setBounds({ x, y: y + menuBarHeight, width, height: height - menuBarHeight });
  } else {
    // Windows/Linux let a window cover the whole display, taskbar included.
    overlayWin.setBounds(display.bounds);
  }
}

function createOverlayWindow() {
  overlayWin = new BrowserWindow({
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: true, // must be resizable so setBounds can fill the screen
    movable: false,
    // macOS normally keeps windows below the menu bar; this lets the overlay cover it.
    enableLargerThanScreen: true,
    roundedCorners: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    backgroundColor: "#00000000",
    webPreferences: { preload: path.join(__dirname, "preload.cjs") },
  });

  // Stay above other apps, including fullscreen ones on macOS.
  overlayWin.setAlwaysOnTop(true, "screen-saver");
  if (isMac) overlayWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  load(overlayWin, "overlay");
  overlayWin.on("closed", () => (overlayWin = null));
}

function setOverlayDrawing(drawing) {
  if (!overlayWin) return;
  overlayDrawing = drawing;
  // forward: true keeps mouse-move events flowing to the page while clicks pass through.
  overlayWin.setIgnoreMouseEvents(!drawing, { forward: true });
  overlayWin.webContents.send("overlay:mode", drawing ? "draw" : "passthrough");
  if (drawing) overlayWin.focus();
}

function toggleOverlay() {
  if (!overlayWin) createOverlayWindow();
  if (overlayWin.isVisible()) {
    overlayWin.hide();
  } else {
    overlayWin.showInactive();
    fitOverlayToScreen();
    setOverlayDrawing(true);
  }
}

function registerShortcuts() {
  // CommandOrControl = Cmd on Mac, Ctrl on Windows/Linux.
  globalShortcut.register("CommandOrControl+Shift+D", toggleOverlay);

  globalShortcut.register("CommandOrControl+Shift+E", () => {
    if (overlayWin && overlayWin.isVisible()) setOverlayDrawing(!overlayDrawing);
  });

  globalShortcut.register("CommandOrControl+Shift+X", () => {
    if (overlayWin) overlayWin.webContents.send("overlay:clear");
  });
}

app.whenReady().then(() => {
  createBoardWindow();
  createOverlayWindow();
  registerShortcuts();

  // Refit if you change resolution or plug in / unplug a monitor.
  screen.on("display-metrics-changed", () => {
    if (overlayWin && overlayWin.isVisible()) fitOverlayToScreen();
  });

  app.on("activate", () => {
    if (!boardWin) createBoardWindow();
  });
});

app.on("will-quit", () => globalShortcut.unregisterAll());

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});

// Closing the main board quits the app (otherwise the hidden overlay keeps it alive).
app.on("browser-window-created", (_e, win) => {
  win.on("close", () => {
    if (win === boardWin) app.quit();
  });
});
