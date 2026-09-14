/**
 * Exports statutory audit findings as a clean, downloadable CSV file.
 *
 * @param {Object} options
 * @param {string} options.productName
 * @param {string} options.memoRef
 * @param {number} options.score
 * @param {string} options.verdict
 * @param {Array} options.rules
 */
export function exportAuditDataCsv({
  productName = 'Packaged Commodity',
  memoRef = 'LMO/2026/8842',
  score = 68,
  verdict = 'NON-COMPLIANT',
  rules = []
}) {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

  const headers = [
    'Inspection Memo ID',
    'Commodity Name',
    'Overall Verdict',
    'Compliance Score',
    'Declaration Name',
    'Rule Reference',
    'Status',
    'Observed Text on Package',
    'Statutory Requirement',
    'Statutory Citation'
  ];

  const rows = rules.map((r) => [
    `"${memoRef}"`,
    `"${productName.replace(/"/g, '""')}"`,
    `"${verdict}"`,
    `"${score}/100"`,
    `"${(r.title || '').replace(/"/g, '""')}"`,
    `"${(r.citation || r.ruleId || '').replace(/"/g, '""')}"`,
    `"${r.status === 'pass' ? 'PASS' : 'VIOLATION'}"`,
    `"${(r.found || r.detectedText || '').replace(/"/g, '""')}"`,
    `"${(r.law || r.remark || '').replace(/"/g, '""')}"`,
    `"${(r.citation || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Legal_Metrology_Audit_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
