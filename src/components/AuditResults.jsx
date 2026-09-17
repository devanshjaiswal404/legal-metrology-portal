import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  Download,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Scale,
  FileCheck2,
  UserCheck,
  Activity
} from 'lucide-react';
import { exportFormVPdf } from '../utils/exportPdf';
import { exportAuditDataCsv } from '../utils/exportCsv';
import AnimatedNumber from './AnimatedNumber';
import ManualVerificationModal from './ManualVerificationModal';

export default function AuditResults({
  auditData,
  selectedRuleId,
  onSelectRule,
  hoveredBoxId,
  onHoverBox,
  isAnalyzing = false,
  officer = null,
  onUpdateAuditData,
  t,
  lang = 'en',
  onTriggerToast
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

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
  const isCompliant = auditData.overall_verdict
    ? auditData.overall_verdict.toUpperCase() === 'COMPLIANT'
    : (auditData.violationsCount === 0 || auditData.score === 100);

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      const activeInspectorId =
        auditData.manualReview?.reviewedById ||
        officer?.officerId ||
        auditData.inspectorId ||
        'LMO-Central-04';

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
        inspectorId: activeInspectorId,
        memoRef: auditData.memoRef || 'LMO/2026/8842',
        commodity: auditData.name,
        seller: auditData.manufacturer || 'Identified Packaged Commodity Packer / Marketer',
        overallVerdict: auditData.overall_verdict || auditData.verdict
      });
      if (onTriggerToast) {
        onTriggerToast(
          lang === 'hi' ? 'प्रपत्र V वैधानिक नोटिस (PDF) तैयार किया गया' : 'Official Form V Statutory Notice (PDF) generated',
          '📄'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsDownloading(false), 600);
    }
  };

  const handleSaveVerification = (reviewPayload) => {
    if (!auditData) return;

    // Map corrected fields into updated rules while preserving original findings
    const updatedRules = (auditData.rules || []).map((r) => {
      const fieldKey =
        r.id === 'mrp' ? 'mrp' :
        r.id === 'usp' ? 'usp' :
        r.id === 'net-qty' ? 'net_quantity' :
        r.id === 'mfg-date' ? 'mfg_date' :
        r.id === 'origin' ? 'country_of_origin' :
        r.id === 'care' ? 'consumer_care' :
        r.id === 'packer' ? 'packer' :
        r.id === 'commodity-name' ? 'product_name' : r.id;

      const fieldMatch = reviewPayload.fields[fieldKey];
      if (!fieldMatch) return r;

      const isPass = fieldMatch.officerStatus === 'PASSED';
      return {
        ...r,
        originalFound: r.originalFound || r.found,
        found: fieldMatch.correctedValue || r.found,
        status: isPass ? 'pass' : 'violation',
        isOverridden: fieldMatch.correctedValue !== fieldMatch.originalValue || fieldMatch.officerStatus !== fieldMatch.aiStatus,
        officerStatus: fieldMatch.officerStatus
      };
    });

    const isNowCompliant = reviewPayload.finalVerdict === 'COMPLIANT';
    const updatedAudit = {
      ...auditData,
      isReviewed: true,
      originalVerdict: auditData.originalVerdict || auditData.overall_verdict,
      originalScore: auditData.originalScore !== undefined ? auditData.originalScore : auditData.score,
      overall_verdict: reviewPayload.finalVerdict,
      verdict: isNowCompliant ? 'COMPLIANT' : 'CONTRAVENTION',
      status: isNowCompliant ? 'COMPLIANT' : 'CONTRAVENTION',
      score: reviewPayload.finalScore,
      rules: updatedRules,
      manualReview: reviewPayload
    };

    if (onUpdateAuditData) {
      onUpdateAuditData(updatedAudit);
    }

    if (onTriggerToast) {
      onTriggerToast(
        lang === 'hi' ? 'अधिकारी मैनुअल सत्यापन सफलतापूर्वक सहेजा गया' : 'Manual Officer Verification recorded successfully',
        '✓'
      );
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
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                {lang === 'hi' ? 'वैधानिक निरीक्षण निर्णय' : 'Statutory Inspection Verdict'}
              </span>
              {auditData.isReviewed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  <span>OFFICER VERIFIED</span>
                </span>
              )}
            </div>
            <div className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
              {isCompliant ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-200">
                    {auditData.overall_verdict || auditData.verdictBanner || (lang === 'hi' ? 'पैकेज्ड वस्तु अनुपालित (0 उल्लंघन)' : 'COMPLIANT')}
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span className="text-rose-200">
                    {auditData.overall_verdict || (lang === 'hi'
                      ? `${auditData.violationsCount} वैधानिक उल्लंघन पाए गए`
                      : 'NON-COMPLIANT')}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {auditData.name || 'Packaged Commodity'} &bull; {lang === 'hi' ? 'विधिक मापविज्ञान अधिनियम, 2009 पठित नियम 2011' : 'The Legal Metrology Act, 2009 read with PC Rules, 2011'}
            </p>
          </div>

          {/* Score Pill with Animated Number Counter */}
          <div className="flex items-center self-start sm:self-auto">
            <div
              className={`px-3.5 py-1.5 rounded-lg font-mono font-bold text-xs sm:text-sm border shadow-sm flex items-center gap-2 transition-all hover:scale-105 ${
                isCompliant
                  ? 'bg-slate-900 text-emerald-300 border-emerald-800/50'
                  : 'bg-slate-900 text-rose-300 border-rose-800/50'
              }`}
            >
              <span className="text-slate-400 font-sans font-normal">{t?.score || 'Compliance Score'}:</span>
              <span className="text-sm sm:text-base font-bold text-white">
                <AnimatedNumber value={auditData.score || 0} />/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Officer Verification Stage Strip */}
      {auditData.isReviewed ? (
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-cyan-200">
            <div className="p-1.5 rounded-lg bg-cyan-900/60 border border-cyan-700/60 text-cyan-300 flex-shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>Manual Verification Completed</span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-900/80 px-1.5 py-0.2 rounded">
                  {auditData.manualReview?.officerDecision}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Verified by {auditData.manualReview?.reviewedBy} ({auditData.manualReview?.reviewedById}) &bull; {auditData.manualReview?.reviewedAt ? new Date(auditData.manualReview.reviewedAt).toLocaleTimeString() : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsVerificationModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 font-semibold border border-cyan-800/70 transition-all cursor-pointer self-start sm:self-auto"
          >
            Edit / Re-verify
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200 text-xs sm:text-sm">Stage 10: Manual Officer Verification</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                PENDING OFFICER REVIEW
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Inspect AI/OCR extracted declarations, adjust values, and add statutory officer remarks before filing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsVerificationModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Manual Officer Verification</span>
          </button>
        </div>
      )}

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
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs sm:text-sm shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
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
            onClick={() => {
              exportAuditDataCsv(auditData);
              if (onTriggerToast) {
                onTriggerToast(
                  lang === 'hi' ? 'ऑडिट लेजर सीएसवी डाउनलोड किया गया' : 'Audit Ledger (CSV) exported',
                  '📊'
                );
              }
            }}
            className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs sm:text-sm border border-slate-700/80 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            title="Download audit findings as a CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{t?.exportCsv || 'Export Audit Ledger (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Flagged Violations Summary (Safely handles string or { rule, issue } objects) */}
      {auditData.violations && auditData.violations.length > 0 && !isCompliant && (
        <div className="p-4 rounded-xl bg-rose-950/25 border border-rose-800/45 space-y-2">
          <div className="text-xs font-semibold text-rose-300 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              {lang === 'hi'
                ? `पहचाने गए वैधानिक उल्लंघन (${auditData.violations.length})`
                : `Detected Statutory Violations (${auditData.violations.length})`}
            </span>
          </div>
          <ul className="space-y-1.5 text-xs text-rose-200/90 pl-5 list-disc">
            {auditData.violations.map((v, idx) => {
              const text =
                typeof v === 'string'
                  ? v
                  : v && typeof v === 'object'
                  ? v.rule && v.issue
                    ? `${v.rule}: ${v.issue}`
                    : v.issue || v.message || v.detail || JSON.stringify(v)
                  : String(v);
              return (
                <li key={idx} className="leading-relaxed font-mono text-[11.5px]">
                  {text}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 3. Clean & Readable Rule Cards List */}
      <div className="space-y-2.5">
        {(auditData.rules || []).map((card) => {
          const isPass = card.status === 'pass';
          const isExempt = card.status === 'exempt';
          const isCompliantStatus = isPass || isExempt;
          const isViolation = card.status === 'violation';
          const isSelected = selectedRuleId === card.id;
          const isHovered = hoveredBoxId === card.id;

          // Localized Title
          let localizedTitle = card.title;
          if (lang === 'hi') {
            if (card.titleHindi) {
              localizedTitle = card.titleHindi;
            } else if (t?.rules) {
              if (card.id === 'mrp') localizedTitle = t.rules.mrp;
              else if (card.id === 'net-qty') localizedTitle = t.rules.netQty;
              else if (card.id === 'mfg-date') localizedTitle = t.rules.mfgDate;
              else if (card.id === 'origin') localizedTitle = t.rules.origin;
              else if (card.id === 'care') localizedTitle = t.rules.consumerCare;
              else if (card.id === 'usp') localizedTitle = t.rules.usp;
              else if (card.id === 'batch') localizedTitle = 'बैच / लॉट संख्या';
              else if (card.id === 'packer') localizedTitle = 'निर्माता एवं विपणनकर्ता विवरण';
              else if (card.id === 'commodity-name') localizedTitle = 'वस्तु का सामान्य / वर्ग नाम';
            }
          }

          return (
            <div
              key={card.id}
              onClick={() => onSelectRule && onSelectRule(card.id)}
              onMouseEnter={() => onHoverBox && onHoverBox(card.id)}
              onMouseLeave={() => onHoverBox && onHoverBox(null)}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer bg-[#111827] hover:scale-[1.01] hover:border-slate-600 hover:shadow-lg ${
                isSelected
                  ? isViolation
                    ? 'border-rose-500/80 ring-1.5 ring-rose-500/50 bg-rose-950/20 scale-[1.01] shadow-lg'
                    : 'border-emerald-500/80 ring-1.5 ring-emerald-500/50 bg-emerald-950/20 scale-[1.01] shadow-lg'
                  : isHovered
                  ? isViolation
                    ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-950/20 scale-[1.01] shadow-lg'
                    : 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-950/20 scale-[1.01] shadow-lg'
                  : isCompliantStatus
                  ? 'border-slate-800/80 hover:border-slate-700'
                  : 'border-rose-900/50 hover:border-rose-800 bg-rose-950/5'
              }`}
            >
              {/* Card Header: Plain Title + Muted Status Badge */}
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                  {isCompliantStatus ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  )}
                  <span>{localizedTitle}</span>
                </h4>

                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase tracking-wide flex-shrink-0 ${
                    isPass
                      ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
                      : isExempt
                      ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
                      : isViolation
                      ? 'bg-rose-950/30 text-rose-300 border-rose-800/40'
                      : 'bg-amber-950/30 text-amber-300 border-amber-800/40'
                  }`}
                >
                  {isPass 
                    ? (lang === 'hi' ? 'अनुपालित' : 'COMPLIANT')
                    : isExempt
                    ? (lang === 'hi' ? 'छूट प्राप्त (नियम 26)' : 'EXEMPT (RULE 26)')
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
                      isCompliantStatus ? 'text-slate-200' : 'text-rose-300 bg-rose-950/30 px-1 py-0.5 rounded border border-rose-900/40'
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

      {/* Manual Officer Verification & Override Modal */}
      <ManualVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        auditData={auditData}
        officer={officer}
        onSaveVerification={handleSaveVerification}
        lang={lang}
      />
    </div>
  );
}
