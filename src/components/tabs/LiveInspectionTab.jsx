import React, { useState } from 'react';
import InputScanner from '../InputScanner';
import BoundingBoxCanvas, { DEFAULT_MOCK_BOXES } from '../BoundingBoxCanvas';
import ComplianceScorecard, { DEFAULT_STATUTORY_RULES } from '../ComplianceScorecard';

export default function LiveInspectionTab() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeAuditData, setActiveAuditData] = useState(null);
  const [selectedRuleId, setSelectedRuleId] = useState('rule-6-1-c'); // Default highlighted violation
  const [score, setScore] = useState(68);
  const [minNumeralHeight, setMinNumeralHeight] = useState('2.5 mm');
  const [statutoryRules] = useState(DEFAULT_STATUTORY_RULES);

  // Handler when officer triggers "Run Statutory Audit" from InputScanner
  const handleRunAudit = async (auditPayload) => {
    setIsAuditing(true);
    setActiveAuditData(auditPayload);

    if (auditPayload.prescribedFont) {
      setMinNumeralHeight(auditPayload.prescribedFont);
    }

    try {
      let fileToUpload = auditPayload.metadata?.file;
      if (!fileToUpload && auditPayload.image) {
        const arr = auditPayload.image.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        fileToUpload = new File([u8arr], auditPayload.metadata?.name || 'specimen.jpg', { type: mime });
      }

      const formData = new FormData();
      formData.append('image', fileToUpload);

      const response = await fetch('http://localhost:5000/api/audit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const auditResult = await response.json();
      console.log("Live Audit Result from Flask:", auditResult);

      const liveScore = auditResult.compliance_score !== undefined
        ? auditResult.compliance_score
        : (auditResult.score !== undefined ? auditResult.score : 0);

      setScore(liveScore);

      // Save new completed audit to localStorage 'metrology_inspections'
      try {
        const existing = JSON.parse(localStorage.getItem('metrology_inspections') || '[]');
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const newRecord = {
          id: `audit-${Date.now()}`,
          memoRef: `LMO/2026/${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: `${dateStr}, ${timeStr} IST`,
          isoDate: now.toISOString(),
          commodity: auditResult.product_name || (auditPayload.metadata?.name ? `Packaged Commodity (${auditPayload.metadata.name})` : 'Scanned Packaged Commodity'),
          manufacturer: auditResult.brand || 'Scanned Manufacturer Entity',
          verdict: auditResult.overall_verdict || (liveScore === 100 ? 'COMPLIANT' : 'NON-COMPLIANT'),
          score: liveScore,
          compliance_score: liveScore,
          packageWidth: auditPayload.packageWidth || 10.0,
          pdpArea: auditPayload.pdpArea || 150.0,
          minNumeralHeight: auditPayload.prescribedFont || '2.5 mm',
          inspectorId: 'LMO-Central-04',
          rules: statutoryRules,
          declarations: auditResult.declarations || {},
          violations: auditResult.violations || [],
          bounding_boxes: auditResult.bounding_boxes || []
        };
        localStorage.setItem('metrology_inspections', JSON.stringify([newRecord, ...existing]));
        window.dispatchEvent(new Event('metrology_history_updated'));
      } catch (err) {
        console.error('Error persisting inspection to repository:', err);
      }
    } catch (error) {
      console.error("Backend connection failed:", error);
      alert("Could not reach http://localhost:5000/api/audit. Make sure python app.py is running!");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Input Scanner Component (Top Section: Calibration, Mode Toggle, Upload / Camera & Audit Trigger) */}
      <InputScanner onRunAudit={handleRunAudit} isAuditing={isAuditing} />

      {/* 2. Visual Inspection & Statutory Audit Scorecard Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 or 7 cols): BoundingBoxCanvas with aspect-ratio coordinate scaling */}
        <div className="xl:col-span-6 space-y-4">
          <BoundingBoxCanvas
            imageSrc={activeAuditData?.image}
            boxes={DEFAULT_MOCK_BOXES}
            selectedBoxId={selectedRuleId}
            onSelectBox={(box) => setSelectedRuleId(box.id)}
          />

          {/* Quick Calibration Metadata Strip */}
          <div className="p-3.5 bg-[#1e293b] border border-slate-700/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400">Calibrated Inspection Frame:</span>
              <span className="font-mono font-bold text-white">
                {activeAuditData ? `${activeAuditData.packageWidth} cm (Width) | ${activeAuditData.pdpArea} cm² (PDP)` : '10.0 cm (Width) | 150.0 cm² (PDP)'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Two-Way Selection Sync: Enabled
            </span>
          </div>
        </div>

        {/* Right Column (6 cols): ComplianceScorecard Component */}
        <div className="xl:col-span-6">
          <ComplianceScorecard
            rules={statutoryRules}
            score={score}
            minNumeralHeight={minNumeralHeight}
            selectedRuleId={selectedRuleId}
            onSelectRule={(ruleId) => setSelectedRuleId(ruleId)}
          />
        </div>
      </div>
    </div>
  );
}
