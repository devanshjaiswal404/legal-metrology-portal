import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  Scale,
  FileCheck,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function StatutoryReferenceTab() {
  const [calcDeclared, setCalcDeclared] = useState(5000); // in grams or ml
  const [calcActual, setCalcActual] = useState(4940); // in grams or ml

  // Schedule II MPE calculation function
  const calculateMPE = (nominal) => {
    if (nominal <= 50) return { percent: 9, fixed: null, maxError: (nominal * 0.09) };
    if (nominal <= 100) return { percent: null, fixed: 4.5, maxError: 4.5 };
    if (nominal <= 200) return { percent: 4.5, fixed: null, maxError: (nominal * 0.045) };
    if (nominal <= 300) return { percent: null, fixed: 9, maxError: 9.0 };
    if (nominal <= 500) return { percent: 3, fixed: null, maxError: (nominal * 0.03) };
    if (nominal <= 1000) return { percent: null, fixed: 15, maxError: 15.0 };
    if (nominal <= 10000) return { percent: 1.5, fixed: null, maxError: (nominal * 0.015) };
    if (nominal <= 15000) return { percent: null, fixed: 150, maxError: 150.0 };
    return { percent: 1, fixed: null, maxError: (nominal * 0.01) };
  };

  const mpeData = calculateMPE(Number(calcDeclared) || 0);
  const allowedDeficit = mpeData.maxError;
  const minAllowedWeight = Math.max(0, (Number(calcDeclared) || 0) - allowedDeficit);
  const actualWeight = Number(calcActual) || 0;
  const isCompliant = actualWeight >= minAllowedWeight;
  const deficit = (Number(calcDeclared) || 0) - actualWeight;

  const scheduleTable = [
    { range: 'Up to 50 g / ml', percent: '9.0%', fixed: '—' },
    { range: '50 to 100 g / ml', percent: '—', fixed: '4.5 g / ml' },
    { range: '100 to 200 g / ml', percent: '4.5%', fixed: '—' },
    { range: '200 to 300 g / ml', percent: '—', fixed: '9.0 g / ml' },
    { range: '300 to 500 g / ml', percent: '3.0%', fixed: '—' },
    { range: '500 to 1,000 g (1 kg / l)', percent: '—', fixed: '15.0 g / ml' },
    { range: '1,000 to 10,000 g (10 kg)', percent: '1.5%', fixed: '—' },
    { range: '10,000 to 15,000 g (15 kg)', percent: '—', fixed: '150.0 g / ml' },
    { range: 'More than 15,000 g (15 kg)', percent: '1.0%', fixed: '—' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Schedule II: Maximum Permissible Error (MPE) Reference
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  PCR, 2011 STATUTE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Statutory limits of error on net quantity specified in the Second Schedule under Rule 2(h) and Rule 11
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-300 font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
            Enforcement: <span className="text-emerald-400">The Legal Metrology Act, 2009</span>
          </div>
        </div>
      </div>

      {/* Interactive Inspector MPE Tolerance Calculator */}
      <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Instant Schedule II Permissible Error Calculator
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Inspector Utility Tool</span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Input 1 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Declared Nominal Net Quantity (g or ml):
            </label>
            <input
              type="number"
              value={calcDeclared}
              onChange={(e) => setCalcDeclared(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400">E.g., 5000g for a 5kg bag</span>
          </div>

          {/* Input 2 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Actual Calibrated Net Quantity (g or ml):
            </label>
            <input
              type="number"
              value={calcActual}
              onChange={(e) => setCalcActual(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400">Recorded using certified test scale</span>
          </div>

          {/* Results Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Statutory Finding:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isCompliant
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-red-500/15 text-red-300 border-red-500/30'
                }`}
              >
                {isCompliant ? 'PASS: WITHIN MPE' : 'VIOLATION: DEFICIT'}
              </span>
            </div>

            <div className="mt-2 text-xs space-y-1 font-mono text-slate-300">
              <div className="flex justify-between">
                <span>Max Allowed Error (MPE):</span>
                <span className="text-amber-400">±{allowedDeficit.toFixed(1)} g/ml</span>
              </div>
              <div className="flex justify-between">
                <span>Min Permissible Weight:</span>
                <span className="text-white">{minAllowedWeight.toFixed(1)} g/ml</span>
              </div>
              <div className="flex justify-between">
                <span>Recorded Difference:</span>
                <span className={deficit > allowedDeficit ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  {deficit > 0 ? `-${deficit.toFixed(1)}` : `+${Math.abs(deficit).toFixed(1)}`} g/ml
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Schedule II Table & Legal Provisions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schedule Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#1e293b] border border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-700/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              Schedule II Statutory Tolerance Limits Table
            </h3>
            <span className="text-[11px] font-mono text-slate-400">PCR, 2011</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Nominal Quantity Range (g or ml)</th>
                  <th className="px-4 py-3 text-center">Percentage of Qty</th>
                  <th className="px-4 py-3 text-center">Fixed Weight (g or ml)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {scheduleTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-200">{row.range}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-emerald-300">{row.percent}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-amber-300">{row.fixed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legal Penalties & Key Sections (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h4>Penal Provisions (Legal Metrology Act, 2009)</h4>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-red-300">Section 36(1): Non-Standard Packages</div>
                <p className="text-slate-400 text-[11px]">
                  Penalty for manufacturing, packing, importing or selling non-standard packages: Fine up to ₹25,000 for 1st offence; ₹50,000 for 2nd offence; and up to ₹1,00,000 or imprisonment up to 1 year for subsequent offences.
                </p>
              </div>

              <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-amber-300">Section 36(2): Error in Net Quantity</div>
                <p className="text-slate-400 text-[11px]">
                  Selling commodities with error exceeding permissible limit: Fine of not less than ₹10,000 extending up to ₹50,000 or imprisonment.
                </p>
              </div>

              <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-emerald-300">Section 48: Compounding of Offences</div>
                <p className="text-slate-400 text-[11px]">
                  Offences under section 36 may be compounded by the Director or authorized legal metrology officer before or after institution of prosecution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
