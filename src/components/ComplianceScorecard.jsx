import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Scale,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { exportFormVPdf } from '../utils/exportPdf';


export const DEFAULT_STATUTORY_RULES = [
  {
    id: 'rule-6-1-e',
    ruleId: 'Rule 6(1)(e)',
    title: 'Maximum Retail Price (MRP)',
    status: 'pass',
    detectedText: 'MRP ₹245.00 (INCL. OF ALL TAXES)',
    remark: 'Compliant. Stated clearly with mandatory "inclusive of all taxes" suffix pursuant to Rule 6(1)(e).',
    clause: 'Rule 6(1)(e) of PCR, 2011'
  },
  {
    id: 'rule-6-1-c',
    ruleId: 'Rule 6(1)(c) & Rule 13',
    title: 'Net Quantity & Metric Units',
    status: 'violation',
    offendingText: 'Net Wt: 5000 gms',
    violationReason: "Illegal non-standard symbol 'gms' detected. Rule 13 & The Legal Metrology Act strictly prescribe standard SI symbols 'g' or 'kg'. Pluralized abbreviations ('gms', 'gm', 'ltrs') are statutory violations.",
    clause: 'Rule 6(1)(c) read with Rule 13 & Section 11 of The Act'
  },
  {
    id: 'rule-6-1-d',
    ruleId: 'Rule 6(1)(d)',
    title: 'Date of Packing / Mfg',
    status: 'pass',
    detectedText: 'Pkd on: 08/2026',
    remark: 'Compliant. Conforms to statutory MM/YYYY format with valid "Pkd on" prefix under Rule 6(1)(d).',
    clause: 'Rule 6(1)(d) of PCR, 2011'
  },
  {
    id: 'rule-6-1-da',
    ruleId: 'Rule 6(1)(da)',
    title: 'Country of Origin',
    status: 'pass',
    detectedText: 'Country of Origin: India',
    remark: 'Compliant. Explicit country of origin declared visibly on the Principal Display Panel.',
    clause: 'Rule 6(1)(da) (Notification G.S.R. 409(E))'
  },
  {
    id: 'rule-6-1-f',
    ruleId: 'Rule 6(1)(f)',
    title: 'Consumer Care Details',
    status: 'violation',
    offendingText: 'Consumer Care: Call 1800-209-4455 (Email Missing)',
    violationReason: 'Missing mandatory consumer grievance email address. Rule 6(1)(f) mandates both a working telephone helpline AND an official grievance redressal email address.',
    clause: 'Rule 6(1)(f) of PCR, 2011'
  },
  {
    id: 'rule-6-11',
    ruleId: 'Rule 6(11)',
    title: 'Unit Sale Price (USP)',
    status: 'pass',
    detectedText: 'USP: ₹49.00 / kg',
    remark: 'Compliant. Mandatory for commodities exceeding 1 kg or 1 L; accurately calculated and rounded per kg.',
    clause: 'Rule 6(11) (Notification G.S.R. 779(E))'
  }
];

