import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Camera,
  RotateCcw,
  Trash2,
  HelpCircle,
  Sparkles,
  Loader2,
  FileImage,
  AlertCircle,
  CheckCircle2,
  Ruler
} from 'lucide-react';

export default function InputScanner({ onRunAudit, isAuditing: externalIsAuditing }) {
  // Calibration Controls State
  const [packageWidth, setPackageWidth] = useState(10.0);
  const [pdpArea, setPdpArea] = useState(150.0);
  const [showTooltip, setShowTooltip] = useState(false);

  // Mode Selection: 'upload' | 'camera'
  const [activeMode, setActiveMode] = useState('upload');

  // Image Preview State (data URL or object URL)
  const [imagePreview, setImagePreview] = useState(null);
  const [imageMetadata, setImageMetadata] = useState(null);

  // Camera State
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Audit Loading State
  const [internalLoading, setInternalLoading] = useState(false);
  const isAuditing = externalIsAuditing !== undefined ? externalIsAuditing : internalLoading;

  // Refs
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Compute Rule 7 Prescribed Minimum Font Height based on PDP Area
  const getPrescribedMinFont = (area) => {
    const numArea = parseFloat(area) || 0;
    if (numArea <= 50) return '1.0 mm (Rule 7, Table I)';
    if (numArea <= 100) return '1.5 mm (Rule 7, Table I)';
    if (numArea <= 500) return '2.0 mm to 4.0 mm (Rule 7, Table I)';
    if (numArea <= 2500) return '4.0 mm to 6.0 mm (Rule 7, Table I)';
    return '6.0 mm (Rule 7, Table I)';
  };

  // Stop camera tracks helper
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  }, [cameraStream]);

  // Start Camera Feed
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser or switch to file upload.'
          : 'Unable to access video device. Please verify camera hardware or switch to file upload.'
      );
      setIsCameraActive(false);
    }
  };

  // Switch modes and handle camera lifecycle
  const handleModeChange = (mode) => {
    setActiveMode(mode);
    if (mode === 'camera') {
      if (!imagePreview) {
        startCamera();
      }
    } else {
      stopCamera();
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle Video Element ref update when stream is active
  useEffect(() => {
    if (videoRef.current && cameraStream && isCameraActive) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isCameraActive]);

  // Handle Drag & Drop Upload
  const handleFileProcess = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Statutory requirement: Please upload an image in .jpg, .png, or .webp format.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImagePreview(dataUrl);
      setImageMetadata({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type
      });
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle Live Camera Frame Capture
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setImagePreview(dataUrl);
    setImageMetadata({
      name: `live-optical-capture-${Date.now().toString().slice(-6)}.jpg`,
      size: `${Math.round((dataUrl.length * 3) / 4 / 1024)} KB`,
      type: 'image/jpeg'
    });

    stopCamera();
  };

  // Retake / Clear Image
  const handleRetake = () => {
    setImagePreview(null);
    setImageMetadata(null);
    if (activeMode === 'camera') {
      startCamera();
    }
  };

  // Run Statutory Audit
  const handleRunAudit = () => {
    if (!imagePreview) return;

    if (onRunAudit) {
      onRunAudit({
        image: imagePreview,
        metadata: imageMetadata,
        packageWidth: parseFloat(packageWidth),
        pdpArea: parseFloat(pdpArea),
        prescribedFont: getPrescribedMinFont(pdpArea)
      });
    } else {
      // Internal simulated loading
      setInternalLoading(true);
      setTimeout(() => {
        setInternalLoading(false);
      }, 2000);
    }
  };

  return (
    <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl overflow-hidden shadow-md">
      {/* Hidden canvas for video captures */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 1. Calibration Controls (Top Bar) */}
      <div className="p-4 sm:p-5 bg-slate-900/80 border-b border-slate-700/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  Optical Calibration Controls
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  RULE 7 GEOMETRY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Calibrate physical packaging dimensions to measure exact font heights
              </p>
            </div>
          </div>

          {/* Number Inputs Bar */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Input 1: Package Width */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <label htmlFor="packageWidth" className="text-xs text-slate-300 whitespace-nowrap font-medium">
                Package Width (cm):
              </label>
              <input
                id="packageWidth"
                type="number"
                value={packageWidth}
                onChange={(e) => setPackageWidth(e.target.value)}
                step="0.5"
                min="1.0"
                max="200.0"
                className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-emerald-300 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
              />
            </div>

            {/* Input 2: PDP Area */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <label htmlFor="pdpArea" className="text-xs text-slate-300 whitespace-nowrap font-medium">
                PDP Area (cm²):
              </label>
              <input
                id="pdpArea"
                type="number"
                value={pdpArea}
                onChange={(e) => setPdpArea(e.target.value)}
                step="10"
                min="5"
                max="50000"
                className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-emerald-300 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
              />
            </div>

            {/* Tooltip Info Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                aria-label="Statutory Rule Information"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
              </button>

              {/* Tooltip Popover */}
              {showTooltip && (
                <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-72 sm:w-80 p-3 bg-slate-950/95 border border-emerald-500/30 rounded-xl shadow-2xl z-50 text-xs text-slate-200 backdrop-blur-md">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Statutory Rule 7 &amp; Table 1
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Under the Legal Metrology (Packaged Commodities) Rules, 2011, the minimum prescribed font height for mandatory numerals (Net Quantity, MRP, USP) is legally dictated by the Principal Display Panel (PDP) area:
                  </p>
                  <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 font-mono text-[10px] text-amber-300">
                    Calculated Threshold for {pdpArea || 0} cm²:
                    <br />
                    <span className="text-emerald-300 font-bold">{getPrescribedMinFont(pdpArea)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dual Mode Toggle (Segmented control button) */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40">
        <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => handleModeChange('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>📁 Upload Label Photo</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('camera')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'camera'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>📸 Live Camera Scanner</span>
          </button>
        </div>

        {/* Current status pill */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className={`w-2 h-2 rounded-full ${imagePreview ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          <span>{imagePreview ? 'IMAGE READY FOR AUDIT' : 'WAITING FOR INPUT'}</span>
        </div>
      </div>

      {/* 3 & 4. Interactive Body Area: Upload Zone OR Live Camera OR Preview */}
      <div className="p-5">
        {imagePreview ? (
          /* Preview State (Shared for both upload & captured camera) */
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-inner group">
              <div className="max-h-[380px] w-full flex items-center justify-center p-3 bg-slate-950/90">
                <img
                  src={imagePreview}
                  alt="Packaged Commodity Label Preview"
                  className="max-h-[350px] w-auto object-contain rounded-lg shadow-md"
                />
              </div>

              {/* Overlay Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-[11px] font-mono text-slate-200">
                <FileImage className="w-3.5 h-3.5 text-emerald-400" />
                <span>{imageMetadata?.name || 'Inspection Sample'}</span>
                {imageMetadata?.size && <span className="text-slate-400">({imageMetadata.size})</span>}
              </div>

              {/* Remove / Retake Button */}
              <button
                type="button"
                onClick={handleRetake}
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            {/* Calibration Summary strip for this image */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
              <div>Package Width: <span className="text-emerald-400 font-bold">{packageWidth} cm</span></div>
              <div>PDP Area: <span className="text-emerald-400 font-bold">{pdpArea} cm²</span></div>
              <div>Min Prescribed Font: <span className="text-amber-400 font-bold">{getPrescribedMinFont(pdpArea)}</span></div>
            </div>
          </div>
        ) : activeMode === 'upload' ? (
          /* 3. Mode A - Upload Zone */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/70 rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-950/40 hover:bg-slate-900/40 transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => e.target.files && handleFileProcess(e.target.files[0])}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-7 h-7 text-emerald-400" />
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-white mb-1">
              Drag &amp; Drop Commodity Label Photo Here
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-3">
              Supports high-resolution packaged commodity captures in <strong className="text-slate-300">.jpg, .png, or .webp</strong>
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium group-hover:bg-slate-700 transition-colors">
              <FileImage className="w-3.5 h-3.5 text-emerald-400" />
              <span>Browse Local Files</span>
            </div>
          </div>
        ) : (
          /* 4. Mode B - Live Camera Scanner */
          <div className="space-y-3">
            {cameraError ? (
              <div className="p-6 bg-red-950/30 border border-red-500/40 rounded-xl text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                <div className="text-sm font-semibold text-red-200">{cameraError}</div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Camera Connection</span>
                </button>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center min-h-[320px] sm:min-h-[380px]">
                {/* Responsive HTML5 Video Stream */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-h-[420px] object-cover"
                />

                {/* Visible Overlay Guide Rectangle */}
                <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-3 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  {/* Corner Reticles */}
                  <div className="flex justify-between items-start">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-slate-900/90 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                      PDP SCANNER GUIDE
                    </span>
                    <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  </div>

                  {/* Central alignment notice */}
                  <div className="text-center">
                    <span className="inline-block px-3 py-1.5 rounded-md bg-slate-950/85 border border-emerald-400/40 text-xs font-medium text-emerald-300 shadow-md">
                      Align Principal Display Panel inside this frame
                    </span>
                  </div>

                  <div className="flex justify-between items-end">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <span className="text-[10px] font-mono text-emerald-400/80 bg-slate-900/80 px-2 py-0.5 rounded">
                      Optical Grid: Ready
                    </span>
                    <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>

                {/* Floating Bottom Capture Trigger */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center z-20">
                  <button
                    type="button"
                    onClick={handleCaptureFrame}
                    className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-emerald-400"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Frame</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Action Button: Run Statutory Audit */}
      <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          {imagePreview ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Commodity label loaded. Ready for Rule 6 statutory OCR verification.
            </span>
          ) : (
            <span>Load or capture a commodity label photo to execute inspection.</span>
          )}
        </div>

        <button
          type="button"
          disabled={!imagePreview || isAuditing}
          onClick={handleRunAudit}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all ${
            !imagePreview || isAuditing
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50 cursor-pointer hover:shadow-emerald-500/20'
          }`}
        >
          {isAuditing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
              <span>Scanning declarations and measuring font geometry...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Run Statutory Audit</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
