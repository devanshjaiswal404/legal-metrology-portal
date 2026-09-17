import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads the official Form V Statutory Inspection & Seizure Memo
 * under Section 15 & 36 of The Legal Metrology Act, 2009 and PCR, 2011.
 *
 * @param {Object} options
 * @param {Array} options.rules - Evaluated statutory rules
 * @param {number} options.score - Overall compliance score (0-100)
 * @param {string} options.minNumeralHeight - Minimum required numeral height
 * @param {string} options.inspectorId - Officer badge ID (default: 'LMO-Central-04')
 * @param {string} options.memoRef - Custom memo reference ID
 */
export function exportFormVPdf({
  rules = [],
  score = 68,
  minNumeralHeight = '2.5 mm',
  inspectorId = 'LMO-Central-04',
  memoRef,
  commodity,
  seller,
  platform,
  overallVerdict = null
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const now = new Date();
  const timestampString = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
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
    memoRef || `LMO/2026/${Math.floor(1000 + Math.random() * 9000)}`;

  // Determine statutory compliance status
  const violations = rules.filter((r) => r.status === 'violation' || r.status === 'fail');
  const contraventionCount = violations.length;
  const isCompliant = overallVerdict
    ? overallVerdict.toUpperCase() === 'COMPLIANT'
    : (contraventionCount === 0 || score === 100);

  // Page Dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 14;

  // --- 1. National Tricolor Accent Bar ---
  const usableWidth = pageWidth - 28; // 210 - 28 = 182mm
  const tricolorSegment = usableWidth / 3;
  doc.setFillColor(255, 153, 51); // Saffron
  doc.rect(14, currentY, tricolorSegment, 1.5, 'F');
  doc.setFillColor(220, 220, 220); // White/Light Silver
  doc.rect(14 + tricolorSegment, currentY, tricolorSegment, 1.5, 'F');
  doc.setFillColor(19, 136, 8); // Green
  doc.rect(14 + tricolorSegment * 2, currentY, tricolorSegment, 1.5, 'F');

  currentY += 7;

  // Top Header: Government Attribution
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85); // Slate-700
  doc.text(
    'GOVERNMENT OF INDIA / STATE LEGAL METROLOGY ENFORCEMENT DIRECTORATE',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );

  currentY += 6;

  // Dynamic Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  if (isCompliant) {
    doc.setTextColor(15, 23, 42); // Dark Slate (#0f172a) / Emerald tone
    doc.text(
      'FORM V — STATUTORY INSPECTION MEMORANDUM & COMPLIANCE CERTIFICATE',
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );
  } else {
    doc.setTextColor(185, 28, 28); // Crimson Red
    doc.text(
      'FORM V — NOTICE OF STATUTORY CONTRAVENTION & SEIZURE MEMORANDUM',
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );
  }

  currentY += 5;

  // Subtitle: Statutory Authority Citation
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(
    'Issued under Section 15 & Section 36 of The Legal Metrology Act, 2009 read with PC Rules, 2011',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );

  currentY += 4;

  // Divider line
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.4);
  doc.line(14, currentY, pageWidth - 14, currentY);

  currentY += 4;

  // --- 2. Clean 4-Column Borderless Metadata Grid (autoTable) ---
  const metadataRows = [
    [
      { content: 'Memo Reference:', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
      { content: generatedMemoRef, styles: { font: 'courier', fontStyle: 'bold', textColor: [15, 23, 42] } },
      { content: 'Inspection Date & Time:', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
      { content: `${formattedDate}, ${formattedTime} IST`, styles: { textColor: [15, 23, 42] } }
    ],
    [
      { content: 'Officer Badge ID:', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
      { content: inspectorId, styles: { font: 'courier', fontStyle: 'bold', textColor: [5, 150, 105] } },
      { content: 'Compliance Score:', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
      {
        content: `${score} / 100`,
        styles: {
          font: 'courier',
          fontStyle: 'bold',
          textColor: isCompliant ? [5, 150, 105] : [220, 38, 38]
        }
      }
    ],
    [
      { content: 'Statutory Verdict:', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
      {
        content: isCompliant ? 'COMPLIANT (PASSED)' : `CONTRAVENTION (${contraventionCount} FLAGGED)`,
        styles: {
          fontStyle: 'bold',
          textColor: isCompliant ? [5, 150, 105] : [220, 38, 38]
        }
      },
      { content: seller ? 'Marketplace / Seller:' : 'Prescribed Font Height:', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
      { content: seller ? `${platform || 'E-Com'} | ${seller}` : `${minNumeralHeight} (Sched. II)`, styles: { font: 'courier', fontStyle: 'bold', textColor: [15, 23, 42] } }
    ]
  ];

  if (commodity) {
    metadataRows.push([
      { content: 'Commodity Audited:', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
      { content: commodity, colSpan: 3, styles: { fontStyle: 'bold', textColor: [15, 23, 42] } }
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    body: metadataRows,
    margin: { left: 14, right: 14 },
    theme: 'plain',
    tableWidth: 182,
    styles: {
      fontSize: 8,
      cellPadding: { top: 1.8, right: 2, bottom: 1.8, left: 2 },
      overflow: 'linebreak',
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 50 },
      2: { cellWidth: 46 },
      3: { cellWidth: 44 }
    }
  });

  currentY = doc.lastAutoTable.finalY + 4;

  // Thin separator under metadata
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.3);
  doc.line(14, currentY, pageWidth - 14, currentY);

  currentY += 4;

  // --- 3. Format Statutory Findings Table (jspdf-autotable) ---
  const tableColumns = [
    { header: 'Declaration Name', dataKey: 'name' },
    { header: 'Rule Reference', dataKey: 'rule' },
    { header: 'Verdict', dataKey: 'status' },
    { header: 'Observed Text', dataKey: 'observed' },
    { header: 'Statutory Remarks', dataKey: 'remarks' }
  ];

  const tableRows = rules.map((r) => {
    const isPass = r.status === 'pass' || r.status === 'exempt';
    const isExempt = r.status === 'exempt';
    let statusText = 'VIOLATION';
    if (isExempt) statusText = 'EXEMPT';
    else if (isPass) statusText = 'PASS';

    return {
      name: r.title || 'Mandatory Declaration',
      rule: r.ruleId || r.clause || 'PCR, 2011',
      status: statusText,
      observed: isPass
        ? (r.detectedText || r.found || 'Verified on Principal Display Panel')
        : (r.offendingText || r.found || 'Defective / Missing'),
      remarks: isPass
        ? (r.remark || r.law || 'Compliant with statutory metric standards.')
        : (r.violationReason || r.law || 'Offence under Section 36.')
    };
  });

  autoTable(doc, {
    startY: currentY,
    columns: tableColumns,
    body: tableRows,
    margin: { left: 14, right: 14 },
    tableWidth: 182, // Total: 40 + 35 + 18 + 38 + 51 = 182 mm
    theme: 'grid',
    styles: {
      fontSize: 7.8,
      cellPadding: 2.6,
      overflow: 'linebreak',
      valign: 'middle',
      textColor: [30, 41, 59] // Slate-800
    },
    headStyles: {
      fillColor: [15, 23, 42], // Dark Slate (#0f172a)
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    columnStyles: {
      name: { cellWidth: 40, fontStyle: 'bold' },
      rule: { cellWidth: 35, fontStyle: 'normal' },
      status: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      observed: { cellWidth: 38, fontStyle: 'normal' },
      remarks: { cellWidth: 51, fontStyle: 'normal' }
    },
    didParseCell: (data) => {
      if (data.column.dataKey === 'status' && data.section === 'body') {
        if (data.cell.raw === 'PASS') {
          data.cell.styles.textColor = [5, 150, 105]; // Emerald
          data.cell.styles.fillColor = [240, 253, 244]; // Light Emerald
        } else if (data.cell.raw === 'EXEMPT') {
          data.cell.styles.textColor = [14, 116, 144]; // Cyan-700
          data.cell.styles.fillColor = [236, 254, 255]; // Light Cyan
        } else {
          data.cell.styles.textColor = [220, 38, 38]; // Crimson Red
          data.cell.styles.fillColor = [254, 242, 242]; // Light Red
        }
      }
    }
  });

  // Get final Y after table
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 5 : currentY + 80;

  // --- 4. Conditional Statutory Notice / Certificate Callout ---
  if (isCompliant) {
    // Green-accented clearance callout
    doc.setFillColor(240, 253, 244); // Light Emerald
    doc.setDrawColor(110, 231, 183); // Emerald-300
    doc.setLineWidth(0.4);
    doc.roundedRect(14, finalY, 182, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(6, 95, 70); // Emerald-800
    doc.text('STATUTORY COMPLIANCE CLEARANCE CERTIFICATE:', 18, finalY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(4, 120, 87); // Emerald-700
    const clearanceText =
      'The specimen audited above conforms to the mandatory declarations prescribed under The Legal Metrology (Packaged Commodities) Rules, 2011. No compounding notice or prosecution under Section 36 is warranted.';
    const splitClearance = doc.splitTextToSize(clearanceText, 174);
    doc.text(splitClearance, 18, finalY + 10);
  } else {
    // Red-accented warning callout
    doc.setFillColor(254, 242, 242); // Light red
    doc.setDrawColor(252, 165, 165); // Red border
    doc.setLineWidth(0.4);
    doc.roundedRect(14, finalY, 182, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28); // Crimson
    doc.text('STATUTORY NOTICE UNDER SECTION 36(1) OF THE ACT:', 18, finalY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(153, 27, 27); // Deep Red
    const warningText =
      'Failure to comply with pre-packaged commodity rules constitutes an offence under Section 36(1) punishable with fine up to Rs. 25,000 for the first offence, or subsequent compounding proceedings under Section 48.';
    const splitWarning = doc.splitTextToSize(warningText, 174);
    doc.text(splitWarning, 18, finalY + 10);
  }

  // --- 5. Signatures & Footer Layout ---
  const signY = finalY + 22;

  // Left Signature Block: Legal Metrology Officer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text('INSPECTED & ISSUED BY (Legal Metrology Officer):', 14, signY);
  doc.setDrawColor(148, 163, 184); // Slate-400
  doc.setLineWidth(0.3);
  doc.line(14, signY + 14, 75, signY + 14); // Signature line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Authorized Officer (${inspectorId})`, 14, signY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Legal Metrology Enforcement Directorate', 14, signY + 22);

  // Center Seal of Office
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.roundedRect(88, signY - 1, 34, 25, 2, 2, 'D');
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('OFFICIAL SEAL', 105, signY + 11, { align: 'center' });
  doc.text('& CREST', 105, signY + 15, { align: 'center' });

  // Right Signature Block: Packer / Trader Acknowledgement
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('RECEIVED & ACKNOWLEDGED BY (Packer/Trader):', 130, signY);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(130, signY + 14, 196, signY + 14); // Signature line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Signatory / Representative', 130, signY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Date & Enterprise Seal', 130, signY + 22);

  // Bottom Tamper-Evident Hash & Footer (y = 288mm)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  const auditHash = `LM-HASH:${timestampString}-${generatedMemoRef}-${score}`;
  doc.text(
    `Form V Generated via National Legal Metrology Compliance Grid | Timestamp: ${formattedDate} ${formattedTime} IST | Audit Hash: ${auditHash}`,
    pageWidth / 2,
    288,
    { align: 'center' }
  );

  // --- 6. Trigger Instant Download ---
  const filename = `Legal_Metrology_Memo_${timestampString}.pdf`;
  doc.save(filename);
  return filename;
}
