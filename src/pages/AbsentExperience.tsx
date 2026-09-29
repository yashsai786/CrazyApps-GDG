import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Scan, 
  ShieldAlert, 
  Accessibility as WheelchairIcon, 
  Recycle, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  SwitchCamera,
  Sparkles,
  Info
} from 'lucide-react';
import { AbsentMode, AbsentAuditResult } from '../types/absent';

interface AbsentExperienceProps {
  onBack: () => void;
}

const MODES: { id: AbsentMode; label: string; icon: any; tagline: string; description: string }[] = [
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: WheelchairIcon,
    tagline: 'Ramps, step-free access, tactile paving, accessible signage, lifts',
    description: 'Looks for physical barriers and absent accessible infrastructure.'
  },
  {
    id: 'safety',
    label: 'Safety',
    icon: ShieldAlert,
    tagline: 'Emergency exits, fire equipment, hazard warnings, drop barriers',
    description: 'Looks for absent emergency egress, missing warnings, and safety gaps.'
  },
  {
    id: 'sustainability',
    label: 'Sustainability',
    icon: Recycle,
    tagline: 'Waste sorting, water refills, bike parking, pedestrian paths',
    description: 'Looks for absent environmental and active-transit infrastructure.'
  }
];

const SCANNING_PHRASES = [
  'Looking carefully...',
  'Checking what is visible...',
  'Comparing visible infrastructure...',
  'Looking for what might be missing...',
  'Analyzing spatial gaps...'
];

