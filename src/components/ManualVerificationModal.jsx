import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  UserCheck,
  Edit3,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  X,
  Save,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

const VERIFICATION_FIELDS = [
  {
    key: 'product_name',
    label: 'Generic Commodity Name',
    rule: 'Rule 6(1)(b)',
    defaultConfidence: 96
  },
  {
    key: 'packer',
    label: 'Manufacturer / Packer / Importer',
    rule: 'Rule 6(1)(a)',
    defaultConfidence: 94
  },
  {
    key: 'packer_address',
    label: 'Registered Office / Factory Address',
    rule: 'Rule 6(1)(a)',
    defaultConfidence: 89
  },
  {
    key: 'net_quantity',
    label: 'Net Quantity & Metric Units',
    rule: 'Rule 6(1)(c) & Rule 13',
    defaultConfidence: 98
  },
  {
    key: 'mrp',
    label: 'Maximum Retail Price (MRP)',
    rule: 'Rule 6(1)(e)',
    defaultConfidence: 92
  },
  {
    key: 'mfg_date',
    label: 'Date of Packing / Mfg',
    rule: 'Rule 6(1)(d)',
    defaultConfidence: 91
  },
  {
    key: 'country_of_origin',
    label: 'Country of Origin',
    rule: 'Rule 6(1)(da)',
    defaultConfidence: 97
  },
  {
    key: 'consumer_care',
    label: 'Consumer Care / Grievance Helpline',
    rule: 'Rule 6(1)(f)',
    defaultConfidence: 93
  },
  {
    key: 'usp',
    label: 'Unit Sale Price (USP)',
    rule: 'Rule 6(11) & Rule 26',
    defaultConfidence: 88
  }
];

