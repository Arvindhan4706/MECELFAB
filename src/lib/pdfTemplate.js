import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

const LAYOUT = {
  pageWidth: 210,
  pageHeight: 297,
  marginTop: 60,
  marginBottom: 42,
  marginLeft: 16,
  marginRight: 16,
  fontSize: { title: 16, subtitle: 10, body: 9, small: 8, tiny: 7 },
  fontName: 'helvetica',
  colors: {
    dark: [16, 37, 63],
    accent: [232, 119, 36],
    text: [30, 30, 30],
    muted: [120, 120, 120],
    light: [245, 245, 245],
    white: [255, 255, 255],
    black: [0, 0, 0],
  },
};

const CONTENT_WIDTH = LAYOUT.pageWidth - LAYOUT.marginLeft - LAYOUT.marginRight;
const CONTENT_HEIGHT = LAYOUT.pageHeight - LAYOUT.marginTop - LAYOUT.marginBottom;

let bgBase64 = null;
function getBgBase64() {
  if (bgBase64) return bgBase64;
  try {
    const imgPath = path.join(process.cwd(), 'public', 'images', 'ESTIMATION.jpeg');
    const buf = fs.readFileSync(imgPath);
    bgBase64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch {
    bgBase64 = null;
  }
  return bgBase64;
}

function createDoc() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFont(LAYOUT.fontName);
  const bg = getBgBase64();
  if (bg) doc.addImage(bg, 'JPEG', 0, 0, LAYOUT.pageWidth, LAYOUT.pageHeight);
  return doc;
}

function newPage(doc) {
  doc.addPage();
  const bg = getBgBase64();
  if (bg) doc.addImage(bg, 'JPEG', 0, 0, LAYOUT.pageWidth, LAYOUT.pageHeight);
  doc.setFont(LAYOUT.fontName);
  return LAYOUT.marginTop;
}

function addPageNumber(doc, num, total) {
  doc.setFontSize(LAYOUT.fontSize.tiny);
  doc.setFont(LAYOUT.fontName, 'normal');
  doc.setTextColor(...LAYOUT.colors.muted);
  doc.text(`Page ${num} of ${total}`, LAYOUT.pageWidth - LAYOUT.marginRight, LAYOUT.pageHeight - 10, { align: 'right' });
}

function addSectionTitle(doc, title, y) {
  if (y + 14 > LAYOUT.pageHeight - LAYOUT.marginBottom) y = newPage(doc);
  doc.setFontSize(LAYOUT.fontSize.subtitle);
  doc.setFont(LAYOUT.fontName, 'bold');
  doc.setTextColor(...LAYOUT.colors.dark);
  doc.text(title, LAYOUT.marginLeft, y);
  doc.setDrawColor(...LAYOUT.colors.accent);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.marginLeft, y + 1.5, LAYOUT.marginLeft + doc.getTextWidth(title) + 4, y + 1.5);
  return y + 8;
}

