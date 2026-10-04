import React from 'react';
import { ArrowLeft, ChevronRight, LogOut, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  currentUser: UserProfile;
  onBack: () => void;
  onSelectOption: (option: 'accounts' | 'verify' | 'accessibility' | 'legal') => void;
  onLogout: () => void;
  isSingleUser?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onBack,
  onSelectOption,
  onLogout,
  isSingleUser = false,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden text-neutral-900">
      {/* Top Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 -ml-1 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          aria-label="Wróć"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>

        <h1 className="text-base font-bold text-neutral-900 tracking-tight">
          Ustawienia
        </h1>

        {/* Empty placeholder for symmetry */}
        <div className="w-8" />
      </div>

      {/* Settings Navigation List (Matches Figma Image 3 right screen) */}
      <div className="flex-1 flex flex-col divide-y divide-neutral-200 animate-content-fade">
        {/* Zarządzaj kontami */}
        <button
          type="button"
          onClick={() => onSelectOption('accounts')}
          style={{ animationDelay: '0ms' }}
          className="animate-item-fade w-full text-left py-4 px-5 text-sm font-normal text-neutral-900 hover:bg-neutral-50 transition-colors flex items-center justify-between cursor-pointer"
        >
          <span>Zarządzaj kontami</span>
          <ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />
        </button>

        {/* Weryfikacja użytkownika */}
        <button
          type="button"
          onClick={() => onSelectOption('verify')}
          style={{ animationDelay: '35ms' }}
          className="animate-item-fade w-full text-left py-4 px-5 text-sm font-normal text-neutral-900 hover:bg-neutral-50 transition-colors flex items-center justify-between cursor-pointer"
        >
          <span>Weryfikacja użytkownika</span>
          <ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />
        </button>

        {/* Ustawienia dostępności */}
        <button
          type="button"
          onClick={() => onSelectOption('accessibility')}
          style={{ animationDelay: '70ms' }}
          className="animate-item-fade w-full text-left py-4 px-5 text-sm font-normal text-neutral-900 hover:bg-neutral-50 transition-colors flex items-center justify-between cursor-pointer"
        >
          <span>Ustawienia dostępności</span>
          <ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />
        </button>

        {/* Informacje prawne */}
        <button
          type="button"
          onClick={() => onSelectOption('legal')}
          style={{ animationDelay: '105ms' }}
          className="animate-item-fade w-full text-left py-4 px-5 text-sm font-normal text-neutral-900 hover:bg-neutral-50 transition-colors flex items-center justify-between cursor-pointer"
        >
          <span>Informacje prawne</span>
          <ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />
        </button>
      </div>

      {/* Account Info and Logout at bottom */}
      <div className="p-5 border-t border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center space-x-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center border text-sm font-medium shrink-0"
            style={{
              backgroundColor: currentUser.avatarBg,
              borderColor: currentUser.avatarBorder,
              color: currentUser.avatarText,
            }}
          >
            {currentUser.initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-neutral-900 truncate">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-neutral-500 truncate">
              {currentUser.email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2.5 px-4 bg-white border border-neutral-200 rounded-sm text-xs font-medium text-neutral-700 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isSingleUser ? 'Wyloguj się' : 'Wyloguj lub zmień konto'}</span>
        </button>
      </div>
    </div>
  );
};
