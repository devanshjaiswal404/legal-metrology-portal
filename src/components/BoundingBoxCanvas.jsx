import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Filter,
  Eye,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  ZoomIn,
  Maximize2,
  ShieldAlert,
  Info
} from 'lucide-react';

// Default mock statutory bounding boxes (measured relative to 800x1050 natural commodity label dimensions)
export const DEFAULT_MOCK_BOXES = [
  {
    id: 'rule-6-1-c',
    rule: 'Rule 6(1)(c)',
    fieldName: 'Net Quantity',
    status: 'violation', // 'pass' | 'violation' | 'warning'
    badgeText: 'Net Qty - VIOLATION',
    x: 70,
    y: 350,
    width: 320,
    height: 75,
    detectedText: 'Net Wt: 5000 gms',
    finding: "Non-standard unit 'gms' used. Rule 11 & Schedule II strictly prescribe standard unit 'g' or 'kg'."
  },
  {
    id: 'rule-6-1-e',
    rule: 'Rule 6(1)(e)',
    fieldName: 'MRP',
    status: 'pass',
    badgeText: 'MRP - PASS',
    x: 70,
    y: 540,
    width: 340,
    height: 70,
    detectedText: 'MRP ₹245.00 (INCL. OF ALL TAXES)',
    finding: 'Compliant with Rule 6(1)(e): Stated with mandatory "Inclusive of all taxes" suffix.'
  },
  {
    id: 'rule-6-1-ea',
    rule: 'Rule 6(1)(ea)',
    fieldName: 'Unit Sale Price',
    status: 'pass',
    badgeText: 'USP - PASS',
    x: 70,
    y: 630,
    width: 260,
    height: 60,
    detectedText: 'USP: ₹49.00 / kg',
    finding: 'Compliant with Rule 6(1)(ea): Mandatory for packages over 1kg, computed per kilogram.'
  },
  {
    id: 'rule-6-1-d',
    rule: 'Rule 6(1)(d)',
    fieldName: 'Mfg / Pkg Date',
    status: 'pass',
    badgeText: 'Mfg Date - PASS',
    x: 440,
    y: 540,
    width: 290,
    height: 70,
    detectedText: 'Pkd on: 08/2026',
    finding: 'Compliant with Rule 6(1)(d): Month and year of packing clearly displayed.'
  },
  {
    id: 'rule-6-1-da',
    rule: 'Rule 6(1)(da)',
    fieldName: 'Country of Origin',
    status: 'pass',
    badgeText: 'Origin - PASS',
    x: 440,
    y: 630,
    width: 290,
    height: 60,
    detectedText: 'Country of Origin: India',
    finding: 'Compliant with Rule 6(1)(da): Explicit country of origin declared visibly on PDP.'
  },
  {
    id: 'rule-6-1-f',
    rule: 'Rule 6(1)(f)',
    fieldName: 'Consumer Care',
    status: 'violation',
    badgeText: 'Consumer Care - VIOLATION',
    x: 70,
    y: 730,
    width: 660,
    height: 85,
    detectedText: 'Consumer Care: Call 1800-209-4455 (Email Missing)',
    finding: 'Violation under Rule 6(1)(f): Mandatory consumer grievance email address missing.'
  },
  {
    id: 'rule-6-1-a',
    rule: 'Rule 6(1)(a)',
    fieldName: 'Manufacturer Details',
    status: 'pass',
    badgeText: 'Manufacturer - PASS',
    x: 70,
    y: 840,
    width: 660,
    height: 90,
    detectedText: 'M/s Hindustan Agro Foods Ltd., Sector 62, Noida (U.P.) - 201309',
    finding: 'Compliant with Rule 6(1)(a): Complete registered corporate address with postal PIN code.'
  }
];

