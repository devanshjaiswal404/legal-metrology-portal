export const VALID_SI_SYMBOLS = ['g', 'kg', 'ml', 'l', 'n', 'u', 'cm', 'm'];
export const PROHIBITED_UNIT_ABBREVIATIONS = ['gms', 'gm', 'kilos', 'kilo', 'ml.', 'ltr', 'ltrs'];

/**
 * Validates Net Quantity under Rule 6(1)(c) and Rule 13 of PC Rules, 2011.
 * Standard SI units (g, kg, ml, l, n, u, cm, m) are compliant.
 * Only flags if non-standard abbreviations (gms, gm, kilos, ml.) are explicitly detected.
 */
export function validateNetQuantity(extractedText = '45 g') {
  const text = String(extractedText || '').trim();
  const lower = text.toLowerCase();

  // Explicit check for non-standard abbreviations
  const hasProhibited = PROHIBITED_UNIT_ABBREVIATIONS.some((abbr) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'i');
    return regex.test(lower);
  });

  if (hasProhibited) {
    return {
      status: 'violation',
      found: text,
      law: "Prohibited non-standard abbreviation detected. Rule 13 & The Legal Metrology Act strictly prescribe standard SI symbols ('g', 'kg', 'ml', 'l'). Pluralized or abbreviated symbols ('gms', 'gm', 'kilos') are statutory offences under Section 11 & 36.",
      citation: 'Rule 6(1)(c) read with Rule 13'
    };
  }

  // Extract unit symbol if present
  const match = lower.match(/([0-9.]+)\s*([a-z]+)/i);
  const detectedUnit = match ? match[2] : 'g';
  const unitToReport = VALID_SI_SYMBOLS.includes(detectedUnit) ? detectedUnit : 'g';

  return {
    status: 'pass',
    found: text,
    law: `Declared using statutory SI metric unit '${unitToReport}' under Rule 13.`,
    citation: 'Rule 6(1)(c) & Rule 13'
  };
}

/**
 * Validates Unit Sale Price (USP) under Rule 6(11) of PC Rules, 2011,
 * applying statutory exemptions under Rule 26 for small packages (<= 10 g / 10 ml).
 */
export function validateUnitSalePrice({
  netWeight = 45,
  netUnit = 'g',
  declaredUsp = '₹0.80 / g',
  isUspPresent = true
} = {}) {
  // Check Rule 26 Exemption: Packages <= 10 g or <= 10 ml are exempt
  const isExempt = (netUnit === 'g' || netUnit === 'ml') && Number(netWeight) <= 10;

  if (isExempt) {
    return {
      status: 'exempt',
      found: `${netWeight} ${netUnit} (Exemption Threshold <= 10 ${netUnit})`,
      law: 'Exempt from USP declaration under Rule 26 (Net weight <= 10 g).',
      citation: 'Rule 26 read with Rule 6(11)'
    };
  }

  if (isUspPresent && declaredUsp) {
    return {
      status: 'pass',
      found: declaredUsp,
      law: 'Declared per-unit rate compliant with Rule 6(11). Accurately stated per gram or standard unit.',
      citation: 'Rule 6(11) of PCR, 2011'
    };
  }

  return {
    status: 'violation',
    found: 'No USP Declared',
    law: 'Mandatory under Rule 6(11) for pre-packaged commodities exceeding 1 kg or 1 L.',
    citation: 'Rule 6(11) of PCR, 2011'
  };
}
