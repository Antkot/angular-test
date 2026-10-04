import React, { useState } from 'react';
import { ArrowLeft, Camera, Check, Trash2 } from 'lucide-react';
import { UserProfile } from '../types';

interface SingleUserViewProps {
  user: UserProfile;
  onBack: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
  isOnlyUser?: boolean;
  canDelete?: boolean;
}

const AVATAR_PALETTES = [
  { bg: '#DCFCE7', border: '#86EFAC', text: '#15803D', label: 'Zielony' },
  { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B', label: 'Czerwony' },
  { bg: '#E0E7FF', border: '#A5B4FC', text: '#3730A3', label: 'Niebieski' },
  { bg: '#FEF3C7', border: '#FCD34D', text: '#B45309', label: 'Żółty' },
  { bg: '#F3E8FF', border: '#D8B4FE', text: '#6B21A8', label: 'Fioletowy' },
];

export const SingleUserView: React.FC<SingleUserViewProps> = ({
  user,
  onBack,
  onUpdateUser,
  onDeleteUser,
  isOnlyUser = false,
  canDelete = true,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Recalculate initials if name changes
  const calculateInitials = (val: string) => {
    const parts = val.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts[0]?.length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    } else if (parts[0]?.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return 'U';
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    const updated = {
      ...user,
      name: newName,
      initials: calculateInitials(newName),
    };
    onUpdateUser(updated);
  };

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    const updated = {
      ...user,
      email: newEmail,
    };
    onUpdateUser(updated);
  };

  const handlePaletteSelect = (pal: typeof AVATAR_PALETTES[0]) => {
    const updated: UserProfile = {
      ...user,
      avatarBg: pal.bg,
      avatarBorder: pal.border,
      avatarText: pal.text,
    };
    onUpdateUser(updated);
    setShowColorPicker(false);
  };

  return (
    <div className="relative flex-1 flex flex-col bg-white overflow-hidden text-neutral-900">
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

        <h1 className="text-base font-bold text-neutral-900 tracking-tight truncate max-w-[200px]">
          {name || user.name}
        </h1>

        <div className="w-8" />
      </div>

      {/* Content Form */}
      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-between animate-content-fade">
        <div className="space-y-6">
          {/* Centered Large Avatar Circle (Matches Figma middle screen) */}
          <div className="flex flex-col items-center justify-center pt-2 pb-2">
            <div className="relative">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center border text-4xl font-normal transition-colors"
                style={{
                  backgroundColor: user.avatarBg,
                  borderColor: user.avatarBorder,
                  color: user.avatarText,
                }}
              >
                {calculateInitials(name)}
              </div>

              {/* Attached Camera Button */}
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="absolute right-0 bottom-0 w-8 h-8 rounded-full bg-[#68B27A] hover:bg-[#5aa16b] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
                title="Zmień kolor awatara"
                aria-label="Zmień kolor awatara"
              >
                <Camera className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Color palette popover if camera button clicked */}
            {showColorPicker && (
              <div className="mt-4 p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center space-x-2 animate-in fade-in duration-150">
                {AVATAR_PALETTES.map((pal, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePaletteSelect(pal)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                      user.avatarBg === pal.bg ? 'scale-110 ring-2 ring-emerald-500' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: pal.bg, borderColor: pal.border }}
                  >
                    {user.avatarBg === pal.bg && (
                      <Check className="w-3 h-3" style={{ color: pal.text }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Imię i nazwisko */}
            <div className="space-y-1.5">
              <label className="text-xs font-normal text-neutral-500 block">
                Imię i nazwisko
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Imię i nazwisko"
                className="w-full px-3.5 py-2.5 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-400 transition-colors"
              />
            </div>

            {/* Adres e-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-normal text-neutral-500 block">
                Adres e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Adres e-mail"
                className="w-full px-3.5 py-2.5 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Delete Account link or notice at bottom */}
        <div className="pt-8 pb-4 text-center">
          {canDelete ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 hover:text-red-700 text-sm font-normal cursor-pointer transition-colors"
            >
              Usuń konto
            </button>
          ) : (
            <span className="inline-block px-3 py-1.5 bg-neutral-100 text-neutral-400 rounded-full text-xs font-normal">
              Główne konto logowania (brak możliwości usunięcia)
            </span>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-[300px] bg-white rounded-xl shadow-2xl p-5 border border-neutral-200 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">
              Usunąć konto?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-5">
              Czy na pewno chcesz usunąć konto użytkownika <strong>{user.name}</strong>? Wszystkie
              powiązane badania i historia zostaną bezpowrotnie usunięte.
            </p>
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-md transition-colors cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteUser(user.id);
                }}
                className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer shadow-xs"
              >
                Usuń konto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
