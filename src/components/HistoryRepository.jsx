import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Search,
  Download,
  FileText,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  ClipboardCheck
} from 'lucide-react';
import { exportFormVPdf } from '../utils/exportPdf';
import { getCleanInspections } from '../utils/storagePurge';

export default function HistoryRepository({ onViewAudit, onClose, t, lang = 'en' }) {
  // 1. Data Storage: Clean initial state free of legacy mock records
  const [inspections, setInspections] = useState(() => getCleanInspections());

  useEffect(() => {
    const handleHistoryUpdate = () => {
      setInspections(getCleanInspections());
    };
    window.addEventListener('metrology_history_updated', handleHistoryUpdate);
    window.addEventListener('storage', handleHistoryUpdate);
    return () => {
      window.removeEventListener('metrology_history_updated', handleHistoryUpdate);
      window.removeEventListener('storage', handleHistoryUpdate);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'violations' | 'compliant'
  const [selectedAuditForModal, setSelectedAuditForModal] = useState(null);

  // Save changes to localStorage helper
  const updateStorage = (data) => {
    setInspections(data);
    try {
      localStorage.setItem('metrology_inspections', JSON.stringify(data));
      window.dispatchEvent(new Event('metrology_history_updated'));
    } catch (err) {
      console.error('Error writing to localStorage:', err);
    }
  };

  // Clear History with Confirmation Prompt
  const handleClearHistory = () => {
    const promptMsg = lang === 'hi'
      ? 'क्या आप निश्चित रूप से संपूर्ण निरीक्षण इतिहास मिटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।'
      : 'Are you sure you want to clear all inspection history? This action cannot be undone.';
    const confirmed = window.confirm(promptMsg);
    if (confirmed) {
      updateStorage([]);
    }
  };

  // Re-download Form V PDF
  const handleDownloadNotice = (audit) => {
    exportFormVPdf({
      rules: audit.rules || [],
      score: audit.score || 0,
      minNumeralHeight: audit.minNumeralHeight || '2.5 mm',
      inspectorId: audit.inspectorId || 'LMO-Central-04',
      memoRef: audit.memoRef
    });
  };

  // Helper function for dynamic compliance resolution
  const checkIsCompliant = (record) => {
    if (!record) return false;
    return (
      record.status === 'COMPLIANT' ||
      record.verdict === 'COMPLIANT' ||
      record.verdict === 'pass' ||
      record.score === 100 ||
      (record.contraventionCount ?? record.violationsCount ?? 0) === 0
    );
  };

  // Filter and Search Logic
  const filteredAudits = inspections.filter((item) => {
    const matchesSearch =
      (item.commodity || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.memoRef || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const isCompliant = checkIsCompliant(item);

    if (filterMode === 'violations') {
      return !isCompliant;
    }
    if (filterMode === 'compliant') {
      return isCompliant;
    }
    return true;
  });

  const totalCount = inspections.length;
  const compliantCount = inspections.filter((i) => checkIsCompliant(i)).length;
  const violationCount = inspections.filter((i) => !checkIsCompliant(i)).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-700/80 flex-shrink-0">
              <FolderArchive className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-slate-100">
                  {t?.title || 'Statutory Inspection Repository'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-700/80">
                  SECTION 15 &amp; 36 REGISTRY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t?.subtitle || 'Persistent legal audit ledger under Section 15 & 36 of Legal Metrology Act, 2009'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={inspections.length === 0}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                inspections.length === 0
                  ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                  : 'bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'hi' ? 'इतिहास मिटाएं' : 'Clear History'}</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1 border border-slate-800"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t?.searchPlaceholder || 'Search by Memo ID, Brand, or Commodity...'}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 font-mono"
            />
          </div>

          {/* Filter Dropdown / Pills */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t?.filterAll || 'All Records'} ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('violations')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === 'violations'
                  ? 'bg-rose-950/50 text-rose-200 shadow-sm border border-rose-800/60'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{t?.filterViolations || 'Contraventions Only'} ({violationCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('compliant')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === 'compliant'
                  ? 'bg-emerald-950/50 text-emerald-200 shadow-sm border border-emerald-800/60'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t?.filterCompliant || 'Compliant Only'} ({compliantCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Formatted Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200">
            {lang === 'hi' ? `रजिस्टर में ${filteredAudits.length} रिकॉर्ड प्रदर्शित` : `Displaying ${filteredAudits.length} Records in Local Registry`}
          </span>
          <span className="font-mono text-[11px] text-slate-500">Key: 'metrology_inspections'</span>
        </div>

        {filteredAudits.length === 0 ? (
          <div className="p-12 sm:p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 shadow-inner">
              <ClipboardCheck className="w-7 h-7 text-slate-400" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <div className="text-base font-semibold text-slate-200 tracking-tight">
                {searchTerm || filterMode !== 'all'
                  ? (lang === 'hi' ? 'कोई मेल खाने वाला रिकॉर्ड नहीं मिला' : 'No Matching Records Found')
                  : (lang === 'hi' ? 'कोई निरीक्षण रिकॉर्ड नहीं मिला' : 'No Inspection Records Found')}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {searchTerm || filterMode !== 'all'
                  ? (lang === 'hi' ? 'कृपया अपनी खोज या फ़िल्टर चयन को समायोजित करें।' : 'Try adjusting your search query or filter selection.')
                  : (lang === 'hi'
                      ? 'पैकेज स्कैनर में निरीक्षण चलाए जाने के बाद ऑडिट किए गए पैकेज और प्रपत्र V नोटिस यहां दिखाई देंगे।'
                      : 'Audited packages and Form V notices will appear here once an inspection is run in the Package Scanner.')}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">{t?.colId || 'Memo Reference'}</th>
                  <th className="px-4 py-3.5">{t?.colImage || 'Sample'}</th>
                  <th className="px-4 py-3.5">{t?.colBrand || 'Commodity & Packer'}</th>
                  <th className="px-4 py-3.5">{t?.colDate || 'Timestamp'}</th>
                  <th className="px-4 py-3.5 text-center">{t?.colVerdict || 'Statutory Status'}</th>
                  <th className="px-4 py-3.5 text-center">{t?.colScore || 'Score'}</th>
                  <th className="px-4 py-3.5 text-right">{t?.colActions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAudits.map((item) => {
                  const isCompliant = checkIsCompliant(item);
                  const isPass = isCompliant;
                  const thumbnail = item.image || (isCompliant ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&auto=format&fit=crop');

                  return (
                    <tr key={item.id || item.memoRef} className="hover:bg-slate-800/30 transition-colors">
                      {/* Column 1: Memo ID */}
                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-200 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">
                          {item.memoRef}
                        </span>
                      </td>

                      {/* Column 2: Scanned Image Thumbnail */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shadow-sm">
                          <img
                            src={thumbnail}
                            alt={item.commodity}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Column 3: Brand / Product */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-100 max-w-xs sm:max-w-sm truncate" title={item.commodity}>
                          {item.commodity}
                        </div>
                        {item.manufacturer && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs" title={item.manufacturer}>
                            {item.manufacturer}
                          </div>
                        )}
                      </td>

                      {/* Column 4: Date & Time */}
                      <td className="px-4 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.timestamp}</span>
                        </div>
                      </td>

                      {/* Column 5: Verdict Pill Badge */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold border tracking-wider uppercase ${
                            isCompliant
                              ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                              : 'bg-rose-950/30 text-rose-300 border-rose-800/50'
                          }`}
                        >
                          {isCompliant ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-400" />
                          )}
                          <span>
                            {isCompliant ? (lang === 'hi' ? 'अनुपालित' : 'COMPLIANT') : (lang === 'hi' ? 'उल्लंघन' : 'VIOLATION')}
                          </span>
                        </span>
                      </td>

                      {/* Column 6: Score (/100) */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`font-mono font-semibold text-xs ${
                            isCompliant ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.score}/100
                        </span>
                      </td>

                      {/* Column 7: Actions ("View Memo", "Download Form V PDF") */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAuditForModal(item);
                              if (onViewAudit) onViewAudit(item);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lang === 'hi' ? 'मेमो देखें' : 'View Memo'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadNotice(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-white text-slate-900 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{lang === 'hi' ? 'प्रपत्र V डाउनलोड' : 'Download Form V PDF'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Detail Modal / Slide-over (When View Audit is clicked) */}
      {selectedAuditForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                  <FileText className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                      {lang === 'hi' ? 'वैधानिक निरीक्षण डोजियर' : 'Statutory Inspection Dossier'}: {selectedAuditForModal.memoRef}
                    </h3>
                    {(() => {
                      const isModalCompliant = checkIsCompliant(selectedAuditForModal);
                      return (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            isModalCompliant
                              ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                              : 'bg-rose-950/30 text-rose-300 border-rose-800/50'
                          }`}
                        >
                          {isModalCompliant ? (lang === 'hi' ? 'अनुपालित' : 'COMPLIANT') : (lang === 'hi' ? 'उल्लंघन' : 'VIOLATION')}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedAuditForModal.timestamp} • {lang === 'hi' ? 'निरीक्षक' : 'Inspector'}: {selectedAuditForModal.inspectorId || 'LMO-Central-04'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAuditForModal(null)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-300">
              {/* Commodity Card */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                  {lang === 'hi' ? 'निरीक्षित वस्तु' : 'Inspected Commodity'}
                </div>
                <div className="text-sm font-semibold text-slate-100">{selectedAuditForModal.commodity}</div>
                <div className="text-slate-400">{selectedAuditForModal.manufacturer}</div>
                <div className="flex gap-4 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                  <div>
                    {lang === 'hi' ? 'स्कोर' : 'Score'}:{' '}
                    <strong className={checkIsCompliant(selectedAuditForModal) ? 'text-emerald-400' : 'text-rose-400'}>
                      {selectedAuditForModal.score}/100
                    </strong>
                  </div>
                  <div>{lang === 'hi' ? 'न्यूनतम फॉन्ट' : 'Min Font'}: <strong className="text-amber-300">{selectedAuditForModal.minNumeralHeight}</strong></div>
                  <div>PDP: <strong className="text-slate-200">{selectedAuditForModal.pdpArea || 150} cm²</strong></div>
                </div>
              </div>

              {/* Rules Evaluation List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                  {lang === 'hi' ? 'अनिवार्य घोषणाओं का विस्तृत ऑडिट' : 'Mandatory Declarations Audit Breakdown'}
                </h4>
                <div className="space-y-2.5">
                  {(selectedAuditForModal.rules || []).map((r, idx) => {
                    const isPass = r.status === 'pass';
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          isPass
                            ? 'bg-slate-900/40 border-slate-800'
                            : 'bg-rose-950/10 border-rose-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            {isPass ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            )}
                            <span>{r.title}</span>
                          </span>
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                              isPass
                                ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                                : 'bg-rose-950/30 text-rose-300 border-rose-800/50'
                            }`}
                          >
                            {isPass ? (lang === 'hi' ? 'पास' : 'PASS') : (lang === 'hi' ? 'उल्लंघन' : 'VIOLATION')}
                          </span>
                        </div>
                        <div className="mt-1.5 font-mono text-[11px] text-slate-300">
                          {isPass ? r.detectedText : r.offendingText}
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {isPass ? r.remark : r.violationReason}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={() => setSelectedAuditForModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-800"
              >
                {lang === 'hi' ? 'बंद करें' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadNotice(selectedAuditForModal)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-white text-slate-900 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'hi' ? 'पुनः प्रपत्र V डाउनलोड करें' : 'Re-Download Form V PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
