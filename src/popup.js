// CDP Helper - Popup Script

// All browser commands by OS
const COMMANDS = {
  chrome: {
    mac: '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222',
    win: '"C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe" --remote-debugging-port=9222',
    linux: 'google-chrome --remote-debugging-port=9222'
  },
  edge: {
    mac: '/Applications/Microsoft\\ Edge.app/Contents/MacOS/Microsoft\\ Edge --remote-debugging-port=9222',
    win: '"C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe" --remote-debugging-port=9222',
    linux: 'microsoft-edge --remote-debugging-port=9222'
  },
  chromium: {
    mac: '/Applications/Chromium.app/Contents/MacOS/Chromium --remote-debugging-port=9222',
    win: '"C:\\\\Program Files\\\\Chromium\\\\Application\\\\chrome.exe" --remote-debugging-port=9222',
    linux: 'chromium --remote-debugging-port=9222'
  },
  brave: {
    mac: '/Applications/Brave\\ Browser.app/Contents/MacOS/Brave\\ Browser --remote-debugging-port=9222',
    win: '"C:\\\\Program Files\\\\BraveSoftware\\\\Brave-Browser\\\\Application\\\\brave.exe" --remote-debugging-port=9222',
    linux: 'brave-browser --remote-debugging-port=9222'
  }
};

// Detect OS
function detectOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'win';
  if (ua.includes('Mac')) return 'mac';
  if (ua.includes('Linux')) return 'linux';
  return 'mac'; // default
}

// Detect current browser name
function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'edge';
  if (ua.includes('Brave/')) return 'brave';
  if (ua.includes('Chromium/')) return 'chromium';
  if (ua.includes('Chrome/')) return 'chrome';
  return 'chrome';
}

let currentOS = detectOS();
let currentBrowser = 'chrome';

// DOM
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const statusDetail = document.getElementById('status-detail');
const browserName = document.getElementById('browser-name');
const cmdText = document.getElementById('cmd-text');
const btnCopy = document.getElementById('btn-copy');
const btnRecheck = document.getElementById('btn-recheck');
const browserSelect = document.getElementById('browser-select');
const tabs = document.querySelectorAll('.tab');

// Render command for current OS + browser
function renderCommand() {
  const cmd = COMMANDS[currentBrowser]?.[currentOS] || COMMANDS.chrome[currentOS];
  cmdText.textContent = cmd;
}

// Switch OS tab
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentOS = tab.dataset.os;
    renderCommand();
  });
});

// Switch browser
browserSelect.addEventListener('change', (e) => {
  currentBrowser = e.target.value;
  renderCommand();
});

// Set active tab to match detected OS
function setActiveTab() {
  tabs.forEach(t => {
    t.classList.toggle('active', t.dataset.os === currentOS);
  });
}

// Check CDP status
async function checkStatus() {
  statusDot.className = 'status-dot';
  statusText.textContent = 'Checking...';
  statusDetail.textContent = '';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const resp = await fetch('http://localhost:9222/json/version', {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();
      statusDot.classList.add('online');
      statusText.textContent = 'CDP Active';
      statusDetail.textContent = `Browser: ${data.Browser || 'Unknown'} | URL: ${data.webSocketDebuggerUrl || ''}`;
      browserName.textContent = 'Remote debugging is ON for port 9222';
    } else {
      throw new Error('Not OK');
    }
  } catch (e) {
    statusDot.classList.add('offline');
    statusText.textContent = 'CDP Not Active';
    statusDetail.textContent = 'Start your browser with --remote-debugging-port=9222';
    browserName.textContent = 'Remote debugging is OFF';
  }
}

// Copy command
btnCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(cmdText.textContent);
    const orig = btnCopy.textContent;
    btnCopy.textContent = 'Copied!';
    btnCopy.classList.add('copied');
    setTimeout(() => {
      btnCopy.textContent = orig;
      btnCopy.classList.remove('copied');
    }, 1500);
  } catch (e) {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = cmdText.textContent;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btnCopy.textContent = 'Copied!';
  }
});

btnRecheck.addEventListener('click', checkStatus);

// Init
setActiveTab();
renderCommand();
checkStatus();
setInterval(checkStatus, 5000);

// Also detect actual browser and pre-select
const detected = detectBrowser();
browserSelect.value = detected;
currentBrowser = detected;
renderCommand();
