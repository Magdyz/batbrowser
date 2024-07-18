document.getElementById("go-button").addEventListener("click", () => {
  console.log("Go button clicked"); // Add this line
  const url = document.getElementById("address-bar").value;
  console.log("URL entered:", url);

  const webview = document.getElementById("webview");
  if (webview) {
    webview.src = "https://"+url;
    console.log("Webview source set to:", webview.src);
  } else {
    console.error("Webview element not found");
  }
});
