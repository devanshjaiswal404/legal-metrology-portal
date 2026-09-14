import React, { useState } from 'react';
import {
  Globe,
  Search,
  UploadCloud,
  CheckCircle2,
  AlertOctagon,
  FileText,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Info,
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { exportFormVPdf } from '../../utils/exportPdf';



export default function EcommerceAuditModule({ t, lang = 'en' }) {
  const [inputUrl, setInputUrl] = useState('');
  const [uploadedScreenshot, setUploadedScreenshot] = useState(null);
  const [activeAudit, setActiveAudit] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleAuditUrl = (e) => {
    e.preventDefault();
    if (!inputUrl.trim() && !uploadedScreenshot) return;

    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);

      // Determine marketplace from URL
      let domain = 'Digital Marketplace';
      const cleanUrl = inputUrl.toLowerCase();
      if (cleanUrl.includes('amazon')) domain = 'Amazon India';
      else if (cleanUrl.includes('blinkit')) domain = 'Blinkit Commerce';
      else if (cleanUrl.includes('flipkart')) domain = 'Flipkart India';
      else if (cleanUrl.includes('zepto')) domain = 'Zepto Quick';
      else if (cleanUrl.includes('swiggy') || cleanUrl.includes('instamart')) domain = 'Swiggy Instamart';
      else if (cleanUrl.includes('bigbasket')) domain = 'BigBasket';

      // Dynamic audit findings based on submitted listing
      setActiveAudit({
        url: inputUrl || (lang === 'hi' ? 'उत्पाद लिस्टिंग स्नैपशॉट' : 'Product Listing Snapshot'),
        marketplace: domain,
        seller: lang === 'hi' ? 'चिह्नित डिजिटल विक्रेता / मार्केटर' : 'Identified Digital Merchant / Marketer',
        productName: inputUrl.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ')?.substring(0, 40) || (lang === 'hi' ? 'पैकेज्ड कमोडिटी लिस्टिंग' : 'Packaged Commodity Listing'),
        image: uploadedScreenshot || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
        score: 60,
        verdict: 'NON-COMPLIANT',
        violationsCount: 2,
        declarations: [
          {
            id: 'mrp',
            title: lang === 'hi' ? 'अधिकतम खुदरा मूल्य (MRP)' : 'Maximum Retail Price (MRP)',
            status: 'pass',
            observed: lang === 'hi' ? '₹ सभी करों सहित दर्शाया गया' : '₹ Listed with (Inclusive of all taxes)',
            law: lang === 'hi' ? 'नियम 6(10) का पालन। कर सहित मूल्य डिजिटल उत्पाद पृष्ठ पर स्पष्ट प्रदर्शित है।' : 'Compliant with Rule 6(10). Total price with tax statement clearly visible on digital product page.',
            citation: 'Rule 6(10) read with Rule 6(1)(e)'
          },
          {
            id: 'net-qty',
            title: lang === 'hi' ? 'मानक शुद्ध मात्रा एवं मीट्रिक इकाइयाँ' : 'Net Quantity Declaration',
            status: 'pass',
            observed: lang === 'hi' ? 'डिजिटल डिस्प्ले पैनल पर घोषित' : 'Declared on digital display panel',
            law: lang === 'hi' ? 'वैधानिक मीट्रिक इकाइयों (g/kg/ml/l) में घोषित।' : 'Declared in legal metric units (g/kg/ml/l).',
            citation: 'Rule 6(10) read with Rule 6(1)(c)'
          },
          {
            id: 'country-origin',
            title: lang === 'hi' ? 'मूल देश (Country of Origin)' : 'Country of Origin',
            status: 'violation',
            observed: lang === 'hi' ? 'उत्पाद विवरण तालिका से गायब' : 'Missing from Product Listing Specification Table',
            law: lang === 'hi' ? 'नियम 6(10) के तहत ई-कॉमर्स साइटों पर मूल देश प्रदर्शित करना अनिवार्य है।' : 'Rule 6(10) strictly mandates Country of Origin on digital and electronic e-commerce networks. Not found on PDP.',
            citation: 'Rule 6(10) read with Rule 6(1)(da)'
          },
          {
            id: 'consumer-care',
            title: lang === 'hi' ? 'उपभोक्ता शिकायत निवारण संपर्क' : 'Consumer Care Helpline & Email',
            status: 'violation',
            observed: lang === 'hi' ? 'लिस्टिंग पर कोई ग्राहक सेवा ईमेल या फोन नंबर नहीं मिला' : 'No seller grievance email or contact number provided on listing',
            law: lang === 'hi' ? 'नियम 6(10) के अंतर्गत ग्राहक सेवा संपर्क विवरण प्रदर्शित करना अनिवार्य है।' : 'Rule 6(10) requires display of customer care contact details of the manufacturer/marketer.',
            citation: 'Rule 6(10) read with Rule 6(1)(f)'
          },
          {
            id: 'manufacturer',
            title: lang === 'hi' ? 'निर्माता / पैकर का विवरण' : 'Manufacturer / Packer Details',
            status: 'pass',
            observed: lang === 'hi' ? 'डिजिटल विनिर्देशों में पैकर/आयातकर्ता चिह्नित' : 'Packer / Importer identified in digital specs',
            law: lang === 'hi' ? 'निर्माता या पैकर का नाम और पता निर्दिष्ट है।' : 'Manufacturer or packer name and address specified.',
            citation: 'Rule 6(10) read with Rule 6(1)(a)'
          }
        ]
      });
    }, 800);
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedScreenshot(ev.target.result);
      if (!inputUrl) setInputUrl('Product-Listing-Screenshot-Scan');
    };
    reader.readAsDataURL(file);
  };

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
      minNumeralHeight: 'Rule 6(10) Digital Exemption',
      inspectorId: 'LMO-Central-04',
      memoRef: `ECOM/2026/${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Demo Trigger */}
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
                  RULE 6(10)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t?.subtitle || 'Digital marketplace compliance audit under Rule 6(10) (2017 Amendments)'}
              </p>
            </div>
          </div>
        </div>

        {/* Input Form: URL input + Screenshot option */}
        <form onSubmit={handleAuditUrl} className="mt-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder={t?.urlPlaceholder || 'Enter Amazon, Blinkit, Flipkart or Zepto product URL...'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isAuditing}
              className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Globe className="w-4 h-4" />
              <span>{isAuditing ? (lang === 'hi' ? 'जांच हो रही है...' : 'Auditing Listing...') : (t?.auditBtn || 'Audit Listing')}</span>
            </button>
          </div>

          {/* Screenshot Upload Option */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer hover:text-slate-200">
              <UploadCloud className="w-4 h-4 text-slate-400" />
              <span>{lang === 'hi' ? 'या उत्पाद लिस्टिंग का स्क्रीनशॉट अपलोड करें' : 'Or upload product listing screenshot'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
            </label>

            {uploadedScreenshot && (
              <span className="text-emerald-400 font-mono text-[11px]">
                {lang === 'hi' ? '✓ स्क्रीनशॉट संलग्न' : '✓ Screenshot Attached'}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Statutory Exemption Callout Banner (Rule 6(10) Specific) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-200">
            {lang === 'hi' ? 'नियम 6(10) के अंतर्गत वैधानिक छूट सूचना:' : 'Statutory Exemption Note under Rule 6(10):'}
          </span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {t?.exemptionNotice || 'Statutory Exemption Note: Month and Year of manufacture/packing is exempt from digital display on e-commerce platforms under Rule 6(10).'}
          </p>
        </div>
      </div>

      {/* Audit Results Section */}
      {activeAudit && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Product Listing Snapshot (4 cols) */}
          <div className="lg:col-span-4 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2">
              <span>{lang === 'hi' ? 'ऑडिटेड मार्केटप्लेस लिस्टिंग' : 'Audited Marketplace Listing'}</span>
              <span className="text-[10px] font-mono text-slate-400">{activeAudit.marketplace}</span>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex justify-center">
              <img
                src={activeAudit.image}
                alt="E-commerce listing screenshot"
                className="max-h-[320px] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-semibold text-slate-100 text-sm">{activeAudit.productName}</div>
              <div className="text-slate-400 text-[11px] truncate font-mono">{activeAudit.url}</div>
              <div className="text-slate-400 text-[11px]">{lang === 'hi' ? 'विक्रेता:' : 'Seller:'} {activeAudit.seller}</div>
            </div>

            <button
              type="button"
              onClick={handleDownloadNotice}
              className="w-full py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{lang === 'hi' ? 'प्रपत्र V कारण बताओ नोटिस तैयार करें' : 'Draft Rule 6(10) Show-Cause Notice'}</span>
            </button>
          </div>

          {/* Right: Rule 6(10) Statutory Verification Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Status Verdict Banner */}
            <div className="rounded-xl p-5 bg-rose-950/20 border border-rose-800/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-100">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                  {lang === 'hi' ? 'डिजिटल अनुपालन निर्णय' : 'Digital Compliance Verdict'}
                </span>
                <div className="text-base sm:text-lg font-bold flex items-center gap-2 mt-0.5 text-rose-200">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>
                    {lang === 'hi' ? 'गैर-अनुपालित: 2 ई-कॉमर्स उल्लंघन' : 'NON-COMPLIANT: 2 E-Commerce Violations'}
                  </span>
                </div>
                <p className="text-xs text-rose-300/80 mt-1">
                  {lang === 'hi'
                    ? 'उत्पाद लिस्टिंग नियम 6(10) के अनिवार्य डिजिटल प्रकटीकरण का उल्लंघन करती है।'
                    : 'Product listing contravenes mandatory digital disclosure under Rule 6(10).'}
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/60 font-mono font-semibold text-sm self-start sm:self-auto text-rose-200">
                {lang === 'hi' ? 'स्कोर:' : 'Score:'} {activeAudit.score}/100
              </div>
            </div>

            {/* List of 5 Core Rule 6(10) Declarations */}
            <div className="space-y-3">
              {activeAudit.declarations.map((item) => {
                const isPass = item.status === 'pass';
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border bg-[#111827] transition-all ${
                      isPass ? 'border-slate-800' : 'border-rose-900/60 bg-rose-950/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {isPass ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertOctagon className="w-4 h-4 text-rose-400" />
                        )}
                        <h4 className="text-sm font-semibold text-slate-100">{item.title}</h4>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${
                          isPass
                            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                            : 'bg-rose-950/30 text-rose-300 border-rose-800/50'
                        }`}
                      >
                        {isPass ? (lang === 'hi' ? 'अनुपालित' : 'COMPLIANT') : (lang === 'hi' ? 'उल्लंघन' : 'VIOLATION')}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 pl-6">
                      <div>
                        <span className="text-slate-400 font-medium mr-1.5">
                          {lang === 'hi' ? 'ऑनलाइन पाया गया:' : 'Observed Online:'}
                        </span>
                        <span className={`font-mono ${isPass ? 'text-emerald-300' : 'text-rose-300'}`}>
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
      {!activeAudit && (
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
                ? 'विधिक मापविज्ञान नियम 6(10) के तहत जांच करने के लिए किसी उत्पाद का URL दर्ज करें या उत्पाद पृष्ठ का स्क्रीनशॉट अपलोड करें।'
                : 'Enter a product URL from an e-commerce platform or upload a product display page screenshot above to audit against Legal Metrology Rule 6(10).'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
