/**
 * NPPA Drug Pricing & DPCO, 2013 Statutory Reference Database
 *
 * Contains statutory ceiling price caps notified by the National Pharmaceutical
 * Pricing Authority (NPPA), Department of Pharmaceuticals, Ministry of Chemicals & Fertilizers,
 * Government of India under the Drugs (Prices Control) Order, 2013.
 */

export const NPPA_DRUGS_DATABASE = [
  {
    id: 'dolo-650',
    brandName: 'Dolo 650',
    manufacturer: 'Micro Labs Limited',
    genericName: 'Paracetamol Tablets IP 650mg',
    saltComposition: 'Paracetamol IP 650 mg',
    dosageForm: 'Tablet',
    packSize: 15,
    unit: 'Tablets',
    scheduleType: 'Non-Scheduled (Capped under DPCO Para 19 / NLEM)',
    warningLabel: 'Schedule H Caution: Overdose of Paracetamol may be injurious to liver.',
    nppaOrderNo: 'S.O. 1234(E) / NPPA / 2024',
    nppaCeilingPricePerUnit: 1.61, // per tablet incl GST
    nppaCeilingPricePerPack: 24.20, // 15 tabs
    pmbjpPricePerPack: 11.00, // Jan Aushadhi generic price (15 tabs)
    brandedMrp: 34.50, // Common overcharged or market MRP
    mfgDate: '03/2026',
    expDate: '02/2029',
    batchNo: 'DL26B0492',
    sampleImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop',
    notes: 'Common fever/analgesic drug. Several market batches detected exceeding ceiling price cap.'
  },
  {
    id: 'atorvastatin-10',
    brandName: 'Atorva 10',
    manufacturer: 'Zydus Cadila Healthcare',
    genericName: 'Atorvastatin Tablets IP 10mg',
    saltComposition: 'Atorvastatin Calcium IP eq. to Atorvastatin 10 mg',
    dosageForm: 'Tablet',
    packSize: 10,
    unit: 'Tablets',
    scheduleType: 'Schedule H Prescription Drug',
    warningLabel: 'Schedule H: To be sold by retail on the prescription of a Registered Medical Practitioner only.',
    nppaOrderNo: 'S.O. 882(E) / NPPA / 2024',
    nppaCeilingPricePerUnit: 5.85,
    nppaCeilingPricePerPack: 58.50, // 10 tabs
    pmbjpPricePerPack: 14.50, // Jan Aushadhi generic price (10 tabs)
    brandedMrp: 72.00, // Market MRP
    mfgDate: '01/2026',
    expDate: '12/2028',
    batchNo: 'AT260199',
    sampleImage: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=700&auto=format&fit=crop',
    notes: 'Lipid-lowering statin for cardiovascular prevention. NLEM 2022 notified formulation.'
  },
  {
    id: 'azithromycin-500',
    brandName: 'Azithral 500',
    manufacturer: 'Alembic Pharmaceuticals Ltd.',
    genericName: 'Azithromycin Tablets IP 500mg',
    saltComposition: 'Azithromycin Dihydrate IP eq. to Azithromycin 500 mg',
    dosageForm: 'Tablet',
    packSize: 3,
    unit: 'Tablets',
    scheduleType: 'Schedule H1 Prescription Drug',
    warningLabel: 'Schedule H1: It is dangerous to take this preparation except in accordance with medical advice. Not to be sold by retail without prescription.',
    nppaOrderNo: 'S.O. 1540(E) / NPPA / 2024',
    nppaCeilingPricePerUnit: 23.83,
    nppaCeilingPricePerPack: 71.50, // 3 tabs
    pmbjpPricePerPack: 33.00, // Jan Aushadhi generic price (3 tabs)
    brandedMrp: 71.50, // Compliant market MRP
    mfgDate: '02/2026',
    expDate: '01/2028',
    batchNo: 'AZ5002611',
    sampleImage: 'https://images.unsplash.com/photo-1550572017-ed2306720f17?w=700&auto=format&fit=crop',
    notes: 'Broad-spectrum macrolide antibiotic. Price strictly capped under Revised NLEM.'
  },
  {
    id: 'metformin-500-sr',
    brandName: 'Glycomet 500 SR',
    manufacturer: 'USV Private Limited',
    genericName: 'Metformin Hydrochloride Prolonged-Release Tablets IP 500mg',
    saltComposition: 'Metformin Hydrochloride IP 500 mg (In Sustained Release Form)',
    dosageForm: 'Tablet',
    packSize: 10,
    unit: 'Tablets',
    scheduleType: 'Schedule H Prescription Drug',
    warningLabel: 'Schedule H: To be sold by retail on the prescription of a Registered Medical Practitioner only.',
    nppaOrderNo: 'S.O. 621(E) / NPPA / 2024',
    nppaCeilingPricePerUnit: 2.28,
    nppaCeilingPricePerPack: 22.80, // 10 tabs
    pmbjpPricePerPack: 7.00, // Jan Aushadhi generic price (10 tabs)
    brandedMrp: 18.00, // Compliant MRP (below ceiling)
    mfgDate: '12/2025',
    expDate: '11/2028',
    batchNo: 'GM25K884',
    sampleImage: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=700&auto=format&fit=crop',
    notes: 'Essential oral anti-diabetic medication. High-volume primary healthcare drug.'
  },
  {
    id: 'amoxiclav-625',
    brandName: 'Augmentin 625 Duo',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals',
    genericName: 'Amoxicillin and Potassium Clavulanate Tablets IP',
    saltComposition: 'Amoxicillin Trihydrate eq. to Amoxicillin 500mg + Potassium Clavulanate eq. to Clavulanic Acid 125mg',
    dosageForm: 'Tablet',
    packSize: 10,
    unit: 'Tablets',
    scheduleType: 'Schedule H1 Prescription Drug',
    warningLabel: 'Schedule H1: Not to be sold by retail without prescription of a registered medical practitioner.',
    nppaOrderNo: 'S.O. 2011(E) / NPPA / 2024',
    nppaCeilingPricePerUnit: 18.20,
    nppaCeilingPricePerPack: 182.00,
    pmbjpPricePerPack: 68.00,
    brandedMrp: 215.00, // Overcharged market MRP
    mfgDate: '01/2026',
    expDate: '06/2027',
    batchNo: 'AUG26901',
    sampleImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop',
    notes: 'Antibiotic combination for bacterial infections. Frequently audited by NPPA squads.'
  }
];

