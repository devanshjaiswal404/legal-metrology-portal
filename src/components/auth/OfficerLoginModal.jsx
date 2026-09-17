import React, { useState } from 'react';
import {
  ShieldCheck,
  Scale,
  User,
  BadgeCheck,
  MapPin,
  Lock,
  ArrowRight,
  Sparkles,
  X,
  Building2
} from 'lucide-react';
import { DEFAULT_DEMO_OFFICER } from '../../utils/officerSession';

const COMMON_DESIGNATIONS = [
  'Senior Legal Metrology Officer (SLMO)',
  'Inspector of Legal Metrology (ILMO)',
  'Assistant Controller of Legal Metrology',
  'Deputy Controller (Enforcement)',
  'Special Task Force (STF) Inspecting Officer'
];

const COMMON_DISTRICTS = [
  'Central Delhi Enforcement Zone',
  'North Delhi Metrology Sub-Division',
  'South Mumbai Legal Metrology Circle',
  'Bengaluru Urban Legal Metrology Range',
  'Hyderabad Central Enforcement District',
  'Kolkata Metropolitan Enforcement Unit'
];

export default function OfficerLoginModal({
  isOpen,
  onLogin,
  onClose,
  isMandatory = false,
  currentOfficer = null
}) {
  const [officerId, setOfficerId] = useState(currentOfficer?.officerId || '');
  const [officerName, setOfficerName] = useState(currentOfficer?.officerName || '');
  const [designation, setDesignation] = useState(currentOfficer?.designation || COMMON_DESIGNATIONS[0]);
  const [district, setDistrict] = useState(currentOfficer?.district || COMMON_DISTRICTS[0]);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!officerId.trim()) {
      setError('Please enter your statutory Officer ID / Badge Reference.');
      return;
    }
    if (!officerName.trim()) {
      setError('Please enter your full officer name.');
      return;
    }
    if (!designation.trim()) {
      setError('Please specify your administrative designation.');
      return;
    }
    if (!district.trim()) {
      setError('Please specify your designated district or jurisdiction.');
      return;
    }

    setError('');
    onLogin({
      officerId: officerId.trim().toUpperCase(),
      officerName: officerName.trim(),
      designation: designation.trim(),
      district: district.trim(),
      department: 'Department of Consumer Affairs, Legal Metrology Division',
      badgeNumber: `GOI-${officerId.trim().toUpperCase()}`,
      isDemo: false,
      loginTime: new Date().toISOString()
    });
  };

  const handleQuickDemoLogin = () => {
    setError('');
    onLogin(DEFAULT_DEMO_OFFICER);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Tricolor Accent Header Bar */}
        <div className="h-1.5 w-full flex">
          <div className="bg-[#FF9933] flex-1" />
          <div className="bg-white flex-1" />
          <div className="bg-[#138808] flex-1" />
        </div>

        {/* Modal Top Bar */}
        <div className="p-6 bg-slate-900/80 border-b border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shadow-sm flex-shrink-0">
              <Scale className="w-6 h-6 text-slate-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Officer Authentication Portal
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                  OFFICIAL USE ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ministry of Consumer Affairs &bull; Legal Metrology Enforcement Division
              </p>
            </div>
          </div>

          {!isMandatory && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Login Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Officer ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Officer ID / Badge ID</span>
              </label>
              <input
                type="text"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                placeholder="e.g. LMO-DEL-2026-04"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            {/* Officer Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Officer Full Name</span>
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Designation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Designation</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="designations-list"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Select or enter administrative title"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
              <datalist id="designations-list">
                {COMMON_DESIGNATIONS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>

          {/* District / Jurisdiction */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Jurisdiction / District Range</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="districts-list"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Select or enter territorial jurisdiction"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
              <datalist id="districts-list">
                {COMMON_DISTRICTS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Security PIN / Token (Placeholder for backend auth token) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Security PIN / Token (Optional for Demo)</span>
              </label>
              <span className="text-[10px] text-slate-500">Bypassed in Sandbox</span>
            </div>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authorize & Access Enforcement System</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Use 1-Click Demo Officer Credentials (LMO-DEL-2026-04)</span>
            </button>
          </div>
        </form>

        {/* Footer Disclaimer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 text-[11px] text-slate-500 text-center leading-relaxed">
          Authorized personnel only under Section 15 of The Legal Metrology Act, 2009.
          All audit actions are recorded in the state enforcement telemetry ledger.
        </div>
      </div>
    </div>
  );
}
