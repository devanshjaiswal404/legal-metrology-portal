import React, { useState } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingDown,
  Building2,
  Calendar,
  IndianRupee,
  Layers
} from 'lucide-react';

export default function EcommerceAuditTab() {
  const [urlInput, setUrlInput] = useState('https://www.amazon.in/dp/B08N5WRWNW');
  const [isScanning, setIsScanning] = useState(false);

  const sampleAudits = [
    {
      id: 'ECOM-INSP-4091',
      platform: 'Amazon India',
      seller: 'Cloudtail Retail Pvt Ltd',
      product: 'California Almonds 500g Vacuum Pouch',
      countryOfOrigin: 'USA',
      mrpStated: '₹650.00',
      uspStated: '₹1.30 / g',
      missingDeclarations: ['Rule 6(1)(n) Customer Care email'],
      status: 'warning'
    },
    {
      id: 'ECOM-INSP-4092',
      platform: 'Flipkart',
      seller: 'OmniTech Deals Hub',
      product: 'Wireless Bluetooth Earbuds Pro with Case',
      countryOfOrigin: 'Not Disclosed on Product Page',
      mrpStated: '₹2,999.00',
      uspStated: 'Missing (Mandatory per Rule 6(1)(ea))',
      missingDeclarations: ['Country of Origin missing', 'Unit Sale Price missing'],
      status: 'violation'
    },
    {
      id: 'ECOM-INSP-4093',
      platform: 'Blinkit',
      seller: 'QuickRetail Distribution hub',
      product: 'Organic Cold Pressed Mustard Oil 1L',
      countryOfOrigin: 'India',
      mrpStated: '₹210.00',
      uspStated: '₹0.21 / ml',
      missingDeclarations: [],
      status: 'pass'
    },
    {
      id: 'ECOM-INSP-4094',
      platform: 'Zepto',
      seller: 'Kirana Express Hub 12',
      product: 'Imported Dark Chocolate Bar 100g',
      countryOfOrigin: 'Switzerland',
      mrpStated: '₹340.00',
      uspStated: '₹3.40 / g',
      missingDeclarations: ['Importer License Details Incomplete'],
      status: 'warning'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Statutory E-Commerce Audit Engine */}
      <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  E-Commerce Marketplace Statutory Audit
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  RULE 6(10) ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated statutory inspection of digital declarations across online marketplace listings
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700">
            Notice Target: <span className="text-slate-200 font-medium">Marketplace Entities & Fulfillers</span>
          </div>
        </div>

        {/* URL Scanner Input */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste product listing URL (Amazon, Flipkart, Blinkit, Zepto, BigBasket)..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setIsScanning(true);
              setTimeout(() => setIsScanning(false), 800);
            }}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>{isScanning ? 'Auditing Listing...' : 'Audit Marketplace URL'}</span>
          </button>
        </div>

        {/* Quick presets */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-slate-400">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Presets:</span>
          {['Amazon India PDP', 'Flipkart Grocery', 'Blinkit Darkstore', 'Zepto 10min'].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setUrlInput(`https://marketplace.in/item-${idx + 101}`)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Listings Audited Today</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">1,482</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>↑ 12% from yesterday</span>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Full Rule 6(10) Compliant</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">1,128</div>
          <div className="text-[11px] text-slate-400 mt-1">76.1% pass rate</div>
        </div>

        <div className="bg-[#1e293b] border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Mandatory USP Missing</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">214</div>
          <div className="text-[11px] text-slate-400 mt-1">Non-standard calculation</div>
        </div>

        <div className="bg-[#1e293b] border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Country of Origin Violations</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 mt-1">140</div>
          <div className="text-[11px] text-red-400 mt-1">Notices auto-queued</div>
        </div>
      </div>

      {/* Audit Results Table */}
      <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-700/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            Recent E-Commerce Statutory Audit Log
          </h3>
          <span className="text-xs text-slate-400 font-mono">Live Monitoring Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Audit Reference</th>
                <th className="px-4 py-3">Platform & Seller</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Origin</th>
                <th className="px-4 py-3">MRP & USP</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sampleAudits.map((item) => {
                const isPass = item.status === 'pass';
                const isWarning = item.status === 'warning';
                const isViolation = item.status === 'violation';

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-300">
                      {item.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{item.platform}</div>
                      <div className="text-[11px] text-slate-400">{item.seller}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-200" title={item.product}>
                      {item.product}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        item.countryOfOrigin.includes('Not Disclosed')
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.countryOfOrigin}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-200">{item.mrpStated}</div>
                      <div className="text-[10px] font-mono text-slate-400">{item.uspStated}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isPass
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : isWarning
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-red-500/15 text-red-300 border-red-500/30'
                        }`}
                      >
                        {isPass ? 'PASS' : isWarning ? 'WARNING' : 'VIOLATION'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-colors"
                      >
                        View Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
