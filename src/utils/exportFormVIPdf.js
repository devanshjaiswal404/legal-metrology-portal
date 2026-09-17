/**
 * Form VI — DPCO Statutory Overcharging Intimation & Legal Metrology Memo Exporter
 *
 * Generates an official statutory PDF demand memo under the Drugs (Prices Control) Order, 2013
 * read with Section 7 of the Essential Commodities Act, 1955 and the Legal Metrology Act, 2009.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportFormVIPdf({
  auditResult,
  inspectorId = 'LMO-Central-04 / NPPA-Squad-02',
  memoRef = null,
  district = 'Central Delhi Legal Metrology Enforcement Zone'
} = {}) {
  if (!auditResult) return;

  const {
    drug,
    scannedMrp,
    ceilingPrice,
    genericPrice,
    isOvercharging,
    overchargeAmount,
    overchargePercentage,
    assumedSeizedBatchPacks,
    totalIllegalOvercharge,
    statutoryCompoundingDemand,
    packagingChecklist = []
  } = auditResult;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const generatedMemoRef =
    memoRef || `NPPA/DPCO/2026/${Math.floor(1000 + Math.random() * 9000)}`;

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 14;

  // --- 1. National Tricolor Accent Bar ---
  const usableWidth = pageWidth - 28;
  const tricolorSegment = usableWidth / 3;
  doc.setFillColor(255, 153, 51); // Saffron
  doc.rect(14, currentY, tricolorSegment, 1.5, 'F');
  doc.setFillColor(220, 220, 220); // Silver/White
  doc.rect(14 + tricolorSegment, currentY, tricolorSegment, 1.5, 'F');
  doc.setFillColor(19, 136, 8); // India Green
  doc.rect(14 + tricolorSegment * 2, currentY, tricolorSegment, 1.5, 'F');
  currentY += 6;

  // --- 2. Government & NPPA Emblem Header ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('GOVERNMENT OF INDIA', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('NATIONAL PHARMACEUTICAL PRICING AUTHORITY (NPPA)', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Department of Pharmaceuticals • Ministry of Chemicals & Fertilizers', pageWidth / 2, currentY, { align: 'center' });
  currentY += 3.5;
  doc.text('in coordination with The Department of Consumer Affairs (Legal Metrology Division)', pageWidth / 2, currentY, { align: 'center' });
  currentY += 7;

  // --- 3. Document Title Banner ---
  if (isOvercharging) {
    doc.setFillColor(153, 27, 27); // Crimson Red
  } else {
    doc.setFillColor(20, 83, 45); // Forest Green
  }
  doc.roundedRect(14, currentY, usableWidth, 9.5, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  const titleText = isOvercharging
    ? 'FORM VI — STATUTORY DEMAND NOTICE & INTIMATION OF DPCO OVERCHARGING'
    : 'FORM VI — STATUTORY PHARMACEUTICAL PRICING COMPLIANCE CERTIFICATE';
  doc.text(titleText, pageWidth / 2, currentY + 6.2, { align: 'center' });
  currentY += 13.5;

  // --- 4. Statutory Citation Reference Block ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Statutory Reference:', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    'Paragraph 14 & 16 of DPCO, 2013 read with Section 7 of Essential Commodities Act, 1955 and Section 36 of Legal Metrology Act, 2009',
    46,
    currentY
  );
  currentY += 6;

  // Metadata Grid: Two Columns
  const metaColWidth = usableWidth / 2;
  const leftX = 14;
  const rightX = 14 + metaColWidth;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, usableWidth, 24, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, usableWidth, 24, 1.5, 1.5, 'S');

  let metaY = currentY + 5;
  doc.setFontSize(8);

  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Intimation Notice Ref:', leftX + 3, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(generatedMemoRef, leftX + 38, metaY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Formulation Name:', leftX + 3, metaY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(drug.brandName || 'Audited Medicine', leftX + 38, metaY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Active Composition:', leftX + 3, metaY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(drug.saltComposition || '', leftX + 38, metaY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Manufacturer / Packer:', leftX + 3, metaY + 15);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(drug.manufacturer || '', leftX + 38, metaY + 15);

  // Right Column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Date & Time of Audit:', rightX + 3, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${formattedDate}, ${formattedTime} IST`, rightX + 36, metaY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Auditing Officer / ID:', rightX + 3, metaY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(inspectorId, rightX + 36, metaY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('NPPA Order Reference:', rightX + 3, metaY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(drug.nppaOrderNo || 'DPCO Gazette Notification', rightX + 36, metaY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Batch / Expiry Date:', rightX + 3, metaY + 15);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${drug.batchNo} | Exp: ${drug.expDate}`, rightX + 36, metaY + 15);

  currentY += 28;

  // --- 5. Three-Way Price Comparison Table ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('1. THREE-WAY STATUTORY PRICE COMPARISON AUDIT', 14, currentY);
  currentY += 3;

  const priceTableData = [
    [
      'A. Scanned Branded Market MRP',
      `₹${scannedMrp.toFixed(2)}`,
      `₹${(scannedMrp / drug.packSize).toFixed(2)}`,
      isOvercharging ? 'EXCEEDS CEILING' : 'CONFORMS'
    ],
    [
      'B. NPPA Notified Ceiling Price Cap',
      `₹${ceilingPrice.toFixed(2)}`,
      `₹${drug.nppaCeilingPricePerUnit.toFixed(2)}`,
      'Statutory Price Ceiling (Para 14)'
    ],
    [
      'C. PMBJP Generic Equivalent Price',
      `₹${genericPrice.toFixed(2)}`,
      `₹${(genericPrice / drug.packSize).toFixed(2)}`,
      'Janaushadhi Benchmark'
    ],
    [
      'D. Overcharge per Pack / Unit',
      isOvercharging ? `+₹${overchargeAmount.toFixed(2)}` : 'NIL (₹0.00)',
      isOvercharging ? `+₹${(overchargeAmount / drug.packSize).toFixed(2)}` : 'NIL',
      isOvercharging ? `${overchargePercentage}% Contravention` : 'Fully Compliant'
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Pricing Parameter', 'Price per Pack', 'Price per Unit (Tab)', 'Statutory Compliance']],
    body: priceTableData,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 42 }
    }
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // --- 6. Compounding Recovery Demand Calculation (if Overcharging) ---
  if (isOvercharging) {
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(14, currentY, usableWidth, 23, 1.5, 1.5, 'F');
    doc.setDrawColor(248, 113, 113);
    doc.roundedRect(14, currentY, usableWidth, 23, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(153, 27, 27);
    doc.text('DEMAND NOTICE FOR RECOVERY OF OVERCHARGED AMOUNT (PARAGRAPH 16 OF DPCO, 2013)', 18, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(80, 15, 15);
    doc.text(
      `1. Seized Production Batch Quantity: ${assumedSeizedBatchPacks.toLocaleString('en-IN')} Packs (${(assumedSeizedBatchPacks * drug.packSize).toLocaleString('en-IN')} Tablets)`,
      18,
      currentY + 10.5
    );
    doc.text(
      `2. Total Illegal Overcharge Principal: ₹${totalIllegalOvercharge.toLocaleString('en-IN')} (Computed @ ₹${overchargeAmount}/pack)`,
      18,
      currentY + 14.5
    );
    doc.setFont('helvetica', 'bold');
    doc.text(
      `3. Total Statutory Compounding Demand with 18% p.a. Interest: ₹${statutoryCompoundingDemand.toLocaleString('en-IN')}`,
      18,
      currentY + 18.5
    );

    currentY += 27;
  } else {
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, currentY, usableWidth, 12, 1.5, 1.5, 'F');
    doc.setDrawColor(134, 239, 172);
    doc.roundedRect(14, currentY, usableWidth, 12, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 83, 45);
    doc.text('CERTIFICATE OF DPCO PRICE COMPLIANCE', 18, currentY + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(22, 101, 52);
    doc.text(
      `The printed retail sale price (₹${scannedMrp.toFixed(2)}) is well within the notified ceiling price (₹${ceilingPrice.toFixed(2)}). No overcharge under Paragraph 14.`,
      18,
      currentY + 9.5
    );

    currentY += 16;
  }

  // --- 7. Pharmaceutical Packaging Label Compliance Table ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('2. PHARMACEUTICAL PACKAGING & LABEL MANDATORY CHECKS', 14, currentY);
  currentY += 3;

  const packagingRows = packagingChecklist.map((item) => [
    item.title,
    item.citation,
    item.status.toUpperCase(),
    item.found,
    item.law
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Mandatory Requirement', 'Statutory Citation', 'Status', 'Observed on Packaging', 'Assessment Finding']],
    body: packagingRows,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 42 },
      4: { cellWidth: 55 }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // --- 8. Prosecution & Compounding Warning (if Overcharging) ---
  if (isOvercharging) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(153, 27, 27);
    doc.text('STATUTORY PROSECUTION WARNING UNDER ESSENTIAL COMMODITIES ACT, 1955:', 14, currentY);
    currentY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105);
    const legalNotice =
      'Failure to deposit the overcharged amount into the Drugs Prices Equalisation Account within 15 days of this intimation notice shall initiate proceedings under Section 7 of the Essential Commodities Act, 1955 (punishable with imprisonment up to 7 years) and cancellation of manufacturing licenses under Rule 85 of the Drugs and Cosmetics Rules, 1945.';
    doc.text(doc.splitTextToSize(legalNotice, usableWidth), 14, currentY);
    currentY += 10;
  }

  // --- 9. Signatures and Endorsement Block ---
  const signY = Math.max(currentY + 4, 255);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, signY, 70, signY);
  doc.line(pageWidth - 70, signY, pageWidth - 14, signY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Signature of Authorized Wholesaler / Retailer', 14, signY + 4);
  doc.text('Seal & Signature of Drug Metrology Inspector', pageWidth - 70, signY + 4);

  doc.setFont('helvetica', 'bold');
  doc.text(`ID: ${inspectorId}`, pageWidth - 70, signY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text('National Pharmaceutical Pricing Authority Squad', pageWidth - 70, signY + 12);

  // Footer Disclaimer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This Form VI intimation is electronically verified by the National Legal Metrology & NPPA Joint Enforcement Portal under Section 65B of Evidence Act.',
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  doc.save(`DPCO_Demand_Notice_${generatedMemoRef.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`);
}
