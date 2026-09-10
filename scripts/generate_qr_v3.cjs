const QRCode = require('qrcode');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT_DIR = 'C:/Users/arvin/.gemini/antigravity-ide/brain/2ec16aec-93df-4529-9028-c2d01001f824';

function drawRoundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function generateCreativeQR(url, outputFile, title, subtitle, centerText) {
  // Generate raw QR code matrix
  const qrData = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const modules = qrData.modules.data;
  const size = qrData.modules.size;
  
  const cellSize = 14; 
  const qrSize = size * cellSize;
  
  const W = 600;
  const H = 760;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  
  // Background: Transparent

  // --- Title Area ---
  ctx.save();
  ctx.textAlign = 'center';
  
  // Company Name
  ctx.font = 'bold 58px "Arial"';
  const textGrad = ctx.createLinearGradient(0, 40, 0, 90);
  textGrad.addColorStop(0, '#111827');
  textGrad.addColorStop(1, '#374151');
  ctx.fillStyle = textGrad;
  ctx.fillText('MECELFAB', W / 2, 80);

  // Subtitle
  ctx.font = '600 16px "Arial"';
  ctx.fillStyle = '#6B7280';
  ctx.fillText(subtitle, W / 2, 115);
  
  // Decorative line
  const lineGrad = ctx.createLinearGradient(W/2 - 100, 0, W/2 + 100, 0);
  lineGrad.addColorStop(0, 'transparent');
  lineGrad.addColorStop(0.5, '#D1D5DB');
  lineGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(W/2 - 100, 135, 200, 2);
  ctx.restore();

  // --- QR Code ---
  const offsetX = (W - qrSize) / 2;
  const offsetY = 180;

  // Calculate center hole for the badge
  const cutSize = 10;
  const cutStart = Math.floor((size - cutSize) / 2);
  const cutEnd = cutStart + cutSize;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  
  // QR Gradient
  const qrGrad = ctx.createLinearGradient(0, 0, qrSize, qrSize);
  qrGrad.addColorStop(0, '#0F172A'); 
  qrGrad.addColorStop(0.5, '#1D4ED8'); // Deep vibrant blue
  qrGrad.addColorStop(1, '#0F172A'); 

  ctx.fillStyle = qrGrad;

  // Draw Data Dots as circles
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (row >= cutStart && row < cutEnd && col >= cutStart && col < cutEnd) continue;

      const isDark = modules[row * size + col];
      if (isDark) {
        const isFinder = (row < 7 && col < 7) || (row < 7 && col >= size - 7) || (row >= size - 7 && col < 7);
        if (!isFinder) {
          ctx.beginPath();
          ctx.arc(col * cellSize + cellSize/2, row * cellSize + cellSize/2, cellSize/2 * 0.85, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }
  }

  // Draw Smooth Rounded Finder Patterns
  const drawFinder = (r, c) => {
    const x = c * cellSize;
    const y = r * cellSize;
    const s = 7 * cellSize;
    
    // Outer ring
    ctx.lineWidth = cellSize;
    ctx.strokeStyle = qrGrad;
    ctx.lineJoin = 'round';
    drawRoundRect(ctx, x + cellSize/2, y + cellSize/2, s - cellSize, s - cellSize, cellSize);
    ctx.stroke();
    
    // Inner box
    drawRoundRect(ctx, x + 2*cellSize, y + 2*cellSize, 3*cellSize, 3*cellSize, cellSize * 0.8);
    ctx.fill();
  };

  drawFinder(0, 0); 
  drawFinder(0, size - 7); 
  drawFinder(size - 7, 0); 
  ctx.restore();

  // --- Center Badge ---
  ctx.save();
  const badgeW = cutSize * cellSize * 1.4;
  const badgeH = 46;
  const badgeX = offsetX + (qrSize - badgeW)/2;
  const badgeY = offsetY + (qrSize - badgeH)/2;

  // Shadow for badge
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = '#FFFFFF';
  drawRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 23);
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Badge Border
  ctx.strokeStyle = '#1D4ED8';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Badge Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 18px "Arial"';
  ctx.fillStyle = '#1D4ED8';
  ctx.fillText(centerText, badgeX + badgeW/2, badgeY + badgeH/2);
  ctx.restore();

  fs.writeFileSync(outputFile, canvas.toBuffer('image/png'));
  console.log('Generated:', outputFile);
}

(async () => {
  await generateCreativeQR(
    'https://www.mecelfabpvtltd.com',
    path.join(OUT_DIR, 'mecelfab_website_qr_v3.png'),
    'INDUSTRIAL SOLUTIONS PVT. LTD.',
    'www.mecelfabpvtltd.com',
    'WEBSITE'
  );
  await generateCreativeQR(
    'https://maps.google.com/?q=NO+35+36,+Jayam+nagar,+Shanmugapuram,+Surapattu,+Chennai+600099',
    path.join(OUT_DIR, 'mecelfab_location_qr_v3.png'),
    'INDUSTRIAL SOLUTIONS PVT. LTD.',
    'No. 35 & 36, Jayam Nagar, Chennai',
    'LOCATION'
  );
})();
