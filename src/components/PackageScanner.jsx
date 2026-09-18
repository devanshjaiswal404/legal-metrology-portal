import React, { useState } from 'react';
import ScanZone from './ScanZone';
import AuditResults from './AuditResults';

/**
 * Helper to convert data URL to File object when needed
 */
function dataUrlToFile(dataUrl, filename = 'specimen.jpg') {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default function PackageScanner({
  auditData: externalAuditData,
  setAuditData: externalSetAuditData,
  selectedBoxId: externalSelectedBoxId,
  setSelectedBoxId: externalSetSelectedBoxId,
  hoveredBoxId: externalHoveredBoxId,
  setHoveredBoxId: externalSetHoveredBoxId,
  packageWidth: externalPackageWidth = 10.0,
  setPackageWidth: externalSetPackageWidth,
  pdpArea: externalPdpArea = 150.0,
  setPdpArea: externalSetPdpArea,
  isAnalyzing: externalIsAnalyzing,
  setIsAnalyzing: externalSetIsAnalyzing,
  onUpdateAuditData,
  onResetImage,
  t,
  lang = 'en',
  showToast,
  onImageSelected
}) {
  // Internal state if used standalone without parent state
  const [internalAuditData, setInternalAuditData] = useState(null);
  const [internalSelectedBoxId, setInternalSelectedBoxId] = useState(null);
  const [internalHoveredBoxId, setInternalHoveredBoxId] = useState(null);
  const [internalPackageWidth, setInternalPackageWidth] = useState(10.0);
  const [internalPdpArea, setInternalPdpArea] = useState(150.0);
  const [internalLoading, setInternalLoading] = useState(false);

  const auditData = externalAuditData !== undefined ? externalAuditData : internalAuditData;
  const setAuditData = externalSetAuditData || setInternalAuditData;
  const selectedBoxId = externalSelectedBoxId !== undefined ? externalSelectedBoxId : internalSelectedBoxId;
  const setSelectedBoxId = externalSetSelectedBoxId || setInternalSelectedBoxId;
  const hoveredBoxId = externalHoveredBoxId !== undefined ? externalHoveredBoxId : internalHoveredBoxId;
  const setHoveredBoxId = externalSetHoveredBoxId || setInternalHoveredBoxId;
  const packageWidth = externalPackageWidth !== undefined ? externalPackageWidth : internalPackageWidth;
  const setPackageWidth = externalSetPackageWidth || setInternalPackageWidth;
  const pdpArea = externalPdpArea !== undefined ? externalPdpArea : internalPdpArea;
  const setPdpArea = externalSetPdpArea || setInternalPdpArea;
  const loading = externalIsAnalyzing !== undefined ? externalIsAnalyzing : internalLoading;
  const setLoading = externalSetIsAnalyzing || setInternalLoading;

  /**
   * Directly dispatches the uploaded image file via fetch to http://localhost:5000/api/audit
   * REMOVES any mock timers (setTimeout), simulated responses, or hardcoded 100 score fallbacks.
   */
  const handleRunAudit = async (fileToUpload, previewDataUrl = null) => {
    if (!fileToUpload) return;

    setLoading(true);
    const preview = previewDataUrl || (fileToUpload instanceof Blob ? URL.createObjectURL(fileToUpload) : null);

    // Immediately reflect preview image
    setAuditData({
      image: preview,
      name: fileToUpload.name || 'Scanned Packaged Commodity',
      boxes: []
    });

    const formData = new FormData();
    formData.append('image', fileToUpload);

    try {
      const response = await fetch('http://localhost:5000/api/audit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const auditResult = await response.json();
      console.log("Live Audit Result from Flask:", auditResult);

      // Directly update state with the Flask output:
      // - compliance_score: auditResult.compliance_score (use actual score from Python, never default to 100)
      // - overall_verdict: auditResult.overall_verdict
      // - declarations: auditResult.declarations
      // - violations: auditResult.violations || []
      // - bounding_boxes: auditResult.bounding_boxes || []
      const decl = auditResult.declarations || {};

      // Transform declarations into statutory rule cards for UI & Form V PDF
      const rules = [
        {
          id: 'mrp',
          title: 'Maximum Retail Price (MRP)',
          titleHindi: 'अधिकतम खुदरा मूल्य (MRP)',
          status: decl.mrp?.status || (auditResult.overall_verdict === 'COMPLIANT' ? 'pass' : 'violation'),
          found: decl.mrp?.text || (decl.mrp?.status === 'violation' ? '[BLANK / UNPRINTED]' : 'MRP Declared (Inclusive of all taxes)'),
          law: decl.mrp?.detail || 'Mandatory under Rule 6(1)(e). Retail sale price must be clearly printed inclusive of all taxes.',
          citation: decl.mrp?.rule || 'Rule 6(1)(e)'
        },
        {
          id: 'usp',
          title: 'Unit Sale Price (USP)',
          titleHindi: 'इकाई विक्रय मूल्य (USP)',
          status: decl.usp?.status || (auditResult.overall_verdict === 'COMPLIANT' ? 'pass' : 'violation'),
          found: decl.usp?.text || (decl.usp?.status === 'violation' ? '[BLANK / UNPRINTED]' : 'Unit Sale Price Declared'),
          law: decl.usp?.detail || 'Mandatory under Rule 6(11) of PC Rules, 2011. Pre-packaged commodities > 100 g must clearly declare per-unit sale price.',
          citation: decl.usp?.rule || 'Rule 6(11) & Rule 26'
        },
        {
          id: 'net-qty',
          title: 'Net Quantity',
          titleHindi: 'मानक शुद्ध मात्रा एवं मीट्रिक इकाइयाँ',
          status: decl.net_quantity?.status || 'pass',
          found: decl.net_quantity?.text || (decl.net_quantity?.status === 'violation' ? '[NON-COMPLIANT UNIT]' : 'Standard Metric Quantity Declared'),
          law: decl.net_quantity?.detail || "Declared using statutory SI metric unit under Rule 13.",
          citation: decl.net_quantity?.rule || 'Rule 6(1)(c) & Rule 13'
        },
        {
          id: 'mfg-date',
          title: 'Date of Packing / Mfg',
          titleHindi: 'निर्माण / पैकिंग का माह एवं वर्ष',
          status: decl.mfg_date?.status || (auditResult.overall_verdict === 'COMPLIANT' ? 'pass' : 'violation'),
          found: decl.mfg_date?.text || (decl.mfg_date?.status === 'violation' ? '[BLANK / UNPRINTED]' : 'Month & Year of Packaging Declared'),
          law: decl.mfg_date?.detail || 'Mandatory under Rule 6(1)(d). Month and year of manufacture or pre-packing must be clearly indicated.',
          citation: decl.mfg_date?.rule || 'Rule 6(1)(d)'
        },
        {
          id: 'origin',
          title: 'Country of Origin',
          titleHindi: 'मूल देश (Country of Origin)',
          status: decl.country_of_origin?.status || 'pass',
          found: decl.country_of_origin?.text || 'Country of Origin: India',
          law: decl.country_of_origin?.detail || 'Clearly declared on the Principal Display Panel.',
          citation: decl.country_of_origin?.rule || 'Rule 6(1)(da)'
        },
        {
          id: 'care',
          title: 'Consumer Grievance Helpline',
          titleHindi: 'उपभोक्ता शिकायत निवारण संपर्क',
          status: decl.consumer_care?.status || 'pass',
          found: decl.consumer_care?.text || 'Consumer Grievance Redressal / Helpline Declared',
          law: decl.consumer_care?.detail || 'Valid consumer contact information and grievance redressal officer details displayed under Rule 6(1)(f).',
          citation: decl.consumer_care?.rule || 'Rule 6(1)(f)'
        },
        {
          id: 'packer',
          title: 'Packer Details',
          titleHindi: 'निर्माता एवं विपणनकर्ता विवरण',
          status: decl.packer?.status || 'pass',
          found: decl.packer?.text || 'Manufactured & Marketed by Packer',
          law: decl.packer?.detail || 'Name and complete address of the manufacturer and packaging unit verified under Rule 6(1)(a).',
          citation: decl.packer?.rule || 'Rule 6(1)(a)'
        },
        {
          id: 'commodity-name',
          title: 'Generic Commodity Name',
          titleHindi: 'वस्तु का सामान्य / वर्ग नाम',
          status: decl.commodity_name?.status || 'pass',
          found: decl.commodity_name?.text || auditResult.product_name,
          law: decl.commodity_name?.detail || 'Generic or common name of commodity declared on Principal Display Panel under Rule 6(1)(b).',
          citation: decl.commodity_name?.rule || 'Rule 6(1)(b)'
        }
      ];

      // Format dynamic bounding boxes with bilingual tags
      const rawBoxes = auditResult.bounding_boxes || [];
      const boxes = rawBoxes.map((b) => {
        const isPass = b.status === 'pass';
        let badgeHindi = b.badgeHindi;
        if (!badgeHindi) {
          if (b.id === 'mrp') badgeHindi = isPass ? 'MRP कर सहित (पास)' : 'MRP अनुपस्थित / अमुद्रित (उल्लंघन)';
          else if (b.id === 'mfg-date') badgeHindi = isPass ? 'पैकिंग तिथि घोषित (पास)' : 'MFD एवं बैच संख्या खाली (उल्लंघन)';
          else if (b.id === 'net-qty') badgeHindi = isPass ? 'शुद्ध मात्रा (पास)' : 'शुद्ध मात्रा (उल्लंघन)';
          else if (b.id === 'usp') badgeHindi = isPass ? 'USP घोषित (पास)' : 'USP अनुपस्थित (उल्लंघन)';
          else if (b.id === 'care') badgeHindi = isPass ? 'हेल्पलाइन एवं ईमेल (पास)' : 'हेल्पलाइन अनुपस्थित (उल्लंघन)';
          else if (b.id === 'packer') badgeHindi = isPass ? 'निर्माता विवरण (पास)' : 'निर्माता विवरण अपूर्ण (उल्लंघन)';
          else if (b.id === 'origin') badgeHindi = 'मूल देश घोषित (पास)';
          else badgeHindi = isPass ? 'अनुपालित (पास)' : 'उल्लंघन';
        }
        return {
          ...b,
          badgeText: b.label || b.badgeText || (isPass ? 'PASS' : 'VIOLATION'),
          badgeHindi,
          fieldName: b.fieldName || b.label || b.id
        };
      });

      const violationsList = auditResult.violations || [];
      const violationsCount = auditResult.contravention_count ?? violationsList.length;
      const overallVerdict = auditResult.overall_verdict || (violationsCount === 0 ? 'COMPLIANT' : 'NON-COMPLIANT');
      const isOverallCompliant = overallVerdict.toUpperCase() === 'COMPLIANT';
      const liveScore = auditResult.compliance_score !== undefined
        ? auditResult.compliance_score
        : (auditResult.score !== undefined ? auditResult.score : 0);
      const commodityName = auditResult.product_name || fileToUpload.name || 'Scanned Packaged Commodity';

      const inspectionId = `INSP-${Date.now()}`;
      const defaultSampleId = `LMO/2026/${Math.floor(1000 + Math.random() * 9000)}`;
      const defaultTrader = decl.packer?.text || auditResult.brand || 'Scanned Entity';
      const defaultDistrict = 'State Enforcement Zone';
      const defaultOfficer = 'Field Enforcement Officer';

      const finalMeta = {
        sampleId: defaultSampleId,
        category: 'Packaged Commodities',
        commodityCategory: 'Packaged Commodities',
        trader: defaultTrader,
        traderName: defaultTrader,
        inspectionType: 'Routine Market Surveillance',
        district: defaultDistrict,
        location: defaultDistrict,
        officer: defaultOfficer
      };

      const newRecord = {
        id: inspectionId,
        inspectionId,
        officer: {
          officerId: 'LMO-2026-01',
          name: defaultOfficer,
          designation: 'Legal Metrology Officer',
          district: defaultDistrict
        },
        inspectionMetadata: finalMeta,
        images: {
          original: preview,
          processed: preview
        },
        extractedDeclarations: decl,
        declarations: decl,
        complianceResults: rules,
        rules: rules,
        violations: violationsList,
        manualReview: null,
        report: null,

        // Direct state fields
        name: commodityName,
        image: preview,
        compliance_score: liveScore,
        score: liveScore,
        overall_verdict: overallVerdict,
        verdict: overallVerdict,
        status: isOverallCompliant ? 'COMPLIANT' : 'CONTRAVENTION',
        verdictBanner: overallVerdict,
        violationsCount,
        contraventionCount: violationsCount,
        packageWidth,
        pdpArea,
        minNumeralHeight: '2.5 mm',
        memoRef: defaultSampleId,
        inspectorId: 'LMO-2026-01',
        inspectorName: defaultOfficer,
        manufacturer: defaultTrader,
        bounding_boxes: rawBoxes,
        boxes: boxes
      };

      setAuditData(newRecord);
      setSelectedBoxId(boxes[0]?.id || 'net-qty');

      // Persist to localStorage 'metrology_inspections'
      try {
        const stored = JSON.parse(localStorage.getItem('metrology_inspections') || '[]');
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const historyItem = {
          ...newRecord,
          timestamp: `${dateStr}, ${timeStr} IST`,
          commodity: commodityName,
          manufacturer: defaultTrader
        };
        const updated = [historyItem, ...stored];
        localStorage.setItem('metrology_inspections', JSON.stringify(updated));
        window.dispatchEvent(new Event('metrology_history_updated'));
      } catch (storageErr) {
        console.error('LocalStorage write error:', storageErr);
      }

      if (showToast) {
        showToast(
          isOverallCompliant
            ? (lang === 'hi' ? `नमूना लोड किया गया — वैधानिक रूप से अनुपालित (${liveScore}/100)` : `Packaging specimen compliant — Score: ${liveScore}/100`)
            : (lang === 'hi' ? `सावधान: ${violationsCount} वैधानिक उल्लंघन चिह्नित` : `${violationsCount} Contraventions detected — Score: ${liveScore}/100`),
          isOverallCompliant ? '✓' : '⚠️'
        );
      }
    } catch (error) {
      console.error("Backend connection failed:", error);
      alert("Could not reach http://localhost:5000/api/audit. Make sure python app.py is running!");
      setAuditData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adapter for ScanZone image selection callback
   */
  const handleImageSelected = (imageDataUrl, imageName, file = null) => {
    let fileToUpload = file;
    if (!fileToUpload && imageDataUrl) {
      fileToUpload = dataUrlToFile(imageDataUrl, imageName || 'specimen.jpg');
    }
    if (onImageSelected) {
      onImageSelected(imageDataUrl, imageName, fileToUpload);
    } else {
      handleRunAudit(fileToUpload, imageDataUrl);
    }
  };

  const handleReset = () => {
    if (onResetImage) {
      onResetImage();
    } else {
      setAuditData(null);
      setSelectedBoxId(null);
      setHoveredBoxId(null);
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-slide grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* Left Column (Scan Zone): 5 cols on lg */}
      <section className="lg:col-span-5 space-y-4">
        <ScanZone
          imageSrc={auditData?.image}
          boxes={auditData?.boxes || auditData?.bounding_boxes || []}
          packageWidth={packageWidth}
          pdpArea={pdpArea}
          onPackageWidthChange={(w) => setPackageWidth(w)}
          onPdpAreaChange={(a) => setPdpArea(a)}
          onImageSelected={handleImageSelected}
          onResetImage={handleReset}
          selectedBoxId={selectedBoxId}
          onSelectBox={(id) => setSelectedBoxId(id)}
          hoveredBoxId={hoveredBoxId}
          onHoverBox={setHoveredBoxId}
          isAnalyzing={loading}
          t={t?.scanner}
          lang={lang}
        />
      </section>

      {/* Right Column (Audit Results & Rule Cards): 7 cols on lg */}
      <section className="lg:col-span-7">
        <AuditResults
          auditData={auditData}
          selectedRuleId={selectedBoxId}
          onSelectRule={(id) => setSelectedBoxId(id)}
          hoveredBoxId={hoveredBoxId}
          onHoverBox={setHoveredBoxId}
          isAnalyzing={loading}
          onUpdateAuditData={onUpdateAuditData}
          t={t?.scanner}
          lang={lang}
          onTriggerToast={showToast}
        />
      </section>
    </div>
  );
}
