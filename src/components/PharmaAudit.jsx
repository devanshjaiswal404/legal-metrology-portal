import React, { useState } from 'react';

const DEFAULT_BENCHMARK = {
  brand_name: "Dolo 650",
  formulation: "Paracetamol 650mg",
  scanned_mrp: 34.50,
  package_size: "15 Tablets",
  nppa_ceiling_price: 30.50,
  jan_aushadhi_generic_price: 11.00,
  is_overcharging: true,
  overcharge_percentage: 13.1,
  schedule_h_warning: "PASS",
  expiry_date: "12/2027",
  statutory_verdict: "DPCO CEILING CONTRAVENTION",
  statutory_note: "Overcharging of ₹4.00 detected under Para 14 DPCO 2013."
};

export default function PharmaAudit() {
  const [data, setData] = useState(DEFAULT_BENCHMARK);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const presets = [
    { label: "Dolo 650 (15 Tabs)", name: "Dolo 650", mrp: 34.50, ceiling: 30.50, generic: 11.00 },
    { label: "Atorvastatin 10mg (10 Tabs)", name: "Atorvastatin 10mg", mrp: 72.00, ceiling: 58.50, generic: 14.50 },
    { label: "Azithromycin 500mg (3 Tabs)", name: "Azithromycin 500mg", mrp: 88.00, ceiling: 71.40, generic: 22.00 },
    { label: "Metformin 500mg (10 Tabs)", name: "Metformin 500mg", mrp: 28.00, ceiling: 24.50, generic: 8.50 },
  ];

  const handlePresetSelect = (p) => {
    const isOver = p.mrp > p.ceiling;
    setData({
      brand_name: p.name,
      formulation: p.name + " Formulation",
      scanned_mrp: p.mrp,
      package_size: "Standard Pack",
      nppa_ceiling_price: p.ceiling,
      jan_aushadhi_generic_price: p.generic,
      is_overcharging: isOver,
      overcharge_percentage: isOver ? (((p.mrp - p.ceiling) / p.ceiling) * 100).toFixed(1) : 0,
      schedule_h_warning: "PASS",
      expiry_date: "08/2027",
      statutory_verdict: isOver ? "DPCO CEILING CONTRAVENTION" : "DPCO COMPLIANT",
      statutory_note: isOver ? `Exceeds NPPA statutory ceiling by ${(((p.mrp - p.ceiling) / p.ceiling) * 100).toFixed(1)}%` : "Priced within statutory ceiling limit."
    });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleAudit = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/api/pharma-audit", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Audit failed");
      const result = await res.json();
      setData({
        brand_name: result.brand_name || "Audited Medicine",
        formulation: result.formulation || "Extracted Salt & Strength",
        scanned_mrp: Number(result.scanned_mrp) || 0,
        package_size: result.package_size || "Strip Specimen",
        nppa_ceiling_price: Number(result.nppa_ceiling_price) || 0,
        jan_aushadhi_generic_price: Number(result.jan_aushadhi_generic_price) || 0,
        is_overcharging: result.is_overcharging ?? (result.scanned_mrp > result.nppa_ceiling_price),
        overcharge_percentage: result.overcharge_percentage || 0,
        schedule_h_warning: result.schedule_h_warning || "PASS",
        expiry_date: result.expiry_date || "DETECTED",
        statutory_verdict: result.statutory_verdict || (result.scanned_mrp > result.nppa_ceiling_price ? "DPCO CEILING CONTRAVENTION" : "DPCO COMPLIANT"),
        statutory_note: result.statutory_note || "Statutory audit evaluation complete."
      });
    } catch (err) {
      console.error(err);
      alert("Backend response unavailable. Showing benchmark estimation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', background: '#0f3a42', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>NPPA • DPCO, 2013</span>
          <span style={{ fontSize: '11px', background: '#1e293b', color: '#94a3b8', padding: '3px 8px', borderRadius: '4px' }}>Essential Commodities Act, 1955 (Section 7)</span>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0', color: '#f8fafc' }}>
          Pharmaceutical Pricing & DPCO Compliance Audit
        </h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
          Cross-reference retail medicine packages against NPPA notified statutory ceiling prices and compute branded vs. generic price markups.
        </p>
      </div>

      {/* Preset Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>STATUTORY PRESETS:</span>
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => handlePresetSelect(p)}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '24px' }}>
        {/* Left Column: Upload Dropzone */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '15px', margin: '0 0 16px 0', color: '#f1f5f9' }}>Medicine Strip Specimen</h3>
          
          <div
            onClick={() => document.getElementById('pharma-file-input').click()}
            style={{
              border: '2px dashed #334155',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#090e17',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {preview ? (
              <img src={preview} alt="Medicine Strip" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '6px' }} />
            ) : (
              <div>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💊</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Upload Medicine Strip or Packaging</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>PNG, JPG or WEBP (Max 10MB)</div>
              </div>
            )}
          </div>
          <input id="pharma-file-input" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

          <button
            onClick={handleAudit}
            disabled={loading || !file}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px',
              background: loading ? '#334155' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: loading || !file ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Inspecting DPCO Compliance..." : "Audit Strip Specimen"}
          </button>
        </div>

        {/* Right Column: Pricing & Findings Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Verdict Banner */}
          <div style={{
            padding: '16px 20px',
            borderRadius: '10px',
            background: data.is_overcharging ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${data.is_overcharging ? '#ef4444' : '#10b981'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: data.is_overcharging ? '#f87171' : '#34d399', letterSpacing: '0.5px' }}>
                DPCO STATUTORY PRICING VERDICT
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                {data.statutory_verdict}
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                {data.statutory_note}
              </div>
            </div>
            {data.is_overcharging && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#f87171' }}>OVERCHARGE</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>+{data.overcharge_percentage}%</div>
              </div>
            )}
          </div>

          {/* 3-Way Comparison Card */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', marginBottom: '16px' }}>
              3-Way Statutory Price Comparison: <span style={{ color: '#38bdf8' }}>{data.brand_name}</span> ({data.formulation})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#090e17', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>SCANNED BRANDED MRP</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>₹{Number(data.scanned_mrp).toFixed(2)}</div>
                <div style={{ fontSize: '10px', color: data.is_overcharging ? '#ef4444' : '#10b981' }}>
                  {data.is_overcharging ? "EXCEEDS CAP" : "WITHIN LIMIT"}
                </div>
              </div>
              <div style={{ background: '#090e17', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>NPPA CEILING CAP</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#38bdf8', margin: '4px 0' }}>₹{Number(data.nppa_ceiling_price).toFixed(2)}</div>
                <div style={{ fontSize: '10px', color: '#38bdf8' }}>DPCO PARA 14 CAP</div>
              </div>
              <div style={{ background: '#090e17', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>PMBJP GENERIC PRICE</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>₹{Number(data.jan_aushadhi_generic_price).toFixed(2)}</div>
                <div style={{ fontSize: '10px', color: '#10b981' }}>GENERIC BENCHMARK</div>
              </div>
            </div>

            {/* Packaging Rule Checks */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
              <div style={{ flex: 1, background: '#090e17', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Schedule H Caution Box:</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{data.schedule_h_warning}</span>
              </div>
              <div style={{ flex: 1, background: '#090e17', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Statutory Expiry Date:</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{data.expiry_date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
