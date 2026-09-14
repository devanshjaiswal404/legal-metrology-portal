import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScanZone from './components/ScanZone';
import AuditResults from './components/AuditResults';
import HistoryRepository from './components/HistoryRepository';
import EcommerceAuditModule from './components/tabs/EcommerceAuditModule';
import AnalyticsDashboard from './components/tabs/AnalyticsDashboard';
import Footer from './components/Footer';
import { translations } from './lib/translations';

export default function App() {
  // Language toggle: 'en' | 'hi'
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('metrology_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const handleToggleLang = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('metrology_lang', newLang);
    } catch {
      // ignore
    }
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

  // Synchronized selected box/rule ID
  const [selectedBoxId, setSelectedBoxId] = useState(null);

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
      const newRecord = {
        id: `scan-${Date.now()}`,
        name: imageName || 'Scanned Packaged Commodity',
        image: imageDataUrl,
        verdict: 'violation',
        verdictBanner: '2 Statutory Violations Detected',
        score: 68,
        violationsCount: 2,
        packageWidth,
        pdpArea,
        minNumeralHeight: '2.5 mm',
        memoRef: `LMO/2026/${Math.floor(1000 + Math.random() * 9000)}`,
        inspectorId: 'LMO-Central-04',
        boxes: [
          {
            id: 'net-qty',
            fieldName: 'Net Quantity',
            status: 'violation',
            badgeText: 'Net Wt: Non-Standard Unit (VIOLATION)',
            x: 12,
            y: 36,
            width: 52,
            height: 12,
            detectedText: 'Net Qty declaration'
          },
          {
            id: 'usp',
            fieldName: 'Unit Sale Price',
            status: 'violation',
            badgeText: 'USP Missing (VIOLATION)',
            x: 12,
            y: 50,
            width: 48,
            height: 10,
            detectedText: 'No USP Declared'
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
        rules: [
          {
            id: 'net-qty',
            title: 'Net Quantity Unit',
            status: 'violation',
            found: 'Non-standard weight symbol detected on packaging panel',
            law: 'Prohibited under Rule 13 and Section 11 of The Act. Statutory SI units strictly required (g, kg, ml, l).',
            citation: 'Rule 6(1)(c) & Rule 13'
          },
          {
            id: 'usp',
            title: 'Unit Sale Price (USP)',
            status: 'violation',
            found: 'No Unit Sale Price declared on label',
            law: 'Mandatory under Rule 6(11) for pre-packaged commodities exceeding 1 kg or 1 L.',
            citation: 'Rule 6(11) of PCR, 2011'
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
        ]
      };

      setAuditData(newRecord);
      setSelectedBoxId('net-qty');
      setIsAnalyzing(false);

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
    setIsAnalyzing(false);
  };

  // Load a historical audit into the Live Scanner
  const handleViewHistoricalAudit = (audit) => {
    setAuditData(audit);
    setSelectedBoxId(audit.rules && audit.rules.length > 0 ? audit.rules[0].id : null);
    setActiveTab('scanner');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-slate-700 selection:text-white font-sans">
      {/* 1. Header with Navigation Tabs & Language Toggle */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        historyCount={historyCount}
        lang={lang}
        onToggleLang={handleToggleLang}
        t={t}
      />

      {/* 2. Main Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: Physical Package Scanner (Clean 2-column production layout) */}
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
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
                isAnalyzing={isAnalyzing}
                t={t.scanner}
                lang={lang}
              />
            </section>
          </div>
        )}

        {/* Tab 2: E-Commerce Listing Audit (Rule 6(10) Crawler & Exemption Note) */}
        {activeTab === 'ecommerce' && (
          <EcommerceAuditModule t={t.ecommerce} lang={lang} />
        )}

        {/* Tab 3: Inspection Repository (History with Thumbnails & Memos) */}
        {activeTab === 'repository' && (
          <HistoryRepository onViewAudit={handleViewHistoricalAudit} t={t.repository} lang={lang} />
        )}

        {/* Tab 4: Enforcement Analytics Dashboard (KPIs & Charts) */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard t={t.analytics} lang={lang} />
        )}
      </main>

      {/* Clean Minimal Footer */}
      <Footer t={t} lang={lang} />
    </div>
  );
}
