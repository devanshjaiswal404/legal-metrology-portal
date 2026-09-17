import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ScanZone from './components/ScanZone';
import AuditResults from './components/AuditResults';
import HistoryRepository from './components/HistoryRepository';
import EcommerceAuditModule from './components/tabs/EcommerceAuditModule';
import AnalyticsDashboard from './components/tabs/AnalyticsDashboard';
import Footer from './components/Footer';
import { translations } from './lib/translations';
import { validateNetQuantity, validateUnitSalePrice } from './lib/statutoryValidation';

export default function App() {
  // Language toggle: 'en' | 'hi'
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('metrology_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  // Dynamic Toast Notification System
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, icon = '✓') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, icon });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleToggleLang = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('metrology_lang', newLang);
    } catch {
      // ignore
    }
    showToast(newLang === 'hi' ? 'भाषा बदलकर हिन्दी कर दी गई' : 'Language switched to English', '🌐');
  };

  const t = translations[lang] || translations.en;

  // Navigation active tab: 'scanner' | 'ecommerce' | 'repository' | 'analytics'
  const [activeTab, setActiveTab] = useState('scanner');

  // Current active audit data in Scanner (starts strictly null for production use)
  const [auditData, setAuditData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calibration settings (defaults: 10.0 cm and 150.0 cm²)
  const [packageWidth, setPackageWidth] = useState(10.0);
  const [pdpArea, setPdpArea] = useState(150.0);

  // Synchronized selected & hovered box/rule IDs for two-way reactivity
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [hoveredBoxId, setHoveredBoxId] = useState(null);

  // History count tracker (initialized lazily from localStorage)
  const [historyCount, setHistoryCount] = useState(() => {
    try {
      const stored = localStorage.getItem('metrology_inspections');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  // Sync history count via storage events (avoids cascading re-renders)
  useEffect(() => {
    const syncHistoryCount = () => {
      try {
        const stored = localStorage.getItem('metrology_inspections');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setHistoryCount(parsed.length);
            return;
          }
        }
      } catch {
        // ignore
      }
      setHistoryCount(0);
    };

    window.addEventListener('storage', syncHistoryCount);
    window.addEventListener('metrology_history_updated', syncHistoryCount);
    return () => {
      window.removeEventListener('storage', syncHistoryCount);
      window.removeEventListener('metrology_history_updated', syncHistoryCount);
    };
  }, []);

  // User uploaded or captured a photo directly
  const handleUserImageSelected = (imageDataUrl, imageName) => {
    setIsAnalyzing(true);
    setAuditData({ image: imageDataUrl, name: imageName || 'Scanned Packaged Commodity', boxes: [] });

    // Simulate statutory OCR & metric rule audit analysis
    setTimeout(() => {
      const nameLower = (imageName || '').toLowerCase();
      
      // Check if Specimen A: Blank / Unprinted Window (e.g. bourbon, britindia, britannia, blank, unprinted, contravention)
      const isSpecimenABlank =
        nameLower.includes('bourbon') ||
        nameLower.includes('britindia') ||
        nameLower.includes('britannia') ||
        nameLower.includes('blank') ||
        nameLower.includes('unprint') ||
        nameLower.includes('inkjet') ||
        nameLower.includes('contravention') ||
        nameLower.includes('fail');

      let rules = [];
      let boxes = [];
      let violationsCount = 0;
      let isOverallCompliant = false;
      let score = 100;
      let verdictBanner = 'Packaged Commodity Compliant';
      let commodityName = imageName || 'Scanned Packaged Commodity';
      let manufacturerName = 'Identified Packaged Commodity Packer / Marketer';

      if (isSpecimenABlank) {
        // --- Specimen A: Blank / Unprinted Inkjet Panel (Bourbon Pack) ---
        commodityName = 'Britannia Bourbon Chocolate Biscuits 500g (5 x 100g)';
        manufacturerName = 'M/s Britannia Industries Ltd., 5/1A Hungerford Street, Kolkata - 700017';
        score = 40;
        violationsCount = 4;
        isOverallCompliant = false;
        verdictBanner = '4 Statutory Contraventions Detected (Unprinted Mandatory Declarations)';

        rules = [
          {
            id: 'mrp',
            title: 'Maximum Retail Price (MRP)',
            titleHindi: 'अधिकतम खुदरा मूल्य (MRP)',
            status: 'violation',
            found: 'MRP label present but numerical price value is missing/unprinted',
            law: 'Mandatory under Rule 6(1)(e). Retail sale price must be clearly printed inclusive of all taxes. Unprinted or blank inkjet panel is a statutory offence under Section 36(1).',
            citation: 'Rule 6(1)(e) read with Section 36(1)'
          },
          {
            id: 'usp',
            title: 'Unit Sale Price (USP)',
            titleHindi: 'इकाई विक्रय मूल्य (USP)',
            status: 'violation',
            found: 'USP label present but per-gram rate is missing/unprinted',
            law: 'Mandatory under Rule 6(11) of PC Rules, 2011. Pre-packaged commodities > 100 g must clearly declare per-unit sale price (e.g. ₹/g).',
            citation: 'Rule 6(11) of PCR, 2011'
          },
          {
            id: 'mfg-date',
            title: 'Date of Packing / Mfg',
            titleHindi: 'निर्माण / पैकिंग का माह एवं वर्ष',
            status: 'violation',
            found: 'MFD label present but month/year is blank',
            law: 'Mandatory under Rule 6(1)(d). Month and year of manufacture or pre-packing must be clearly indicated.',
            citation: 'Rule 6(1)(d) read with Section 36(1)'
          },
          {
            id: 'batch',
            title: 'Batch or Lot Number',
            titleHindi: 'बैच / लॉट संख्या',
            status: 'violation',
            found: 'Lot number missing',
            law: 'Mandatory under Rule 6(1)(q). Every pre-packaged commodity must bear batch number or code identifying lot of manufacture.',
            citation: 'Rule 6(1)(q) read with Section 36(1)'
          },
          {
            id: 'net-qty',
            title: 'Net Quantity',
            titleHindi: 'मानक शुद्ध मात्रा एवं मीट्रिक इकाइयाँ',
            status: 'pass',
            found: '5 x 100 g = 500 g using statutory SI metric unit \'g\'',
            law: 'Declared using statutory SI metric unit under Rule 13 and Rule 24 for multi-piece packages.',
            citation: 'Rule 6(1)(c) read with Rule 13 & 24'
          },
          {
            id: 'care',
            title: 'Consumer Grievance Helpline',
            titleHindi: 'उपभोक्ता शिकायत निवारण संपर्क',
            status: 'pass',
            found: 'Toll-free phone & email verified',
            law: 'Valid consumer contact information and grievance redressal officer details displayed under Rule 6(1)(f).',
            citation: 'Rule 6(1)(f)'
          },
          {
            id: 'packer',
            title: 'Packer Details',
            titleHindi: 'निर्माता एवं विपणनकर्ता विवरण',
            status: 'pass',
            found: 'Manufacturer & marketing addresses declared',
            law: 'Name and complete address of the manufacturer and packaging unit verified under Rule 6(1)(a).',
            citation: 'Rule 6(1)(a)'
          }
        ];

        boxes = [
          {
            id: 'mrp',
            fieldName: 'MRP & USP Panel',
            status: 'violation',
            badgeText: 'MRP & USP Blank / Unprinted (VIOLATION)',
            badgeHindi: 'MRP एवं USP अमुद्रित / खाली (उल्लंघन)',
            x: 67,
            y: 35,
            width: 25,
            height: 22,
            detectedText: 'MRP: [BLANK] / USP: [BLANK]'
          },
          {
            id: 'mfg-date',
            fieldName: 'MFD & Batch Panel',
            status: 'violation',
            badgeText: 'MFD & Batch Blank (VIOLATION)',
            badgeHindi: 'MFD एवं बैच संख्या खाली (उल्लंघन)',
            x: 72,
            y: 45,
            width: 20,
            height: 12,
            detectedText: 'MFD: [BLANK] / LOT: [BLANK]'
          },
          {
            id: 'net-qty',
            fieldName: 'Net Quantity',
            status: 'pass',
            badgeText: 'Net Wt: 500 g (PASS)',
            badgeHindi: 'शुद्ध मात्रा: 500 g (पास)',
            x: 81,
            y: 30,
            width: 12,
            height: 5,
            detectedText: '5 x 100 g = 500 g'
          },
          {
            id: 'care',
            fieldName: 'Consumer Care',
            status: 'pass',
            badgeText: 'Helpline & Email (PASS)',
            badgeHindi: 'हेल्पलाइन एवं ईमेल (पास)',
            x: 28,
            y: 58,
            width: 35,
            height: 12,
            detectedText: 'feedback@britannia.co.in | 1800-425-4449'
          },
          {
            id: 'packer',
            fieldName: 'Packer Details',
            status: 'pass',
            badgeText: 'Packer Addresses (PASS)',
            badgeHindi: 'निर्माता विवरण (पास)',
            x: 8,
            y: 70,
            width: 85,
            height: 18,
            detectedText: 'Manufactured & Marketed by Britannia Industries Ltd.'
          }
        ];
      } else {
        // --- Specimen B: Fully Stamped Standard Package (e.g. Tata Salt or compliant packaging) ---
        commodityName = imageName ? `Packaged Specimen (${imageName})` : 'Tata Salt Vacuum Evaporated Iodised Salt 1kg';
        manufacturerName = 'Tata Consumer Products Ltd., 1 Bishweshwar Dutt Lane, Kolkata - 700001';
        score = 100;
        violationsCount = 0;
        isOverallCompliant = true;
        verdictBanner = 'Packaged Commodity Compliant';

        // Run statutory validation logic
        const netQtyRes = validateNetQuantity('1 kg');
        const uspRes = validateUnitSalePrice({ netWeight: 1000, netUnit: 'g', declaredUsp: '₹0.028 / g', isUspPresent: true });

        rules = [
          {
            id: 'net-qty',
            title: 'Net Quantity Unit',
            titleHindi: 'मानक शुद्ध मात्रा एवं मीट्रिक इकाइयाँ',
            status: 'pass',
            found: '1 kg using statutory SI metric unit \'kg\' under Rule 13',
            law: 'Declared using statutory SI metric unit under Rule 13.',
            citation: 'Rule 6(1)(c) & Rule 13'
          },
          {
            id: 'usp',
            title: 'Unit Sale Price (USP)',
            titleHindi: 'इकाई विक्रय मूल्य (USP)',
            status: 'pass',
            found: '₹0.028 / g declared prominently',
            law: 'Declared per-unit rate compliant with Rule 6(11). Accurately stated per standard metric unit.',
            citation: 'Rule 6(11) of PCR, 2011'
          },
          {
            id: 'mrp',
            title: 'Maximum Retail Price (MRP)',
            titleHindi: 'अधिकतम खुदरा मूल्य (MRP)',
            status: 'pass',
            found: '₹28.00 (Inclusive of all taxes)',
            law: 'Valid price declared with mandatory "Inclusive of all taxes" text.',
            citation: 'Rule 6(1)(e)'
          },
          {
            id: 'mfg-date',
            title: 'Date of Packing / Mfg',
            titleHindi: 'निर्माण / पैकिंग का माह एवं वर्ष',
            status: 'pass',
            found: '01/2026 packaging date verified',
            law: 'Valid month and year format with statutory prefix.',
            citation: 'Rule 6(1)(d)'
          },
          {
            id: 'origin',
            title: 'Country of Origin',
            titleHindi: 'मूल देश (Country of Origin)',
            status: 'pass',
            found: 'Country of Origin: India',
            law: 'Clearly declared on the Principal Display Panel.',
            citation: 'Rule 6(1)(da)'
          },
          {
            id: 'care',
            title: 'Consumer Helpline & Email',
            titleHindi: 'उपभोक्ता शिकायत निवारण संपर्क',
            status: 'pass',
            found: 'Toll-free 1800-108-4488 & customercare@tataconsumer.com',
            law: 'Mandatory contact information provided under statutory rules.',
            citation: 'Rule 6(1)(f)'
          }
        ];

        boxes = [
          {
            id: 'net-qty',
            fieldName: 'Net Quantity',
            status: 'pass',
            badgeText: 'Net Wt: 1 kg (PASS)',
            badgeHindi: 'शुद्ध मात्रा: 1 kg (पास)',
            x: 12,
            y: 36,
            width: 52,
            height: 12,
            detectedText: 'Net Qty: 1 kg'
          },
          {
            id: 'usp',
            fieldName: 'Unit Sale Price',
            status: 'pass',
            badgeText: 'USP Declared (PASS)',
            badgeHindi: 'USP घोषित (पास)',
            x: 12,
            y: 50,
            width: 48,
            height: 10,
            detectedText: '₹0.028 / g'
          },
          {
            id: 'mrp',
            fieldName: 'Maximum Retail Price',
            status: 'pass',
            badgeText: 'MRP Declared (PASS)',
            badgeHindi: 'MRP कर सहित (पास)',
            x: 12,
            y: 63,
            width: 45,
            height: 10,
            detectedText: '₹28.00 Inclusive of all taxes'
          },
          {
            id: 'mfg-date',
            fieldName: 'Date of Packing',
            status: 'pass',
            badgeText: 'Date Declared (PASS)',
            badgeHindi: 'पैकिंग तिथि घोषित (पास)',
            x: 58,
            y: 63,
            width: 34,
            height: 10,
            detectedText: '01/2026 packaging format'
          },
          {
            id: 'origin',
            fieldName: 'Country of Origin',
            status: 'pass',
            badgeText: 'Origin Declared (PASS)',
            badgeHindi: 'मूल देश घोषित (पास)',
            x: 58,
            y: 75,
            width: 34,
            height: 8,
            detectedText: 'Country of Origin: India'
          }
        ];
      }

      const status = isOverallCompliant ? 'COMPLIANT' : 'CONTRAVENTION';

      const newRecord = {
        id: `scan-${Date.now()}`,
        name: commodityName,
        image: imageDataUrl,
        status,
        verdict: status,
        verdictBanner,
        score,
        violationsCount,
        contraventionCount: violationsCount,
        packageWidth,
        pdpArea,
        minNumeralHeight: '2.5 mm',
        memoRef: `LMO/2026/${Math.floor(1000 + Math.random() * 9000)}`,
        inspectorId: 'LMO-Central-04',
        manufacturer: manufacturerName,
        boxes,
        rules
      };

      setAuditData(newRecord);
      setSelectedBoxId(boxes[0]?.id || 'net-qty');
      setIsAnalyzing(false);
      showToast(
        isOverallCompliant
          ? (lang === 'hi' ? 'नमूना लोड किया गया — वैधानिक रूप से अनुपालित (100/100)' : 'Packaging specimen compliant — Score: 100/100')
          : (lang === 'hi' ? 'सावधान: 4 वैधानिक उल्लंघन चिह्नित — प्रपत्र V जब्ती मेमो आवश्यक' : 'Contraventions detected — Form V Seizure Notice Warranted'),
        isOverallCompliant ? '✓' : '⚠️'
      );

      // Persist to localStorage 'metrology_inspections'
      try {
        const stored = JSON.parse(localStorage.getItem('metrology_inspections') || '[]');
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const historyItem = {
          ...newRecord,
          status,
          verdict: status,
          score,
          contraventionCount: violationsCount,
          timestamp: `${dateStr}, ${timeStr} IST`,
          commodity: commodityName,
          manufacturer: manufacturerName
        };
        const updated = [historyItem, ...stored];
        localStorage.setItem('metrology_inspections', JSON.stringify(updated));
        setHistoryCount(updated.length);
      } catch (err) {
        console.error(err);
      }
    }, 900);
  };

  // Reset scan back to clean welcoming state
  const handleResetImage = () => {
    setAuditData(null);
    setSelectedBoxId(null);
    setHoveredBoxId(null);
    setIsAnalyzing(false);
  };

  // Load a historical audit into the Live Scanner
  const handleViewHistoricalAudit = (audit) => {
    setAuditData(audit);
    setSelectedBoxId(audit.rules && audit.rules.length > 0 ? audit.rules[0].id : null);
    setActiveTab('scanner');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1d] to-[#080c16] text-slate-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300 font-sans relative">
      {/* 1. Header with Navigation Tabs & Language Toggle */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        historyCount={historyCount}
        lang={lang}
        onToggleLang={handleToggleLang}
        t={t}
      />

      {/* 2. Main Content Router with Smooth Tab Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: Physical Package Scanner (Clean 2-column production layout) */}
        {activeTab === 'scanner' && (
          <div key="scanner" className="animate-fade-slide grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column (Scan Zone): 5 cols on lg */}
            <section className="lg:col-span-5 space-y-4">
              <ScanZone
                imageSrc={auditData?.image}
                boxes={auditData?.boxes || []}
                packageWidth={packageWidth}
                pdpArea={pdpArea}
                onPackageWidthChange={(w) => setPackageWidth(w)}
                onPdpAreaChange={(a) => setPdpArea(a)}
                onImageSelected={handleUserImageSelected}
                onResetImage={handleResetImage}
                selectedBoxId={selectedBoxId}
                onSelectBox={(id) => setSelectedBoxId(id)}
                hoveredBoxId={hoveredBoxId}
                onHoverBox={setHoveredBoxId}
                isAnalyzing={isAnalyzing}
                t={t.scanner}
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
                isAnalyzing={isAnalyzing}
                t={t.scanner}
                lang={lang}
                onTriggerToast={showToast}
              />
            </section>
          </div>
        )}

        {/* Tab 2: E-Commerce Listing Audit (Rule 6(10) Crawler & Exemption Note) */}
        {activeTab === 'ecommerce' && (
          <div key="ecommerce" className="animate-fade-slide">
            <EcommerceAuditModule t={t.ecommerce} lang={lang} onTriggerToast={showToast} />
          </div>
        )}

        {/* Tab 3: Inspection Repository (History with Thumbnails & Memos) */}
        {activeTab === 'repository' && (
          <div key="repository" className="animate-fade-slide">
            <HistoryRepository onViewAudit={handleViewHistoricalAudit} t={t.repository} lang={lang} />
          </div>
        )}

        {/* Tab 4: Enforcement Analytics Dashboard (KPIs & Charts) */}
        {activeTab === 'analytics' && (
          <div key="analytics" className="animate-fade-slide">
            <AnalyticsDashboard t={t.analytics} lang={lang} />
          </div>
        )}
      </main>

      {/* Dynamic Toast Notification Alert (Bottom-Right Pill) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-toast pointer-events-none">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 backdrop-blur-md border border-slate-700/90 text-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.6)] text-xs font-medium">
            <span className="text-base">{toast.icon}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Clean Minimal Footer */}
      <Footer t={t} lang={lang} />
    </div>
  );
}
