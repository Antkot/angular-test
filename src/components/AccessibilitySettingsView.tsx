import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export type FontSizeOption = 'Mała' | 'Standardowa' | 'Duża' | 'Bardzo duża';

export interface AccessibilitySettings {
  fontSize: FontSizeOption;
  highContrast: boolean;
  reduceMotion: boolean;
}

interface AccessibilitySettingsViewProps {
  onBack: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
}

export const AccessibilitySettingsView: React.FC<AccessibilitySettingsViewProps> = ({
  onBack,
  settings,
  onUpdateSettings,
}) => {
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);

  const fontOptions: FontSizeOption[] = ['Mała', 'Standardowa', 'Duża', 'Bardzo duża'];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden text-neutral-900">
      {/* Top Header (Matches Figma screen) */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white z-10">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 -ml-1 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          aria-label="Wróć"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>

        <h1 className="text-sm font-bold text-neutral-900 tracking-tight">
          Ustawienia dostępności
        </h1>

        <div className="w-8" />
      </div>

      {/* Settings Form */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 space-y-6 animate-content-fade">
        {/* Wielkość czcionki (domyślnie: Standardowa) */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs text-neutral-500 font-normal block">
            Wielkość czcionki
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-neutral-800 bg-white border border-neutral-200 rounded-sm flex items-center justify-between hover:border-neutral-300 transition-colors cursor-pointer text-left"
            >
              <span>{settings.fontSize}</span>
              <span className="text-[10px] text-neutral-500 ml-2">▼</span>
            </button>

            {/* Font size dropdown options */}
            {isFontDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-30 py-1 text-xs">
                {fontOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ fontSize: opt });
                      setIsFontDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left hover:bg-neutral-50 transition-colors cursor-pointer ${
                      settings.fontSize === opt ? 'font-semibold text-[#68B27A]' : 'text-neutral-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zwiększony kontrast (domyślnie wyłączony) */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs sm:text-sm text-neutral-800 font-normal">
            Zwiększony kontrast
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={settings.highContrast}
            onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none p-0.5 ${
              settings.highContrast ? 'bg-[#68B27A]' : 'bg-neutral-200'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                settings.highContrast ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Wyłącz animacje (domyślnie wyłączone) */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs sm:text-sm text-neutral-800 font-normal">
            Wyłącz animacje
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={settings.reduceMotion}
            onClick={() => onUpdateSettings({ reduceMotion: !settings.reduceMotion })}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none p-0.5 ${
              settings.reduceMotion ? 'bg-[#68B27A]' : 'bg-neutral-200'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                settings.reduceMotion ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
