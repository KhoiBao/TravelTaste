// Chọn trình duyệt có sẵn trên máy: Chrome nếu có, không thì Edge, không thì chromium của Playwright.
const fs = require('node:fs');
const {chromium} = require('playwright');

const CANDIDATES = [
  ['chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'],
  ['chrome', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'],
  ['msedge', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'],
  ['msedge', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'],
];

function pickChannel() {
  for (const [channel, executable] of CANDIDATES) {
    if (fs.existsSync(executable)) return channel;
  }
  return undefined;
}

async function launchBrowser(options = {}) {
  return chromium.launch({channel: pickChannel(), headless: true, ...options});
}

module.exports = {chromium, launchBrowser, pickChannel};
