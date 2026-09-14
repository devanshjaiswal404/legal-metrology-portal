import React from 'react';
import { Scale, ShieldCheck } from 'lucide-react';

export default function Footer({ t, lang = 'en' }) {
  return (
    <footer className="w-full border-t border-slate-800/80 mt-auto py-5 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <Scale className="w-4 h-4 text-slate-400" />
          <span>{t?.portalTitle || 'National Legal Metrology Portal'} &bull; {t?.portalSubtitle || 'Packaging Compliance'}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <span>{lang === 'hi' ? 'मानक: पीसीआर, 2011 एवं विधिक मापविज्ञान अधिनियम, 2009' : 'Standards: PCR, 2011 & The Legal Metrology Act, 2009'}</span>
          <span>&bull;</span>
          <span className="text-emerald-400/90 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'सत्यापित नियम' : 'Verified Rules'}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
