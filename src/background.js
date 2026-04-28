// CDP Helper - Background Service Worker
// This extension only detects CDP status and displays OS-specific commands.
// It does NOT start CDP automatically (that requires launch flags).

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('CDP Helper installed - detecting remote debugging status...');
  }
});
