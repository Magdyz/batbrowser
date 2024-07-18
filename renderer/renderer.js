// Select the input field and button
const addressBar = document.getElementById("address-bar");
const goButton = document.getElementById("go-button");

// Function to handle navigation securely
const navigateToUrl = () => {
  let url = addressBar.value.trim(); // Trim whitespace from the entered URL

  // Check if the URL is empty
  if (url === "") {
    console.log("URL is empty");
    return;
  }

  // Check if the URL starts with "http://" or "https://"
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    // If not, prepend "https://" to the URL
    url = "https://" + url;
  }

  // Validate the URL format using a regular expression (optional step)
  const urlPattern = /^(https?):\/\/([^\s$.?#].[^\s]*)$/;
  if (!urlPattern.test(url)) {
    console.error("Invalid URL format:", url);
    return;
  }

  // Set the URL to the webview element
  const webview = document.getElementById("webview");
  if (webview) {
    webview.src = url;
    console.log("Navigating to:", url);
  } else {
    console.error("Webview element not found");
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
