import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  initialEmail?: string;
  onBack?: () => void;
  onLogin: (email: string) => void;
  onRegister?: (email: string) => void;
  showBackButton?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  initialEmail = 'jan.kowalski@gmail.com',
  onBack,
  onLogin,
  onRegister,
  showBackButton = true,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('haslo123');
  const [confirmPassword, setConfirmPassword] = useState('haslo123');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password && confirmPassword && password !== confirmPassword) {
        setError('Hasła nie są identyczne');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        if (onRegister) {
          onRegister(email || 'jan.kowalski@gmail.com');
        } else {
          onLogin(email || 'jan.kowalski@gmail.com');
        }
      }, 350);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLogin(email || 'jan.kowalski@gmail.com');
      }, 350);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (mode === 'register' && onRegister) {
        onRegister(email || 'jan.kowalski@gmail.com');
      } else {
        onLogin(email || 'jan.kowalski@gmail.com');
      }
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-3 pb-6 overflow-y-auto text-neutral-900 animate-content-fade">
      <div>
        {/* Top Header with Back button if multi-user or in registration mode */}
        <div className="flex items-center justify-between mb-4">
          {mode === 'register' ? (
            <button
              type="button"
              onClick={() => {
                setError('');
                setMode('login');
              }}
              className="p-1.5 -ml-1 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer flex items-center text-xs"
              aria-label="Wróć do logowania"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>
          ) : showBackButton && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 -ml-1 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
              aria-label="Wróć do wyboru konta"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>
          ) : (
            <div className="h-5" />
          )}
        </div>

        {/* Title: "Zaloguj się" or "Zarejestruj się" */}
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight mb-5">
          {mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3.5">
          {/* Adres e-mail */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-normal text-neutral-500">
              Adres e-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="np. jan.kowalski@gmail.com"
              className="w-full px-3 py-2.5 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-400 transition-colors"
            />
          </div>

          {/* Hasło */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-normal text-neutral-500">
              Hasło
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? 'Wprowadź hasło' : 'Ustaw hasło'}
                className="w-full px-3 py-2.5 pr-11 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-400 transition-colors"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword((prev) => !prev);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 rounded-md transition-colors cursor-pointer"
                aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Powtórz hasło (Only in Register mode) */}
          {mode === 'register' && (
            <div className="flex flex-col space-y-1 animate-in fade-in duration-150">
              <label className="text-xs font-normal text-neutral-500">
                Powtórz hasło
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Wprowadź hasło ponownie"
                  className="w-full px-3 py-2.5 pr-11 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConfirmPassword((prev) => !prev);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 rounded-md transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Error Message if any */}
          {error && (
            <p className="text-xs text-red-500 font-medium pt-0.5">{error}</p>
          )}

          {/* Divider "lub" */}
          <div className="relative flex items-center justify-center pt-3 pb-1">
            <div className="w-full border-t border-neutral-200" />
            <span className="absolute bg-white px-3 text-xs text-neutral-500">
              lub
            </span>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 bg-white border border-neutral-200 rounded-sm flex items-center justify-center space-x-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all active:scale-[0.99] cursor-pointer"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Zaloguj za pomocą Google</span>
          </button>
        </form>
      </div>

      {/* Bottom Buttons (Matches Figma screens) */}
      <div className="pt-6 pb-1">
        {mode === 'login' ? (
          <div className="space-y-2.5">
            {/* Primary Filled Button: "Zaloguj się" */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-[#68B27A] hover:bg-[#5aa16b] active:bg-[#519160] text-white font-medium text-base rounded-full shadow-xs transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Zaloguj się'
              )}
            </button>

            {/* Secondary Outlined Button: "Utwórz konto" */}
            <button
              type="button"
              onClick={() => {
                setError('');
                setMode('register');
              }}
              className="w-full py-3.5 px-6 bg-white border border-[#68B27A] text-[#68B27A] hover:bg-[#68B27A]/10 active:bg-[#68B27A]/20 font-medium text-base rounded-full transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer"
            >
              Utwórz konto
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Primary Filled Button: "Utwórz konto" */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-[#68B27A] hover:bg-[#5aa16b] active:bg-[#519160] text-white font-medium text-base rounded-full shadow-xs transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Utwórz konto'
              )}
            </button>

            {/* Back to Login link */}
            <button
              type="button"
              onClick={() => {
                setError('');
                setMode('login');
              }}
              className="w-full py-1 text-xs text-neutral-500 hover:text-neutral-800 text-center cursor-pointer transition-colors"
            >
              Masz już konto? <span className="text-[#68B27A] font-semibold underline">Zaloguj się</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

