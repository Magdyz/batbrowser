const { app, nativeImage, BrowserWindow } = require("electron");
const path = require("path");

let win; // Define the window variable in a higher scope

// Function to create the browser window
function createWindow() {
  const iconPath = path.resolve(__dirname, "images", "icon.png");

  // Create a NativeImage instance from the icon path
  const appIcon = nativeImage.createFromPath(iconPath);

  // Set the application icon in the dock (for macOS)
  if (process.platform === "darwin") {
    app.dock.setIcon(appIcon);
  }

  // Create a new browser window
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Enable Node.js integration in the renderer process
      nodeIntegration: true,
      // Disable context isolation (for simplicity; generally, keep this enabled for security)
      contextIsolation: true,
      // Path to the preload script
      preload: path.join(__dirname, "preload.js"),
      allowRunningInsecureContent: false,
      webviewTag: true, // Enable <webview> tag
      // Enables a sandboxed renderer process, which means the web content will be run with fewer privileges.
      sandbox: true,
      imageAnimationPolicy: "noAnimation",
      autoplayPolicy: "user-gesture-required",
    },
    icon: appIcon, // Use the NativeImage instance
  });

  // Load the index.html file into the window
  win.loadFile("renderer/index.html");

  // Event listener for window close
  win.on("close", (event) => {
    event.preventDefault();
    sessionCleanUp().then(() => {
      win.destroy();
    });
  });

  // open dev tools
  //win.webContents.openDevTools();
}

const sessionCleanUp = async () => {
  if (win) {
    // user agent
    const ses = win.webContents.session;
    console.log(ses.getUserAgent());

    try {
      // Clear cache
      await ses.clearCache();
      console.log("Cache cleared");

      // Clear all storage data
      await ses.clearStorageData();
      console.log("Storage data cleared");
    } catch (error) {
      console.error("Error during session cleanup:", error);
    }
  }
};

// Event handler for when Electron has finished initializing
app.whenReady().then(createWindow);

// Event handler for when all windows are closed
app.on("window-all-closed", () => {
  // Quit the application if not on macOS
  if (process.platform !== "darwin") {
    sessionCleanUp().then(() => {
      app.quit();
    });
  }
});

// Event handler for when the application is activated (macOS specific)
app.on("activate", () => {
  // Create a new window if there are no open windows
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Perform session cleanup when the application is quitting
app.on("before-quit", (event) => {
  event.preventDefault();
  sessionCleanUp().then(() => {
    app.quit();
  });
});
