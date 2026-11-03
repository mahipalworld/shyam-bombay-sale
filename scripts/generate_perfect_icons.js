const path = require('path');
const fs = require('fs');
const sharp = require(path.join(__dirname, '../node_modules/sharp'));

async function generatePerfectIcons() {
  const root = path.join(__dirname, '..');
  const publicDir = path.join(root, 'public');
  const svgSourcePath = path.join(root, 'SBS_Final_Logo_Assets/SBS_Premium_Door_Icon.svg');

  console.log('Loading master SVG path from:', svgSourcePath);
  const svgContent = fs.readFileSync(svgSourcePath, 'utf8');
  const pathMatch = svgContent.match(/<path[^>]+d="([^"]+)"/);
  if (!pathMatch) {
    throw new Error('Could not find path d attribute in master SVG');
  }
  const pathD = pathMatch[1];

  // Mathematical & Optical centering parameters:
  // Original path bounds:
  // X: [9, 1051] => width = 1042, center = 530
  // Y: [9, 1152] => height = 1143, center = 580.5
  // Android Adaptive Icon Canvas: 512x512
  // Safe zone diameter = 66% (338px diameter, 169px radius from center 256, 256)
  // Scale s = 0.208:
  // Rendered width = 1042 * 0.208 = 216.7px (42.3% of canvas)
  // Rendered height = 1143 * 0.208 = 237.7px (46.4% of canvas)
  // Max radius from center = 160.8px (Safe limit = 169px, giving +8.2px safe margin)
  // Optical centroid adjustment: +1.5px X, -1.0px Y
  const s = 0.208;
  const tx = +(256 - 530 * s + 1.5).toFixed(2);
  const ty = +(256 - 580.5 * s - 1.0).toFixed(2);

  console.log(`Calculated transform: scale=${s}, translate=(${tx}, ${ty})`);

  // Master 512x512 Vector SVG with Brand Orange Background (#FF6600) and Crisp White Logo (#FFFFFF)
  const masterSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <title>SBS Store Icon</title>
  <rect width="512" height="512" fill="#FF6600" />
  <g transform="translate(${tx}, ${ty}) scale(${s})">
    <path fill="#FFFFFF" fill-rule="evenodd" d="${pathD}" />
  </g>
</svg>`;

  // 1. Write the vector icon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), masterSvg, 'utf8');
  console.log('✓ Generated public/icon.svg');

  // 2. Render master 512x512 buffer with high quality
  const master512Buffer = await sharp(Buffer.from(masterSvg), { density: 300 })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Helper to save resized PNG
  async function savePng(buffer, width, height, filename) {
    const outPath = path.join(publicDir, filename);
    await sharp(buffer)
      .resize(width, height, {
        fit: 'contain',
        kernel: sharp.kernel.lanczos3
      })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ Generated public/${filename} (${width}x${height})`);
  }

  // Generate All Resolution Variants
  await savePng(master512Buffer, 512, 512, 'icon-512x512-maskable.png');
  await savePng(master512Buffer, 512, 512, 'icon-512x512.png');
  await savePng(master512Buffer, 512, 512, 'icon.png');
  await savePng(master512Buffer, 192, 192, 'icon-192x192-maskable.png');
  await savePng(master512Buffer, 192, 192, 'icon-192x192.png');
  await savePng(master512Buffer, 180, 180, 'apple-touch-icon.png');
  await savePng(master512Buffer, 48, 48, 'favicon-48x48.png');
  await savePng(master512Buffer, 32, 32, 'favicon-32x32.png');
  await savePng(master512Buffer, 32, 32, 'favicon.png');
  await savePng(master512Buffer, 16, 16, 'favicon-16x16.png');

  console.log('Generating multi-resolution favicon.ico with python...');
  const { execSync } = require('child_process');
  execSync(`python -c "
from PIL import Image
im = Image.open('public/icon-512x512.png')
im.save('public/favicon.ico', format='ICO', sizes=[(16,16), (32,32), (48,48)])
"`);
  console.log('✓ Generated public/favicon.ico');

  console.log('All icons generated successfully!');
}

generatePerfectIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
