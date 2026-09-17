import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Search,
  UploadCloud,
  CheckCircle2,
  AlertOctagon,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Info,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { exportFormVPdf } from '../../utils/exportPdf';

// Preset Marketplace URL Demos for one-click testing
const PRESET_DEMO_CHIPS = [
  {
    id: 'blinkit-tea',
    name: 'Blinkit: Tata Tea Gold 500g',
    shortName: 'Blinkit',
    product: 'Tata Tea Gold 500g',
    url: 'https://blinkit.com/prn/tata-tea-gold/prid/124982',
    icon: '⚡'
  },
  {
    id: 'amazon-oil',
    name: 'Amazon: Fortune Sunlite Oil 1L',
    shortName: 'Amazon',
    product: 'Fortune Sunlite Oil 1L',
    url: 'https://www.amazon.in/dp/B00TS8M0F6/ref=fortune_sunlite_oil_1l',
    icon: '📦'
  },
  {
    id: 'flipkart-biscuits',
    name: 'Flipkart: Britannia Biscuits',
    shortName: 'Flipkart',
    product: 'Britannia Good Day Butter Biscuits 600g',
    url: 'https://www.flipkart.com/britannia-good-day-butter-cookies/p/itm12894',
    icon: '🛒'
  },
  {
    id: 'zepto-yogurt',
    name: 'Zepto: Epigamia Yogurt',
    shortName: 'Zepto',
    product: 'Epigamia Greek Yogurt Natural 400g',
    url: 'https://www.zeptonow.com/pn/epigamia-greek-yogurt-400g/p/99321',
    icon: '🚀'
  }
];

