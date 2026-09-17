import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ScanZone from './components/ScanZone';
import AuditResults from './components/AuditResults';
import HistoryRepository from './components/HistoryRepository';
import EcommerceAuditModule from './components/tabs/EcommerceAuditModule';
import PharmaDpcoModule from './components/tabs/PharmaDpcoModule';
import AnalyticsDashboard from './components/tabs/AnalyticsDashboard';
import Footer from './components/Footer';
import { translations } from './lib/translations';
import { validateNetQuantity, validateUnitSalePrice } from './lib/statutoryValidation';
import { analyzePackagingSpecimen } from './services/inspectionService';
import { getCleanInspections } from './utils/storagePurge';
import {
  getStoredOfficerSession,
  saveOfficerSession,
  clearOfficerSession,
  DEFAULT_DEMO_OFFICER
} from './utils/officerSession';
import OfficerLoginModal from './components/auth/OfficerLoginModal';

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

  // Officer Profile & Enforcement Session State
  const [officer, setOfficer] = useState(() => {
    return getStoredOfficerSession() || DEFAULT_DEMO_OFFICER;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Pre-scan Statutory Inspection Metadata Setup
  const [inspectionMetadata, setInspectionMetadata] = useState(() => ({
    sampleId: `LMO/SMP/2026/${Math.floor(1000 + Math.random() * 9000)}`,
    commodityCategory: 'Packaged Food & Snacks',
    traderName: '',
    inspectionType: 'Routine Market Surveillance',
    location: officer?.district || 'Central District'
  }));

  // Synchronize officer session events across windows/tabs
  useEffect(() => {
    const handleSessionChange = (e) => {
      setOfficer(e.detail || null);
    };
    window.addEventListener('metrology_officer_session_changed', handleSessionChange);
    return () => window.removeEventListener('metrology_officer_session_changed', handleSessionChange);
  }, []);

  // Update default district in metadata when officer profile changes
  useEffect(() => {
    if (officer?.district) {
      setInspectionMetadata((prev) => ({
        ...prev,
        location: prev.location === 'Central District' || !prev.location ? officer.district : prev.location
      }));
    }
  }, [officer]);

  const handleLoginSuccess = (officerData) => {
    const saved = saveOfficerSession(officerData);
    setOfficer(saved);
    setIsLoginModalOpen(false);
    showToast(
      lang === 'hi'
        ? `सत्यापित अधिकारी: ${saved.name} (${saved.officerId})`
        : `Authenticated as ${saved.name} (${saved.officerId})`,
      '🛡️'
    );
  };

  const handleLogout = () => {
    clearOfficerSession();
    setOfficer(null);
    showToast(lang === 'hi' ? 'अधिकारी सत्र समाप्त' : 'Officer session logged out', 'ℹ️');
  };

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

  // History count tracker (initialized lazily from clean localStorage)
  const [historyCount, setHistoryCount] = useState(() => {
    return getCleanInspections().length;
  });

  // Sync history count via storage events and perform one-time mount purge
  useEffect(() => {
    const syncHistoryCount = () => {
      const clean = getCleanInspections();
      setHistoryCount(clean.length);
    };

    // Run initial purge on mount
    syncHistoryCount();

    window.addEventListener('storage', syncHistoryCount);
    window.addEventListener('metrology_history_updated', syncHistoryCount);
    return () => {
      window.removeEventListener('storage', syncHistoryCount);
      window.removeEventListener('metrology_history_updated', syncHistoryCount);
    };
  }, []);

  // User uploaded or captured a photo directly
  const handleUserImageSelected = async (imageDataUrl, imageName, file = null, customMetadata = null) => {
    setIsAnalyzing(true);
    setAuditData({ image: imageDataUrl, name: imageName || 'Scanned Packaged Commodity', boxes: [] });

    const activeMeta = customMetadata || inspectionMetadata;

    try {
      // Execute statutory inspection engine (Member 1 backend, Gemini multimodal, or deterministic fallback)
      const inspectionResult = await analyzePackagingSpecimen(imageDataUrl, {
        imageName,
        packageWidth,
        pdpArea,
        file
      });

      const decl = inspectionResult.declarations || {};

      // Transform declarations into statutory rule cards for UI & Form V PDF
      const rules = [
        {
          id: 'mrp',
          title: 'Maximum Retail Price (MRP)',
          titleHindi: 'अधिकतम खुदरा मूल्य (MRP)',
          status: decl.mrp?.status || 'pass',
          found: decl.mrp?.text || (decl.mrp?.status === 'violation' ? '[BLANK / UNPRINTED]' : 'MRP Declared (Inclusive of all taxes)'),
          law: decl.mrp?.detail || 'Mandatory under Rule 6(1)(e). Retail sale price must be clearly printed inclusive of all taxes.',
          citation: decl.mrp?.rule || 'Rule 6(1)(e)'
        },
        {
          id: 'usp',
          title: 'Unit Sale Price (USP)',
          titleHindi: 'इकाई विक्रय मूल्य (USP)',
          status: decl.usp?.status || 'pass',
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
          status: decl.mfg_date?.status || 'pass',
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
          found: decl.commodity_name?.text || inspectionResult.product_name,
          law: decl.commodity_name?.detail || 'Generic or common name of commodity declared on Principal Display Panel under Rule 6(1)(b).',
          citation: decl.commodity_name?.rule || 'Rule 6(1)(b)'
        }
      ];

      // Format dynamic bounding boxes with bilingual tags
      const boxes = (inspectionResult.bounding_boxes || []).map((b) => {
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

      const violationsCount = inspectionResult.contravention_count ?? 0;
      const overall_verdict = inspectionResult.overall_verdict || (violationsCount === 0 ? 'COMPLIANT' : 'NON-COMPLIANT');
      const isOverallCompliant = overall_verdict.toUpperCase() === 'COMPLIANT';
      const status = isOverallCompliant ? 'COMPLIANT' : 'CONTRAVENTION';
      const score = inspectionResult.compliance_score;
      const commodityName = inspectionResult.product_name || imageName || 'Scanned Packaged Commodity';
      const manufacturerName = decl.packer?.text || inspectionResult.brand || 'Identified Packaged Commodity Packer / Marketer';
      const verdictBanner = overall_verdict;

      const inspectionId = `INSP-${Date.now()}`;
      const activeOfficer = officer || {
        officerId: 'LMO-Central-04',
        name: 'Inspector S. Sharma',
        designation: 'Legal Metrology Officer',
        district: 'Central District'
      };

      const finalMeta = {
        sampleId: activeMeta?.sampleId || `LMO/SMP/2026/${Math.floor(1000 + Math.random() * 9000)}`,
        commodityCategory: activeMeta?.commodityCategory || 'Packaged Food & Snacks',
        traderName: activeMeta?.traderName || decl.packer?.text || manufacturerName,
        inspectionType: activeMeta?.inspectionType || 'Routine Market Surveillance',
        location: activeMeta?.location || activeOfficer.district || 'Central District'
      };

      const newRecord = {
        id: inspectionId,
        inspectionId,
        officer: {
          officerId: activeOfficer.officerId,
          name: activeOfficer.name,
          designation: activeOfficer.designation,
          district: activeOfficer.district
        },
        inspectionMetadata: finalMeta,
        images: {
          original: imageDataUrl,
          processed: imageDataUrl
        },
        extractedDeclarations: decl,
        complianceResults: rules,
        violations: inspectionResult.violations || [],
        manualReview: null,
        report: null,

        // Backwards compatibility fields for existing UI & PDF export
        name: commodityName,
        image: imageDataUrl,
        status,
        verdict: overall_verdict,
        overall_verdict,
        verdictBanner,
        score,
        violationsCount,
        contraventionCount: violationsCount,
        packageWidth,
        pdpArea,
        minNumeralHeight: '2.5 mm',
        memoRef: finalMeta.sampleId,
        inspectorId: activeOfficer.officerId,
        manufacturer: finalMeta.traderName || manufacturerName,
        boxes,
        rules
      };

      setAuditData(newRecord);
      setSelectedBoxId(boxes[0]?.id || 'net-qty');
      setIsAnalyzing(false);
      showToast(
        isOverallCompliant
          ? (lang === 'hi' ? 'नमूना लोड किया गया — वैधानिक रूप से अनुपालित (100/100)' : 'Packaging specimen compliant — Score: 100/100')
          : (lang === 'hi' ? `सावधान: ${violationsCount} वैधानिक उल्लंघन चिह्नित — प्रपत्र V जब्ती मेमो आवश्यक` : `${violationsCount} Contraventions detected — Form V Seizure Notice Warranted`),
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
    } catch (error) {
      console.error('Inspection failed:', error);
      setIsAnalyzing(false);
      showToast('Error during statutory audit analysis', '⚠️');
    }
  };

  // Handle manual officer review update from AuditResults modal
  const handleUpdateAuditData = (updatedAudit) => {
    setAuditData(updatedAudit);

    // Synchronize update to local storage inspection repository
    try {
      const stored = JSON.parse(localStorage.getItem('metrology_inspections') || '[]');
      const updatedList = stored.map((item) =>
        item.id === updatedAudit.id || item.inspectionId === updatedAudit.inspectionId
          ? { ...item, ...updatedAudit }
          : item
      );
      localStorage.setItem('metrology_inspections', JSON.stringify(updatedList));
      setHistoryCount(updatedList.length);
    } catch (err) {
      console.error('Failed to sync updated audit to repository:', err);
    }
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
        officer={officer}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
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
                metadata={inspectionMetadata}
                onMetadataChange={setInspectionMetadata}
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
                officer={officer}
                onUpdateAuditData={handleUpdateAuditData}
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

        {/* Tab 3: Pharma & DPCO Audit (NPPA Pricing Cap & Drug Packaging) */}
        {activeTab === 'pharma' && (
          <div key="pharma" className="animate-fade-slide">
            <PharmaDpcoModule t={t} lang={lang} onTriggerToast={showToast} />
          </div>
        )}

        {/* Tab 4: Inspection Repository (History with Thumbnails & Memos) */}
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

      {/* Officer Authentication & Enforcement Session Modal */}
      <OfficerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentOfficer={officer}
        lang={lang}
      />
    </div>
  );
}
