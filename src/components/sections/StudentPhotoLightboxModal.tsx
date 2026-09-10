import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FullStudentRecord } from '../../types';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Camera,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  User,
  CheckCircle2,
  Info
} from 'lucide-react';

interface StudentPhotoLightboxModalProps {
  isOpen: boolean;
  student: FullStudentRecord | null;
  onClose: () => void;
  onOpenPhotoCapture?: (student: FullStudentRecord) => void;
}

export const StudentPhotoLightboxModal: React.FC<StudentPhotoLightboxModalProps> = ({
  isOpen,
  student,
  onClose,
  onOpenPhotoCapture
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset zoom & pan when modal opens or student changes
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setImageLoaded(false);
      setDownloadSuccess(false);

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === '+' || e.key === '=') {
          handleZoomIn();
        } else if (e.key === '-' || e.key === '_') {
          handleZoomOut();
        } else if (e.key === '0') {
          handleReset();
        } else if (e.key.toLowerCase() === 'r') {
          handleRotate();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, student]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.35, 0.75);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleZoom = () => {
    if (zoomLevel === 1) {
      setZoomLevel(1.85);
    } else if (zoomLevel < 2.5) {
      setZoomLevel(2.5);
    } else {
      handleReset();
    }
  };

  // Mouse & Touch Dragging for Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && zoomLevel > 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    if (!student?.photoUrl) return;
    try {
      const link = document.createElement('a');
      link.href = student.photoUrl;
      const cleanName = student.name ? student.name.replace(/[^a-zA-Z0-9]/g, '_') : 'murid';
      link.download = `Foto_${cleanName}_${student.ic || student.bil || 'skmp'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  if (!isOpen || !student || typeof document === 'undefined') return null;

  const isMale = student.gender === 'LELAKI';

  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] flex flex-col justify-between bg-slate-950/95 backdrop-blur-xl select-none animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Bar */}
      <div
        className="w-full bg-slate-900/90 border-b border-white/10 px-3 py-2.5 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3 z-20 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
                Bil. #{student.bil}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                  isMale
                    ? 'bg-blue-500/25 text-blue-300 border-blue-400/40'
                    : 'bg-rose-500/25 text-rose-300 border-rose-400/40'
                }`}
              >
                {student.gender}
              </span>
              <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 truncate max-w-[160px] sm:max-w-[220px]">
                {student.year} • {student.className}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white truncate mt-0.5">
              {student.name}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-mono">
              KP: <span className="text-yellow-300 font-bold">{student.ic || '-'}</span> | ID: {student.studentId || '-'}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Tutup Paparan Gambar (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Tutup</span>
          </button>
        </div>
      </div>

      {/* Main Image Viewer Area */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden p-2 sm:p-6 cursor-grab active:cursor-grabbing"
        onClick={(e) => {
          // If clicked directly on the canvas background, close
          if (e.target === containerRef.current) {
            onClose();
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {student.photoUrl ? (
          <div
            className="relative transition-transform duration-100 ease-out flex items-center justify-center max-w-full max-h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`
            }}
          >
            <img
              src={student.photoUrl}
              alt={student.name}
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              onClick={(e) => {
                e.stopPropagation();
                toggleZoom();
              }}
              className={`max-w-[85vw] sm:max-w-[70vw] md:max-w-[55vw] lg:max-w-[45vw] max-h-[62vh] sm:max-h-[68vh] object-contain rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] border-2 border-emerald-400/80 bg-slate-900 cursor-zoom-in active:cursor-grabbing transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              title="Ketik untuk besarkan atau kecilkan gambar"
            />

            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
                <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-6 bg-slate-900/60 rounded-3xl border border-white/10 max-w-sm text-center">
            <User className="w-16 h-16 text-slate-500 mb-2" />
            <p className="text-sm font-bold text-white">Tiada Foto Murid</p>
            <p className="text-xs text-slate-400 mt-1">
              Murid ini belum mempunyai gambar profil yang dimuat naik atau ditangkap.
            </p>
            {onOpenPhotoCapture && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPhotoCapture(student);
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <span>Tangkap Gambar Sekarang</span>
              </button>
            )}
          </div>
        )}

        {/* Floating Hint Overlay on first load */}
        {student.photoUrl && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-900/80 border border-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] sm:text-xs text-slate-300 shadow-md flex items-center gap-1.5">
            <Info className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span>Ketik gambar untuk zum masuk/keluar ({Math.round(zoomLevel * 100)}%)</span>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div
        className="w-full bg-slate-900/90 border-t border-white/10 px-3 py-3 sm:px-6 sm:py-4 flex flex-wrap items-center justify-between gap-2 sm:gap-4 z-20 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Zoom Level & Reset */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.75}
            className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            title="Zum Keluar (-)"
          >
            <ZoomOut className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Kecilkan</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs font-mono font-bold border border-slate-700 transition min-w-[58px] sm:min-w-[68px] text-center cursor-pointer"
            title="Set Semula Zum (0)"
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3.5}
            className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            title="Zum Masuk (+)"
          >
            <ZoomIn className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Besarkan</span>
          </button>

          <button
            type="button"
            onClick={handleRotate}
            className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            title="Pusing Gambar 90 darjah (R)"
          >
            <RotateCw className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">Pusing</span>
          </button>
        </div>

        {/* Right Side: Download & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {student.photoUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 sm:px-3.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Muat turun fail gambar murid"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold hidden sm:inline">Disimpan</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">Simpan Foto</span>
                </>
              )}
            </button>
          )}

          {onOpenPhotoCapture && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPhotoCapture(student);
              }}
              className="p-2 sm:px-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
              title="Ambil atau tukar gambar profil murid"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">{student.photoUrl ? 'Tukar Foto' : 'Ambil Foto'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