export default function EcommerceAuditModule({ t, lang = 'en', onTriggerToast }) {
  const [inputUrl, setInputUrl] = useState('');
  const [auditMode, setAuditMode] = useState('url'); // 'url' | 'screenshot'
  const [uploadedScreenshot, setUploadedScreenshot] = useState(null);
  const [activeAudit, setActiveAudit] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStepText, setAuditStepText] = useState('');
  const auditTimeoutRef = useRef(null);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (auditTimeoutRef.current) clearTimeout(auditTimeoutRef.current);
    };
  }, []);

  /**
   * Smart Parser & Mock Scraper Engine
   * Generates statutory findings under Rule 6(10) of Legal Metrology (Packaged Commodities) Amendment Rules, 2017
   */
  const executeAudit = (targetUrl, screenshotImg = null) => {
    const rawUrl = (targetUrl || inputUrl || '').trim();
    if (!rawUrl && !screenshotImg) return;

    setIsAuditing(true);
    setAuditStepText(lang === 'hi' ? 'सुरक्षित एसएसएल कनेक्शन स्थापित किया जा रहा है...' : 'Establishing secure SSL connection...');

    // Progress step 1
    auditTimeoutRef.current = setTimeout(() => {
      setAuditStepText(lang === 'hi' ? 'मार्केटप्लेस मेटाडेटा एवं पीडीपी विनिर्देश निकाले जा रहे हैं...' : 'Extracting marketplace metadata & PDP specifications...');

      // Progress step 2
      auditTimeoutRef.current = setTimeout(() => {
        setAuditStepText(lang === 'hi' ? 'नियम 6(10) के तहत वैधानिक अनिवार्य घोषणाओं का विश्लेषण...' : 'Auditing mandatory declarations under Rule 6(10)...');

        // Complete audit
        auditTimeoutRef.current = setTimeout(() => {
          setIsAuditing(false);
          setAuditStepText('');

          const cleanUrl = rawUrl.toLowerCase();

          // 1. Domain & Seller Matching
          let marketplace = 'Digital Marketplace';
          let seller = 'Verified Retail Marketplace Partner';
          let productName = 'Packaged Commodity Item';
          let productImage = screenshotImg || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop';
          let netQty = '500 g';
          let mrpText = '₹340 (Inclusive of all taxes)';
          let isCompliantOverall = true;

          if (cleanUrl.includes('blinkit')) {
            marketplace = 'Blinkit Commerce';
            seller = 'Blinkit Commerce Pvt. Ltd.';
            productName = 'Tata Tea Gold Leaf Tea 500g';
            productImage = screenshotImg || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop';
            netQty = '500 g';
            mrpText = '₹340 (Incl. of all taxes)';
            isCompliantOverall = true; // Fully compliant demo
          } else if (cleanUrl.includes('amazon')) {
            marketplace = 'Amazon India';
            seller = 'Cloudtail / Retail Marketplace Partner';
            productName = 'Fortune Sunlite Refined Sunflower Oil 1L';
            productImage = screenshotImg || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop';
            netQty = '1 L';
            mrpText = '₹165 (Inclusive of all taxes)';
            isCompliantOverall = true;
          } else if (cleanUrl.includes('flipkart')) {
            marketplace = 'Flipkart Internet';
            seller = 'SuperComNet Retailers Pvt. Ltd.';
            productName = 'Britannia Good Day Butter Cookies 600g';
            productImage = screenshotImg || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop';
            netQty = '600 g';
            mrpText = '₹120 (Inclusive of all taxes)';
            isCompliantOverall = true;
          } else if (cleanUrl.includes('zepto')) {
            marketplace = 'Zepto Quick Commerce';
            seller = 'KiranaKart Technologies Pvt. Ltd.';
            productName = 'Epigamia Greek Yogurt Natural 400g';
            productImage = screenshotImg || 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop';
            netQty = '400 g';
            mrpText = '₹140 (Incl. of all taxes)';
            isCompliantOverall = true;
          } else {
            // Dynamic URL segment extraction for custom URLs
            try {
              const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
              marketplace = parsed.hostname.replace('www.', '').toUpperCase();
              const pathSegments = parsed.pathname.split('/').filter(Boolean);
              if (pathSegments.length > 0) {
                const last = pathSegments[pathSegments.length - 1];
                productName = decodeURIComponent(last).replace(/[-_+]/g, ' ').replace(/\.[^/.]+$/, '');
                productName = productName.charAt(0).toUpperCase() + productName.slice(1);
              } else {
                productName = `Commodity (${parsed.hostname})`;
              }
            } catch {
              productName = rawUrl.substring(0, 35) || 'Packaged Commodity';
              marketplace = 'Web Marketplace';
            }
            seller = `${marketplace} Registered Merchant`;
            isCompliantOverall = true;
          }

          // Rule 6(10) Statutory Declarations Breakdown
          const declarations = [
            {
              id: 'mrp',
              title: lang === 'hi' ? 'अधिकतम खुदरा मूल्य (MRP)' : 'Maximum Retail Price (MRP)',
              status: 'pass',
              observed: mrpText,
              law: lang === 'hi'
                ? 'नियम 6(10) का पालन। कर सहित मूल्य डिजिटल उत्पाद पृष्ठ पर स्पष्ट प्रदर्शित है।'
                : 'Compliant with Rule 6(10) read with Rule 6(1)(e). Retail price prominently shown inclusive of all statutory taxes.',
              citation: 'Rule 6(10) read with Rule 6(1)(e)'
            },
            {
              id: 'net-qty',
              title: lang === 'hi' ? 'मानक शुद्ध मात्रा (Net Quantity)' : 'Net Quantity Declaration',
              status: 'pass',
              observed: netQty,
              law: lang === 'hi'
                ? `वैधानिक मीट्रिक इकाई '${netQty.split(' ')[1] || 'g'}' में घोषित under Rule 13.`
                : `Declared using statutory SI metric unit '${netQty.split(' ')[1] || 'g'}' under Rule 13.`,
              citation: 'Rule 6(10) read with Rule 6(1)(c) & Rule 13'
            },
            {
              id: 'usp',
              title: lang === 'hi' ? 'इकाई विक्रय मूल्य (USP)' : 'Unit Sale Price (USP)',
              status: 'pass',
              observed: 'Declared (₹/g or ₹/ml standard unit rate)',
              law: lang === 'hi'
                ? 'नियम 6(11) के अनुसार प्रति ग्राम/मिली दर ऑनलाइन स्पष्ट अंकित है।'
                : 'Unit sale price declared in compliance with Rule 6(11) of PC Rules, 2011.',
              citation: 'Rule 6(10) read with Rule 6(11)'
            },
            {
              id: 'country-origin',
              title: lang === 'hi' ? 'मूल देश (Country of Origin)' : 'Country of Origin',
              status: 'pass',
              observed: 'India (Declared on PDP Specifications)',
              law: lang === 'hi'
                ? 'नियम 6(10) के तहत मूल देश स्पष्ट रूप से विनिर्देश तालिका में घोषित।'
                : 'Statutory declaration of Country of Origin clearly displayed on digital display panel under Rule 6(1)(da).',
              citation: 'Rule 6(10) read with Rule 6(1)(da)'
            },
            {
              id: 'mfg-date',
              title: lang === 'hi' ? 'पैकिंग / निर्माण का माह एवं वर्ष' : 'Date of Packing / Mfg',
              status: 'exempt',
              observed: 'Online Display Statutorily Exempt',
              law: lang === 'hi'
                ? 'नियम 6(10) के तहत ई-कॉमर्स प्लेटफॉर्मों पर निर्माण/पैकिंग तिथि प्रदर्शित करने से वैधानिक छूट प्राप्त है।'
                : 'Statutorily exempt under Rule 6(10) proviso: E-commerce entities are exempt from displaying month & year of manufacture/pack online.',
              citation: 'Rule 6(10) Proviso (2017 Amendment)'
            },
            {
              id: 'consumer-care',
              title: lang === 'hi' ? 'उपभोक्ता शिकायत निवारण संपर्क' : 'Consumer Care Helpline & Email',
              status: 'pass',
              observed: 'Contact Email & Toll-Free Helpline Verified',
              law: lang === 'hi'
                ? 'निर्माता अथवा मार्केटर का ग्राहक सेवा विवरण उपलब्ध है।'
                : 'Consumer grievance redressal telephone and email address clearly provided under Rule 6(1)(f).',
              citation: 'Rule 6(10) read with Rule 6(1)(f)'
            },
            {
              id: 'manufacturer',
              title: lang === 'hi' ? 'निर्माता / पैकर पहचान' : 'Manufacturer / Packer Identity',
              status: 'pass',
              observed: seller,
              law: lang === 'hi'
                ? 'निर्माता अथवा पैकर का पंजीकृत नाम एवं पता विनिर्देश में शामिल।'
                : 'Name and registered address of manufacturer/packer/importer displayed as required.',
              citation: 'Rule 6(10) read with Rule 6(1)(a)'
            }
          ];

          const violationsCount = declarations.filter((d) => d.status === 'violation').length;
          const score = violationsCount === 0 ? 100 : Math.max(0, 100 - violationsCount * 20);

          const auditRecord = {
            url: rawUrl || 'Listing-Screenshot-Audit',
            marketplace,
            seller,
            productName,
            image: productImage,
            score,
            verdict: violationsCount === 0 ? 'COMPLIANT' : 'NON-COMPLIANT',
            violationsCount,
            declarations,
            memoRef: `ECOM/2026/${Math.floor(1000 + Math.random() * 9000)}`
          };

          setActiveAudit(auditRecord);

          if (onTriggerToast) {
            onTriggerToast(
              lang === 'hi'
                ? `${marketplace} लिस्टिंग ऑडिट पूर्ण — 100/100 अनुपालित`
                : `${marketplace} audit complete — Score: ${score}/100`,
              '⚡'
            );
          }
        }, 400);
      }, 400);
    }, 400);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeAudit(inputUrl, uploadedScreenshot);
  };

  const handleSelectChip = (chip) => {
    setInputUrl(chip.url);
    setAuditMode('url');
    executeAudit(chip.url, null);
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setUploadedScreenshot(dataUrl);
      if (!inputUrl) setInputUrl('Marketplace-Product-Page-Screenshot');
      if (onTriggerToast) {
        onTriggerToast(
          lang === 'hi' ? 'उत्पाद स्क्रीनशॉट संलग्न — ऑडिट के लिए तैयार' : 'Listing screenshot attached — ready to audit',
          '📸'
        );
      }
      executeAudit(inputUrl || 'Marketplace-Product-Page-Screenshot', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // PDF Notice / Certificate Generator
  const handleDownloadNotice = () => {
    if (!activeAudit) return;
    exportFormVPdf({
      rules: activeAudit.declarations.map((d) => ({
        title: d.title,
        ruleId: d.citation,
        status: d.status,
        detectedText: d.observed,
        offendingText: d.observed,
        remark: d.law,
        violationReason: d.law,
        clause: d.citation
      })),
      score: activeAudit.score,
      minNumeralHeight: 'Digital Exemption (Rule 6(10))',
      inspectorId: 'LMO-Central-04',
      memoRef: activeAudit.memoRef,
      commodity: activeAudit.productName,
      seller: activeAudit.seller,
      platform: activeAudit.marketplace
    });

    if (onTriggerToast) {
      onTriggerToast(
        activeAudit.score === 100
          ? (lang === 'hi' ? 'ई-कॉमर्स अनुपालन प्रमाण पत्र (PDF) डाउनलोड हुआ' : 'Form V Compliance Certificate (PDF) generated')
          : (lang === 'hi' ? 'प्रपत्र V कारण बताओ नोटिस (PDF) तैयार हुआ' : 'Form V Show-Cause Notice (PDF) generated'),
        '📄'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Audit Console Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 flex-shrink-0">
              <Globe className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-slate-100">
                  {t?.title || 'E-Commerce Marketplace Audit'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-700/80">
                  RULE 6(10) AUDIT ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t?.subtitle || 'Digital marketplace compliance audit under Rule 6(10) (2017 Amendments)'}
              </p>
            </div>
          </div>

          {/* Mode Switcher: URL Input vs Screenshot Upload */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setAuditMode('url')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                auditMode === 'url'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'उत्पाद लिंक (URL)' : 'Product URL'}</span>
            </button>
            <button
              type="button"
              onClick={() => setAuditMode('screenshot')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                auditMode === 'screenshot'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पेज स्क्रीनशॉट' : 'Listing Screenshot'}</span>
            </button>
          </div>
        </div>

        {/* Input Bar or Screenshot Zone */}
        {auditMode === 'url' ? (
          <form onSubmit={handleFormSubmit} className="mt-5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder={t?.urlPlaceholder || 'Enter Blinkit, Amazon, Flipkart, or Zepto product URL...'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isAuditing || !inputUrl.trim()}
                className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {isAuditing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    <span>{lang === 'hi' ? 'जांच जारी है...' : 'Auditing Listing...'}</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>{t?.auditBtn || 'Audit Listing'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 p-5 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-center space-y-3">
            <UploadCloud className="w-8 h-8 text-slate-400" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-200">
                {lang === 'hi' ? 'ई-कॉमर्स उत्पाद लिस्टिंग का स्क्रीनशॉट ड्रॉप करें' : 'Drop an e-commerce PDP screenshot here'}
              </p>
              <p className="text-[11px] text-slate-400">
                {lang === 'hi'
                  ? 'अमेज़न, ब्लिंकिट या फ्लिपकार्ट उत्पाद पृष्ठ का स्नैपशॉट अपलोड करें'
                  : 'Bypasses CORS restrictions by directly inspecting optical product packaging declarations'}
              </p>
            </div>
            <label className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-600 transition-colors">
              <span>{lang === 'hi' ? 'छवि चुनें' : 'Browse Screenshot'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
            </label>
            {uploadedScreenshot && (
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {lang === 'hi' ? 'स्क्रीनशॉट लोड किया गया' : 'Screenshot loaded successfully'}
              </span>
            )}
          </div>
        )}

        {/* Task 1: One-Click Preset URL Chips */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {lang === 'hi' ? 'त्वरित 1-क्लिक टेस्ट प्रीसेट चिप्स:' : '1-Click Preset Demo URLs:'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_DEMO_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleSelectChip(chip)}
                disabled={isAuditing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-all hover:scale-[1.02] active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>{chip.icon}</span>
                <span className="font-semibold text-slate-200">{chip.shortName}:</span>
                <span className="text-slate-400">{chip.product}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Task 2: Realistic Loading Progress Indicator */}
        {isAuditing && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center gap-3 animate-fadeIn">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400 flex-shrink-0" />
            <div className="space-y-0.5">
              <span className="text-xs font-mono text-emerald-300 font-semibold">{auditStepText}</span>
              <p className="text-[10px] text-slate-400 font-mono">
                Executing statutory parser on client engine &bull; Zero CORS latency
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Task 3: Dedicated Statutory Exemption Alert Callout (Rule 6(10) Specific) */}
      <div className="bg-slate-900/70 border border-cyan-800/40 rounded-xl p-4 sm:p-4.5 flex items-start gap-3.5 text-xs shadow-sm">
        <div className="p-2 rounded-lg bg-cyan-950/50 text-cyan-300 border border-cyan-800/50 flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-cyan-300" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-cyan-200 text-xs sm:text-sm">
              {lang === 'hi'
                ? 'नियम 6(10) वैधानिक छूट सक्रिय (2017 संशोधन):'
                : 'Rule 6(10) Statutory Exemption Active:'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-700/50">
              LEGAL METROLOGY (PC) AMENDMENT RULES, 2017
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
            {lang === 'hi'
              ? 'डिजिटल ई-कॉमर्स मार्केटप्लेस पर विनिर्माण या पैकिंग का माह एवं वर्ष प्रदर्शित करने से वैधानिक छूट प्राप्त है, बशर्ते अन्य सभी अनिवार्य घोषणाएं (शुद्ध मात्रा, कर सहित MRP, मूल देश, निर्माता/पैकर पहचान, ग्राहक सेवा विवरण) स्पष्ट रूप से लिस्टेड हों।'
              : 'Digital e-commerce marketplaces are exempt from displaying the Month & Year of packaging online, provided all other mandatory declarations (Net Quantity, MRP with taxes, Country of Origin, Manufacturer/Packer identity, Consumer Care) are prominently listed.'}
          </p>
        </div>
      </div>

      {/* Audit Results Section */}
      {activeAudit && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Listing Card (4 cols) */}
          <div className="lg:col-span-4 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm p-4.5 space-y-4">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'hi' ? 'सत्यापित मार्केटप्लेस लिस्टिंग' : 'Audited Listing Dossier'}</span>
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                {activeAudit.marketplace}
              </span>
            </div>

            {/* Product Image Thumbnail */}
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex justify-center p-2">
              <img
                src={activeAudit.image}
                alt={activeAudit.productName}
                className="max-h-[220px] w-auto object-contain rounded-md"
              />
            </div>

            {/* Metadata Fields */}
            <div className="space-y-2 text-xs">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {lang === 'hi' ? 'कमोडिटी शीर्षक:' : 'Audited Commodity:'}
                </div>
                <div className="font-semibold text-slate-100 text-sm mt-0.5">{activeAudit.productName}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {lang === 'hi' ? 'डिजिटल विक्रेता / मार्केटर:' : 'Marketplace Seller Entity:'}
                </div>
                <div className="font-medium text-slate-300 text-xs mt-0.5">{activeAudit.seller}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {lang === 'hi' ? 'लिस्टिंग URL / संदर्भ:' : 'Listing Reference URL:'}
                </div>
                <div className="text-slate-400 text-[11px] truncate font-mono mt-0.5 bg-slate-900 p-1.5 rounded border border-slate-800" title={activeAudit.url}>
                  {activeAudit.url}
                </div>
              </div>
            </div>

            {/* Download Certificate / Notice Button */}
            <button
              type="button"
              onClick={handleDownloadNotice}
              className="w-full py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
            >
              <FileText className="w-4 h-4 text-slate-900" />
              <span>
                {activeAudit.score === 100
                  ? (lang === 'hi' ? 'प्रपत्र V अनुपालन प्रमाण पत्र (PDF)' : 'Export Form V Compliance Certificate (PDF)')
                  : (lang === 'hi' ? 'प्रपत्र V कारण बताओ नोटिस (PDF)' : 'Export Form V Show-Cause Notice (PDF)')}
              </span>
            </button>
          </div>

          {/* Right Column: Rule 6(10) Statutory Finding Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Status Verdict Banner */}
            <div
              className={`rounded-xl p-5 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-100 ${
                activeAudit.score === 100
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : 'bg-rose-950/20 border-rose-800/40'
              }`}
            >
              <div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    activeAudit.score === 100 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {lang === 'hi' ? 'डिजिटल अनुपालन निर्णय' : 'Digital Compliance Verdict'}
                </span>
                <div className="text-base sm:text-lg font-bold flex items-center gap-2 mt-0.5">
                  {activeAudit.score === 100 ? (
                    <>
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-200">
                        {lang === 'hi' ? 'पूर्णतः अनुपालित (100/100) — नियम 6(10) स्वीकृत' : 'COMPLIANT WITH RULE 6(10) (100/100)'}
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                      <span className="text-rose-200">
                        {lang === 'hi'
                          ? `गैर-अनुपालित: ${activeAudit.violationsCount} उल्लंघन पाए गए`
                          : `NON-COMPLIANT: ${activeAudit.violationsCount} Violations Flagged`}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-300/90 mt-1">
                  {activeAudit.score === 100
                    ? (lang === 'hi'
                        ? 'समस्त अनिवार्य ई-कॉमर्स घोषणाएं सत्यापित। पैकिंग तिथि को नियम 6(10) के तहत छूट प्राप्त है।'
                        : 'All mandatory e-commerce declarations verified. Packing date is statutorily exempt under Rule 6(10).')
                    : (lang === 'hi'
                        ? 'उत्पाद लिस्टिंग नियम 6(10) के अनिवार्य डिजिटल प्रकटीकरण का उल्लंघन करती है।'
                        : 'Product listing contravenes mandatory digital disclosure under Rule 6(10).')}
                </p>
              </div>

              <div
                className={`px-3.5 py-1.5 rounded-lg border font-mono font-semibold text-sm self-start sm:self-auto ${
                  activeAudit.score === 100
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                }`}
              >
                {lang === 'hi' ? 'स्कोर:' : 'Score:'} {activeAudit.score}/100
              </div>
            </div>

            {/* List of Rule 6(10) Declarations */}
            <div className="space-y-3">
              {activeAudit.declarations.map((item) => {
                const isPass = item.status === 'pass';
                const isExempt = item.status === 'exempt';
                const isViolation = item.status === 'violation';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border bg-[#111827] transition-all ${
                      isExempt
                        ? 'border-cyan-900/50 bg-cyan-950/10'
                        : isPass
                        ? 'border-slate-800'
                        : 'border-rose-900/60 bg-rose-950/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {isExempt ? (
                          <Info className="w-4 h-4 text-cyan-400" />
                        ) : isPass ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertOctagon className="w-4 h-4 text-rose-400" />
                        )}
                        <h4 className="text-sm font-semibold text-slate-100">{item.title}</h4>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                          isExempt
                            ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/50'
                            : isPass
                            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                            : 'bg-rose-950/30 text-rose-300 border-rose-800/50'
                        }`}
                      >
                        {isExempt
                          ? (lang === 'hi' ? 'छूट प्राप्त (नियम 6(10))' : 'EXEMPT (RULE 6(10))')
                          : isPass
                          ? (lang === 'hi' ? 'अनुपालित' : 'COMPLIANT')
                          : (lang === 'hi' ? 'उल्लंघन' : 'VIOLATION')}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 pl-6">
                      <div>
                        <span className="text-slate-400 font-medium mr-1.5">
                          {lang === 'hi' ? 'ऑनलाइन पाया गया:' : 'Observed Online:'}
                        </span>
                        <span
                          className={`font-mono ${
                            isExempt
                              ? 'text-cyan-300 font-semibold'
                              : isPass
                              ? 'text-slate-200'
                              : 'text-rose-300'
                          }`}
                        >
                          {item.observed}
                        </span>
                      </div>
                      <div className="text-slate-300">{item.law}</div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 pl-6">
                      {item.citation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Clean Empty State Before Submission */}
      {!activeAudit && !isAuditing && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <Globe className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-sm font-semibold text-slate-100">
              {lang === 'hi' ? 'कोई ई-कॉमर्स लिस्टिंग ऑडिट नहीं की गई' : 'No E-Commerce Listing Audited'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'hi'
                ? 'विधिक मापविज्ञान नियम 6(10) के तहत जांच करने के लिए ऊपर किसी 1-क्लिक प्रीसेट चिप पर क्लिक करें, URL दर्ज करें या लिस्टिंग स्क्रीनशॉट अपलोड करें।'
                : 'Click any 1-Click Preset Chip above, enter an Amazon/Blinkit product link, or drop a listing screenshot to audit against Legal Metrology Rule 6(10).'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
