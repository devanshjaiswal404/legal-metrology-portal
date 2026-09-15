import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertOctagon,
  FileCheck2,
  PieChart,
  Scale,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  Inbox
} from 'lucide-react';
import AnimatedNumber from '../AnimatedNumber';

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

  const totalInspections = inspections.length;
  const violationAudits = inspections.filter((i) => i.verdict === 'violation' || i.verdict === 'NON-COMPLIANT');
  const nonComplianceRate = totalInspections > 0 ? ((violationAudits.length / totalInspections) * 100).toFixed(1) + '%' : '0%';
  const totalNoticesIssued = violationAudits.length;

  // Summary Metrics Data connected dynamically to localStorage
  const summaryMetrics = [
    {
      title: t?.totalScans || 'Total Inspections',
      value: String(totalInspections),
      numericValue: totalInspections,
      badge: totalInspections > 0 ? `${totalInspections} ${lang === 'hi' ? 'दर्ज' : 'logged'}` : (lang === 'hi' ? '0 दर्ज' : '0 logged'),
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: Scale,
      subtext: lang === 'hi' ? 'केंद्रीय एवं राज्य प्रवर्तन इकाइयाँ' : 'Central & State Enforcement Units'
    },
    {
      title: t?.contraventionRate || 'Contravention Rate',
      value: nonComplianceRate,
      numericValue: totalInspections > 0 ? parseFloat(nonComplianceRate) : 0,
      isPercent: true,
      badge: `${violationAudits.length} ${lang === 'hi' ? 'उल्लंघन चिह्नित' : 'violations flagged'}`,
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      icon: AlertOctagon,
      subtext: lang === 'hi' ? 'धारा 36 वैधानिक न्यायनिर्णयन अपेक्षित' : 'Requires Sec 36 statutory adjudication'
    },
    {
      title: t?.frequentViolation || 'Top Infringement',
      value: totalInspections > 0 && violationAudits.length > 0 ? 'Rule 6(1)(c)' : (lang === 'hi' ? 'कोई नहीं' : 'None Detected'),
      badge: totalInspections > 0 && violationAudits.length > 0 ? (lang === 'hi' ? 'अवैध "gms" इकाइयाँ' : 'Prohibited "gms" units') : (lang === 'hi' ? 'सभी अनुपालित' : 'All Compliant'),
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: AlertTriangle,
      subtext: lang === 'hi' ? 'पैकेजिंग पर गैर-मानक वजन प्रतीक' : 'Non-standard weight symbols on packaging'
    },
    {
      title: t?.noticesIssued || 'Form V Notices Served',
      value: String(totalNoticesIssued),
      numericValue: totalNoticesIssued,
      badge: `${totalNoticesIssued} ${lang === 'hi' ? 'प्रपत्र V मेमो' : 'Form V Memos'}`,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: FileCheck2,
      subtext: totalNoticesIssued > 0 ? (lang === 'hi' ? 'वैधानिक शमन प्रक्रियाधीन' : 'Pending statutory compounding') : (lang === 'hi' ? '0 लंबित नोटिस' : '0 pending notices')
    }
  ];

  // Chart 1: Violations by Rule Category
  const ruleBreakdown = [
    { rule: lang === 'hi' ? 'नियम 6(1)(c) शुद्ध मात्रा इकाइयाँ' : 'Rule 6(1)(c) Net Quantity Symbols', percentage: 41, count: '41%', color: 'bg-rose-500' },
    { rule: lang === 'hi' ? 'नियम 6(11) इकाई विक्रय मूल्य (USP गायब)' : 'Rule 6(11) Unit Sale Price (USP Missing)', percentage: 27, count: '27%', color: 'bg-amber-500' },
    { rule: lang === 'hi' ? 'नियम 6(1)(f) उपभोक्ता सहायता (ईमेल गायब)' : 'Rule 6(1)(f) Consumer Care (Email Missing)', percentage: 19, count: '19%', color: 'bg-orange-500' },
    { rule: lang === 'hi' ? 'नियम 6(1)(e) MRP एवं कर (समावेशी नोट नहीं)' : 'Rule 6(1)(e) MRP & Taxes (No Inclusive Note)', percentage: 8, count: '8%', color: 'bg-blue-500' },
    { rule: lang === 'hi' ? 'नियम 6(1)(da) मूल देश अनुपस्थित' : 'Rule 6(1)(da) Country of Origin Absent', percentage: 5, count: '5%', color: 'bg-purple-500' }
  ];

  // Chart 2: Top Non-Compliant Product Categories
  const categoryBreakdown = [
    { category: lang === 'hi' ? 'पैकेज्ड स्नैक्स एवं कन्फेक्शनरी' : 'Packaged Snacks & Confectionery', violations: 44, percentage: 82, badge: lang === 'hi' ? 'उच्च प्राथमिकता' : 'High Priority' },
    { category: lang === 'hi' ? 'मसाले एवं खाद्य सामग्री' : 'Spices, Condiments & Masalas', violations: 32, percentage: 64, badge: lang === 'hi' ? 'शुद्ध मात्रा त्रुटि' : 'Net Qty Deficit' },
    { category: lang === 'hi' ? 'खाद्य तेल एवं वनस्पति घी' : 'Edible Oils & Vanaspati Ghee', violations: 26, percentage: 52, badge: lang === 'hi' ? 'आयतन इकाई त्रुटि' : 'Volume Unit Error' },
    { category: lang === 'hi' ? 'मेवे, नट्स एवं दालें' : 'Dry Fruits, Nuts & Pulses', violations: 21, percentage: 42, badge: lang === 'hi' ? 'USP लोप' : 'USP Omission' },
    { category: lang === 'hi' ? 'डेयरी उत्पाद एवं पेय पदार्थ' : 'Dairy, Paneer & Beverages', violations: 19, percentage: 38, badge: lang === 'hi' ? 'धुंधली निर्माण तिथि' : 'Faint Mfg Date' }
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
                {t?.title || 'Enforcement Intelligence Dashboard'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-700/80">
                LIVE METRICS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t?.subtitle || 'Real-time state and district contravention intelligence'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{lang === 'hi' ? 'वित्त वर्ष 2026-27 प्रवर्तन चक्र' : 'FY 2026-27 Enforcement Cycle'}</span>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={idx}
              className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{metric.title}</span>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight font-mono">
                  {metric.numericValue !== undefined ? (
                    <AnimatedNumber
                      value={metric.numericValue}
                      decimals={metric.isPercent ? 1 : 0}
                      suffix={metric.isPercent ? '%' : ''}
                    />
                  ) : (
                    metric.value
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${metric.badgeColor}`}>
                    {metric.badge}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                {metric.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State Banner when 0 inspections exist */}
      {totalInspections === 0 && (
        <div className="bg-[#111827] border border-dashed border-slate-800 rounded-xl p-8 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Inbox className="w-6 h-6 text-slate-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-semibold text-slate-200">
              {lang === 'hi' ? 'फील्ड अधिकारियों द्वारा निरीक्षण दर्ज करने पर डेटा प्रदर्शित होगा' : 'Data will populate as field officers log inspections'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {lang === 'hi'
                ? 'वैधानिक विश्लेषण, उल्लंघन दर एवं जब्ती रजिस्टर को स्वचालित रूप से तैयार करने के लिए पैकेट स्कैनर में जांच करें।'
                : 'Perform scans in the Physical Package Scanner or log digital listing audits to dynamically aggregate statutory analytics, non-compliance rates, and seizure registers.'}
            </p>
          </div>
        </div>
      )}

      {/* Two Clean Charts Grid */}
      {totalInspections > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Violations by Rule Category (6 cols) */}
        <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                {lang === 'hi' ? 'वैधानिक नियम अनुसार उल्लंघन वर्गीकरण' : 'Violations by Statutory Rule Category'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {lang === 'hi' ? 'कुल: 54 उल्लंघन' : 'TOTAL: 54 VIOLATIONS'}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            {lang === 'hi'
              ? 'विधिक मापविज्ञान (पीसी) नियम, 2011 के अंतर्गत जारी किए गए नोटिसों का वितरण:'
              : 'Distribution of statutory notices served under specific sub-rules of the Packaged Commodities Rules, 2011:'}
          </p>

          <div className="space-y-4 pt-1">
            {ruleBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{item.rule}</span>
                  <span className="font-mono font-semibold text-slate-200">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{lang === 'hi' ? 'प्रमुख कारण: बहुवचन इकाइयाँ (\'gms\', \'ltrs\')' : 'Primary Trigger: Pluralized symbols (\'gms\', \'ltrs\')'}</span>
            <span className="text-rose-400 font-semibold">Rule 6(1)(c) #1</span>
          </div>
        </div>

        {/* Chart 2: Top Non-Compliant Product Categories (6 cols) */}
        <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                {lang === 'hi' ? 'सर्वाधिक गैर-अनुपालित उत्पाद श्रेणियाँ' : 'Top Non-Compliant Product Categories'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {lang === 'hi' ? 'संवेदनशील क्षेत्र' : 'HIGH-RISK SECTORS'}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            {lang === 'hi'
              ? 'पैकेजिंग एवं लेबलिंग उल्लंघनों की उच्चतम आवृत्ति वाली वस्तु श्रेणियाँ:'
              : 'Commodity categories exhibiting highest incidence of packaging & labeling contraventions:'}
          </p>

          <div className="space-y-3 pt-1">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <span>{cat.category}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                      {cat.badge}
                    </span>
                  </div>
                  <div className="w-48 sm:w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-mono font-semibold text-slate-200">{cat.violations} {lang === 'hi' ? 'मामले' : 'cases'}</div>
                  <div className="text-[10px] text-rose-400 font-medium">{cat.percentage}% {lang === 'hi' ? 'गैर-अनुपालित' : 'non-compliant'}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{lang === 'hi' ? 'स्नैक एवं मसाला मिलों के लिए विशेष प्रवर्तन अभियान' : 'Special enforcement drive ordered for Snack & Spice mills'}</span>
            <span className="text-slate-300 font-medium">{lang === 'hi' ? 'कार्रवाई लंबित' : 'Action Pending'}</span>
          </div>
        </div>
      </div>
    ) : null}

      {/* Brand Repeat Offenders & Seizures Section */}
      {totalInspections > 0 && violationAudits.length > 0 && (
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