function addKeyValue(doc, label, value, x, y, labelW = 28) {
  doc.setFontSize(LAYOUT.fontSize.small);
  doc.setFont(LAYOUT.fontName, 'bold');
  doc.setTextColor(...LAYOUT.colors.muted);
  doc.text(label, x, y);
  doc.setFont(LAYOUT.fontName, 'normal');
  doc.setTextColor(...LAYOUT.colors.text);
  const valStr = String(value || '—');
  const maxW = CONTENT_WIDTH - labelW;
  const lines = doc.splitTextToSize(valStr, maxW);
  doc.text(lines.slice(0, 3), x + labelW, y);
  return y + (lines.slice(0, 3).length * 4) + 1;
}

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 4) {
  if (!text) return y;
  doc.setFontSize(LAYOUT.fontSize.small);
  doc.setFont(LAYOUT.fontName, 'normal');
  doc.setTextColor(...LAYOUT.colors.text);
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    if (y > LAYOUT.pageHeight - LAYOUT.marginBottom - 5) {
      y = newPage(doc);
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function addTable(doc, headers, rows, startY, colStyles = {}) {
  let y = startY;
  const footerY = LAYOUT.pageHeight - LAYOUT.marginBottom;
  const maxRowsFirstPage = Math.max(2, Math.floor((footerY - y - 18) / 6));

  const head = [headers];
  let firstPageRows;
  let remainingRows = [];

  if (rows.length <= maxRowsFirstPage) {
    firstPageRows = rows;
  } else {
    firstPageRows = rows.slice(0, maxRowsFirstPage);
    remainingRows = rows.slice(maxRowsFirstPage);
  }

  autoTable(doc, {
    startY: y,
    head,
    body: firstPageRows,
    theme: 'plain',
    styles: {
      font: LAYOUT.fontName,
      fontSize: LAYOUT.fontSize.small,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      textColor: LAYOUT.colors.text,
      lineWidth: 0,
    },
    headStyles: {
      fillColor: LAYOUT.colors.dark,
      textColor: LAYOUT.colors.white,
      fontStyle: 'bold',
      fontSize: LAYOUT.fontSize.small,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: colStyles,
    margin: { left: LAYOUT.marginLeft, right: LAYOUT.marginRight },
  });

  y = doc.lastAutoTable.finalY + 3;

  while (remainingRows.length > 0) {
    y = newPage(doc);

    const pageMaxRows = Math.floor((footerY - y - 18) / 6);
    const pageRows = remainingRows.slice(0, pageMaxRows);
    remainingRows = remainingRows.slice(pageMaxRows);

    autoTable(doc, {
      startY: y,
      head,
      body: pageRows,
      theme: 'plain',
      styles: {
        font: LAYOUT.fontName,
        fontSize: LAYOUT.fontSize.small,
        cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
        textColor: LAYOUT.colors.text,
        lineWidth: 0,
      },
      headStyles: {
        fillColor: LAYOUT.colors.dark,
        textColor: LAYOUT.colors.white,
        fontStyle: 'bold',
        fontSize: LAYOUT.fontSize.small,
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: colStyles,
      margin: { left: LAYOUT.marginLeft, right: LAYOUT.marginRight },
    });

    y = doc.lastAutoTable.finalY + 3;
  }

  return y;
}

function addTotals(doc, items, startY) {
  const footerY = LAYOUT.pageHeight - LAYOUT.marginBottom;
  if (startY + 55 > footerY) startY = newPage(doc);

  const blockX = LAYOUT.marginLeft + CONTENT_WIDTH * 0.55;
  const blockW = CONTENT_WIDTH * 0.45;
  let y = startY;

  doc.setDrawColor(...LAYOUT.colors.dark);
  doc.setLineWidth(0.3);
  doc.line(blockX, y, blockX + blockW, y);
  y += 6;

  for (const item of items) {
    doc.setFontSize(LAYOUT.fontSize.small);
    doc.setFont(LAYOUT.fontName, item.bold ? 'bold' : 'normal');
    doc.setTextColor(...(item.color || LAYOUT.colors.text));
    doc.text(item.label, blockX + 2, y);
    doc.text(item.value, blockX + blockW - 2, y, { align: 'right' });
    if (item.bold) {
      y += 2;
      doc.setDrawColor(...LAYOUT.colors.dark);
      doc.setLineWidth(0.4);
      doc.line(blockX, y, blockX + blockW, y);
    }
    y += 5.5;
  }

  return y;
}

function addTerms(doc, text, startY) {
  if (!text) return startY;
  let y = addSectionTitle(doc, 'Terms & Conditions', startY);
  doc.setFontSize(LAYOUT.fontSize.tiny);
  doc.setFont(LAYOUT.fontName, 'normal');
  doc.setTextColor(...LAYOUT.colors.muted);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  for (const line of lines) {
    if (y > LAYOUT.pageHeight - LAYOUT.marginBottom - 10) {
      y = newPage(doc);
    }
    doc.text(line, LAYOUT.marginLeft, y);
    y += 3.5;
  }
  return y + 4;
}

function addSignatures(doc, authorizerName, startY) {
  const footerY = LAYOUT.pageHeight - LAYOUT.marginBottom;
  if (startY + 30 > footerY) startY = newPage(doc);

  let y = startY + 6;
  const left = LAYOUT.marginLeft + 10;
  const right = LAYOUT.marginLeft + CONTENT_WIDTH / 2 + 15;
  const lineW = 50;

  doc.setDrawColor(...LAYOUT.colors.muted);
  doc.setLineWidth(0.3);

  doc.line(left, y, left + lineW, y);
  doc.setFontSize(LAYOUT.fontSize.small);
  doc.setFont(LAYOUT.fontName, 'bold');
  doc.setTextColor(...LAYOUT.colors.text);
  doc.text('Accepted by Client', left + lineW / 2, y + 5, { align: 'center' });
  doc.setFont(LAYOUT.fontName, 'normal');
  doc.setFontSize(LAYOUT.fontSize.tiny);
  doc.setTextColor(...LAYOUT.colors.muted);
  doc.text('Signature & Date', left + lineW / 2, y + 9, { align: 'center' });

  doc.line(right, y, right + lineW, y);
  doc.setFontSize(LAYOUT.fontSize.small);
  doc.setFont(LAYOUT.fontName, 'bold');
  doc.setTextColor(...LAYOUT.colors.text);
  doc.text('For MECELFAB', right + lineW / 2, y + 5, { align: 'center' });
  if (authorizerName) {
    doc.setFont(LAYOUT.fontName, 'normal');
    doc.setFontSize(LAYOUT.fontSize.tiny);
    doc.setTextColor(...LAYOUT.colors.muted);
    doc.text(authorizerName, right + lineW / 2, y + 9, { align: 'center' });
  }
  doc.setFontSize(LAYOUT.fontSize.tiny);
  doc.text('Authorized Signatory', right + lineW / 2, y + 13, { align: 'center' });

  return y + 20;
}

function wrapText(text, maxChars) {
  if (!text) return '';
  if (text.length <= maxChars) return text;
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for (const word of words) {
    if ((line + ' ' + word).trim().length > maxChars) {
      lines.push(line.trim());
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.join('\n');
}

function formatCurrency(amount) {
  return '₹ ' + Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function numberToWords(num) {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  let result = convert(intPart);
  if (decPart > 0) result += ' and ' + convert(decPart) + ' Paise';
  return result + ' Only';
}

export function generateQuotationPDF(quotation, _company = {}) {
  const doc = createDoc();
  let y = LAYOUT.marginTop;

  doc.setFontSize(LAYOUT.fontSize.title);
  doc.setFont(LAYOUT.fontName, 'bold');
  doc.setTextColor(...LAYOUT.colors.dark);
  doc.text('QUOTATION', LAYOUT.marginLeft, y + 2);

  doc.setFontSize(LAYOUT.fontSize.small);
  doc.setFont(LAYOUT.fontName, 'normal');
  doc.setTextColor(...LAYOUT.colors.muted);
  doc.text(`${quotation.quotationNumber}  V${quotation.version || 1}`, LAYOUT.pageWidth - LAYOUT.marginRight, y + 2, { align: 'right' });

  doc.setDrawColor(...LAYOUT.colors.dark);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.marginLeft, y + 5, LAYOUT.pageWidth - LAYOUT.marginRight, y + 5);
  y += 11;

  const rightCol = LAYOUT.marginLeft + CONTENT_WIDTH * 0.62;
  const leftEnd = addKeyValue(doc, 'Quote No:', `${quotation.quotationNumber} V${quotation.version || 1}`, LAYOUT.marginLeft, y, 22);
  addKeyValue(doc, 'Date:', new Date(quotation.createdAt).toLocaleDateString('en-IN'), rightCol, y, 18);
  y += 5;
  addKeyValue(doc, 'Valid Until:', new Date(new Date(quotation.createdAt).getTime() + (quotation.validityDays || 30) * 86400000).toLocaleDateString('en-IN'), rightCol, y, 18);
  y = Math.max(leftEnd, y + 6);

  y = addSectionTitle(doc, 'Customer Details', y);
  const custRight = LAYOUT.marginLeft + CONTENT_WIDTH * 0.52;
  let yLeft = y;
  let yRight = y;
  yLeft = addKeyValue(doc, 'Name:', wrapText(quotation.customerName, 45), LAYOUT.marginLeft, yLeft, 18);
  yRight = addKeyValue(doc, 'Company:', wrapText(quotation.companyName || '—', 40), custRight, yRight, 22);
  yLeft = addKeyValue(doc, 'Email:', wrapText(quotation.email || '—', 40), LAYOUT.marginLeft, yLeft + 0.5, 18);
  yRight = addKeyValue(doc, 'Phone:', quotation.phone || '—', custRight, yRight + 0.5, 22);
  yLeft = addKeyValue(doc, 'Address:', wrapText(quotation.address || '—', 38), LAYOUT.marginLeft, yLeft + 0.5, 18);
  y = Math.max(yLeft, yRight) + 4;

  y = addSectionTitle(doc, 'Scope of Work', y);
  y = addWrappedText(doc, quotation.scopeOfWork || '—', LAYOUT.marginLeft, y, CONTENT_WIDTH);
  y += 5;

  y = addSectionTitle(doc, 'Line Items', y);
  const items = (quotation.items || []).map((item, idx) => [
    String(idx + 1),
    wrapText(item.description, 50),
    String(item.quantity),
    formatCurrency(item.unitPrice),
    formatCurrency(item.totalPrice),
  ]);

  y = addTable(doc, ['#', 'Description', 'Qty', 'Unit Price', 'Total'], items, y, {
    0: { cellWidth: 10, halign: 'center' },
    1: { cellWidth: 'auto' },
    2: { cellWidth: 16, halign: 'center' },
    3: { cellWidth: 30, halign: 'right' },
    4: { cellWidth: 30, halign: 'right' },
  });
  y += 3;

  const taxAmt = quotation.taxAmount || 0;
  const totalItems = [
    { label: 'Subtotal', value: formatCurrency(quotation.subtotal) },
  ];
  if (quotation.discount > 0) {
    totalItems.push({ label: 'Discount', value: `- ${formatCurrency(quotation.discount)}` });
  }
  totalItems.push({ label: `Tax (${quotation.taxRate || 0}%)`, value: formatCurrency(taxAmt) });
  totalItems.push({ label: 'Grand Total', value: formatCurrency(quotation.grandTotal), bold: true, color: LAYOUT.colors.dark });
  y = addTotals(doc, totalItems, y);

  if (quotation.grandTotal > 0) {
    doc.setFontSize(LAYOUT.fontSize.tiny);
    doc.setFont(LAYOUT.fontName, 'italic');
    doc.setTextColor(...LAYOUT.colors.muted);
    const amountWords = `Amount in Words: ${numberToWords(Math.round(quotation.grandTotal))}`;
    const wordLines = doc.splitTextToSize(amountWords, CONTENT_WIDTH);
    for (const line of wordLines) {
      if (y > LAYOUT.pageHeight - LAYOUT.marginBottom - 5) y = newPage(doc);
      doc.text(line, LAYOUT.marginLeft, y);
      y += 3.5;
    }
    y += 3;
  }

  y = addTerms(doc, quotation.termsConditions, y);
  addSignatures(doc, quotation.user?.name, y);

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageNumber(doc, i, totalPages);
  }

  return Buffer.from(doc.output('arraybuffer'));
}

export function generateEstimationPDF(data, _company = {}) {
  const doc = createDoc();
  let y = LAYOUT.marginTop;

  doc.setFontSize(LAYOUT.fontSize.title);
  doc.setFont(LAYOUT.fontName, 'bold');
  doc.setTextColor(...LAYOUT.colors.dark);
  doc.text('ESTIMATION', LAYOUT.marginLeft, y + 2);

  doc.setFontSize(LAYOUT.fontSize.small);
  doc.setFont(LAYOUT.fontName, 'normal');
  doc.setTextColor(...LAYOUT.colors.muted);
  doc.text(data.estimationNumber || '', LAYOUT.pageWidth - LAYOUT.marginRight, y + 2, { align: 'right' });

  doc.setDrawColor(...LAYOUT.colors.dark);
  doc.setLineWidth(0.5);
  doc.line(LAYOUT.marginLeft, y + 5, LAYOUT.pageWidth - LAYOUT.marginRight, y + 5);
  y += 11;

  if (data.customerName) {
    y = addSectionTitle(doc, 'Customer Details', y);
    y = addKeyValue(doc, 'Name:', data.customerName, LAYOUT.marginLeft, y, 18);
    if (data.companyName) y = addKeyValue(doc, 'Company:', data.companyName, LAYOUT.marginLeft, y, 18);
    if (data.email) y = addKeyValue(doc, 'Email:', data.email, LAYOUT.marginLeft, y, 18);
    y += 4;
  }

  if (data.scopeOfWork) {
    y = addSectionTitle(doc, 'Scope of Work', y);
    y = addWrappedText(doc, data.scopeOfWork, LAYOUT.marginLeft, y, CONTENT_WIDTH);
    y += 5;
  }

  if (data.items && data.items.length > 0) {
    y = addSectionTitle(doc, 'Line Items', y);
    const items = data.items.map((item, idx) => [
      String(idx + 1),
      wrapText(item.description, 50),
      String(item.quantity),
      formatCurrency(item.unitPrice),
      formatCurrency(item.totalPrice || item.quantity * item.unitPrice),
    ]);
    y = addTable(doc, ['#', 'Description', 'Qty', 'Unit Price', 'Total'], items, y, {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    });
    y += 3;

    const totalItems = [
      { label: 'Subtotal', value: formatCurrency(data.subtotal) },
    ];
    if (data.discount > 0) totalItems.push({ label: 'Discount', value: `- ${formatCurrency(data.discount)}` });
    if (data.taxRate > 0) totalItems.push({ label: `Tax (${data.taxRate}%)`, value: formatCurrency(data.taxAmount) });
    totalItems.push({ label: 'Grand Total', value: formatCurrency(data.grandTotal), bold: true, color: LAYOUT.colors.dark });
    y = addTotals(doc, totalItems, y);
  }

  if (data.termsConditions) {
    addTerms(doc, data.termsConditions, y);
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageNumber(doc, i, totalPages);
  }

  return Buffer.from(doc.output('arraybuffer'));
}

export { LAYOUT, CONTENT_WIDTH, CONTENT_HEIGHT, formatCurrency, numberToWords };
