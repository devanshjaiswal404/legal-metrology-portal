import React, { useState, useMemo } from 'react';
import {
  Pill,
  Search,
  UploadCloud,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Download,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Scale,
  Sparkles,
  Activity,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { NPPA_DRUGS_DATABASE, evaluateDrugPricing } from '../../data/nppaDrugsData';
import { exportFormVIPdf } from '../../utils/exportFormVIPdf';

export default function PharmaDpcoModule({ t, lang = 'en', onTriggerToast }) {
  // Audit Mode: 'upload' | 'search'
  const [auditMode, setAuditMode] = useState('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrugId, setSelectedDrugId] = useState('dolo-650');
  const [customMrp, setCustomMrp] = useState('34.50');
  const [uploadedImage, setUploadedImage] = useState(
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop'
  );
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Selected drug record
  const currentDrug = useMemo(() => {
    return NPPA_DRUGS_DATABASE.find((d) => d.id === selectedDrugId) || NPPA_DRUGS_DATABASE[0];
  }, [selectedDrugId]);

  // Filtered drug formulations for Search Mode
  const filteredDrugs = useMemo(() => {
    if (!searchQuery.trim()) return NPPA_DRUGS_DATABASE;
    const q = searchQuery.toLowerCase();
    return NPPA_DRUGS_DATABASE.filter(
      (d) =>
        d.brandName.toLowerCase().includes(q) ||
        d.genericName.toLowerCase().includes(q) ||
        d.saltComposition.toLowerCase().includes(q) ||
        d.manufacturer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Evaluated pricing and packaging result
  const auditResult = useMemo(() => {
    const mrp = parseFloat(customMrp) || currentDrug.brandedMrp;
    return evaluateDrugPricing(currentDrug, mrp);
  }, [currentDrug, customMrp]);

  // Handle preset selection
  const handleSelectPreset = (drugId) => {
    const drug = NPPA_DRUGS_DATABASE.find((d) => d.id === drugId);
    if (!drug) return;
    setSelectedDrugId(drugId);
    setCustomMrp(drug.brandedMrp.toFixed(2));
    if (drug.sampleImage) {
      setUploadedImage(drug.sampleImage);
    }
    if (onTriggerToast) {
      onTriggerToast(
        lang === 'hi'
          ? `${drug.brandName} (${drug.saltComposition}) लोड किया गया`
          : `Loaded ${drug.brandName} formulation record`,
        '💊'
      );
    }
  };

  // Handle file drop / upload
  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      // If filename matches any preset keywords, auto-switch
      const name = file.name.toLowerCase();
      if (name.includes('atorva')) handleSelectPreset('atorvastatin-10');
      else if (name.includes('azith')) handleSelectPreset('azithromycin-500');
      else if (name.includes('glyco') || name.includes('metformin')) handleSelectPreset('metformin-500-sr');
      else if (name.includes('aug')) handleSelectPreset('amoxiclav-625');
      else handleSelectPreset('dolo-650');
    };
    reader.readAsDataURL(file);
  };

  // Trigger Form VI PDF export
  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    try {
      exportFormVIPdf({
        auditResult,
        inspectorId: 'LMO-Central-04 / NPPA-Squad-02'
      });
      if (onTriggerToast) {
        onTriggerToast(
          lang === 'hi'
            ? 'प्रपत्र VI DPCO मांग नोटिस (PDF) डाउनलोड किया गया'
            : 'Form VI DPCO Demand Notice (PDF) exported',
          '📄'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsExportingPdf(false), 500);
    }
  };

  // Export CSV Audit Ledger
  const handleExportCsv = () => {
    const headers = [
      'Drug Formulation',
      'Generic Name',
      'Salt Composition',
      'Pack Size',
      'Branded MRP',
      'NPPA Ceiling Cap',
      'PMBJP Generic Price',
      'Compliance Status',
      'Overcharge Amount',
      'Overcharge Percentage',
      'Compounding Demand'
    ];

    const row = [
      `"${auditResult.drug.brandName}"`,
      `"${auditResult.drug.genericName}"`,
      `"${auditResult.drug.saltComposition}"`,
      `"${auditResult.drug.packSize} ${auditResult.drug.unit}"`,
      `"₹${auditResult.scannedMrp.toFixed(2)}"`,
      `"₹${auditResult.ceilingPrice.toFixed(2)}"`,
      `"₹${auditResult.genericPrice.toFixed(2)}"`,
      `"${auditResult.status}"`,
      `"₹${auditResult.overchargeAmount.toFixed(2)}"`,
      `"${auditResult.overchargePercentage}%"`,
      `"₹${auditResult.statutoryCompoundingDemand.toFixed(2)}"`
    ];

    const csvContent = [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DPCO_Pharma_Audit_${auditResult.drug.id}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    if (onTriggerToast) {
      onTriggerToast(
        lang === 'hi' ? 'फार्मा ऑडिट लेजर (CSV) निर्यात किया गया' : 'Pharma Audit Ledger (CSV) exported',
        '📊'
      );
    }
  };

  const isOvercharging = auditResult.isOvercharging;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Legislative Citation */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 uppercase tracking-wide flex items-center gap-1.5">
                <Pill className="w-3 h-3 text-cyan-400" />
                <span>NPPA &bull; DPCO, 2013</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                {lang === 'hi' ? 'आवश्यक वस्तु अधिनियम, 1955' : 'Essential Commodities Act, 1955 (Section 7)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {lang === 'hi'
                ? 'औषधि मूल्य नियंत्रण (DPCO) एवं विधिक मापविज्ञान ऑडिट'
                : 'Pharmaceutical Pricing & DPCO Compliance Audit'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {lang === 'hi'
                ? 'राष्ट्रीय औषधि मूल्य निर्धारण प्राधिकरण (NPPA) द्वारा अधिसूचित सीलिंग मूल्य से दवाओं के अंकित मूल्य का मिलान करें और अवैध अधिक वसूली पर जब्ती व मांग नोटिस जारी करें।'
                : 'Cross-reference retail medicine packages against NPPA notified statutory ceiling prices under DPCO, 2013 and compute branded vs. generic markups with illegal compounding recovery calculations.'}
            </p>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto flex-shrink-0">
            <button
              type="button"
              onClick={() => setAuditMode('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                auditMode === 'upload'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'hi' ? 'स्ट्रिप फोटो स्कैन' : 'Scan Strip Image'}</span>
            </button>
            <button
              type="button"
              onClick={() => setAuditMode('search')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                auditMode === 'search'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'hi' ? 'सॉल्ट खोज' : 'Search Formulation'}</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Preset Chips */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex-shrink-0">
            {lang === 'hi' ? 'त्वरित औषधि नमूने:' : 'Statutory Presets:'}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleSelectPreset('dolo-650')}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:scale-105 cursor-pointer ${
                selectedDrugId === 'dolo-650'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-700/80 shadow-sm'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              💊 Dolo 650 (Paracetamol 650mg &bull; 15 Tabs)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('atorvastatin-10')}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:scale-105 cursor-pointer ${
                selectedDrugId === 'atorvastatin-10'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-700/80 shadow-sm'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              💊 Atorvastatin 10mg (10 Tabs)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('azithromycin-500')}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:scale-105 cursor-pointer ${
                selectedDrugId === 'azithromycin-500'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/80 shadow-sm'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              💊 Azithromycin 500mg (3 Tabs)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('metformin-500-sr')}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:scale-105 cursor-pointer ${
                selectedDrugId === 'metformin-500-sr'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/80 shadow-sm'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              💊 Metformin 500mg SR (10 Tabs)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Optical Packaging Inspection or Formulation Search (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {auditMode === 'upload' ? (
            /* Mode A: Optical Medicine Strip Upload Card */
            <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-cyan-400" />
                  <span>{lang === 'hi' ? 'दवा स्ट्रिप / बॉक्स नमूना' : 'Medicine Packaging Specimen'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentDrug.packSize} {currentDrug.unit}
                </span>
              </div>

              {/* Viewport with Bounding Box Highlights */}
              <div className="relative aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center group">
                <img
                  src={uploadedImage}
                  alt={currentDrug.brandName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Simulated Pharmaceutical Bounding Boxes */}
                {/* 1. MRP Box */}
                <div
                  style={{ position: 'absolute', top: '22%', left: '15%', width: '40%', height: '18%' }}
                  className={`border-2 rounded transition-all flex flex-col justify-between p-1 z-10 ${
                    isOvercharging
                      ? 'border-rose-500 bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : 'border-emerald-500 bg-emerald-500/20'
                  }`}
                >
                  <span
                    className={`text-[9px] font-mono font-bold px-1 py-0.5 rounded self-start ${
                      isOvercharging ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    MRP: ₹{auditResult.scannedMrp.toFixed(2)} ({isOvercharging ? 'OVERCHARGED' : 'PASS'})
                  </span>
                </div>

                {/* 2. Schedule H Warning Box */}
                <div
                  style={{ position: 'absolute', top: '50%', left: '15%', width: '68%', height: '22%' }}
                  className="border-2 border-amber-500/90 bg-amber-500/15 rounded p-1 z-10 flex items-start"
                >
                  <span className="text-[8.5px] font-mono font-bold bg-slate-900/95 text-amber-300 px-1 py-0.5 rounded border border-amber-800">
                    {currentDrug.scheduleType}
                  </span>
                </div>

                {/* 3. Batch & Expiry Box */}
                <div
                  style={{ position: 'absolute', top: '76%', left: '45%', width: '45%', height: '16%' }}
                  className="border-2 border-emerald-500/90 bg-emerald-500/15 rounded p-1 z-10 flex items-end justify-end"
                >
                  <span className="text-[8.5px] font-mono font-bold bg-slate-900/95 text-emerald-300 px-1 py-0.5 rounded border border-emerald-800">
                    Exp: {currentDrug.expDate} (PASS)
                  </span>
                </div>
              </div>

              {/* Upload Input & Scanned MRP Adjuster */}
              <div className="pt-1 space-y-3">
                <label className="block text-xs text-slate-400 font-medium">
                  {lang === 'hi' ? 'स्ट्रिप पर अंकित खुदरा मूल्य (MRP) सत्यापित करें:' : 'Verify Scanned Strip MRP (₹):'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-slate-400 font-mono text-sm">₹</span>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      value={customMrp}
                      onChange={(e) => setCustomMrp(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/90 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <label className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'hi' ? 'फोटो बदलें' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                    />
                  </label>
                </div>
                <span className="text-[11px] text-slate-400 font-mono block">
                  {lang === 'hi'
                    ? `NPPA सीलिंग सीमा: ₹${auditResult.ceilingPrice.toFixed(2)} (${auditResult.drug.packSize} गोलियाँ)`
                    : `Statutory NPPA Ceiling: ₹${auditResult.ceilingPrice.toFixed(2)} (${auditResult.drug.packSize} ${auditResult.drug.unit})`}
                </span>
              </div>
            </div>
          ) : (
            /* Mode B: Search Formulation / Drug Name */
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-4 shadow-sm">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={lang === 'hi' ? 'दवा या साल्ट का नाम खोजें (उदा. Dolo, Paracetamol)...' : 'Search drug name or active salt (e.g., Atorvastatin)...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Formulation List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredDrugs.map((d) => {
                  const isSelected = selectedDrugId === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => handleSelectPreset(d.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-700/80 ring-1 ring-cyan-500/50'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{d.brandName}</span>
                        <span className="font-mono font-semibold text-cyan-300">
                          Ceiling: ₹{d.nppaCeilingPricePerPack.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{d.saltComposition}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-800/60">
                        <span>{d.manufacturer}</span>
                        <span>{d.packSize} {d.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Statutory Pricing Analysis & Demand Notice (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Statutory Pricing Verdict Banner */}
          <div
            className={`rounded-xl p-5 text-white shadow-sm transition-all border ${
              isOvercharging
                ? 'bg-rose-950/20 border-rose-800/50 text-rose-100'
                : 'bg-emerald-950/20 border-emerald-800/50 text-emerald-100'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  {lang === 'hi' ? 'DPCO मूल्य निर्धारण स्थिति' : 'DPCO Statutory Pricing Verdict'}
                </span>
                <div className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
                  {isOvercharging ? (
                    <>
                      <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      <span className="text-rose-200">DPCO CEILING CONTRAVENTION</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-emerald-200">DPCO COMPLIANT</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  {auditResult.verdictMessage}
                </p>
              </div>

              {/* Overcharge / Savings Counter Pill */}
              <div className="flex items-center self-start sm:self-auto">
                <div
                  className={`px-3.5 py-2 rounded-lg font-mono font-bold text-xs sm:text-sm border shadow-sm flex flex-col items-end ${
                    isOvercharging
                      ? 'bg-slate-900 text-rose-300 border-rose-800/60'
                      : 'bg-slate-900 text-emerald-300 border-emerald-800/60'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-normal">
                    {isOvercharging ? (lang === 'hi' ? 'अवैध अधिक वसूली' : 'Overcharge Delta') : (lang === 'hi' ? 'उपभोक्ता बचत' : 'Consumer Savings')}
                  </span>
                  <span className="text-base font-bold text-white flex items-center gap-1">
                    {isOvercharging ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-rose-400" />
                        <span>+{auditResult.overchargePercentage}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 text-emerald-400" />
                        <span>{auditResult.consumerSavingsVsCeiling > 0 ? `-${auditResult.consumerSavingsVsCeiling}%` : 'Cap Compliant'}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Three-Way Price Comparison Card */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  <span>{lang === 'hi' ? '3-तरफा वैधानिक मूल्य तुलना' : '3-Way Statutory Price Comparison'}</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {currentDrug.brandName} &bull; {currentDrug.saltComposition} ({currentDrug.packSize} {currentDrug.unit})
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                {currentDrug.nppaOrderNo}
              </span>
            </div>

            {/* Three Comparative Metric Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Column 1: Scanned Branded MRP */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isOvercharging
                    ? 'bg-rose-950/20 border-rose-800/60 ring-1 ring-rose-500/20'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                    {lang === 'hi' ? 'अंकित खुदरा मूल्य (MRP)' : 'Scanned Branded MRP'}
                  </span>
                  <div className="text-xl font-bold text-white font-mono mt-1">
                    ₹{auditResult.scannedMrp.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ₹{(auditResult.scannedMrp / currentDrug.packSize).toFixed(2)} / tablet
                  </span>
                </div>
                <span
                  className={`inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-mono font-semibold self-start border ${
                    isOvercharging
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {isOvercharging ? 'EXCEEDS CAP' : 'LEGAL RETAIL'}
                </span>
              </div>

              {/* Column 2: NPPA Ceiling Price Cap */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/50 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wide">
                    {lang === 'hi' ? 'NPPA सीलिंग मूल्य कैप' : 'NPPA Ceiling Cap'}
                  </span>
                  <div className="text-xl font-bold text-cyan-200 font-mono mt-1">
                    ₹{auditResult.ceilingPrice.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    ₹{currentDrug.nppaCeilingPricePerUnit.toFixed(2)} / tablet (Max Legal)
                  </span>
                </div>
                <span className="inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 self-start">
                  DPCO PARA 14 CAP
                </span>
              </div>

              {/* Column 3: PMBJP Generic Equivalent */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/50 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wide">
                    {lang === 'hi' ? 'जन औषधि जेनेरिक मूल्य' : 'PMBJP Generic Price'}
                  </span>
                  <div className="text-xl font-bold text-emerald-200 font-mono mt-1">
                    ₹{auditResult.genericPrice.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ₹{(auditResult.genericPrice / currentDrug.packSize).toFixed(2)} / tablet
                  </span>
                </div>
                <span className="inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 self-start">
                  GENERIC BENCHMARK
                </span>
              </div>
            </div>

            {/* Overcharge Recovery Highlight (if violation) */}
            {isOvercharging && (
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>
                      {lang === 'hi' ? 'वैधानिक वसूली गणना (पैरा 16)' : 'Statutory Compounding Recovery (Para 16)'}
                    </span>
                  </span>
                  <p className="text-[11px] text-slate-300">
                    {lang === 'hi'
                      ? `जब्त 15,000 पैक बैच पर अवैध वसूली: ₹${auditResult.totalIllegalOvercharge.toLocaleString('en-IN')}`
                      : `Estimated 15,000 packs batch recovery: ₹${auditResult.totalIllegalOvercharge.toLocaleString('en-IN')} + 18% p.a. interest`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-rose-400 font-mono uppercase block">
                    {lang === 'hi' ? 'कुल मांग राशि' : 'Total Demand Due'}
                  </span>
                  <span className="font-mono font-bold text-rose-200 text-sm">
                    ₹{auditResult.statutoryCompoundingDemand.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Action Card: Form VI PDF & CSV Export Buttons */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-300 text-center sm:text-left">
              <span className="font-semibold text-slate-200">
                {lang === 'hi' ? 'औषधि प्रवर्तन मांग प्रपत्र:' : 'Enforcement Demand Memo:'}{' '}
              </span>
              <span className="text-slate-400">
                {lang === 'hi'
                  ? 'प्रपत्र VI DPCO मांग नोटिस एवं सीलिंग जब्ती मेमो तैयार करें।'
                  : 'Generate official Form VI DPCO overcharging intimation & recovery memo.'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs sm:text-sm shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-900" />
                <span>
                  {isExportingPdf
                    ? (lang === 'hi' ? 'मेमो तैयार हो रहा है...' : 'Generating Notice...')
                    : (lang === 'hi' ? 'प्रपत्र VI DPCO नोटिस (PDF)' : 'Download Form VI Notice (PDF)')}
                </span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs sm:text-sm border border-slate-700/80 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'hi' ? 'फार्मा लेजर (CSV)' : 'Export Pharma Ledger (CSV)'}</span>
              </button>
            </div>
          </div>

          {/* 4. Medical Packaging Label Checks */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'hi' ? 'फार्मास्युटिकल पैकेजिंग वैधानिक चेकलिस्ट' : 'Pharmaceutical Packaging Statutory Checklist'}</span>
            </h4>

            {auditResult.packagingChecklist.map((item) => {
              const isPass = item.status === 'pass';
              return (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 rounded-xl border bg-[#111827] transition-all ${
                    isPass
                      ? 'border-slate-800/80 hover:border-slate-700'
                      : 'border-rose-800/60 bg-rose-950/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h5 className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                      {isPass ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      )}
                      <span>{lang === 'hi' ? item.titleHindi : item.title}</span>
                    </h5>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase tracking-wide flex-shrink-0 ${
                        isPass
                          ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
                          : 'bg-rose-950/30 text-rose-300 border-rose-800/40'
                      }`}
                    >
                      {isPass ? (lang === 'hi' ? 'अनुपालित' : 'COMPLIANT') : (lang === 'hi' ? 'उल्लंघन' : 'CONTRAVENTION')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 pl-5 space-y-0.5">
                    <p className="font-mono text-[11px] text-slate-200">{item.found}</p>
                    <p className="text-[11.5px] text-slate-400">{item.law}</p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500 pl-5">
                    <span>{lang === 'hi' ? 'कानूनी संदर्भ:' : 'Statute:'} {item.citation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
