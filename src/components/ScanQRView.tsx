import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, CheckCircle2, QrCode, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';

interface ScanQRViewProps {
  currentUser: UserProfile;
  availableUsersToScan: UserProfile[];
  onBack: () => void;
  onUserScanned: (user: UserProfile) => void;
  onOpenUserProfile: (userId: string) => void;
}

export const ScanQRView: React.FC<ScanQRViewProps> = ({
  currentUser,
  availableUsersToScan,
  onBack,
  onUserScanned,
  onOpenUserProfile,
}) => {
  const [isScanning, setIsScanning] = useState(true);
  const [scannedUser, setScannedUser] = useState<UserProfile | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Try real camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setCameraActive(true);
        }
      })
      .catch(() => {
        setCameraActive(false);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleScanTarget = (user: UserProfile) => {
    setIsScanning(false);
    setScannedUser(user);
    onUserScanned(user);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleSimulateNewPatient = () => {
    const randomId = Date.now();
    const demoUser: UserProfile = {
      id: `user-scanned-${randomId}`,
      name: 'Anna Nowak',
      email: 'anna.nowak@gmail.com',
      initials: 'AN',
      avatarBg: '#FEF3C7',
      avatarBorder: '#FCD34D',
      avatarText: '#B45309',
      role: 'patient',
    };
    handleScanTarget(demoUser);
  };

  return (
    <div className="relative flex-1 flex flex-col bg-white overflow-hidden text-neutral-900">
      {/* Top Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white z-20">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 -ml-1 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          aria-label="Wróć"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>

        <h1 className="text-base font-bold text-neutral-900 tracking-tight">
          Skanowanie kodu QR
        </h1>

        <div className="w-8" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-between animate-content-fade">
        {!scannedUser ? (
          <>
            <div>
              <p className="text-xs text-neutral-500 text-center leading-relaxed max-w-[280px] mx-auto mt-2 mb-4">
                Skieruj aparat na kod QR innego użytkownika, aby dodać jego profil i uzyskać dostęp do dokumentacji medycznej.
              </p>

              {/* Viewfinder Frame */}
              <div className="w-56 h-56 mx-auto relative rounded-2xl overflow-hidden border-2 border-[#68B27A] flex items-center justify-center bg-neutral-950 shadow-md">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <QrCode className="w-16 h-16 text-neutral-600 mx-auto mb-2 stroke-1 animate-pulse" />
                    <span className="text-[11px] text-neutral-400">
                      Wyszukiwanie kodu QR...
                    </span>
                  </div>
                )}

                {/* Animated Scan Line */}
                <div className="absolute inset-x-0 h-0.5 bg-[#68B27A] shadow-[0_0_8px_#68B27A] animate-[pulse_1.5s_ease-in-out_infinite]" />

                {/* Corner guide markers */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white pointer-events-none" />
              </div>
            </div>

            {/* Quick Simulation Options */}
            <div className="pt-4 pb-2 space-y-2">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block text-center">
                Symuluj zeskanowanie kodu QR pacjenta:
              </span>
              <div className="flex flex-col space-y-2">
                {availableUsersToScan.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleScanTarget(u)}
                    className="w-full py-2 px-3 bg-neutral-50 hover:bg-emerald-50 border border-neutral-200 hover:border-emerald-300 rounded-lg flex items-center justify-between text-xs text-neutral-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border"
                        style={{
                          backgroundColor: u.avatarBg,
                          borderColor: u.avatarBorder,
                          color: u.avatarText,
                        }}
                      >
                        {u.initials}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                      Zeskanuj
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleSimulateNewPatient}
                  className="w-full py-2 px-3 bg-[#68B27A]/10 hover:bg-[#68B27A]/20 border border-[#68B27A]/40 rounded-lg flex items-center justify-center space-x-1.5 text-xs text-[#2b6d3a] font-medium transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Zeskanuj nowego pacjenta: Anna Nowak</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Scan Success Card */
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 stroke-[2]" />
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mb-1">
              Pomyślnie dodano użytkownika!
            </h2>
            <p className="text-xs text-neutral-500 max-w-[260px] mb-6">
              Kod QR został poprawnie zweryfikowany. Uzyskano dostęp do pełnej dokumentacji medycznej.
            </p>

            {/* Profile pill */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center space-x-3 mb-8 w-full max-w-[260px]">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center border text-base font-bold shrink-0"
                style={{
                  backgroundColor: scannedUser.avatarBg,
                  borderColor: scannedUser.avatarBorder,
                  color: scannedUser.avatarText,
                }}
              >
                {scannedUser.initials}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {scannedUser.name}
                </p>
                <p className="text-[11px] text-neutral-500 truncate">
                  {scannedUser.email}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-2.5">
              <button
                type="button"
                onClick={() => onOpenUserProfile(scannedUser.id)}
                className="w-full py-3 px-6 bg-[#68B27A] hover:bg-[#5aa16b] text-white font-medium text-sm rounded-full shadow-xs transition-colors cursor-pointer"
              >
                Przejdź do dokumentacji medycznej
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-2.5 px-6 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium text-xs rounded-full transition-colors cursor-pointer"
              >
                Wróć do listy kont
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