export default function ManualVerificationModal({
  isOpen,
  onClose,
  auditData,
  officer,
  onSaveVerification,
  lang = 'en'
}) {
  if (!isOpen || !auditData) return null;

  const decl = auditData.declarations || {};

  // Extract initial values from declarations or rules
  const getInitialValue = (key) => {
    if (key === 'product_name') return auditData.name || decl.commodity_name?.text || '';
    if (key === 'packer') return auditData.manufacturer || decl.packer?.text || '';
    if (key === 'packer_address') return decl.packer?.detail || decl.packer?.text || '';
    if (key === 'net_quantity') return decl.net_quantity?.text || '';
    if (key === 'mrp') return decl.mrp?.text || '';
    if (key === 'mfg_date') return decl.mfg_date?.text || '';
    if (key === 'country_of_origin') return decl.country_of_origin?.text || 'India';
    if (key === 'consumer_care') return decl.consumer_care?.text || '';
    if (key === 'usp') return decl.usp?.text || '';
    return '';
  };

  const getInitialStatus = (key) => {
    let raw = 'pass';
    if (key === 'product_name') raw = decl.commodity_name?.status || 'pass';
    else if (key === 'packer' || key === 'packer_address') raw = decl.packer?.status || 'pass';
    else if (key === 'net_quantity') raw = decl.net_quantity?.status || 'pass';
    else if (key === 'mrp') raw = decl.mrp?.status || 'pass';
    else if (key === 'mfg_date') raw = decl.mfg_date?.status || 'pass';
    else if (key === 'country_of_origin') raw = decl.country_of_origin?.status || 'pass';
    else if (key === 'consumer_care') raw = decl.consumer_care?.status || 'pass';
    else if (key === 'usp') raw = decl.usp?.status || 'pass';

    return raw === 'violation' || raw === 'fail'
      ? 'POTENTIAL_NON_COMPLIANCE'
      : 'PASSED';
  };

  // State for editable fields
  const [fieldsState, setFieldsState] = useState(() => {
    const state = {};
    VERIFICATION_FIELDS.forEach((f) => {
      const origVal = getInitialValue(f.key);
      const aiStatus = getInitialStatus(f.key);
      state[f.key] = {
        originalValue: origVal,
        correctedValue: origVal,
        confidence: f.defaultConfidence,
        aiStatus: aiStatus,
        officerStatus: aiStatus
      };
    });
    return state;
  });

  // Re-sync if auditData changes
  useEffect(() => {
    const state = {};
    VERIFICATION_FIELDS.forEach((f) => {
      const origVal = getInitialValue(f.key);
      const aiStatus = getInitialStatus(f.key);
      state[f.key] = {
        originalValue: origVal,
        correctedValue: origVal,
        confidence: f.defaultConfidence,
        aiStatus: aiStatus,
        officerStatus: aiStatus
      };
    });
    setFieldsState(state);
  }, [auditData]);

  // Overall officer decision
  const [officerDecision, setOfficerDecision] = useState(() => {
    const isCompliant = auditData.overall_verdict === 'COMPLIANT' || (auditData.contraventionCount ?? 0) === 0;
    return isCompliant ? 'CONFIRM_FINDINGS' : 'CONFIRM_NON_COMPLIANCE';
  });

  const [officerRemark, setOfficerRemark] = useState('');
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const handleFieldTextChange = (key, value) => {
    setFieldsState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        correctedValue: value
      }
    }));
  };

  const handleFieldStatusChange = (key, status) => {
    setFieldsState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        officerStatus: status
      }
    }));
  };

  const handleResetToAi = () => {
    const state = {};
    VERIFICATION_FIELDS.forEach((f) => {
      const origVal = getInitialValue(f.key);
      const aiStatus = getInitialStatus(f.key);
      state[f.key] = {
        originalValue: origVal,
        correctedValue: origVal,
        confidence: f.defaultConfidence,
        aiStatus: aiStatus,
        officerStatus: aiStatus
      };
    });
    setFieldsState(state);
    setOfficerRemark('');
  };

  const handleFinalSubmit = () => {
    const hasViolations = Object.values(fieldsState).some(
      (f) => f.officerStatus === 'POTENTIAL_NON_COMPLIANCE'
    );

    let finalVerdict = 'NON-COMPLIANT';
    let finalScore = 100;

    if (officerDecision === 'MARK_COMPLIANT') {
      finalVerdict = 'COMPLIANT';
      finalScore = 100;
    } else if (officerDecision === 'CONFIRM_NON_COMPLIANCE') {
      finalVerdict = 'NON-COMPLIANT';
      finalScore = Math.max(20, 100 - Object.values(fieldsState).filter(f => f.officerStatus === 'POTENTIAL_NON_COMPLIANCE').length * 20);
    } else if (officerDecision === 'FURTHER_REVIEW') {
      finalVerdict = 'PENDING_LABORATORY_REVIEW';
      finalScore = 60;
    } else {
      finalVerdict = hasViolations ? 'NON-COMPLIANT' : 'COMPLIANT';
      finalScore = hasViolations ? 60 : 100;
    }

    const reviewPayload = {
      isReviewed: true,
      reviewedAt: new Date().toISOString(),
      reviewedBy: officer?.officerName || 'Enforcement Officer',
      reviewedById: officer?.officerId || 'LMO-Central-04',
      officerDesignation: officer?.designation || 'Senior Legal Metrology Officer',
      officerDistrict: officer?.district || 'Central Enforcement Zone',
      officerDecision,
      officerRemark: officerRemark.trim(),
      fields: fieldsState,
      finalVerdict,
      finalScore
    };

    onSaveVerification(reviewPayload);
    setShowConfirmSubmit(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl my-auto">
        {/* Tricolor Accent Strip */}
        <div className="h-1.5 w-full flex flex-shrink-0">
          <div className="bg-[#FF9933] flex-1" />
          <div className="bg-white flex-1" />
          <div className="bg-[#138808] flex-1" />
        </div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/50 border border-cyan-700/60 flex items-center justify-center text-cyan-300 shadow-sm flex-shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {lang === 'hi' ? 'अधिकारी मैनुअल सत्यापन एवं समीक्षा' : 'Manual Officer Verification & Findings Review'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                  STATUTORY STAGE 10
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Review, correct, and validate AI-extracted packaging declarations under Section 15 powers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Officer Context Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">
                Inspecting Officer: <strong className="text-white font-semibold">{officer?.officerName || 'Inspector'}</strong> ({officer?.officerId || 'LMO-Central-04'})
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {officer?.district || 'Jurisdiction Range'}
            </span>
          </div>

          {/* Section A: Edit OCR Values Table / Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <h4 className="font-semibold text-slate-200 text-sm">
                  Section A: Declaration OCR Review & Officer Override
                </h4>
              </div>
              <button
                type="button"
                onClick={handleResetToAi}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to AI Detections</span>
              </button>
            </div>

            <div className="space-y-3">
              {VERIFICATION_FIELDS.map((field) => {
                const item = fieldsState[field.key] || {};
                const isModified = item.correctedValue !== item.originalValue;

                return (
                  <div
                    key={field.key}
                    className={`p-3.5 rounded-xl border transition-all ${
                      item.officerStatus === 'POTENTIAL_NON_COMPLIANCE'
                        ? 'bg-rose-950/15 border-rose-800/50'
                        : item.officerStatus === 'REQUIRES_MANUAL_VERIFICATION'
                        ? 'bg-amber-950/15 border-amber-800/50'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{field.label}</span>
                        <span className="text-[10.5px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                          {field.rule}
                        </span>
                        {isModified && (
                          <span className="text-[10px] font-mono font-semibold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/80">
                            OFFICER EDITED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-mono">
                          Confidence: <strong className="text-slate-200">{item.confidence}%</strong>
                        </span>
                        {/* Status Toggle Selector */}
                        <select
                          value={item.officerStatus}
                          onChange={(e) => handleFieldStatusChange(field.key, e.target.value)}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                        >
                          <option value="PASSED">✓ Passed</option>
                          <option value="POTENTIAL_NON_COMPLIANCE">⚠️ Potential Contravention</option>
                          <option value="REQUIRES_MANUAL_VERIFICATION">❓ Needs Physical Lab Check</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Original Detected Value */}
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                        <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                          Original AI / OCR Detected Value:
                        </span>
                        <span className="font-mono text-slate-300 text-xs break-words">
                          {item.originalValue || <em className="text-slate-500">[Unprinted / Blank]</em>}
                        </span>
                      </div>

                      {/* Corrected / Editable Value */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono text-cyan-400 block">
                          Officer Verified / Corrected Value:
                        </span>
                        <input
                          type="text"
                          value={item.correctedValue}
                          onChange={(e) => handleFieldTextChange(field.key, e.target.value)}
                          placeholder="Enter verified label declaration..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B & C: Officer Remarks & Final Decision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            {/* Officer Remarks Textarea */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Officer Inspection Remarks / Field Notes:</span>
              </label>
              <textarea
                rows={3}
                value={officerRemark}
                onChange={(e) => setOfficerRemark(e.target.value)}
                placeholder="Add inspector findings, retail point observations, or reasons for override..."
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            {/* Final Review Action Selection */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 block">
                Final Officer Review Action:
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input
                    type="radio"
                    name="decision"
                    value="CONFIRM_FINDINGS"
                    checked={officerDecision === 'CONFIRM_FINDINGS'}
                    onChange={(e) => setOfficerDecision(e.target.value)}
                    className="text-cyan-500"
                  />
                  <span className="text-slate-200 font-medium">Confirm & Approve AI Findings</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input
                    type="radio"
                    name="decision"
                    value="CONFIRM_NON_COMPLIANCE"
                    checked={officerDecision === 'CONFIRM_NON_COMPLIANCE'}
                    onChange={(e) => setOfficerDecision(e.target.value)}
                    className="text-rose-500"
                  />
                  <span className="text-rose-300 font-medium">Confirm Potential Non-Compliance (Issue Form V Notice)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input
                    type="radio"
                    name="decision"
                    value="MARK_COMPLIANT"
                    checked={officerDecision === 'MARK_COMPLIANT'}
                    onChange={(e) => setOfficerDecision(e.target.value)}
                    className="text-emerald-500"
                  />
                  <span className="text-emerald-300 font-medium">Mark as Compliant (Officer Discretion Exemption)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input
                    type="radio"
                    name="decision"
                    value="FURTHER_REVIEW"
                    checked={officerDecision === 'FURTHER_REVIEW'}
                    onChange={(e) => setOfficerDecision(e.target.value)}
                    className="text-amber-500"
                  />
                  <span className="text-amber-300 font-medium">Send for Further Laboratory Verification</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <span className="text-[11px] text-slate-400">
            Original AI telemetry and visual bounding boxes will remain preserved alongside your review.
          </span>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmSubmit(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Finalize Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Sub-Modal Dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 animate-fade-in">
          <div className="bg-[#111827] border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">
                Confirm Statutory Inspection Review
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to finalize this manual inspection review with decision:
              <strong className="text-white block mt-1 font-mono">
                {officerDecision}
              </strong>
              This record will be saved to the official registry and formatted onto Form V PDF memos under Officer ID{' '}
              <strong className="text-emerald-400">{officer?.officerId || 'LMO-Central-04'}</strong>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Confirm & Record in Registry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
