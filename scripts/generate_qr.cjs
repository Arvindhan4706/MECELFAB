const QRCode = require('qrcode');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT_DIR = 'C:/Users/arvin/.gemini/antigravity-ide/brain/2ec16aec-93df-4529-9028-c2d01001f824';

async function generateQR(url, outputFile, subtitle, innerText) {
  const W = 600, H = 700;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Transparent background by default

  // Company name
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 54px Arial';
  ctx.fillStyle = '#000000'; // Black text
  ctx.fillText('MECELFAB', W / 2, 80);
  
  ctx.font = '16px Arial';
  ctx.fillStyle = '#333333';
  ctx.fillText(subtitle, W / 2, 110);
  ctx.restore();

  // QR code
  const qrSize = 500;
  const qrX = (W - qrSize) / 2;
  const qrY = 140;

  const qrCanvas = createCanvas(qrSize, qrSize);
  await QRCode.toCanvas(qrCanvas, url, {
    width: qrSize,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' }, // QR has white background for contrast
    errorCorrectionLevel: 'H', // High error correction to allow center overlay
  });

  // Draw QR on main canvas
  ctx.drawImage(qrCanvas, qrX, qrY);

  // Overlay text in center of QR
  ctx.save();
  const boxW = 180;
  const boxH = 50;
  const boxX = W / 2 - boxW / 2;
  const boxY = qrY + qrSize / 2 - boxH / 2;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#000000';
  ctx.fillText(innerText, W / 2, qrY + qrSize / 2);
  ctx.restore();

  fs.writeFileSync(outputFile, canvas.toBuffer('image/png'));
  console.log('Generated:', outputFile);
}

(async () => {
  await generateQR(
    'https://www.mecelfabpvtltd.com',
    path.join(OUT_DIR, 'mecelfab_website_qr_v2.png'),
    'www.mecelfabpvtltd.com',
    'WEBSITE'
  );
  await generateQR(
    'https://maps.google.com/?q=NO+35+36,+Jayam+nagar,+Shanmugapuram,+Surapattu,+Chennai+600099',
    path.join(OUT_DIR, 'mecelfab_location_qr_v2.png'),
    'No. 35 & 36, Jayam Nagar, Chennai',
    'LOCATION'
  );
})();
