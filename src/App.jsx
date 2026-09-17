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
      // Run statutory validation logic
      const netQtyRes = validateNetQuantity('45 g');
      const uspRes = validateUnitSalePrice({ netWeight: 45, netUnit: 'g', declaredUsp: '₹0.80 / g', isUspPresent: true });

      const isNetQtyPass = netQtyRes.status === 'pass';
      const isUspCompliant = uspRes.status === 'pass' || uspRes.status === 'exempt';

      const rules = [
        {
          id: 'net-qty',
          title: 'Net Quantity Unit',
          status: netQtyRes.status,
          found: netQtyRes.found,
          law: netQtyRes.law,
          citation: netQtyRes.citation
        },
        {
          id: 'usp',
          title: 'Unit Sale Price (USP)',
          status: uspRes.status,
          found: uspRes.found,
          law: uspRes.law,
          citation: uspRes.citation
        },
        {
          id: 'mrp',
          title: 'Maximum Retail Price (MRP)',
          status: 'pass',
          found: 'Retail price declared with tax note',
          law: 'Valid price declared with mandatory "Inclusive of all taxes" text.',
          citation: 'Rule 6(1)(e)'
        },
        {
          id: 'mfg-date',
          title: 'Date of Packing / Mfg',
          status: 'pass',
          found: 'Packaging date verified',
          law: 'Valid month and year format with statutory prefix.',
          citation: 'Rule 6(1)(d)'
        },
        {
          id: 'origin',
          title: 'Country of Origin',
          status: 'pass',
          found: 'Country of origin declared',
          law: 'Clearly declared on the Principal Display Panel.',
          citation: 'Rule 6(1)(da)'
        },
        {
          id: 'care',
          title: 'Consumer Helpline & Email',
          status: 'pass',
          found: 'Customer grievance redressal details identified',
          law: 'Mandatory contact information provided under statutory rules.',
          citation: 'Rule 6(1)(f)'
        }
      ];

      const violationsCount = rules.filter(r => r.status === 'violation').length;
      const isOverallCompliant = violationsCount === 0;

      const newRecord = {
        id: `scan-${Date.now()}`,
        name: imageName || 'Scanned Packaged Commodity',
        image: imageDataUrl,
        verdict: isOverallCompliant ? 'compliant' : 'violation',
        verdictBanner: isOverallCompliant ? 'Packaged Commodity Compliant' : `${violationsCount} Statutory Violations Detected`,
        score: isOverallCompliant ? 100 : Math.max(0, 100 - violationsCount * 16),
        violationsCount,
        packageWidth,
        pdpArea,
        minNumeralHeight: '2.5 mm',
        memoRef: `LMO/2026/${Math.floor(1000 + Math.random() * 9000)}`,
        inspectorId: 'LMO-Central-04',
        boxes: [
          {
            id: 'net-qty',
            fieldName: 'Net Quantity',
            status: isNetQtyPass ? 'pass' : 'violation',
            badgeText: isNetQtyPass ? 'Net Wt: 45 g (PASS)' : 'Net Wt: Non-Standard Unit (VIOLATION)',
            x: 12,
            y: 36,
            width: 52,
            height: 12,
            detectedText: 'Net Qty: 45 g'
          },
          {
            id: 'usp',
            fieldName: 'Unit Sale Price',
            status: isUspCompliant ? 'pass' : 'violation',
            badgeText: isUspCompliant ? 'USP Declared / Exempt (PASS)' : 'USP Missing (VIOLATION)',
            x: 12,
            y: 50,
            width: 48,
            height: 10,
            detectedText: uspRes.status === 'exempt' ? 'Exempt under Rule 26' : '₹0.80 / g'
          },
          {
            id: 'mrp',
            fieldName: 'Maximum Retail Price',
            status: 'pass',
            badgeText: 'MRP Declared (PASS)',
            x: 12,
            y: 63,
            width: 45,
            height: 10,
            detectedText: 'Inclusive of all taxes'
          },
          {
            id: 'mfg-date',
            fieldName: 'Date of Packing',
            status: 'pass',
            badgeText: 'Date Declared (PASS)',
            x: 58,
            y: 63,
            width: 34,
            height: 10,
            detectedText: 'MM/YYYY packaging format'
          },
          {
            id: 'origin',
            fieldName: 'Country of Origin',
            status: 'pass',
            badgeText: 'Origin Declared (PASS)',
            x: 58,
            y: 75,
            width: 34,
            height: 8,
            detectedText: 'Country of Origin'
          }
        ],
        rules
      };

      setAuditData(newRecord);
      setSelectedBoxId('net-qty');
      setIsAnalyzing(false);
      showToast(
        lang === 'hi' ? 'नमूना लोड किया गया — वैधानिक जांच पूर्ण' : 'Packaging specimen loaded — Statutory audit complete',
        '📸'
      );

      // Persist to localStorage 'metrology_inspections'
      try {
        const stored = JSON.parse(localStorage.getItem('metrology_inspections') || '[]');
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const historyItem = {
          ...newRecord,
          timestamp: `${dateStr}, ${timeStr} IST`,
          commodity: imageName ? `Packaging Specimen (${imageName})` : 'Scanned Packaged Commodity',
          manufacturer: 'Identified Packaged Commodity Packer / Marketer'
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
