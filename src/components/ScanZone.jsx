import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Camera,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  CheckCircle2,
  AlertOctagon,
  Loader2,
  Sparkles
} from 'lucide-react';

export default function ScanZone({
  imageSrc,
  boxes = [],
  packageWidth,
  pdpArea,
  onPackageWidthChange,
  onPdpAreaChange,
  onImageSelected,
  onResetImage,
  selectedBoxId,
  onSelectBox,
  isAnalyzing = false,
  t,
  lang = 'en'
}) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [prevImageSrc, setPrevImageSrc] = useState(imageSrc);

  if (prevImageSrc !== imageSrc) {
    setPrevImageSrc(imageSrc);
    setImageLoadError(false);
  }

  // References
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      setStream(s);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error(err);
      setCameraError('Camera access denied or unavailable. Please upload a photo instead.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  // Capture Camera Frame
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    stopCamera();
    onImageSelected(dataUrl, lang === 'hi' ? 'लाइव कैमरा कैप्चर' : 'Live Camera Capture');
  };

  // Handle Drag & Drop / File Input
  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageSelected(e.target.result, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Fallback styling for offline / load error
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750" fill="%230f172a"><rect width="600" height="750" rx="16" fill="%23111827" stroke="%23374151" stroke-width="2"/><text x="300" y="80" font-family="sans-serif" font-size="22" font-weight="bold" fill="%23f8fafc" text-anchor="middle">COMMODITY PACKAGING SPECIMEN</text><rect x="40" y="140" width="520" height="520" rx="12" fill="%231e293b" stroke="%23475569"/><text x="300" y="380" font-family="sans-serif" font-size="16" fill="%2394a3b8" text-anchor="middle">High Resolution Inspection Sample</text></svg>`;

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        className="hidden"
      />

      {/* Main Scan Container Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {!imageSrc && !isCameraActive ? (
          /* Empty Scan Zone: Simple Drag & Drop + Two Action Buttons */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-5"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <UploadCloud className="w-7 h-7 text-slate-300" />
            </div>

            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-semibold text-slate-100">
                {t?.uploadTitle || 'Drop label image here or click to browse'}
              </h3>
              <p className="text-xs text-slate-400">
                {t?.subtitle || 'Capture or upload package artwork to verify Legal Metrology (PC) Rules, 2011'}
              </p>
            </div>

            {/* Two Clear Options: "Upload Photo" or "Use Camera" */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-slate-800" />
                <span>{lang === 'hi' ? 'फोटो अपलोड करें' : 'Upload Photo'}</span>
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-slate-400" />
                <span>{t?.useCamera || 'Launch Optical Camera'}</span>
              </button>
            </div>

            {cameraError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 px-3 py-1.5 rounded-lg max-w-sm">
                {cameraError}
              </p>
            )}

            <span className="text-[11px] text-slate-500">
              {t?.uploadSubtitle || 'Supports high-resolution JPG, PNG, WEBP labels'}
            </span>
          </div>
        ) : isCameraActive ? (
          /* Live Camera View */
          <div className="relative bg-black min-h-[380px] flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[460px] object-cover" />

            {/* Guide rectangle */}
            <div className="absolute inset-8 border border-dashed border-slate-400/60 rounded-lg pointer-events-none flex items-center justify-center">
              <span className="bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-md text-slate-200 text-xs font-mono">
                {lang === 'hi' ? 'मुख्य प्रदर्शन पैनल (PDP) को फ्रेम में संरेखित करें' : 'Align Principal Display Panel Within Frame'}
              </span>
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2.5 z-10">
              <button
                type="button"
                onClick={handleCaptureFrame}
                className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{t?.capture || 'Capture Frame'}</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-700 cursor-pointer"
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          /* Image Loaded: Display with Responsively Scaled Bounding Boxes */
          <div className="p-4 sm:p-5 bg-[#0e1422]/70">
            {/* Top Image Actions Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                {lang === 'hi' ? 'स्कैन किया गया नमूना' : 'Scanned Specimen View'}
              </span>
              <button
                type="button"
                onClick={onResetImage}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t?.retake || 'Retake Image'}</span>
              </button>
            </div>

            {/* Visual Container: object-contain inside clean container with rounded-xl border */}
            <div className="flex justify-center items-center w-full overflow-hidden p-1">
              <div className="relative inline-block rounded-lg overflow-hidden border border-slate-800 bg-black/40 shadow-sm">
                <img
                  src={imageLoadError ? fallbackSvg : imageSrc}
                  alt="Scanned Commodity Packaging"
                  onError={() => setImageLoadError(true)}
                  className="block max-h-[460px] w-auto max-w-full object-contain rounded-lg select-none"
                />

                {/* Analysis In-Progress Scanner Overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
                    <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                    <div className="mt-3.5 space-y-1">
                      <h4 className="text-xs font-semibold text-slate-200 tracking-tight flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t?.analyzing || 'Executing Optical & Statutory Analysis...'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        {lang === 'hi' 
                          ? 'मुख्य प्रदर्शन पैनल, मीट्रिक इकाइयाँ, कर खंड एवं अक्षरों की ऊंचाई की जांच हो रही है...'
                          : 'Verifying Principal Display Panel, metric units, tax clauses, and numeral heights...'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Scaled Responsive Bounding Boxes (Precise 1.5px Lines + Matte Fills) */}
                {!isAnalyzing && boxes.map((box) => {
                  const isPass = box.status === 'pass';
                  const isSelected = selectedBoxId === box.id;

                  // Localized badge text if Hindi
                  let displayBadge = box.badgeText;
                  if (lang === 'hi') {
                    if (box.id === 'net-qty') displayBadge = isPass ? 'शुद्ध मात्रा: मानक (पास)' : 'शुद्ध मात्रा: गैर-मानक इकाई (उल्लंघन)';
                    else if (box.id === 'usp') displayBadge = isPass ? 'USP घोषित (पास)' : 'USP अनुपस्थित (उल्लंघन)';
                    else if (box.id === 'mrp') displayBadge = 'MRP कर सहित (पास)';
                    else if (box.id === 'mfg-date') displayBadge = 'पैकिंग तिथि घोषित (पास)';
                    else if (box.id === 'origin') displayBadge = 'मूल देश घोषित (पास)';
                  }

                  return (
                    <div
                      key={box.id}
                      style={{
                        position: 'absolute',
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.width}%`,
                        height: `${box.height}%`,
                        borderWidth: '1.5px',
                        backgroundColor: isPass ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.14)'
                      }}
                      onClick={() => onSelectBox && onSelectBox(box.id)}
                      className={`rounded-sm cursor-pointer transition-all duration-100 z-10 ${
                        isPass
                          ? 'border-emerald-500/80'
                          : 'border-rose-500/90'
                      } ${
                        isSelected
                          ? 'ring-1.5 ring-white/90 shadow-sm'
                          : 'hover:opacity-90'
                      }`}
                    >
                      {/* Floating Tag sitting directly on top */}
                      <div className="absolute -top-5 left-0 whitespace-nowrap z-20 pointer-events-none">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-mono font-medium tracking-tight shadow-sm border ${
                            isPass
                              ? 'bg-slate-900/95 text-emerald-300 border-emerald-800/60'
                              : 'bg-slate-900/95 text-rose-300 border-rose-800/60'
                          }`}
                        >
                          {isPass ? (
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <AlertOctagon className="w-2.5 h-2.5 text-rose-400" />
                          )}
                          <span>{displayBadge}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Accordion: Advanced Package Calibration (Optional) */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span>⚙️ {t?.calibrationToggle || 'Principal Display Panel (PDP) Calibration'}</span>
          </span>
          {isAccordionOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {isAccordionOpen && (
          <div className="p-4 pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-900/40">
            <div className="space-y-1.5">
              <label htmlFor="cal-width" className="block text-slate-400 font-medium">
                {t?.packWidth || 'Package Width (cm)'}:
              </label>
              <input
                id="cal-width"
                type="number"
                step="0.5"
                min="1"
                value={packageWidth}
                onChange={(e) => onPackageWidthChange(parseFloat(e.target.value) || 10.0)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                {lang === 'hi' ? 'मानक आधार: 10.0 सेमी' : 'Standard Baseline: 10.0 cm'}
              </span>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cal-pdp" className="block text-slate-400 font-medium">
                {t?.pdpArea || 'PDP Area (sq. cm)'}:
              </label>
              <input
                id="cal-pdp"
                type="number"
                step="10"
                min="5"
                value={pdpArea}
                onChange={(e) => onPdpAreaChange(parseFloat(e.target.value) || 150.0)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                {lang === 'hi' ? 'अनुसूची II आधार: 150.0 वर्ग सेमी' : 'Schedule II Baseline: 150.0 cm²'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
