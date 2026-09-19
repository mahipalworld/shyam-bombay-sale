'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Camera, 
  SwitchCamera, 
  Upload, 
  Keyboard, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Zap,
  RefreshCw,
  Barcode
} from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan?: (barcode: string) => void;
  onScanSuccess?: (barcode: string) => void;
  title?: string;
  description?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  onScanSuccess,
  title = 'Scan Product Barcode',
  description = 'Point your camera at the barcode on the product packaging or tag.',
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [manualCode, setManualCode] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const scannerRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);
  const containerId = 'sbs-barcode-scanner-viewport';

  // Play pleasant short beep on successful barcode scan using Web Audio API
  const playBeepSound = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08); // E6 note

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio autoplay policy or not supported - safe ignore
    }
  }, []);

  const handleBarcodeDetected = useCallback((decodedText: string) => {
    const cleanCode = decodedText.trim();
    if (!cleanCode) return;

    playBeepSound();
    setScannedResult(cleanCode);

    // Stop camera
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
    }

    setTimeout(() => {
      if (onScan) onScan(cleanCode);
      if (onScanSuccess) onScanSuccess(cleanCode);
      onClose();
    }, 400);
  }, [onScan, onScanSuccess, onClose, playBeepSound]);

  // Clean stop of scanner instance
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch {
        // Safe ignore
      } finally {
        scannerRef.current = null;
      }
    }
    setIsScanning(false);
  }, []);

  // Initialize and start camera scanner
  const startScanner = useCallback(async (cameraMode: 'environment' | 'user') => {
    if (!isOpen || activeTab !== 'camera') return;
    setCameraError(null);
    setScannedResult(null);

    await stopScanner();

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
      if (!isMountedRef.current) return;

      const viewportEl = document.getElementById(containerId);
      if (!viewportEl) return;

      const scanner = new Html5Qrcode(containerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.ITF,
        ],
        verbose: false
      });

      scannerRef.current = scanner;

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 180 },
        aspectRatio: 1.333,
      };

      await scanner.start(
        { facingMode: cameraMode },
        config,
        (decodedText: string) => {
          handleBarcodeDetected(decodedText);
        },
        () => {
          // Frame scan error/waiting - normal in continuous scanning
        }
      );

      if (isMountedRef.current) {
        setIsScanning(true);
      }
    } catch (err: any) {
      console.warn('Barcode camera error:', err);
      if (isMountedRef.current) {
        setCameraError(
          err?.name === 'NotAllowedError' || err?.message?.includes('Permission')
            ? 'Camera permission denied. Please allow camera access in browser settings or use manual entry.'
            : err?.message || 'Could not access device camera. Please check your camera permissions.'
        );
        setIsScanning(false);
      }
    }
  }, [isOpen, activeTab, stopScanner, handleBarcodeDetected]);

  // Trigger camera startup when modal opens or camera toggles
  useEffect(() => {
    isMountedRef.current = true;

    if (isOpen && activeTab === 'camera') {
      const timer = setTimeout(() => {
        startScanner(facingMode);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }

    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, [isOpen, activeTab, facingMode, startScanner, stopScanner]);

  // Flip camera between environment (rear) and user (front)
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Handle uploading barcode image from disk/gallery
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setCameraError(null);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('sbs-file-scanner-temp', false);

      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();

      if (decodedText) {
        handleBarcodeDetected(decodedText);
      } else {
        setCameraError('No recognizable barcode detected in this image. Please ensure good lighting or enter manually.');
      }
    } catch (err: any) {
      setCameraError('Could not decode barcode from this image. Please try another photo or enter manually.');
    } finally {
      setIsProcessingFile(false);
      e.target.value = '';
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCode.trim();
    if (!clean) return;
    handleBarcodeDetected(clean);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Hidden container for file scan processing */}
      <div id="sbs-file-scanner-temp" className="hidden" />

      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F95721] text-white flex items-center justify-center shadow-xs shadow-orange-500/30">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-gray-900 leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                EAN-13, UPC, Code 128, QR
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Camera / Upload / Manual */}
        <div className="flex border-b border-gray-100 bg-gray-50/60 p-1.5 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setCameraError(null);
              setActiveTab('camera');
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-white text-[#F95721] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopScanner();
              setCameraError(null);
              setActiveTab('upload');
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-[#F95721] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopScanner();
              setCameraError(null);
              setActiveTab('manual');
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'manual'
                ? 'bg-white text-[#F95721] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Success Overlay */}
          {scannedResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 text-[#00A859] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-900">Barcode Captured!</p>
                <p className="font-mono text-xs text-emerald-700 font-bold truncate">
                  {scannedResult}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {cameraError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Scanner Note</p>
                <p className="text-[11px] leading-relaxed text-red-600">{cameraError}</p>
              </div>
            </div>
          )}

          {/* TAB 1: LIVE CAMERA VIEWPORT */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-gray-800">
                {/* Scanner container for html5-qrcode */}
                <div id={containerId} className="w-full h-full" />

                {/* Animated Targeting Overlay */}
                {isScanning && !cameraError && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="relative w-full max-w-[280px] h-[160px] border-2 border-dashed border-white/60 rounded-2xl">
                      {/* 4 Corner Markers */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-[#F95721] rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-[#F95721] rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-[#F95721] rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-[#F95721] rounded-br-lg" />

                      {/* Laser scanning line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#F95721] to-transparent shadow-[0_0_12px_#F95721] animate-scanner-laser" />
                    </div>
                  </div>
                )}

                {/* Loading state before camera starts */}
                {!isScanning && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 bg-black/90 space-y-2 p-4 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#F95721]" />
                    <p className="text-xs font-bold">Initializing camera stream...</p>
                    <p className="text-[10px] text-white/60">Position product barcode in front of the lens</p>
                  </div>
                )}
              </div>

              {/* Controls Toolbar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  title="Switch between front and rear cameras"
                >
                  <SwitchCamera className="w-3.5 h-3.5" />
                  <span>{facingMode === 'environment' ? 'Use Front Camera' : 'Use Rear Camera'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => startScanner(facingMode)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                  title="Restart Camera"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* TAB 2: UPLOAD IMAGE / PHOTO */}
          {activeTab === 'upload' && (
            <div className="space-y-4 text-center py-4">
              <label className="border-2 border-dashed border-gray-200 hover:border-[#F95721] bg-gray-50/60 hover:bg-orange-50/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all block">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#F95721] flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-800">
                    {isProcessingFile ? 'Analyzing image...' : 'Click to select or take barcode photo'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Supports JPG, PNG, WebP images of barcodes
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  disabled={isProcessingFile}
                  className="hidden"
                />
              </label>

              <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-3 text-[11px] text-amber-800 text-left space-y-0.5">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Tip for Photo Scan
                </p>
                <p className="text-[10px] text-amber-700">
                  Ensure the barcode lines are in focus and well-lit without glare from bright lights.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL ENTRY */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Enter Barcode / SKU / Product Code
                </label>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g., 8901030865421 or SBS-TRIM-01"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#F95721] focus:ring-1 focus:ring-[#F95721] outline-hidden transition-all"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  Type or paste numbers from standard retail packaging (EAN-13, UPC, etc.)
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="flex-1 py-2.5 bg-[#F95721] hover:bg-[#E44813] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Use This Barcode</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 px-4">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#F95721]" />
            Fast Hardware Detection
          </span>
          <button
            type="button"
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="font-bold text-gray-600 hover:text-black hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
