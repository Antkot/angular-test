import React, { useState } from 'react';
import { ArrowLeft, Check, UserPlus } from 'lucide-react';
import { UserProfile } from '../types';

interface NewUserViewProps {
  onBack: () => void;
  onAddUser: (user: UserProfile) => void;
}

const AVATAR_PALETTES = [
  { bg: '#DCFCE7', border: '#86EFAC', text: '#15803D', label: 'Zielony' },
  { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B', label: 'Czerwony' },
  { bg: '#E0E7FF', border: '#A5B4FC', text: '#3730A3', label: 'Niebieski' },
  { bg: '#FEF3C7', border: '#FCD34D', text: '#B45309', label: 'Żółty' },
  { bg: '#F3E8FF', border: '#D8B4FE', text: '#6B21A8', label: 'Fioletowy' },
];

export const NewUserView: React.FC<NewUserViewProps> = ({ onBack, onAddUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [selectedPalette, setSelectedPalette] = useState(AVATAR_PALETTES[0]);

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
  };

  // Preview initials: if name typed show initials, otherwise "D" as in user screenshot
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
          Nowy użytkownik
        </h1>

        <div className="w-8" />
      </div>

      {/* Form Content */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 px-5 py-3 flex flex-col justify-between overflow-y-auto no-scrollbar"
      >
        <div className="space-y-3.5">
          {/* Avatar Preview & Color Selection */}
          <div className="flex flex-col items-center justify-center pt-1 pb-1">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center border-2 text-lg font-bold mb-2 shadow-xs transition-colors"
              style={{
                backgroundColor: selectedPalette.bg,
                borderColor: selectedPalette.border,
                color: selectedPalette.text,
              }}
            >
              {displayInitial}
            </div>

            {/* Color circles */}
            <div className="flex items-center space-x-2.5">
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
                  aria-label={`Kolor ${pal.label}`}
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
            <label className="text-xs font-medium text-neutral-600 block">
              Imię i nazwisko
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Daniel Kowalski"
              className="w-full px-3 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
            />
          </div>

          {/* Adres e-mail */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-600 block">
              Adres e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="np. daniel.kowalski@gmail.com"
              className="w-full px-3 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
            />
          </div>

          {/* Rola profilu */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-600 block">
              Rola profilu
            </label>
            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all cursor-pointer ${
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
                className={`py-2 px-3 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                  role === 'caregiver'
                    ? 'border-[#68B27A] bg-[#68B27A]/10 text-neutral-900 font-semibold'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Opiekun
              </button>
            </div>
          </div>
        </div>

        {/* Submit button at bottom */}
        <div className="pt-3 pb-3">
          <button
            type="submit"
            className="w-full py-3 px-6 bg-[#68B27A] hover:bg-[#5AA16B] active:bg-[#519160] text-white font-medium text-sm rounded-full shadow-xs transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer"
          >
            Dodaj konto
          </button>
        </div>
      </form>
    </div>
  );
};