// Fallback high-contrast statutory package illustration (used when no user photo has been uploaded yet)
const DEFAULT_PACKAGE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1050" viewBox="0 0 800 1050" fill="%230f172a"><rect width="800" height="1050" rx="24" fill="%230f172a" stroke="%23334155" stroke-width="6"/><rect x="40" y="40" width="720" height="970" rx="16" fill="%231e293b" stroke="%23475569" stroke-width="2"/><rect x="40" y="40" width="720" height="12" fill="%23ff9933"/><text x="400" y="120" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="%23f8fafc" text-anchor="middle">PREMIUM CHAKKI ATTA</text><text x="400" y="160" font-family="Arial, sans-serif" font-size="20" fill="%2394a3b8" text-anchor="middle">100% Whole Wheat Grain Flour</text><line x1="80" y1="200" x2="720" y2="200" stroke="%23334155" stroke-width="2"/><rect x="80" y="240" width="640" height="70" rx="8" fill="%230f172a" stroke="%23334155"/><text x="100" y="282" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="%2338bdf8">PRINCIPAL DISPLAY PANEL (PDP)</text><text x="70" y="395" font-family="monospace" font-size="28" font-weight="bold" fill="%23f87171">Net Wt: 5000 gms</text><text x="70" y="585" font-family="monospace" font-size="24" font-weight="bold" fill="%2334d399">MRP ₹245.00 (INCL. OF ALL TAXES)</text><text x="440" y="585" font-family="monospace" font-size="24" font-weight="bold" fill="%2334d399">Pkd on: 08/2026</text><text x="70" y="675" font-family="monospace" font-size="22" font-weight="bold" fill="%2334d399">USP: ₹49.00 / kg</text><text x="70" y="780" font-family="Arial, sans-serif" font-size="20" fill="%23f87171">Consumer Care: Call 1800-XXX-XXXX (Email Missing)</text><text x="70" y="890" font-family="Arial, sans-serif" font-size="19" fill="%23e2e8f0">M/s Hindustan Agro Foods Ltd., Sector 62, Noida (U.P.) - 201309</text><text x="400" y="980" font-family="Arial, sans-serif" font-size="14" fill="%2364748b" text-anchor="middle">STATUTORY SPECIMEN SAMPLE • THE LEGAL METROLOGY ACT, 2009</text></svg>`;

