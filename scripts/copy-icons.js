const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\mahip_or2vm0z\\.gemini\\antigravity-ide\\brain\\c8afa537-496b-4e7a-9129-8a9c45ff71fb\\sbs_app_icon_1788405815022.jpg';
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const targets = [
  'icon-192x192.png',
  'icon-512x512.png',
  'apple-touch-icon.png',
  'icon.png'
];

targets.forEach(t => {
  fs.copyFileSync(src, path.join(publicDir, t));
  console.log(`Copied icon to ${t}`);
});