export const AbsentExperience: React.FC<AbsentExperienceProps> = ({ onBack }) => {
  const [selectedMode, setSelectedMode] = useState<AbsentMode>('accessibility');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [scanningMessageIdx, setScanningMessageIdx] = useState<number>(0);
  const [auditResult, setAuditResult] = useState<AbsentAuditResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Start camera
  const startCamera = useCallback(async (facing: 'environment' | 'user' = 'environment') => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported on this device.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('[AbsentCamera] Access notice:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. You can upload an image instead.');
      } else {
        setCameraError('Camera is currently unavailable. You can upload an image instead.');
      }
      setCameraActive(false);
    }
  }, [stopCamera]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Rotate scanning message
  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setScanningMessageIdx((prev) => (prev + 1) % SCANNING_PHRASES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Capture frame from live video
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const canvas = document.createElement('canvas');
    // Scale down if larger than 1280 to optimize transfer
    const maxDim = 1024;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.82);
  }, []);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1024;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setCapturedImage(compressed);
          stopCamera();
          setAuditResult(null);
          setAnalysisError(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Perform Analysis
  const performAnalysis = async (imageToAnalyze?: string) => {
    let imageSrc = imageToAnalyze || capturedImage;

    // If camera is running, capture the current frame
    if (!imageSrc && cameraActive) {
      imageSrc = captureFrame();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      }
    }

    if (!imageSrc) {
      setAnalysisError('Please capture or upload an image to inspect.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imageSrc,
          mode: selectedMode
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        if (response.status === 429 || errJson?.isRateLimit) {
          setShowRateLimitModal(true);
          return;
        }
        throw new Error(errJson?.error || 'Analysis request failed with status ' + response.status);
      }

      const data: AbsentAuditResult = await response.json();
      setAuditResult(data);
      stopCamera();
    } catch (err: any) {
      console.error('[Absent] Scan error:', err);
      setAnalysisError("The scan couldn't be completed. The AI couldn't inspect this image right now.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScanClick = () => {
    if (cameraActive) {
      const frame = captureFrame();
      if (frame) {
        setCapturedImage(frame);
        performAnalysis(frame);
      }
    } else if (capturedImage) {
      performAnalysis(capturedImage);
    } else {
      startCamera();
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setAuditResult(null);
    setAnalysisError(null);
    startCamera(facingMode);
  };

  const toggleFacingMode = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  // Quick preset sample scenes for instant judging/demo
  const handleLoadSample = (sampleType: 'staircase' | 'corridor' | 'street') => {
    stopCamera();
    setAnalysisError(null);
    setAuditResult(null);

    // High quality architectural sample images
    const samples: Record<string, { url: string; mode: AbsentMode }> = {
      staircase: {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=900&q=80', // concrete staircase in public space
        mode: 'accessibility'
      },
      corridor: {
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80', // commercial indoor space
        mode: 'safety'
      },
      street: {
        url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=900&q=80', // public urban streetscape
        mode: 'sustainability'
      }
    };

    const choice = samples[sampleType];
    setSelectedMode(choice.mode);

    // Fetch and convert sample to base64
    fetch(choice.url)
      .then((r) => r.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCapturedImage(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        setAnalysisError('Could not load sample. Please use camera or file upload.');
      });
  };

  return (
    <div className="relative w-full min-h-screen bg-[#07090e] text-zinc-100 flex flex-col justify-between selection:bg-cyan-500/30">
      {/* Clean ambient radial glow */}
      <div 
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 15%, rgba(6, 182, 212, 0.08) 0%, rgba(7, 9, 14, 0.95) 70%, #050608 100%)'
        }}
      />

      {/* Top Bar with Back Button */}
      <header className="relative z-20 max-w-5xl w-full mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-['Inter'] text-zinc-400 hover:text-zinc-200 transition-all duration-200 focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Choose another experience</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] font-['JetBrains_Mono'] text-cyan-400/80 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>ABSENT Visual Gap Auditor</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-6 py-4 flex-1 flex flex-col items-center">
        {/* Title & Tagline */}
        <div className="text-center mb-6">
          <h1 className="font-['Cinzel'] text-3xl sm:text-4xl tracking-[0.25em] font-light text-zinc-100 mb-2">
            ABSENT
          </h1>
          <p className="font-['Inter'] text-sm sm:text-base text-zinc-300 font-light tracking-wide mb-1">
            AI that looks for what isn't there.
          </p>
          <p className="font-['JetBrains_Mono'] text-xs text-cyan-400/70 tracking-widest uppercase">
            Point. Scan. Discover.
          </p>
        </div>

        {/* MODE SELECTOR */}
        <div className="w-full max-w-xl grid grid-cols-3 gap-2.5 mb-6">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-400/80 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.18)]'
                    : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-cyan-300' : 'text-zinc-400'}`} />
                <span className="text-xs font-['Inter'] font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* VIEWPORT / CAMERA / RESULTS CONTAINER */}
        <div className="w-full max-w-xl bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl relative">
          
          {/* 1. RESULTS VIEW */}
          {auditResult ? (
            <div className="flex flex-col gap-5">
              {/* Result Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-['JetBrains_Mono'] uppercase tracking-wider font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                    {auditResult.mode} SCAN
                  </span>
                  <span className="text-xs font-['JetBrains_Mono'] text-zinc-400">
                    Confidence: {Math.round(auditResult.overall_confidence * 100)}%
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs font-['Inter'] text-zinc-400 hover:text-cyan-300 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Scan Again</span>
                </button>
              </div>

              {/* Captured Image Thumbnail & Scene Summary */}
              <div className="flex flex-col sm:flex-row gap-4 items-start bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/60">
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Audited scene"
                    className="w-full sm:w-32 h-28 object-cover rounded-lg border border-zinc-800"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-zinc-400 mb-1">
                    Observed Scene: {auditResult.scene}
                  </h3>
                  <p className="text-xs sm:text-sm font-['Inter'] text-zinc-200 leading-relaxed">
                    {auditResult.summary}
                  </p>
                </div>
              </div>

              {/* Findings List */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-['JetBrains_Mono'] text-zinc-400 uppercase tracking-widest">
                  Identified Gaps ({auditResult.findings?.length || 0})
                </h4>

                {auditResult.findings && auditResult.findings.length > 0 ? (
                  auditResult.findings.map((f, idx) => {
                    const isHigh = f.severity === 'high';
                    const isMed = f.severity === 'medium';
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex flex-col gap-3 ${
                          isHigh
                            ? 'bg-rose-950/20 border-rose-500/30'
                            : isMed
                            ? 'bg-amber-950/20 border-amber-500/30'
                            : 'bg-zinc-900/40 border-zinc-800/80'
                        }`}
                      >
                        {/* Title & Severity */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-4 h-4 shrink-0 ${isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-blue-400'}`} />
                            <h5 className="text-sm font-['Inter'] font-semibold text-zinc-100">
                              {f.title}
                            </h5>
                          </div>
                          <span
                            className={`text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded uppercase tracking-wider ${
                              isHigh
                                ? 'bg-rose-500/20 text-rose-300'
                                : isMed
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {f.severity} severity • {Math.round(f.confidence * 100)}%
                          </span>
                        </div>

                        {/* Evidence Checklist */}
                        {f.evidence && f.evidence.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-['JetBrains_Mono'] text-zinc-400">Why we flagged this:</span>
                            {f.evidence.map((ev, evIdx) => (
                              <div key={evIdx} className="flex items-center gap-2 text-xs font-['Inter'] text-zinc-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span>{ev}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Recommendation */}
                        {f.recommendation && (
                          <div className="text-xs font-['Inter'] text-zinc-300 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                            <strong className="text-cyan-300 font-medium">Recommendation: </strong>
                            {f.recommendation}
                          </div>
                        )}

                        {/* Mandatory Uncertainty Notice */}
                        <div className="flex items-start gap-2 text-[11px] font-['Inter'] text-zinc-400/90 italic pt-1 border-t border-zinc-800/40">
                          <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                          <span>{f.uncertainty}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-400">
                    No apparent infrastructure gaps observed in this specific frame.
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-['Inter'] text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  Scan Another Scene
                </button>
                <button
                  onClick={() => {
                    const nextMode = selectedMode === 'accessibility' ? 'safety' : selectedMode === 'safety' ? 'sustainability' : 'accessibility';
                    setSelectedMode(nextMode);
                    if (capturedImage) performAnalysis(capturedImage);
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-['Inter'] text-xs transition-colors"
                >
                  Change Mode →
                </button>
              </div>
            </div>
          ) : (
            /* 2. CAMERA / UPLOAD / SCANNING VIEW */
            <div className="flex flex-col gap-4">
              
              {/* Media Viewport */}
              <div className="relative aspect-video sm:aspect-[4/3] w-full bg-black rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                
                {/* Live Video */}
                {cameraActive && !capturedImage && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Still Captured/Uploaded Image */}
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Scene preview"
                    className="w-full h-full object-contain bg-zinc-950"
                  />
                )}

                {/* Empty / Inactive Camera placeholder */}
                {!cameraActive && !capturedImage && (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-500">
                    <Camera className="w-10 h-10 mb-3 text-zinc-600" />
                    <p className="text-xs font-['Inter'] text-zinc-400 mb-1">
                      {cameraError || 'Camera inactive'}
                    </p>
                    <p className="text-[11px] text-zinc-600 mb-4 max-w-xs">
                      Activate your webcam or upload a photo to audit for physical gaps.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => startCamera(facingMode)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-zinc-950 text-xs font-['Inter'] font-semibold transition-colors"
                      >
                        Enable Camera
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-['Inter'] transition-colors"
                      >
                        Upload Image
                      </button>
                    </div>
                  </div>
                )}

                {/* Technical HUD Reticle Overlay */}
                <div className="pointer-events-none absolute inset-0">
                  {/* Four Corner Marks */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/70" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/70" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/70" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/70" />

                  {/* Mode Watermark Tag */}
                  <div className="absolute top-3 left-10 text-[10px] font-['JetBrains_Mono'] tracking-widest text-cyan-400/80 uppercase">
                    ABSENT // {selectedMode}
                  </div>

                  {/* Camera flip control if live */}
                  {cameraActive && (
                    <button
                      onClick={toggleFacingMode}
                      className="pointer-events-auto absolute top-3 right-10 p-1.5 rounded-full bg-black/60 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      title="Flip camera"
                    >
                      <SwitchCamera className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* SCANNING LASER BEAM ANIMATION */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                    {/* Sweeping laser line */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-[scanline_1.8s_ease-in-out_infinite]" />
                    
                    <div className="relative z-10 flex flex-col items-center p-4 text-center">
                      <Scan className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                      <div className="text-xs font-['JetBrains_Mono'] text-cyan-300 uppercase tracking-widest font-semibold mb-1">
                        ANALYZING SCENE
                      </div>
                      <div className="text-xs font-['Inter'] text-zinc-300 transition-all duration-300">
                        {SCANNING_PHRASES[scanningMessageIdx]}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Banner */}
              {analysisError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-xs text-rose-200">
                  <span>{analysisError}</span>
                  <button
                    onClick={() => performAnalysis()}
                    className="underline text-rose-300 hover:text-rose-100 font-medium ml-2"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Main Scan Button */}
                <button
                  onClick={handleScanClick}
                  disabled={isAnalyzing}
                  className="w-full flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-zinc-950 font-['Inter'] font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98]"
                >
                  <Scan className="w-4 h-4" />
                  <span>
                    {isAnalyzing
                      ? 'Analyzing...'
                      : cameraActive
                      ? "Capture & Scan For What's Missing →"
                      : capturedImage
                      ? "SCAN FOR WHAT'S MISSING →"
                      : 'Activate Camera & Scan'}
                  </span>
                </button>

                {/* Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-['Inter'] text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  title="Upload photo from disk"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image</span>
                </button>
              </div>

              {/* Sample Presets for Fast Judging Demonstration */}
              <div className="pt-2 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
                <span className="font-['JetBrains_Mono']">Fast Demo Scenes:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleLoadSample('staircase')}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-300 border border-zinc-800/80 transition-colors"
                  >
                    ♿ Public Staircase
                  </button>
                  <button
                    onClick={() => handleLoadSample('corridor')}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-300 border border-zinc-800/80 transition-colors"
                  >
                    ⚠ Corridor Exit
                  </button>
                  <button
                    onClick={() => handleLoadSample('street')}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-300 border border-zinc-800/80 transition-colors"
                  >
                    ♻ Streetscape
                  </button>
                </div>
              </div>

            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Mode explanation subtitle */}
        <p className="mt-4 text-xs font-['Inter'] text-zinc-500 text-center max-w-md">
          {MODES.find((m) => m.id === selectedMode)?.description}
        </p>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] font-['Inter'] text-zinc-600">
        ABSENT AI Gap Auditor • Local Camera Processing • Privacy-first zero permanent storage
      </footer>

      {/* AI Rate Limit Exceeded Popup Modal */}
      {showRateLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-sm w-full bg-zinc-950 border border-amber-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-['Cinzel'] text-lg font-light text-zinc-100 tracking-wider mb-2">
              Limit Exceeded
            </h3>
            <p className="font-['Inter'] text-sm text-zinc-300 leading-relaxed mb-6">
              Sorry, AI rate limit exceeded. Come back tomorrow!
            </p>
            <button
              onClick={() => setShowRateLimitModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-['Inter'] text-xs font-semibold tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-[0.98]"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
