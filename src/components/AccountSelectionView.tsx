import React from 'react';
import { Plus, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface AccountSelectionViewProps {
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onAddNewUser: () => void;
  onLogout?: () => void;
}

export const AccountSelectionView: React.FC<AccountSelectionViewProps> = ({
  users,
  onSelectUser,
  onAddNewUser,
  onLogout,
}) => {
  return (
    <div className="flex-1 flex flex-col px-6 pt-6 pb-4 overflow-y-auto animate-content-fade">
      {/* Title */}
      <div className="relative flex items-center justify-center mt-2 mb-8">
        <h1 className="text-xl font-bold text-center text-neutral-900 tracking-tight">
          Wybierz konto
        </h1>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="absolute right-0 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
            title="Wyloguj się z aplikacji"
            aria-label="Wyloguj"
          >
            <LogOut className="w-4 h-4 stroke-[1.8]" />
          </button>
        )}
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-2 gap-4">
        {users.map((user, idx) => (
          <button
            key={user.id}
            type="button"
            onClick={() => onSelectUser(user)}
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

            {/* User Name - wraps without ellipsis */}
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
          style={{ animationDelay: `${users.length * 40}ms` }}
          className="animate-item-fade group relative flex flex-col items-center justify-center p-3 bg-white border border-neutral-200 rounded-sm aspect-square w-full overflow-hidden hover:border-neutral-400 hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
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
  );
};
