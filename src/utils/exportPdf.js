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
  memoRef
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

  const violations = rules.filter((r) => r.status === 'violation');
  const isCompliant = violations.length === 0;
  const overallVerdict = isCompliant
    ? 'COMPLIANT (STATUTORY CERTIFICATE ISSUED)'
    : 'NON-COMPLIANT (ACTION UNDER SECTION 36 INITIATED)';

  // Page Dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 15;

  // --- 1. National Emblem / Header Band ---
  // Top tricolor accent line
  doc.setFillColor(255, 153, 51); // Saffron
  doc.rect(14, currentY, (pageWidth - 28) / 3, 1.5, 'F');
  doc.setFillColor(200, 200, 200); // White/Light Grey
  doc.rect(14 + (pageWidth - 28) / 3, currentY, (pageWidth - 28) / 3, 1.5, 'F');
  doc.setFillColor(19, 136, 8); // Green
  doc.rect(14 + ((pageWidth - 28) * 2) / 3, currentY, (pageWidth - 28) / 3, 1.5, 'F');

  currentY += 8;

  // Top Header: Government Attribution
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85); // Slate-700
  doc.text(
    'GOVERNMENT OF INDIA / STATE LEGAL METROLOGY DEPARTMENT',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );

  currentY += 6;

  // Document Title: FORM V
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate-900 / Deep Navy
  doc.text(
    'FORM V - NOTICE OF INSPECTION & SEIZURE MEMO',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );

  currentY += 5;

  // Subtitle: Statutory Authority Citation
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
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

  currentY += 6;

  // --- 2. Inspection Metadata Box ---
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(14, currentY, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  // Row 1 Metadata
  doc.text('Memo Reference:', 18, currentY + 6);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(generatedMemoRef, 48, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Inspection Timestamp:', 110, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${formattedDate}, ${formattedTime} IST`, 147, currentY + 6);

  // Row 2 Metadata
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Officer ID:', 18, currentY + 13);
  doc.setFont('courier', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(inspectorId, 48, currentY + 13);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Compliance Score:', 110, currentY + 13);
  doc.setFont('courier', 'bold');
  doc.setTextColor(isCompliant ? 16 : 239, isCompliant ? 185 : 68, isCompliant ? 129 : 68);
  doc.text(`${score} / 100`, 147, currentY + 13);

  // Row 3 Metadata: Verdict & Prescribed Font Height
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Overall Verdict:', 18, currentY + 20);
  doc.setFont('helvetica', 'bold');
  if (isCompliant) {
    doc.setTextColor(16, 185, 129);
  } else {
    doc.setTextColor(220, 38, 38);
  }
  doc.text(overallVerdict, 48, currentY + 20);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Prescribed Font Ht:', 110, currentY + 20);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(minNumeralHeight, 147, currentY + 20);

  currentY += 28;

  // --- 3. Formatted Table of Declarations (jspdf-autotable) ---
  const tableColumns = [
    { header: 'Declaration Name', dataKey: 'name' },
    { header: 'Rule Reference', dataKey: 'rule' },
    { header: 'Finding', dataKey: 'status' },
    { header: 'Observed Text', dataKey: 'observed' },
    { header: 'Statutory Remarks', dataKey: 'remarks' }
  ];

  const tableRows = rules.map((r) => {
    const isPass = r.status === 'pass';
    return {
      name: r.title || 'Mandatory Declaration',
      rule: r.ruleId || r.clause || 'PCR, 2011',
      status: isPass ? 'PASS' : 'VIOLATION',
      observed: isPass ? r.detectedText || 'Verified' : r.offendingText || 'Defective/Missing',
      remarks: isPass ? r.remark || 'Compliant with statutory standard.' : r.violationReason || 'Offence under Section 36.'
    };
  });

  autoTable(doc, {
    startY: currentY,
    columns: tableColumns,
    body: tableRows,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle',
      textColor: [30, 41, 59] // Slate-800
    },
    headStyles: {
      fillColor: [15, 23, 42], // Dark Slate (#0f172a)
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    columnStyles: {
      name: { cellWidth: 36, fontStyle: 'bold' },
      rule: { cellWidth: 30, fontStyle: 'normal' },
      status: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      observed: { cellWidth: 42, fontStyle: 'normal' },
      remarks: { cellWidth: 'auto', fontStyle: 'normal' }
    },
    didParseCell: (data) => {
      // Style the status cell with green or red colors
      if (data.column.dataKey === 'status' && data.section === 'body') {
        if (data.cell.raw === 'PASS') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald Green
          data.cell.styles.fillColor = [240, 253, 244]; // Light Emerald
        } else if (data.cell.raw === 'VIOLATION') {
          data.cell.styles.textColor = [220, 38, 38]; // Crimson Red
          data.cell.styles.fillColor = [254, 242, 242]; // Light Red
        }
      }
    }
  });

  // Get final Y after table
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : currentY + 80;

  // --- 4. Statutory Warning Box (Section 36) ---
  doc.setFillColor(254, 242, 242); // Light red
  doc.setDrawColor(252, 165, 165); // Red border
  doc.setLineWidth(0.4);
  doc.roundedRect(14, finalY, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(185, 28, 28); // Dark Red
  doc.text('STATUTORY WARNING UNDER SECTION 36(1):', 18, finalY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27);
  doc.text(
    'Notice under Section 36(1): Any contravention of mandatory packaging declarations is punishable with a fine up to Rs. 25,000.',
    18,
    finalY + 10.5
  );

  // --- 5. Official Signature and Stamp Section ---
  const signY = finalY + 22;

  // Officer Signature Box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text('Inspected & Issued By:', 18, signY);
  doc.line(18, signY + 15, 75, signY + 15); // Signature line
  doc.setFont('helvetica', 'bold');
  doc.text(`Legal Metrology Officer (${inspectorId})`, 18, signY + 19);
  doc.setFont('helvetica', 'normal');
  doc.text('Central Enforcement Directorate', 18, signY + 23);

  // Seal of Office
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.roundedRect(90, signY - 2, 35, 27, 2, 2, 'D');
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('SEAL OF OFFICE', 107.5, signY + 12, { align: 'center' });

  // Recipient / Packer Acknowledgement Line
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.text('Received by Packer / Seller:', 135, signY);
  doc.line(135, signY + 15, pageWidth - 18, signY + 15);
  doc.text('Signature / Stamp & Date', 135, signY + 19);

  // Bottom Security & Authenticity Footnote
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Form V Generated via National Legal Metrology Compliance Grid • Verification Hash: ${timestampString}-${generatedMemoRef}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 8,
    { align: 'center' }
  );

  // --- 6. Trigger Instant Download ---
  const filename = `Legal_Metrology_Memo_${timestampString}.pdf`;
  doc.save(filename);
  return filename;
}
