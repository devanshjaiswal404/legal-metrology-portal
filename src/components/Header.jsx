import React from 'react';
import {
  Scale,
  ClipboardList,
  Camera,
  Globe,
  BarChart3,
  Pill
} from 'lucide-react';

export default function Header({
  activeTab = 'scanner',
  onSelectTab,
  historyCount = 0,
  lang = 'en',
  onToggleLang,
  t
}) {
  const tabs = [
    { id: 'scanner', label: t?.tabs?.scanner || 'Package Scanner', icon: Camera, emoji: '📸' },
    { id: 'ecommerce', label: t?.tabs?.ecommerce || 'E-Commerce Audit', icon: Globe, emoji: '🌐' },
    { id: 'pharma', label: t?.tabs?.pharma || 'Pharma & DPCO Audit', icon: Pill, emoji: '💊' },
    { id: 'repository', label: t?.tabs?.repository || 'Inspection Repository', icon: ClipboardList, emoji: '📋' },
    { id: 'analytics', label: t?.tabs?.analytics || 'Enforcement Analytics', icon: BarChart3, emoji: '📊' },
  ];

  return (
    <header className="w-full bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Official Emblem / Scale + Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-200 shadow-sm flex-shrink-0">
            <Scale className="w-5 h-5 text-slate-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-base sm:text-lg text-slate-100 tracking-tight">
                {t?.portalTitle || 'National Legal Metrology Portal'}
              </span>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {t?.ministryBadge || 'Ministry of Consumer Affairs • Govt. of India'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t?.portalSubtitle || 'Statutory Packaging Compliance & Enforcement System'}
            </p>
          </div>
        </div>

        {/* Right: Language Toggle + Live Officer ID + Session Badge */}
        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
          {/* Seamless English / Hindi Language Switcher */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => onToggleLang && onToggleLang('en')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onToggleLang && onToggleLang('hi')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                lang === 'hi'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>हिन्दी</span>
            </button>
          </div>

          {/* Officer Status Pill */}
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
            <span>{t?.officer || 'Officer'}: <strong className="text-slate-100 font-semibold">LMO-Central-04</strong></span>
          </div>

          {/* Live Active Inspection Status Badge */}
          <div className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span>{t?.statusLive || 'Active Duty'}</span>
          </div>
        </div>
      </div>

      {/* 1. Header Navigation Tabs Bar: Segmented Control Style */}
      <div className="border-t border-slate-800/70 bg-[#090d16] px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/90 p-1 rounded-lg overflow-x-auto no-scrollbar max-w-full">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab && onSelectTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md font-medium text-xs sm:text-[13px] whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  {tab.id === 'repository' && historyCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800/90 text-slate-300 border border-slate-700">
                      {historyCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
