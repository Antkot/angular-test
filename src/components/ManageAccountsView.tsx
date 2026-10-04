import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { UserProfile } from '../types';

interface ManageAccountsViewProps {
  users: UserProfile[];
  onBack: () => void;
  onSelectUser: (userId: string) => void;
  onAddNewUser: () => void;
}

export const ManageAccountsView: React.FC<ManageAccountsViewProps> = ({
  users,
  onBack,
  onSelectUser,
  onAddNewUser,
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
          Zarządzanie kontami
        </h1>

        <div className="w-8" />
      </div>

      {/* Grid of Accounts (Matches Figma left screen) */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 animate-content-fade">
        <div className="grid grid-cols-2 gap-4">
          {users.map((user, idx) => (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelectUser(user.id)}
              style={{ animationDelay: `${idx * 40}ms` }}
              className="animate-item-fade group relative flex flex-col items-center justify-center p-3 bg-white border border-neutral-200 rounded-sm aspect-square w-full overflow-hidden hover:border-neutral-400 hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              {/* Avatar Circle */}
              <div
                className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center border text-base font-medium mb-2 transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: user.avatarBg,
                  borderColor: user.avatarBorder,
                  color: user.avatarText,
                }}
              >
                {user.initials}
              </div>

              {/* User Name */}
              <div className="h-10 flex items-center justify-center w-full px-1">
                <span className="text-xs sm:text-sm font-normal text-neutral-800 text-center leading-snug break-words">
                  {user.name}
                </span>
              </div>
            </button>
          ))}

          {/* New User Card */}
          <button
            type="button"
            onClick={onAddNewUser}
            className="group relative flex flex-col items-center justify-center p-3 bg-white border border-neutral-200 rounded-sm aspect-square w-full overflow-hidden hover:border-neutral-400 hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            {/* Dashed Circle with Plus */}
            <div className="w-14 h-14 shrink-0 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center mb-2 group-hover:border-neutral-400 group-hover:scale-105 transition-all text-neutral-700">
              <Plus className="w-6 h-6 stroke-[1.8]" />
            </div>

            {/* Label */}
            <div className="h-10 flex items-center justify-center w-full px-1">
              <span className="text-xs sm:text-sm font-normal text-neutral-800 text-center leading-snug break-words">
                Nowy użytkownik
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
