import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertOctagon,
  Scale,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Package,
  Coins,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export default function AnalyticsDashboard({ t, lang = 'en' }) {
  const [inspections] = useState(() => {
    try {
      const stored = localStorage.getItem('metrology_inspections');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  const violationAudits = inspections.filter(
    (i) => i.verdict === 'violation' || i.verdict === 'NON-COMPLIANT' || i.verdict === 'CONTRAVENTION' || i.status === 'CONTRAVENTION'
  );

  // 1. Top 3 Simplified Violations by Rule (Plain English)
  const topViolations = [
    {
      name: 'Incorrect Metric Units (Rule 13 / 6c)',
      nameHindi: 'गैर-मानक मीट्रिक इकाइयाँ (नियम 13 / 6c)',
      percentage: 45,
      barColor: 'bg-rose-500',
      textColor: 'text-rose-400'
    },
    {
      name: 'Missing Unit Sale Price / USP (Rule 6.11)',
      nameHindi: 'इकाई विक्रय मूल्य अनुपस्थित / USP (नियम 6.11)',
      percentage: 33,
      barColor: 'bg-amber-500',
      textColor: 'text-amber-400'
    },
    {
      name: 'Missing MRP / Inclusive Note (Rule 6e)',
      nameHindi: 'MRP / कर समावेशी नोट अनुपस्थित (नियम 6e)',
      percentage: 22,
      barColor: 'bg-blue-500',
      textColor: 'text-blue-400'
    }
  ];

  // 2. High-Risk Sectors Leaderboard (Top 3 clean items)
  const topSectors = [
    {
      rank: 1,
      category: 'Packaged Snacks & Chips',
      categoryHindi: 'पैकेज्ड स्नैक्स एवं नमकीन',
      count: 44,
      isHighPriority: true
    },
    {
      rank: 2,
      category: 'Spices & Masalas',
      categoryHindi: 'मसाले एवं खाद्य सामग्री',
      count: 32,
      isHighPriority: false
    },
    {
      rank: 3,
      category: 'Edible Oils & Ghee',
      categoryHindi: 'खाद्य तेल एवं घी',
      count: 26,
      isHighPriority: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-slate-100">
                {t?.title || (lang === 'hi' ? 'प्रवर्तन इंटेलिजेंस डैशबोर्ड' : 'Enforcement Intelligence Dashboard')}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-700/80">
                STATE AUDIT TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t?.subtitle || (lang === 'hi' ? 'न्यायिक एवं विधिक मापविज्ञान प्रवर्तन सांख्यिकी' : 'Executive judicial and statutory compliance overview for state tribunals')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{lang === 'hi' ? 'वित्त वर्ष 2026-27 प्रवर्तन चक्र' : 'FY 2026-27 Judicial Record'}</span>
        </div>
      </div>

      {/* 4. High-Contrast Key Intelligence Takeaway Banner */}
      <div className="p-4 sm:p-4.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 text-amber-200 shadow-md flex items-start sm:items-center gap-3.5">
        <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm tracking-tight leading-relaxed">
          <span className="font-bold text-amber-300 mr-2 uppercase tracking-wide font-mono text-[11px] sm:text-xs px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/60 inline-block mb-1 sm:mb-0">
            {lang === 'hi' ? 'जिला टेलीमेट्री अलर्ट' : 'District Telemetry Alert'}
          </span>
          <span className="text-slate-100 font-medium">
            {lang === 'hi'
              ? 'कुल उल्लंघनों में से 78% गैर-मानक SI इकाई प्रतीकों एवं छूटे हुए यूनिट विक्रय मूल्य (USP) के कारण पैकेज्ड स्नैक्स में पाए गए हैं।'
              : '78% of all contraventions originate in pre-packaged snacks due to non-standard SI unit symbols and omitted Unit Sale Prices.'}
          </span>
        </div>
      </div>

      {/* 1. Prominent 3-Card Top Bar (Bold, Clean KPIs for Judges) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Packaging Audited */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {lang === 'hi' ? 'कुल परीक्षित पैकेजिंग' : 'Total Packaging Audited'}
            </span>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Package className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
              184 <span className="text-lg sm:text-xl font-medium text-slate-400 font-sans">{lang === 'hi' ? 'पैकेज' : 'Packages'}</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-medium">
            {lang === 'hi' ? '6 खुदरा जिलों में विस्तृत' : 'Across 6 Retail Districts'}
          </div>
        </div>

        {/* Card 2: Statewide Compliance Rate */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {lang === 'hi' ? 'राज्यव्यापी अनुपालन दर' : 'Statewide Compliance Rate'}
            </span>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
              71.7%
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/70">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{lang === 'hi' ? '132 उत्तीर्ण' : '132 Passed'}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/70">
              <AlertOctagon className="w-3 h-3 text-rose-400" />
              <span>{lang === 'hi' ? '52 उल्लंघन' : '52 Contraventions'}</span>
            </span>
          </div>
        </div>

        {/* Card 3: Section 36 Compounding Ledger */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {lang === 'hi' ? 'धारा 36 शमन लेजर' : 'Section 36 Compounding Ledger'}
            </span>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 font-mono tracking-tight">
              ₹13.0 <span className="text-lg sm:text-xl font-medium text-amber-200/80 font-sans">{lang === 'hi' ? 'लाख' : 'Lakhs'}</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-medium">
            {lang === 'hi' ? 'संभावित वैधानिक दंड वसूली' : 'Potential statutory penalty recovery'}
          </div>
        </div>
      </div>

      {/* 2 & 3. Simplified Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Simplified "Violations by Rule" (6 cols) */}
        <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                {lang === 'hi' ? 'नियम अनुसार उल्लंघन' : 'Violations by Rule'}
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              {lang === 'hi' ? 'शीर्ष 3 उल्लंघन' : 'TOP 3 INFRINGEMENTS'}
            </span>
          </div>

          {/* 3 Progress Bars without fine-print subheadings */}
          <div className="space-y-4 pt-1">
            {topViolations.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-slate-200">
                    {lang === 'hi' ? item.nameHindi : item.name}
                  </span>
                  <span className={`font-mono font-bold text-sm ${item.textColor}`}>
                    {item.percentage}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Simplified "High-Risk Sectors" Leaderboard (6 cols) */}
        <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                {lang === 'hi' ? 'उच्च जोखिम वाले क्षेत्र' : 'High-Risk Sectors'}
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              LEADERBOARD
            </span>
          </div>

          {/* Clean 3-Item Leaderboard without repetitive multi-tags */}
          <div className="space-y-3 pt-1">
            {topSectors.map((sector) => (
              <div
                key={sector.rank}
                className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-slate-300 flex-shrink-0">
                    {sector.rank}
                  </span>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <span>{lang === 'hi' ? sector.categoryHindi : sector.category}</span>
                      {sector.isHighPriority && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80">
                          {lang === 'hi' ? 'उच्च प्राथमिकता' : 'High Priority'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950/40 px-2.5 py-1 rounded border border-rose-900/50">
                    {sector.count} {lang === 'hi' ? 'उल्लंघन चिह्नित' : 'Contraventions flagged'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Repeat Offenders & Seizures Section (if local scans have violations) */}
      {violationAudits.length > 0 && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                {lang === 'hi' ? 'बारंबार उल्लंघनकर्ता ब्रांड एवं वैधानिक जब्ती रजिस्टर' : 'Brand Repeat Offenders & Statutory Seizure Register'}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-rose-300 font-semibold bg-rose-950/40 px-2.5 py-1 rounded border border-rose-800/50 self-start sm:self-auto">
              SECTION 36(1) PROCEEDINGS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-2.5 px-3">{lang === 'hi' ? 'निर्माता / ब्रांड' : 'Manufacturer / Brand'}</th>
                  <th className="py-2.5 px-3">{lang === 'hi' ? 'मुख्य गैर-अनुपालन' : 'Primary Non-Compliance'}</th>
                  <th className="py-2.5 px-3">{lang === 'hi' ? 'मेमो संदर्भ' : 'Memo Reference'}</th>
                  <th className="py-2.5 px-3">{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
                  <th className="py-2.5 px-3">{lang === 'hi' ? 'वैधानिक कार्रवाई' : 'Statutory Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {violationAudits.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-semibold text-slate-100">{item.commodity || item.name || 'Packaged Specimen'}</td>
                    <td className="py-3 px-3 text-rose-300">
                      {item.rules?.find((r) => r.status === 'violation')?.title || (lang === 'hi' ? 'वैधानिक घोषणा लोप' : 'Statutory Declaration Omission')}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{item.memoRef || 'LMO/2026/PROC'}</td>
                    <td className="py-3 px-3 font-mono text-rose-400 font-semibold">
                      {lang === 'hi' ? 'गैर-अनुपालित' : 'Non-Compliant'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950/50 text-rose-300 border border-rose-800/60">
                        {lang === 'hi' ? 'नोटिस जारी' : 'Notice Issued'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