export default function BoundingBoxCanvas({
  imageSrc,
  boxes = DEFAULT_MOCK_BOXES,
  selectedBoxId,
  onSelectBox
}) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Toggle state: "all" vs "violations"
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'violations'
  const [hoveredBoxId, setHoveredBoxId] = useState(null);

  // Rendered vs Natural dimensions for exact coordinate scaling
  const [renderedDimensions, setRenderedDimensions] = useState({ width: 0, height: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 800, height: 1050 });

  const activeImageSrc = imageSrc || DEFAULT_PACKAGE_SVG;

  // Handle Image Load & Dimension extraction
  const handleImageLoad = (e) => {
    const img = e.target;
    setNaturalDimensions({
      width: img.naturalWidth || 800,
      height: img.naturalHeight || 1050
    });
    measureRenderedDimensions();
  };

  // Measure rendered dimensions using client bounding rect
  const measureRenderedDimensions = () => {
    if (imgRef.current) {
      setRenderedDimensions({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight
      });
    }
  };

  // ResizeObserver on the image/container to maintain exact scaling on window/container resize
  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new ResizeObserver(() => {
      measureRenderedDimensions();
    });

    observer.observe(imgRef.current);
    window.addEventListener('resize', measureRenderedDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureRenderedDimensions);
    };
  }, []);

  // 1. Coordinate Scaling (Crucial Requirement)
  // scaleX = renderedWidth / naturalWidth
  // scaleY = renderedHeight / naturalHeight
  const { scaleX, scaleY } = useMemo(() => {
    const rW = renderedDimensions.width || 800;
    const rH = renderedDimensions.height || 1050;
    const nW = naturalDimensions.width || 800;
    const nH = naturalDimensions.height || 1050;

    return {
      scaleX: rW / nW,
      scaleY: rH / nH
    };
  }, [renderedDimensions, naturalDimensions]);

  // Filter boxes based on toggle
  const visibleBoxes = useMemo(() => {
    if (filterMode === 'violations') {
      return boxes.filter((b) => b.status === 'violation');
    }
    return boxes;
  }, [boxes, filterMode]);

  // Active highlighted box for details
  const activeBox = boxes.find((b) => b.id === (hoveredBoxId || selectedBoxId));

  return (
    <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Top Controls Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
              Statutory Visual Inspection Canvas
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                AUTO-SCALED
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Preserves aspect ratio with dynamic sub-pixel coordinate scaling
            </p>
          </div>
        </div>

        {/* 3. Toggle Button: "Show All Boxes" vs "Show Violations Only" */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-[#1e293b] text-white shadow border border-slate-600'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Show All Boxes ({boxes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('violations')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'violations'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-red-400'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Show Violations Only ({boxes.filter((b) => b.status === 'violation').length})</span>
          </button>
        </div>
      </div>

      {/* Main Canvas / Image Area with SVG & HTML overlay */}
      <div
        ref={containerRef}
        className="relative bg-slate-950 p-4 sm:p-6 flex items-center justify-center overflow-hidden min-h-[420px] select-none"
      >
        {/* Responsive Image preserving aspect ratio */}
        <div className="relative inline-block max-w-full">
          <img
            ref={imgRef}
            src={activeImageSrc}
            alt="Packaged Commodity Inspection Target"
            onLoad={handleImageLoad}
            className="block max-h-[580px] w-auto max-w-full rounded-lg shadow-2xl border border-slate-800 object-contain mx-auto"
          />

          {/* SVG Overlay scaled with exact rendered coordinates */}
          {renderedDimensions.width > 0 && renderedDimensions.height > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width={renderedDimensions.width}
              height={renderedDimensions.height}
              style={{
                width: `${renderedDimensions.width}px`,
                height: `${renderedDimensions.height}px`
              }}
            >
              {visibleBoxes.map((box) => {
                // Scaled coordinate calculation
                const x = box.x * scaleX;
                const y = box.y * scaleY;
                const width = box.width * scaleX;
                const height = box.height * scaleY;

                const isPass = box.status === 'pass';
                const isSelected = selectedBoxId === box.id;
                const isHovered = hoveredBoxId === box.id;

                // 2. Visual Styling Requirements:
                // Green outline (#10b981) + 15% opacity fill for COMPLIANT declarations
                // Red outline (#ef4444) + 20% opacity fill for VIOLATIONS
                const strokeColor = isPass ? '#10b981' : '#ef4444';
                const fillColor = isPass
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(239, 68, 68, 0.20)';

                return (
                  <g key={box.id}>
                    {/* Bounding Rectangle */}
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected || isHovered ? 3 : 2}
                      strokeDasharray={isSelected ? '4 2' : 'none'}
                      rx={4}
                      className="transition-all duration-150"
                    />

                    {/* Corner Accent Dots */}
                    <circle cx={x} cy={y} r={2.5} fill={strokeColor} />
                    <circle cx={x + width} cy={y} r={2.5} fill={strokeColor} />
                    <circle cx={x} cy={y + height} r={2.5} fill={strokeColor} />
                    <circle cx={x + width} cy={y + height} r={2.5} fill={strokeColor} />
                  </g>
                );
              })}
            </svg>
          )}

          {/* HTML Interactive Badges Overlay (sitting on top of each box) */}
          {renderedDimensions.width > 0 &&
            visibleBoxes.map((box) => {
              const x = box.x * scaleX;
              const y = box.y * scaleY;
              const width = box.width * scaleX;
              const isPass = box.status === 'pass';
              const isSelected = selectedBoxId === box.id;
              const isHovered = hoveredBoxId === box.id;

              return (
                <div
                  key={box.id}
                  style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${Math.max(4, y - 24)}px`,
                    maxWidth: `${Math.max(160, width)}px`
                  }}
                  onMouseEnter={() => setHoveredBoxId(box.id)}
                  onMouseLeave={() => setHoveredBoxId(null)}
                  onClick={() => onSelectBox && onSelectBox(box)}
                  className={`cursor-pointer transition-all duration-150 z-20 ${
                    isSelected || isHovered ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold tracking-tight shadow-md border truncate ${
                      isPass
                        ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                        : 'bg-red-950/95 text-red-200 border-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse'
                    }`}
                  >
                    {isPass ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertOctagon className="w-3 h-3 text-red-400 flex-shrink-0" />
                    )}
                    <span className="truncate">{box.badgeText}</span>
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* 3. Interactive Detail Drawer / Active Finding Preview */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          {activeBox ? (
            <div>
              <span className="font-bold text-white font-mono mr-2">[{activeBox.rule}]</span>
              <strong className={activeBox.status === 'pass' ? 'text-emerald-400' : 'text-red-400'}>
                {activeBox.badgeText}:
              </strong>{' '}
              <span className="text-slate-300">{activeBox.finding}</span>
            </div>
          ) : (
            <span className="text-slate-400">
              Hover or click any statutory bounding box above to inspect OCR text and legal findings.
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 self-end sm:self-auto flex-shrink-0">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Pass: {boxes.filter((b) => b.status === 'pass').length}
          </span>
          <span className="text-red-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Violations: {boxes.filter((b) => b.status === 'violation').length}
          </span>
        </div>
      </div>
    </div>
  );
}
