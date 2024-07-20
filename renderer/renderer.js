// Select the input field and button
const addressBar = document.getElementById("address-bar");
const goButton = document.getElementById("go-button");
const clearButton = document.getElementById("clear-button");

// Function to handle navigation securely
const navigateToUrl = () => {
  let url = addressBar.value.trim(); // Trim whitespace from the entered URL

  // Check if the URL is empty
  if (url === "") {
    console.log("URL is empty");
    return;
  }

  // Comprehensive regular expression for URL validation
  const urlPattern =
    /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,6}(:[0-9]{1,5})?(\/\S*)?$/i;

  // Check if the entered value is a valid URL
  if (urlPattern.test(url)) {
    // Create a temporary anchor element to test if the URL is valid
    const tempAnchor = document.createElement("a");
    tempAnchor.href = url.startsWith("http") ? url : `https://${url}`;

    // If the URL is valid, it should have a hostname and protocol
    if (tempAnchor.hostname && tempAnchor.protocol.startsWith("http")) {
      url = tempAnchor.href; // Use the full URL
    } else {
      // If the URL is not valid, treat it as a search query
      url = "https://duckduckgo.com/?q=" + encodeURIComponent(url);
    }
  } else {
    // If the entered value does not match the URL pattern, treat it as a search query
    url = "https://duckduckgo.com/?q=" + encodeURIComponent(url);
  }

  // Set the URL to the webview element
  const webview = document.getElementById("webview");
  if (webview) {
    // Remove previous error listener to prevent multiple bindings
    webview.removeEventListener("did-fail-load", handleLoadError);

    // Set an event listener for loading errors
    webview.addEventListener("did-fail-load", handleLoadError);

    // Navigate to the URL
    webview.src = url;
    console.log("Navigating to:", url);
  } else {
    console.error("Webview element not found");
  }
};

// Function to handle load errors in the webview
const handleLoadError = (event) => {
  if (event.errorCode === -105 || event.errorCode === -106) {
    // Name not resolved or not found
    const searchUrl =
      "https://duckduckgo.com/?q=" +
      encodeURIComponent(addressBar.value.trim());
    try {
      webview.src = searchUrl;
      console.log("Navigating to search:", searchUrl);
    } catch (error) {
      console.error("Failed to navigate to search:", error);
    }
  }
};

// Event listener for Enter key press
addressBar.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    navigateToUrl();
  }
});

// Event listener for Go button click
goButton.addEventListener("click", () => {
  navigateToUrl();
});

// Event listener for Clear button click
clearButton.addEventListener("click", () => {
  window.electron.performSessionCleanup().then(() => {
    console.log("History Cleared");
  });
});
