import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Download,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  HelpCircle,
  Sparkles,
  Search,
  Scale
} from 'lucide-react';
import { exportFormVPdf } from '../utils/exportPdf';
import { exportAuditDataCsv } from '../utils/exportCsv';

export default function AuditResults({
  auditData,
  selectedRuleId,
  onSelectRule,
  isAnalyzing = false,
  t,
  lang = 'en'
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  // If analysis in progress: Show Analyzing State
  if (isAnalyzing) {
    return (
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-xl min-h-[460px] space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {t?.analyzing || 'Executing Optical & Statutory Analysis...'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {lang === 'hi'
              ? 'मुख्य प्रदर्शन पैनल (PDP), नियम 6 घोषणाओं, मीट्रिक इकाइयों एवं कराधान प्रावधानों की वैधानिक जांच की जा रही है।'
              : 'Scanning Principal Display Panel for Rule 6 statutory declarations, metric units, minimum numeral height, and mandatory taxation clauses.'}
          </p>
        </div>

        <div className="w-full max-w-xs bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  // If no image is scanned: Display requested clean empty state card
  if (!auditData || !auditData.image) {
    return (
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-xl min-h-[460px] space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
          <Scale className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {t?.emptyTitle || 'Awaiting Commodity Label'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {t?.emptyDesc || 'Upload or capture a product packaging label to perform automated statutory verification.'}
          </p>
        </div>

        {/* Feature Checklist for Officers */}
        <div className="grid grid-cols-2 gap-2.5 max-w-sm w-full text-left text-xs text-slate-300">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>{t?.rules?.mrp || 'MRP & Tax Inclusion'}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>{t?.rules?.netQty || 'Metric Net Quantity'}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>{t?.rules?.mfgDate || 'Mfg Date & Origin'}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>{t?.rules?.consumerCare || 'Consumer Care Helpline'}</span>
          </div>
        </div>
      </div>
    );
  }

  // Once Scanned: Show Big Status Banner + Rule Cards
  const isCompliant = auditData.violationsCount === 0;

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      exportFormVPdf({
        rules: (auditData.rules || []).map((r) => ({
          title: r.title,
          ruleId: r.citation,
          status: r.status,
          detectedText: r.found,
          offendingText: r.found,
          remark: r.law,
          violationReason: r.law,
          clause: r.citation
        })),
        score: auditData.score || 0,
        minNumeralHeight: auditData.minNumeralHeight || '2.5 mm',
        inspectorId: auditData.inspectorId || 'LMO-Central-04',
        memoRef: auditData.memoRef || 'LMO/2026/8842'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsDownloading(false), 600);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Muted Institutional Status Banner */}
      <div
        className={`rounded-xl p-5 text-white shadow-sm transition-all border ${
          isCompliant
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-100'
            : 'bg-rose-950/20 border-rose-800/40 text-rose-100'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              {lang === 'hi' ? 'वैधानिक निरीक्षण निर्णय' : 'Statutory Inspection Verdict'}
            </span>
            <div className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
              {isCompliant ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-200">{t?.verdictPass || 'COMPLIANT WITH STATUTE'}</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span className="text-rose-200">
                    {lang === 'hi'
                      ? `${auditData.violationsCount} वैधानिक उल्लंघन पाए गए`
                      : `${auditData.violationsCount} Statutory Contraventions Detected`}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {auditData.name || 'Packaged Commodity'} &bull; {lang === 'hi' ? 'विधिक मापविज्ञान अधिनियम, 2009 पठित नियम 2011' : 'The Legal Metrology Act, 2009 read with PC Rules, 2011'}
            </p>
          </div>

          {/* Score Pill */}
          <div className="flex items-center self-start sm:self-auto">
            <div
              className={`px-3.5 py-1.5 rounded-lg font-mono font-bold text-xs sm:text-sm border shadow-sm flex items-center gap-2 ${
                isCompliant
                  ? 'bg-slate-900 text-emerald-300 border-emerald-800/50'
                  : 'bg-slate-900 text-rose-300 border-rose-800/50'
              }`}
            >
              <span className="text-slate-400 font-sans font-normal">{t?.score || 'Compliance Score'}:</span>
              <span className="text-sm sm:text-base font-bold text-white">{auditData.score}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Action Card: High-Contrast Primary Button + Ghost Secondary Button */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-300 text-center sm:text-left">
          <span className="font-semibold text-slate-200">
            {lang === 'hi' ? 'आधिकारिक प्रवर्तन प्रपत्र:' : 'Official Enforcement Notice:'}{' '}
          </span>
          <span className="text-slate-400">
            {lang === 'hi' ? 'सत्यापित प्रपत्र V वैधानिक निरीक्षण नोटिस तैयार करें।' : 'Generate verified Form V statutory inspection record.'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900" />
                <span>{lang === 'hi' ? 'मेमो तैयार हो रहा है...' : 'Generating Memo...'}</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-slate-900" />
                <span>{t?.downloadPdf || 'Download Form V Notice (PDF)'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => exportAuditDataCsv(auditData)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs sm:text-sm border border-slate-700/80 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Download audit findings as a CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{t?.exportCsv || 'Export Audit Ledger (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* 3. Clean & Readable Rule Cards List */}
      <div className="space-y-2.5">
        {(auditData.rules || []).map((card) => {
          const isPass = card.status === 'pass';
          const isViolation = card.status === 'violation';
          const isWarning = card.status === 'warning';
          const isSelected = selectedRuleId === card.id;

          // Localized Title
          let localizedTitle = card.title;
          if (lang === 'hi' && t?.rules) {
            if (card.id === 'mrp') localizedTitle = t.rules.mrp;
            else if (card.id === 'net-qty') localizedTitle = t.rules.netQty;
            else if (card.id === 'mfg-date') localizedTitle = t.rules.mfgDate;
            else if (card.id === 'origin') localizedTitle = t.rules.origin;
            else if (card.id === 'care') localizedTitle = t.rules.consumerCare;
            else if (card.id === 'usp') localizedTitle = t.rules.usp;
          }

          return (
            <div
              key={card.id}
              onClick={() => onSelectRule && onSelectRule(card.id)}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-[#111827] ${
                isSelected
                  ? isViolation
                    ? 'border-rose-500/80 ring-1 ring-rose-500/50 bg-rose-950/10'
                    : 'border-emerald-500/80 ring-1 ring-emerald-500/50 bg-emerald-950/10'
                  : isPass
                  ? 'border-slate-800/80 hover:border-slate-700'
                  : 'border-rose-900/50 hover:border-rose-800 bg-rose-950/5'
              }`}
            >
              {/* Card Header: Plain Title + Muted Status Badge */}
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                  {isPass ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  )}
                  <span>{localizedTitle}</span>
                </h4>

                <span
                  className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border uppercase tracking-wide flex-shrink-0 ${
                    isPass
                      ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
                      : isViolation
                      ? 'bg-rose-950/30 text-rose-300 border-rose-800/40'
                      : 'bg-amber-950/30 text-amber-300 border-amber-800/40'
                  }`}
                >
                  {isPass 
                    ? (lang === 'hi' ? 'अनुपालित' : 'COMPLIANT')
                    : isViolation 
                    ? (lang === 'hi' ? 'उल्लंघन' : 'CONTRAVENTION') 
                    : (lang === 'hi' ? 'चेतावनी' : 'WARNING')}
                </span>
              </div>

              {/* Simple Explanation: What was found vs. Legal Requirement */}
              <div className="space-y-1 text-xs text-slate-300 pl-5 sm:pl-5.5">
                <div>
                  <span className="text-slate-400 mr-1.5">
                    {lang === 'hi' ? 'पाया गया:' : 'Observed:'}
                  </span>
                  <span
                    className={`font-mono text-[11px] ${
                      isPass ? 'text-slate-200' : 'text-rose-300 bg-rose-950/30 px-1 py-0.5 rounded border border-rose-900/40'
                    }`}
                  >
                    {card.found}
                  </span>
                </div>

                <div className="text-slate-400 text-[11.5px] leading-relaxed">
                  {card.law}
                </div>
              </div>

              {/* Rule Citation in Small Gray Font at Bottom */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px] font-mono text-slate-500 pl-5 sm:pl-5.5">
                <span>{lang === 'hi' ? 'कानून/नियम:' : 'Statute:'} {card.citation}</span>
                {isSelected && (
                  <span className="text-slate-400 font-medium font-sans">
                    {lang === 'hi' ? 'सक्रिय चयन' : 'Focus Active'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