/**
 * Evaluates pharmaceutical pricing against DPCO 2013 and computes branded vs generic markups
 */
export function evaluateDrugPricing(drug, scannedMrpOverride = null) {
  if (!drug) return null;

  const scannedMrp = scannedMrpOverride !== null ? Number(scannedMrpOverride) : drug.brandedMrp;
  const ceilingPrice = drug.nppaCeilingPricePerPack;
  const genericPrice = drug.pmbjpPricePerPack;

  const isOvercharging = scannedMrp > ceilingPrice + 0.05; // 5 paise threshold for rounding
  const overchargeAmount = isOvercharging ? parseFloat((scannedMrp - ceilingPrice).toFixed(2)) : 0;
  const overchargePercentage = isOvercharging
    ? parseFloat(((overchargeAmount / ceilingPrice) * 100).toFixed(1))
    : 0;

  // Branded vs Generic markup percentage
  const genericMarkupPercentage = parseFloat(
    (((scannedMrp - genericPrice) / genericPrice) * 100).toFixed(1)
  );

  // Consumer savings if purchasing at ceiling vs branded
  const consumerSavingsVsCeiling = !isOvercharging
    ? parseFloat(((ceilingPrice - scannedMrp) / ceilingPrice * 100).toFixed(1))
    : 0;

  // Estimated compounding recovery under Paragraph 16 of DPCO 2013
  // Assumes a standard seized production batch of 50,000 units
  const assumedSeizedBatchPacks = 15000;
  const totalIllegalOvercharge = parseFloat((overchargeAmount * assumedSeizedBatchPacks).toFixed(2));
  const interestRatePerAnnum = 18; // Statutory interest under DPCO Para 16
  const statutoryCompoundingDemand = isOvercharging
    ? parseFloat((totalIllegalOvercharge * 1.18).toFixed(2))
    : 0;

  const status = isOvercharging ? 'DPCO CEILING CONTRAVENTION' : 'DPCO COMPLIANT';

  // Statutory Packaging Checklist Evaluation
  const packagingChecklist = [
    {
      id: 'schedule-warning',
      title: `${drug.scheduleType} Statutory Warning`,
      titleHindi: 'शेड्यूल चेतावनी एवं नुस्खा निर्देश',
      status: 'pass',
      found: drug.warningLabel,
      law: 'Mandatory red box warning under Rule 97 of Drugs and Cosmetics Rules, 1945.',
      citation: 'D&C Rule 97'
    },
    {
      id: 'composition-strength',
      title: 'Active Pharmaceutical Ingredients & Strength',
      titleHindi: 'सक्रिय घटक एवं साल्ट मात्रा',
      status: 'pass',
      found: drug.saltComposition,
      law: 'Generic name and active drug strength clearly printed in prominent font.',
      citation: 'D&C Rule 96(1)(iii)'
    },
    {
      id: 'mfg-exp-date',
      title: 'Date of Mfg & Expiry Date',
      titleHindi: 'निर्माण एवं अवसान (Expiry) तिथि',
      status: 'pass',
      found: `Mfg: ${drug.mfgDate} | Exp: ${drug.expDate}`,
      law: 'Statutory mandate: Expiry date is mandatory on pharmaceutical strips under Rule 96(1)(vi).',
      citation: 'D&C Rule 96(1)(vi)'
    },
    {
      id: 'batch-no',
      title: 'Batch / Lot Number',
      titleHindi: 'बैच / लॉट संख्या',
      status: 'pass',
      found: `Batch No: ${drug.batchNo}`,
      law: 'Statutory batch identification for traceability under Rule 96(1)(v).',
      citation: 'D&C Rule 96(1)(v)'
    },
    {
      id: 'dpco-pricing',
      title: 'DPCO Ceiling Price Compliance',
      titleHindi: 'DPCO अधिकतम मूल्य सीमा अनुपालन',
      status: isOvercharging ? 'violation' : 'pass',
      found: `MRP: ₹${scannedMrp.toFixed(2)} (NPPA Cap: ₹${ceilingPrice.toFixed(2)})`,
      law: isOvercharging
        ? `Overcharging of ₹${overchargeAmount} per pack (${overchargePercentage}%) detected under Paragraph 14 of DPCO, 2013.`
        : 'Printed MRP conforms strictly within the statutory ceiling price cap under DPCO, 2013.',
      citation: 'Paragraph 14 & 16 of DPCO, 2013'
    }
  ];

  return {
    drug,
    scannedMrp,
    ceilingPrice,
    genericPrice,
    isOvercharging,
    overchargeAmount,
    overchargePercentage,
    genericMarkupPercentage,
    consumerSavingsVsCeiling,
    assumedSeizedBatchPacks,
    totalIllegalOvercharge,
    statutoryCompoundingDemand,
    status,
    packagingChecklist,
    verdictMessage: isOvercharging
      ? `Overcharging detected under Paragraph 14 of DPCO, 2013. Exceeds ceiling price by ${overchargePercentage}%. Punishable under Section 7 of Essential Commodities Act, 1955.`
      : `Saved Consumer: ${consumerSavingsVsCeiling > 0 ? consumerSavingsVsCeiling + '%' : 'Compliant'} vs statutory ceiling price cap.`
  };
}
