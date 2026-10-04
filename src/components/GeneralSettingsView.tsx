import React, { useState } from 'react';
import { ArrowLeft, Bell, Shield, Moon, Globe, RefreshCcw } from 'lucide-react';
import { UserProfile } from '../types';

interface GeneralSettingsViewProps {
  currentUser: UserProfile;
  onBack: () => void;
  onResetData: () => void;
}

export const GeneralSettingsView: React.FC<GeneralSettingsViewProps> = ({
  currentUser,
  onBack,
  onResetData,
}) => {
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [reminders, setReminders] = useState(true);

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Top Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 -ml-1 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
          aria-label="Wróć"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>

        <h1 className="text-base font-bold text-neutral-900 tracking-tight">
          Ogólne
        </h1>

        <div className="w-8" />
      </div>

      {/* Settings list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
        {/* Profile Card */}
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center border text-base font-bold"
            style={{
              backgroundColor: currentUser.avatarBg,
              borderColor: currentUser.avatarBorder,
              color: currentUser.avatarText,
            }}
          >
            {currentUser.initials}
          </div>
          <div>
            <p className="font-semibold text-neutral-900">{currentUser.name}</p>
            <p className="text-xs text-neutral-500">{currentUser.email}</p>
            <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {currentUser.role === 'patient' ? 'Pacjent' : 'Opiekun'}
            </span>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Preferencje i powiadomienia
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div className="flex items-center space-x-2.5">
                <Bell className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-800 text-xs">Powiadomienia o badaniach</span>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="accent-[#68B27A] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div className="flex items-center space-x-2.5">
                <Shield className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-800 text-xs">Logowanie FaceID / Biometria</span>
              </div>
              <input
                type="checkbox"
                checked={biometrics}
                onChange={() => setBiometrics(!biometrics)}
                className="accent-[#68B27A] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div className="flex items-center space-x-2.5">
                <Globe className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-800 text-xs">Język aplikacji</span>
              </div>
              <span className="text-xs text-neutral-500 font-medium">Polski</span>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Czy chcesz przywrócić domyślne dane testowe?')) {
                onResetData();
              }
            }}
            className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-xs font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Zresetuj dane do domyślnych z Figmy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
