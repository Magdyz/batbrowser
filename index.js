const { app, BrowserWindow } = require("electron");
const path = require("path");

// Function to create the browser window
function createWindow() {
  // Create a new browser window
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Enable Node.js integration in the renderer process
      nodeIntegration: true,
      // Disable context isolation (for simplicity; generally, keep this enabled for security)
      contextIsolation: false,
      // Path to the preload script
      preload: path.join(__dirname, "preload.js"),
      allowRunningInsecureContent: false,
      webviewTag: true, // Enable <webview> tag
    },
  });

  // Load the index.html file into the window
  win.loadFile("renderer/index.html");
  // open dev tools
  // win.webContents.openDevTools();
}

// Event handler for when Electron has finished initializing
app.whenReady().then(createWindow);

// Event handler for when all windows are closed
app.on("window-all-closed", () => {
  // Quit the application if not on macOS
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Event handler for when the application is activated (macOS specific)
app.on("activate", () => {
  // Create a new window if there are no open windows
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
