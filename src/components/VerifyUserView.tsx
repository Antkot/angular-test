import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, CheckCircle2, Copy } from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';

interface VerifyIllustrationProps {
  direction: 'right' | 'left';
}

const VerificationIllustration: React.FC<VerifyIllustrationProps> = ({ direction }) => {
  return (
    <svg
      className="w-36 h-16 text-neutral-800"
      viewBox="0 0 140 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Left Person (with soft mint green body) */}
      <circle cx="42" cy="22" r="8" fill="white" />
      <path
        d="M 30 45 C 30 37.5 35 33.5 42 33.5 C 49 33.5 54 37.5 54 45"
        fill="#D8F3DC"
      />

      {/* Medical Document in middle */}
      <rect x="56" y="10" width="28" height="38" rx="4" fill="white" />
      {/* Green Cross on Document */}
      <path
        d="M 70 15.5 v 7 M 66.5 19 h 7"
        stroke="#48A768"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Document text lines */}
      <line x1="62" y1="27" x2="78" y2="27" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="62" y1="32.5" x2="78" y2="32.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="62" y1="38" x2="70" y2="38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

      {/* Right Person (Faithfully matches user's image on both cards) */}
      {/* Outer hair contour */}
      <path
        d="M 88 32 C 86 25 86.5 18 91.5 14 C 94.5 11.5 101.5 11.5 104.5 14 C 109.5 18 110 25 108 32"
        fill="none"
      />
      {/* Inner bangs / hairline framing forehead */}
      <path
        d="M 89 23.5 C 92 18.5 95 18.5 98 21.5 C 101 18.5 104 18.5 107 23.5"
        fill="none"
      />
      {/* Chin / face outline */}
      <path
        d="M 90.5 23.5 C 91.5 30 104.5 30 105.5 23.5"
        fill="none"
      />
      {/* Shoulders / body */}
      <path
        d="M 85 45 C 85 37.5 90.5 33.5 98 33.5 C 105.5 33.5 111 37.5 111 45"
        fill="none"
      />

      {/* Circular Badge with Directional Arrow */}
      {direction === 'right' ? (
        // Right arrow on top card (between document and right person)
        <g>
          <circle cx="84" cy="40" r="7.5" fill="#48A768" stroke="none" />
          <path
            d="M 80.5 40 H 87.5 M 84.5 37.5 L 87.5 40 L 84.5 42.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : (
        // Left arrow on bottom card (between left person and document, matching uploaded image)
        <g>
          <circle cx="56" cy="40" r="7.5" fill="#48A768" stroke="none" />
          <path
            d="M 59.5 40 H 52.5 M 55.5 37.5 L 52.5 40 L 55.5 42.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
};

interface VerifyUserViewProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onBack: () => void;
  onOpenSettings?: () => void;
  onLinkUser: (targetUserId: string) => void;
}

type Step = 'choose' | 'share-qr' | 'scan-qr';

export const VerifyUserView: React.FC<VerifyUserViewProps> = ({
  currentUser,
  allUsers,
  onBack,
  onLinkUser,
}) => {
  const [step, setStep] = useState<Step>('choose');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessUser, setScanSuccessUser] = useState<UserProfile | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate real QR code for current user
  useEffect(() => {
    const payload = JSON.stringify({
      app: 'MediCard',
      version: '1.0',
      action: 'medical_access_grant',
      userId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      timestamp: Date.now(),
    });

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR code generation error', err));
  }, [currentUser]);

  const handleSimulateScan = (targetUser: UserProfile) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccessUser(targetUser);
      onLinkUser(targetUser.id);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }, 1200);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(`MEDICARD-VERIFY-${currentUser.id.toUpperCase()}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="relative flex-1 flex flex-col bg-white overflow-hidden text-neutral-900">
      {/* Top Header (Matches Figma Image Exactly: Arrow on left, Centered title, Empty right) */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white z-20">
        <button
          type="button"
          onClick={() => {
            if (step !== 'choose') {
              setStep('choose');
              setScanSuccessUser(null);
            } else {
              onBack();
            }
          }}
          className="p-1.5 -ml-1 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          aria-label="Wróć"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>

        <h1 className="text-sm font-bold text-neutral-900 tracking-tight">
          Weryfikacja użytkownika
        </h1>

        <div className="w-8" />
      </div>

      {/* Screen 1: Choose Verification Type (Matches Figma image exactly: 2 vertical stacked wide cards) */}
      {step === 'choose' && (
        <div className="flex-1 flex flex-col justify-start px-5 pt-8 space-y-4 overflow-y-auto animate-content-fade">
          {/* Card 1: Chcę uzyskać dostęp do danych medycznych osoby bliskiej */}
          <button
            type="button"
            onClick={() => setStep('scan-qr')}
            className="animate-item-fade w-full flex flex-col items-center justify-center p-6 bg-white border border-neutral-200 rounded-sm hover:border-neutral-300 hover:shadow-xs transition-all active:scale-[0.99] text-center cursor-pointer group"
          >
            {/* Illustration with green body and right arrow */}
            <div className="h-16 w-full flex items-center justify-center mb-3">
              <VerificationIllustration direction="right" />
            </div>

            {/* Text */}
            <p className="text-xs sm:text-[13px] leading-snug font-normal text-neutral-800 text-center max-w-[250px]">
              Chcę uzyskać dostęp do danych medycznych osoby bliskiej
            </p>
          </button>

          {/* Card 2: Chcę udostępnić moje dane medyczne */}
          <button
            type="button"
            onClick={() => setStep('share-qr')}
            style={{ animationDelay: '40ms' }}
            className="animate-item-fade w-full flex flex-col items-center justify-center p-6 bg-white border border-neutral-200 rounded-sm hover:border-neutral-300 hover:shadow-xs transition-all active:scale-[0.99] text-center cursor-pointer group"
          >
            {/* Illustration with green body and left arrow */}
            <div className="h-16 w-full flex items-center justify-center mb-3">
              <VerificationIllustration direction="left" />
            </div>

            {/* Text */}
            <p className="text-xs sm:text-[13px] leading-snug font-normal text-neutral-800 text-center max-w-[250px]">
              Chcę udostępnić moje dane medyczne
            </p>
          </button>
        </div>
      )}

      {/* Screen 2: Share QR (Udostępnienie własnego kodu QR) */}
      {step === 'share-qr' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          {/* Centered QR code */}
          <div className="p-4 bg-white rounded-xl shadow-xs border border-neutral-100 flex items-center justify-center">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code do udostępnienia danych"
                className="w-56 h-56 object-contain"
              />
            ) : (
              <div className="w-56 h-56 bg-neutral-100 animate-pulse rounded-lg" />
            )}
          </div>

          {/* Subtext */}
          <p className="text-sm font-medium text-neutral-900 text-center max-w-[260px] mt-8 leading-snug">
            Zeskanuj ten kod QR aplikacją opiekuna
          </p>

          {/* User badge */}
          <div className="mt-4 px-3 py-1.5 bg-neutral-50 rounded-full border border-neutral-200 text-xs text-neutral-600 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Konto: <strong>{currentUser.name}</strong></span>
          </div>

          <button
            type="button"
            onClick={copyCode}
            className="mt-4 text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5 cursor-pointer py-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copySuccess ? 'Skopiowano kod do schowka!' : 'Kopiuj kod tekstowy'}</span>
          </button>
        </div>
      )}

      {/* Screen 3 & 4: Scan QR (Skanowanie kodu bliskiej osoby) */}
      {step === 'scan-qr' && (
        <div className="flex-1 flex flex-col justify-between px-6 pt-16 pb-12">
          {/* Top text area */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {scanSuccessUser ? (
              <div className="text-center p-6 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-900 mb-1">
                  Połączono pomyślnie!
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  Uzyskano autoryzowany dostęp do historii badań medycznych użytkownika{' '}
                  <strong>{scanSuccessUser.name}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setScanSuccessUser(null);
                    setStep('choose');
                    onBack();
                  }}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-full text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                >
                  Przejdź do badań
                </button>
              </div>
            ) : isScanning ? (
              <div className="w-full max-w-[280px] text-center space-y-4">
                <div className="w-56 h-56 mx-auto relative rounded-2xl overflow-hidden border-2 border-[#68B27A] flex items-center justify-center bg-neutral-900 text-white">
                  <div className="absolute inset-x-0 h-0.5 bg-emerald-400 animate-bounce" />
                  <span className="text-xs text-neutral-300">Wyszukiwanie kodu QR...</span>
                </div>
                <p className="text-xs text-neutral-500">Skieruj obiektyw na ekran pacjenta</p>
              </div>
            ) : (
              <p className="text-base font-medium text-neutral-900 text-center leading-snug max-w-[280px]">
                Zeskanuj aparatem kod QR w aplikacji osoby udostępniającej dane
              </p>
            )}
          </div>

          {/* Bottom camera button & sample accounts selector */}
          {!scanSuccessUser && (
            <div className="flex flex-col items-center space-y-4">
              {/* Other users quick simulated test connection */}
              <div className="w-full text-center">
                <span className="text-[11px] text-neutral-400 block mb-2">
                  Symulacja skanowania kodu innego użytkownika:
                </span>
                <div className="flex justify-center gap-2">
                  {allUsers
                    .filter((u) => u.id !== currentUser.id)
                    .map((other) => (
                      <button
                        key={other.id}
                        type="button"
                        onClick={() => handleSimulateScan(other)}
                        className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-md text-neutral-700 font-medium cursor-pointer"
                      >
                        Kod: {other.name.split(' ')[0]}
                      </button>
                    ))}
                </div>
              </div>

              {/* Large Camera Circle Button */}
              <button
                type="button"
                onClick={() => {
                  const target = allUsers.find((u) => u.id !== currentUser.id) || allUsers[0];
                  handleSimulateScan(target);
                }}
                className="w-18 h-18 bg-[#68B27A] hover:bg-[#5AA16B] active:bg-[#519160] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
                aria-label="Włącz aparat do skanowania"
              >
                <Camera className="w-8 h-8 stroke-[1.8]" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
