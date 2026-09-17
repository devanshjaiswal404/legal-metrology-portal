/**
 * Storage Purge & Clean Registry Utility
 * Removes legacy mock specimens (Tata Salt, Britannia Bourbon, dummy records) from localStorage.
 */

const DUMMY_SPECIMEN_PATTERNS = [
  'tata salt',
  'tataconsumer',
  'whatsapp image',
  'bourbon',
  'britindia',
  'britannia',
  'sample_a',
  'sample_b',
  'dummy'
];

/**
 * Checks whether an inspection record is a legacy mock specimen
 */
export function isLegacyMockRecord(item) {
  if (!item || typeof item !== 'object') return true;
  const searchableText = [
    item.commodity,
    item.name,
    item.brand,
    item.manufacturer,
    item.title,
    item.memoRef,
    item.product_name,
    item.image
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return DUMMY_SPECIMEN_PATTERNS.some((pattern) => searchableText.includes(pattern));
}

/**
 * Cleans the localStorage 'metrology_inspections' key by purging legacy dummy records
 * and returns the clean array of user-scanned records.
 */
export function getCleanInspections() {
  try {
    const raw = localStorage.getItem('metrology_inspections');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const cleanRecords = parsed.filter((item) => !isLegacyMockRecord(item));

    if (cleanRecords.length !== parsed.length) {
      localStorage.setItem('metrology_inspections', JSON.stringify(cleanRecords));
      window.dispatchEvent(new Event('metrology_history_updated'));
    }

    return cleanRecords;
  } catch (err) {
    console.error('Error purifying metrology inspections:', err);
    return [];
  }
}
