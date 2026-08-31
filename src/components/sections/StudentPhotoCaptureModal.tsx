import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FullStudentRecord } from '../../types';
import {
  syncStudentPhotoToGoogleSheets
} from '../../utils/googleSheetsStudentSync';
import {
  Camera,
  Upload,
  X,
  RefreshCw,
  Check,
  CheckCircle2,
  AlertCircle,
  FlipHorizontal,
  Sparkles,
  Trash2,
  User,
  ShieldCheck,
  Smartphone,
  Info
} from 'lucide-react';

interface StudentPhotoCaptureModalProps {
  isOpen: boolean;
  student: FullStudentRecord | null;
  onClose: () => void;
  onPhotoSaved: (studentKey: string, photoUrl: string) => void;
}

export const StudentPhotoCaptureModal: React.FC<StudentPhotoCaptureModalProps> = ({
  isOpen,
  student,
  onClose,
  onPhotoSaved
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    setIsVideoReady(false);
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track', e);
        }
      });
      setStream(null);
    }
  }, [stream]);

  // Start camera stream with robust mobile fallbacks
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setIsInitializingCamera(true);
    setIsVideoReady(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera langsung tidak disokong oleh pelayar ini. Sila guna fungsi "Kamera Telefon Pintar".');
      }

      let mediaStream: MediaStream | null = null;

      // Primary attempt: standard facingMode
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (e1) {
        console.warn('Primary camera constraints failed, attempting fallback constraint:', e1);
        // Fallback 1: simple facingMode
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode },
            audio: false
          });
        } catch (e2) {
          console.warn('Fallback 1 failed, attempting universal video stream:', e2);
          // Fallback 2: universal video
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
      }

      if (!mediaStream) {
        throw new Error('Gagal memulakan suapan video.');
      }

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Explicitly trigger play for mobile browsers (iOS Safari & Android Chrome)
        try {
          await videoRef.current.play();
          setIsVideoReady(true);
        } catch (playErr) {
          console.warn('Video play delayed, waiting for user/metadata:', playErr);
        }
      }
    } catch (err: any) {
      console.error('Gagal memulakan kamera:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Kebenaran akses kamera ditolak. Sila benarkan akses kamera dalam tetapan pelayar atau klik "Guna Kamera Telefon Pintar".');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Tiada peranti kamera dikesan pada peranti anda.');
      } else {
        setCameraError('Kamera tidak dapat dipaparkan: ' + (err.message || 'Sila guna butang "Kamera Telefon Pintar".'));
      }
    } finally {
      setIsInitializingCamera(false);
    }
  }, [facingMode, stopCamera]);

  // Effect when modal opens / closes or tab changes
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !capturedPhoto) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, capturedPhoto, startCamera, stopCamera]);

  // Effect to attach video stream when ref mounts or stream updates
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().then(() => {
        setIsVideoReady(true);
      }).catch((e) => {
        console.warn('Auto play caught on ref update:', e);
      });
    }
  }, [stream]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture frame from video
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions for passport portrait photo (e.g. 480 x 600)
    const targetWidth = 480;
    const targetHeight = 600;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    // Calculate crop for portrait center
    const aspect = targetWidth / targetHeight;
    let cropWidth = videoWidth;
    let cropHeight = videoWidth / aspect;

    if (cropHeight > videoHeight) {
      cropHeight = videoHeight;
      cropWidth = videoHeight * aspect;
    }

    const startX = (videoWidth - cropWidth) / 2;
    const startY = (videoHeight - cropHeight) / 2;

    // If front camera, flip horizontally for natural mirror look
    if (facingMode === 'user') {
      ctx.translate(targetWidth, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  // Snap with countdown
  const handleSnapWithTimer = (seconds: number) => {
    if (countdown !== null) return;
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail format gambar sahaja (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const targetWidth = 480;
        const targetHeight = 600;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Crop center
        const aspect = targetWidth / targetHeight;
        let cropWidth = img.width;
        let cropHeight = img.width / aspect;

        if (cropHeight > img.height) {
          cropHeight = img.height;
          cropWidth = img.height * aspect;
        }

        const startX = (img.width - cropWidth) / 2;
        const startY = (img.height - cropHeight) / 2;

        ctx.drawImage(img, startX, startY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCapturedPhoto(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Reset / Retake
  const handleRetake = () => {
    setCapturedPhoto(null);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  // Save photo and trigger sync to Google Sheets
  const handleSavePhoto = async () => {
    if (!student || !capturedPhoto) return;

    setIsSaving(true);
    try {
      const primaryKey = student.studentId || student.ic || student.id;
      const res = await syncStudentPhotoToGoogleSheets(student, capturedPhoto);

      onPhotoSaved(primaryKey, capturedPhoto);
      setSuccessToast(res.message || 'Gambar murid berjaya disimpan!');

      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Ralat semasa menyimpan gambar:', err);
      alert('Gagal menyimpan gambar murid. Sila cuba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !student) return null;

  const isMale = student.gender === 'LELAKI';

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-[90] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Hidden canvas for image manipulation */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg border border-emerald-400/40">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                Studio Gambar Murid SKMP
              </h3>
              <p className="text-xs text-slate-300">
                {student.name} • {student.year} ({student.className})
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 bg-white/10 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl transition border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        {!capturedPhoto && (
          <div className="p-2 sm:p-3 bg-slate-950/60 border-b border-white/10 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                setActiveTab('camera');
                setCameraError(null);
              }}
              className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                activeTab === 'camera'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Kamera Langsung</span>
            </button>

            {/* Direct Native Phone Camera Trigger Button */}
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 border bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-md active:scale-95"
              title="Buka aplikasi kamera terus pada telefon pintar anda"
            >
              <Smartphone className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>Kamera Telefon (HD)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                activeTab === 'upload'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Muat Naik Fail</span>
            </button>
          </div>
        )}

        {/* Hidden inputs for Native Smartphone Camera and File Upload */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Main Body Content */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center space-y-4">
          {/* 1. Preview of Captured/Uploaded Photo */}
          {capturedPhoto ? (
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="relative w-56 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-2xl shadow-emerald-950/50 bg-black">
                <img
                  src={capturedPhoto}
                  alt={`Gambar ${student.name}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1 border border-emerald-300/40">
                  <Sparkles className="w-3 h-3" />
                  <span>Siap Ditangkap</span>
                </div>
              </div>

              {/* Student Identification Stamp */}
              <div className="text-center">
                <h4 className="text-sm font-black text-white">{student.name}</h4>
                <p className="text-xs text-slate-300 font-mono">
                  KP: {student.ic || '-'} | Kelas: {student.year} - {student.className}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center gap-3 pt-2">
                <button
                  onClick={handleRetake}
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-slate-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 border border-white/15"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Ambil Semula</span>
                </button>

                <button
                  onClick={handleSavePhoto}
                  disabled={isSaving}
                  className="flex-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 border border-emerald-400 shadow-xl shadow-emerald-950/50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan ke Google Sheets...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan & Segerak ke Google Sheets</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : activeTab === 'camera' ? (
            /* 2. Live Camera View */
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-black shadow-2xl flex items-center justify-center">
                {/* Shutter flash animation */}
                {isShutterFlashing && (
                  <div className="absolute inset-0 bg-white z-40 animate-ping" />
                )}

                {/* Countdown overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-7xl font-black text-yellow-300 animate-bounce">
                      {countdown}
                    </span>
                  </div>
                )}

                {/* Video element with mobile inline play support */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.play().then(() => {
                        setIsVideoReady(true);
                      }).catch((e) => {
                        console.warn('Play on metadata loaded:', e);
                      });
                    }
                  }}
                  onCanPlay={() => {
                    if (videoRef.current) {
                      videoRef.current.play().then(() => {
                        setIsVideoReady(true);
                      }).catch((e) => {
                        console.warn('Play on can play:', e);
                      });
                    }
                  }}
                  className={`w-full h-full object-cover ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  }`}
                />

                {/* Face Guideline Mask Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  {/* Oval Portrait Guide */}
                  <div className="w-40 h-52 sm:w-48 sm:h-64 border-2 border-dashed border-emerald-400/60 rounded-[45%] shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center relative">
                    <span className="text-[10px] text-emerald-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded-full border border-emerald-400/30 absolute -top-3">
                      Posisikan Wajah Murid
                    </span>
                  </div>
                </div>

                {/* Flip Camera Button in top corner */}
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="absolute top-3 right-3 z-20 p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition"
                  title="Tukar Kamera Depan / Belakang"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>

                {/* Initializing / Error State */}
                {isInitializingCamera && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 z-10">
                    <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                    <p className="text-xs text-slate-300 font-medium">Menghidupkan kamera...</p>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/95 p-4 flex flex-col items-center justify-center text-center space-y-3 z-20">
                    <AlertCircle className="w-8 h-8 text-rose-400" />
                    <p className="text-xs text-rose-300 font-medium leading-relaxed">{cameraError}</p>
                    <div className="flex flex-col gap-2 w-full max-w-[200px]">
                      <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Buka Kamera Telefon</span>
                      </button>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold rounded-xl transition"
                      >
                        Cuba Lagi
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Trigger Buttons */}
              <div className="w-full flex items-center justify-center gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSnapWithTimer(3)}
                  disabled={Boolean(cameraError) || isInitializingCamera || countdown !== null}
                  className="py-2.5 px-3 sm:px-4 bg-white/10 hover:bg-white/20 text-yellow-300 rounded-2xl text-xs font-bold transition flex items-center gap-1 border border-white/10"
                  title="Tangkap dengan kiraan masa 3 saat"
                >
                  <span>3s</span>
                </button>

                <button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={Boolean(cameraError) || isInitializingCamera || countdown !== null}
                  className="py-3 px-5 sm:px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl text-sm font-black transition flex items-center gap-2 border border-emerald-400 shadow-xl shadow-emerald-950/50 active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  <span>Tangkap</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFacingMode}
                  disabled={Boolean(cameraError) || isInitializingCamera}
                  className="py-2.5 px-3 sm:px-4 bg-white/10 hover:bg-white/20 text-slate-300 rounded-2xl text-xs font-bold transition flex items-center gap-1 border border-white/10"
                  title="Tukar Kamera"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Tukar</span>
                </button>
              </div>

              {/* Mobile Tip / Fallback Box */}
              <div className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Smartphone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-[11px] leading-tight">
                    Jika skrin kamera gelap pada telefon anda, gunakan kamera terus:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="flex-shrink-0 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition border border-blue-400 active:scale-95"
                >
                  Guna Kamera Telefon
                </button>
              </div>
            </div>
          ) : (
            /* 3. Upload File View */
            <div className="w-full flex flex-col items-center space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-white/20 hover:border-emerald-400 bg-slate-950/50 hover:bg-slate-950/80 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition space-y-3 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 group-hover:bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-400/30 transition">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-emerald-300 transition">
                    Pilih atau Seret Fail Gambar Di Sini
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Menyokong format JPG, PNG, atau WEBP (Maksimum 5MB)
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md border border-emerald-400"
                >
                  Buka Fail Gambar
                </button>
              </div>

              {/* Existing Photo / Default Avatar Preview */}
              <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/10 flex items-center gap-3 w-full">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
                  {student.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User
                      className={`w-6 h-6 ${
                        isMale ? 'text-blue-400' : 'text-rose-400'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block">Status Gambar Semasa:</span>
                  <span className="text-xs font-bold text-slate-200">
                    {student.photoUrl ? 'Gambar telah sedia ada' : `Menggunakan ikon ${student.gender.toLowerCase()}`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="bg-slate-950/80 px-4 sm:px-6 py-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Foto disimpan ke direktori murid & disegerakkan ke Google Sheets.</span>
          </span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-300 hover:text-white font-bold"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
