import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: UserProfile) => void;
}

const AVATAR_PALETTES = [
  { bg: '#DCFCE7', border: '#86EFAC', text: '#15803D', label: 'Zielony' },
  { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B', label: 'Czerwony' },
  { bg: '#E0E7FF', border: '#A5B4FC', text: '#3730A3', label: 'Niebieski' },
  { bg: '#FEF3C7', border: '#FCD34D', text: '#B45309', label: 'Żółty' },
  { bg: '#F3E8FF', border: '#D8B4FE', text: '#6B21A8', label: 'Fioletowy' },
];

export const NewUserModal: React.FC<NewUserModalProps> = ({
  isOpen,
  onClose,
  onAddUser,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [selectedPalette, setSelectedPalette] = useState(AVATAR_PALETTES[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Calculate initials (e.g. "Anna Nowak" -> "AN")
    const parts = name.trim().split(/\s+/);
    let initials = '';
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts[0].length >= 2) {
      initials = parts[0].slice(0, 2).toUpperCase();
    } else {
      initials = parts[0][0].toUpperCase();
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      initials,
      avatarBg: selectedPalette.bg,
      avatarBorder: selectedPalette.border,
      avatarText: selectedPalette.text,
      role,
    };

    onAddUser(newUser);
    onClose();
  };

  const displayInitial = name.trim()
    ? name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'D';

  return (
    <div
      className="absolute inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[340px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-[#68B27A]" />
            <h2 className="text-sm font-bold text-neutral-900">Nowy użytkownik</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center pb-1">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-2 text-xl font-bold mb-2 shadow-xs transition-colors"
              style={{
                backgroundColor: selectedPalette.bg,
                borderColor: selectedPalette.border,
                color: selectedPalette.text,
              }}
            >
              {displayInitial}
            </div>
            {/* Color picker circles */}
            <div className="flex space-x-2.5 mt-1">
              {AVATAR_PALETTES.map((pal, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPalette(pal)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                    selectedPalette.bg === pal.bg
                      ? 'scale-110 ring-2 ring-emerald-500 ring-offset-1'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: pal.bg, borderColor: pal.border }}
                >
                  {selectedPalette.bg === pal.bg && (
                    <Check className="w-3 h-3" style={{ color: pal.text }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Imię i nazwisko */}
          <div className="space-y-1">
            <label className="text-neutral-600 font-medium block">Imię i nazwisko</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Daniel Kowalski"
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-sm text-neutral-900 bg-white focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Adres e-mail */}
          <div className="space-y-1">
            <label className="text-neutral-600 font-medium block">Adres e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="np. daniel.kowalski@gmail.com"
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-sm text-neutral-900 bg-white focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Rola */}
          <div className="space-y-1">
            <label className="text-neutral-600 font-medium block">Rola profilu</label>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`py-2 px-3 rounded-sm border text-center font-medium transition-all cursor-pointer ${
                  role === 'patient'
                    ? 'border-[#68B27A] bg-[#68B27A]/10 text-neutral-900 font-semibold'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Pacjent
              </button>
              <button
                type="button"
                onClick={() => setRole('caregiver')}
                className={`py-2 px-3 rounded-sm border text-center font-medium transition-all cursor-pointer ${
                  role === 'caregiver'
                    ? 'border-[#68B27A] bg-[#68B27A]/10 text-neutral-900 font-semibold'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Opiekun
              </button>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#68B27A] hover:bg-[#5AA16B] active:bg-[#519160] text-white font-medium rounded-full shadow-xs transition-colors cursor-pointer"
            >
              Dodaj konto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
