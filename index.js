const {
  app,
  nativeImage,
  BrowserWindow,
  ipcMain,
  session,
} = require("electron");
const path = require("path");
const { sessionCleanUp } = require("./utils/sessionUtils");
const { ElectronBlocker } = require("@cliqz/adblocker-electron");
const fetch = require("cross-fetch"); // required 'fetch'

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
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      allowRunningInsecureContent: false,
      webviewTag: true,
      sandbox: true,
      imageAnimationPolicy: "noAnimation",
      autoplayPolicy: "user-gesture-required",
      additionalArguments: ["--disable-webrtc"],
      disableHardwareAcceleration: true,
    },
    icon: appIcon, // Use the NativeImage instance
  });

  // Load the index.html file into the window
  win.loadFile("renderer/index.html");
  const ses = win.webContents.session;

  // Set permission request handler
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ["notifications"];
    callback(allowedPermissions.includes(permission));
  });

  // Event listener for window close
  win.on("close", (event) => {
    event.preventDefault();
    sessionCleanUp(ses).then(() => {
      win.destroy();
    });
  });

  // Deny all HID permission requests
  ses.setPermissionCheckHandler((webContents, permission) => {
    return permission !== "hid" && permission !== "serial";
  });

  ses.on("select-hid-device", (event, details, callback) => {
    event.preventDefault();
    callback(null); // Prevent HID device selection
  });

  ses.on("select-serial-port", (event, portList, callback) => {
    event.preventDefault();
    callback(""); // Prevent serial port selection
  });

  // Disable Web Storage
  ses.setPermissionCheckHandler((webContents, permission) => {
    return permission !== "storage";
  });

  // Disable Preconnect and Preload
  ses.setPermissionCheckHandler((webContents, permission) => {
    return permission !== "preconnect";
  });

  // Prevent opening new windows/tabs
  win.webContents.setWindowOpenHandler(({ url }) => {
    return { action: "deny" }; // Prevent opening new windows/tabs
  });

  // Open dev tools if needed
  win.webContents.on("devtools-opened", () => {
    win.webContents.closeDevTools();
  });
  //win.webContents.openDevTools();
}

// Initialize the ad blocker before creating the window
async function initializeAdBlocker() {
  const blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);

  // Add custom YouTube ad blocking rules
  blocker.update({
    filters: [
      "||youtube.com/get_video_info?*adformat=", // Block specific YouTube ad requests
      "||youtube.com/api/stats/ads?", // Block YouTube ad stats
      "||youtube.com/pagead/", // Block YouTube page ads
    ],
  });

  blocker.enableBlockingInSession(session.defaultSession);
}

// Event handler for when Electron has finished initializing
app.whenReady().then(async () => {
  await initializeAdBlocker();
  createWindow();
});

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
  sessionCleanUp(win.webContents.session).then(() => {
    app.quit();
  });
});

// Listen for the session cleanup request from the renderer process
ipcMain.handle("perform-session-cleanup", async () => {
  if (win) {
    const ses = win.webContents.session;
    await sessionCleanUp(ses);
  }
});
