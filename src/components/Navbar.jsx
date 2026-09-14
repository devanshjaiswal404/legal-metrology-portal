import React from 'react';
import { ScanLine, Globe, FolderArchive, BookOpen } from 'lucide-react';

export const TABS = [
  {
    id: 'live-inspection',
    name: 'Live Inspection',
    icon: ScanLine,
    badge: 'Real-time',
    description: 'Packaged commodity label & net weight inspection'
  },
  {
    id: 'ecommerce-audit',
    name: 'E-Commerce Audit',
    icon: Globe,
    badge: 'Rule 6(10)',
    description: 'Digital marketplace compliance crawler'
  },
  {
    id: 'inspection-repository',
    name: 'Inspection Repository',
    icon: FolderArchive,
    badge: 'Challan Log',
    description: 'Seizure records, violations & audit dossiers'
  },
  {
    id: 'statutory-reference',
    name: 'Statutory Reference (Schedule II)',
    icon: BookOpen,
    badge: 'MPE Rules',
    description: 'Maximum Permissible Error & mandatory declarations'
  },
];

export default function Navbar({ activeTab, onSelectTab }) {
  return (
    <nav className="w-full bg-[#0b1329] border-b border-[#1e293b] px-4 sm:px-6 lg:px-8 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                type="button"
                className={`group relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#1e293b] text-white shadow-sm border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/50 border border-transparent'
                }`}
                title={tab.description}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{tab.name}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium tracking-tight ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Bottom Active Pill Indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Status Pill in Nav */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 pl-4 border-l border-slate-800">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>SYSTEM: NORMAL</span>
        </div>
      </div>
    </nav>
  );
}