export default function ComplianceScorecard({
  rules = DEFAULT_STATUTORY_RULES,
  score = 68,
  minNumeralHeight = '2.5 mm',
  selectedRuleId,
  onSelectRule
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'pass' | 'violation' | 'warning'
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const passCount = rules.filter((r) => r.status === 'pass').length;
  const violationCount = rules.filter((r) => r.status === 'violation').length;

  const isCompliant = violationCount === 0;

  const filteredRules = rules.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  // Handle Form V PDF Export
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      exportFormVPdf({
        rules,
        score,
        minNumeralHeight,
        inspectorId: 'LMO-Central-04'
      });
    } catch (err) {
      console.error('Error generating statutory PDF memo:', err);
    } finally {
      setTimeout(() => {
        setIsGeneratingPdf(false);
      }, 500);
    }
  };

  // Circular Gauge Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* 1. Top Summary Banner */}
      <div className="p-5 bg-slate-900/95 border-b border-slate-700/80 space-y-4">
        {/* Top Header Label */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Statutory Audit Findings &amp; Scorecard
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            PCR, 2011 COMPLIANCE
          </span>
        </div>

        {/* Verdict & Score Gauge Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          {/* Overall Verdict Badge (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-center space-y-1.5">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-400">
              Statutory Evaluation
            </span>
            <div>
              {isCompliant ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 font-extrabold text-sm sm:text-base tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>VERDICT: COMPLIANT</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/80 border-2 border-red-500 text-red-200 font-extrabold text-sm sm:text-base tracking-wide shadow-[0_0_15px_rgba(239,68,68,0.25)]">
                  <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
                  <span>VERDICT: NON-COMPLIANT</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {violationCount > 0
                ? `${violationCount} mandatory statutory violations flagged under Legal Metrology Rules.`
                : 'All mandatory packaged commodity declarations satisfied.'}
            </p>
          </div>

          {/* Circular Gauge Score (4 cols) */}
          <div className="md:col-span-4 flex items-center justify-center sm:justify-start gap-3.5 border-y md:border-y-0 md:border-x border-slate-800/80 py-2 md:py-0 md:px-4">
            <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
              <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke={isCompliant ? '#10b981' : score >= 50 ? '#ef4444' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-extrabold font-mono text-white leading-none">
                  {score}
                </span>
                <span className="text-[9px] font-mono text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">Compliance Score</div>
              <div className="text-[11px] font-mono text-slate-400">
                Score: <strong className={isCompliant ? 'text-emerald-400' : 'text-red-400'}>{score}/100</strong>
              </div>
              <div className="text-[10px] text-slate-400">
                Pass: {passCount} | Fail: {violationCount}
              </div>
            </div>
          </div>

          {/* Statutory Font Threshold Badge (3 cols) */}
          <div className="md:col-span-3 flex flex-col justify-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Statutory Threshold
            </span>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="text-[11px] leading-tight">
                <div className="text-slate-400 text-[10px]">Min Numeral Height:</div>
                <div className="font-mono font-bold text-amber-300">
                  {minNumeralHeight} (Sched. II)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pill Tabs */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-slate-800 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Declarations ({rules.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('violation')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                filter === 'violation'
                  ? 'bg-red-950 text-red-200 border border-red-500/80 shadow-sm'
                  : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Violations ({violationCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('pass')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                filter === 'pass'
                  ? 'bg-emerald-950 text-emerald-200 border border-emerald-500/80 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Compliant ({passCount})</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
            6 Statutory Rules Evaluated
          </span>
        </div>
      </div>

      {/* 2 & 3. Statutory Rule Evaluation Cards List */}
      <div className="p-5 space-y-3.5 overflow-y-auto max-h-[580px]">
        {filteredRules.map((card) => {
          const isPass = card.status === 'pass';
          const isViolation = card.status === 'violation';
          const isWarning = card.status === 'warning';
          const isSelected = selectedRuleId === card.id;

          return (
            <div
              key={card.id}
              onClick={() => onSelectRule && onSelectRule(card.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? isViolation
                    ? 'border-red-500 ring-2 ring-red-500/40 bg-red-950/20 shadow-lg'
                    : 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-950/20 shadow-lg'
                  : isPass
                  ? 'border-emerald-500/50 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500'
                  : isViolation
                  ? 'border-red-500/60 bg-red-950/15 hover:bg-red-950/25 hover:border-red-500'
                  : 'border-amber-500/50 bg-amber-950/15 hover:bg-amber-950/25 hover:border-amber-500'
              }`}
            >
              {/* Card Header: Rule ID, Title & Status Pill */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex-shrink-0">
                    {isPass && (
                      <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    {isViolation && (
                      <div className="p-1 rounded bg-red-500/15 text-red-400 border border-red-500/40 animate-pulse">
                        <AlertOctagon className="w-4 h-4" />
                      </div>
                    )}
                    {isWarning && (
                      <div className="p-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/40">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-200 border border-slate-700">
                        {card.ruleId}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {card.title}
                      </h4>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase flex-shrink-0 ${
                    isPass
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                      : isViolation
                      ? 'bg-red-500/20 text-red-300 border-red-500/50'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  }`}
                >
                  {isPass ? 'PASS' : isViolation ? 'VIOLATION' : 'WARNING'}
                </span>
              </div>

              {/* Card Body Details */}
              <div className="mt-3 space-y-2.5 pl-8 text-xs">
                {/* Detected / Offending Text Box */}
                {isPass ? (
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Detected Declaration:
                    </span>
                    <div className="font-mono text-emerald-300 font-semibold">
                      {card.detectedText}
                    </div>
                    <p className="mt-1 text-slate-300 leading-relaxed text-[11px]">
                      {card.remark}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-950/90 border border-red-900/60 space-y-1.5">
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block">
                      Offending Text on Label:
                    </span>
                    <div className="font-mono text-red-300 font-bold bg-red-950/40 p-1.5 rounded border border-red-800/60 inline-block">
                      {card.offendingText}
                    </div>
                    <div className="text-[11px] text-red-200 leading-relaxed pt-0.5">
                      <strong>Violation Reason: </strong>
                      {card.violationReason}
                    </div>
                  </div>
                )}

                {/* Statutory Clause Citation Footer */}
                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400 border-t border-slate-800/60">
                  <span className="text-slate-400 truncate">
                    Statute: <strong className="text-slate-300">{card.clause}</strong>
                  </span>
                  {isSelected && (
                    <span className="text-emerald-400 font-bold">Target Focused</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-900/95 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-400 text-[11px] text-center sm:text-left">
          Click any card to highlight its corresponding target on the visual canvas.
        </div>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer border border-emerald-400/40"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Generating Form V Memo...</span>
            </>
          ) : (
            <>
              <span>📄 Download Form V Statutory Notice (PDF)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
