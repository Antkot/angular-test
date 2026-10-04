/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { AccountSelectionView } from './components/AccountSelectionView';
import { LoginView } from './components/LoginView';
import { MainRecordsView } from './components/MainRecordsView';
import { RecordDetailsView } from './components/RecordDetailsView';
import { SettingsView } from './components/SettingsView';
import { GeneralSettingsView } from './components/GeneralSettingsView';
import { LegalInfoView } from './components/LegalInfoView';
import { VerifyUserView } from './components/VerifyUserView';
import { NewUserView } from './components/NewUserView';
import { ManageAccountsView } from './components/ManageAccountsView';
import { SingleUserView } from './components/SingleUserView';
import { AccessibilitySettingsView, AccessibilitySettings } from './components/AccessibilitySettingsView';
import { ScanQRView } from './components/ScanQRView';
import { INITIAL_USERS, INITIAL_RECORDS } from './data/mockData';
import { MedicalRecord, UserProfile, ViewState } from './types';

const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  fontSize: 'Standardowa',
  highContrast: false,
  reduceMotion: false,
};

export default function App() {
  // Persistence state - auto restores INITIAL_USERS if empty
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('medicard_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('medicard_current_user') || 'user-jf';
  });

  // Track the primary user who logged into the app - cannot be deleted!
  const [loggedInUserId, setLoggedInUserId] = useState<string>(() => {
    return localStorage.getItem('medicard_logged_in_user') || 'user-jf';
  });

  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('medicard_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_RECORDS;
  });

  // Current view state: Start on login screen!
  const [viewState, setViewState] = useState<ViewState>({ type: 'login' });

  // Accessibility state
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('medicard_accessibility');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_ACCESSIBILITY;
  });

  useEffect(() => {
    try {
      localStorage.setItem('medicard_accessibility', JSON.stringify(accessibility));
    } catch {
      // fallback
    }
  }, [accessibility]);

  // If in account-select view but there's only 1 user, skip straight to main
  useEffect(() => {
    if (viewState.type === 'account-select' && users.length <= 1) {
      if (users[0]) {
        setCurrentUserId(users[0].id);
      }
      setViewState({ type: 'main' });
    }
  }, [viewState.type, users]);

  // Auto-restore users if empty
  useEffect(() => {
    if (!users || users.length === 0) {
      setUsers(INITIAL_USERS);
      setRecords(INITIAL_RECORDS);
      setCurrentUserId('user-jf');
      setLoggedInUserId('user-jf');
    }
  }, [users]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('medicard_users', JSON.stringify(users.length > 0 ? users : INITIAL_USERS));
      localStorage.setItem('medicard_records', JSON.stringify(records));
      localStorage.setItem('medicard_current_user', currentUserId);
      localStorage.setItem('medicard_logged_in_user', loggedInUserId);
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [users, records, currentUserId, loggedInUserId]);

  const currentUser =
    (users && users.length > 0
      ? users.find((u) => u.id === currentUserId) || users[0]
      : null) || INITIAL_USERS[0];

  // Records for current active user
  const userRecords = records.filter(
    (r) => r.userId === currentUserId || (currentUser.role === 'caregiver')
  );

  // Actions
  const handleSelectAccount = (user: UserProfile) => {
    setCurrentUserId(user.id);
    setViewState({ type: 'main' });
  };

  const handleLogin = (email: string) => {
    const matched =
      users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
      users[0] ||
      INITIAL_USERS[0];
    setCurrentUserId(matched.id);
    setLoggedInUserId(matched.id);
    // If only 1 user, skip account selection and go straight to main!
    if (users.length <= 1) {
      setViewState({ type: 'main' });
    } else {
      setViewState({ type: 'account-select' });
    }
  };

  const handleRegister = (email: string) => {
    const trimmedEmail = email.trim();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (existing) {
      setCurrentUserId(existing.id);
      setLoggedInUserId(existing.id);
      if (users.length <= 1) {
        setViewState({ type: 'main' });
      } else {
        setViewState({ type: 'account-select' });
      }
      return;
    }

    const namePart = trimmedEmail.split('@')[0] || 'Użytkownik';
    const formattedName = namePart
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Nowy Użytkownik';

    const initials = formattedName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'NU';

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: formattedName,
      email: trimmedEmail,
      initials,
      avatarBg: '#DCFCE7',
      avatarBorder: '#86EFAC',
      avatarText: '#15803D',
      role: 'patient',
    };

    const newUsers = [...users, newUser];
    setUsers(newUsers);
    setCurrentUserId(newUser.id);
    setLoggedInUserId(newUser.id);
    if (newUsers.length <= 1) {
      setViewState({ type: 'main' });
    } else {
      setViewState({ type: 'account-select' });
    }
  };

  const handleScannedUser = (scannedUser: UserProfile) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === scannedUser.id);
      if (!exists) {
        return [...prev, scannedUser];
      }
      return prev;
    });

    setRecords((prev) => {
      const hasRecords = prev.some((r) => r.userId === scannedUser.id);
      if (!hasRecords) {
        const demoRecord: MedicalRecord = {
          id: `rec-scanned-${Date.now()}`,
          userId: scannedUser.id,
          title: 'Wizyta kontrolna - karta informacyjna',
          description: 'Udostępniona historia leczenia pacjenta przez kod QR',
          doctor: 'Dr n. med. Marta Wiśniewska',
          date: '14.05.2025',
          tags: [
            { id: 't1', name: 'Tag xd', bg: '#BACDFD', text: '#1E293B' },
            { id: 't4', name: 'Kardiolog', bg: '#E9D5FF', text: '#6B21A8' },
          ],
          notes: 'Pacjent udostępnił dostęp do bieżących wyników laboratoryjnych oraz zaleceń pooperacyjnych.',
          createdAt: Date.now(),
        };
        return [demoRecord, ...prev];
      }
      return prev;
    });
  };

  const handleAddNewUser = (newUser: UserProfile) => {
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setViewState({ type: 'account-select' });
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const handleDeleteUser = (userIdToDelete: string) => {
    // The account logged into cannot be deleted!
    if (userIdToDelete === loggedInUserId) {
      return;
    }
    if (users.length <= 1) {
      return;
    }

    setUsers((prev) => {
      const remaining = prev.filter((u) => u.id !== userIdToDelete);
      if (currentUserId === userIdToDelete) {
        if (remaining.length > 0) {
          setCurrentUserId(remaining[0].id);
        }
      }
      return remaining.length > 0 ? remaining : INITIAL_USERS;
    });
    setRecords((prev) => prev.filter((r) => r.userId !== userIdToDelete));
    setViewState({ type: 'settings-accounts' });
  };

  const handleSaveRecord = (updatedRecord: MedicalRecord) => {
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === updatedRecord.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedRecord;
        return copy;
      } else {
        return [updatedRecord, ...prev];
      }
    });
  };

  const handleDeleteRecord = (recordId: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  const handleLinkUser = (targetUserId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const currentAccess = u.accessTo || [];
          return {
            ...u,
            accessTo: Array.from(new Set([...currentAccess, targetUserId])),
          };
        }
        return u;
      })
    );
  };

  const handleResetData = () => {
    setUsers(INITIAL_USERS);
    setRecords(INITIAL_RECORDS);
    setCurrentUserId('user-jf');
    setLoggedInUserId('user-jf');
    setViewState({ type: 'account-select' });
    localStorage.clear();
  };

  const handleSetSingleUserMode = () => {
    const single = [INITIAL_USERS[0]];
    setUsers(single);
    setCurrentUserId(single[0].id);
    setViewState({
      type: 'login',
      selectedEmail: single[0].email,
      selectedName: single[0].name,
    });
  };

  const handleSetMultiUserMode = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserId('user-jk');
    setViewState({ type: 'account-select' });
  };

  // Find record if viewing details
  const activeRecord: MedicalRecord =
    viewState.type === 'record-details'
      ? viewState.recordId === 'new'
        ? {
            id: `rec-${Date.now()}`,
            userId: currentUser.id,
            title: 'Badanie z dnia 16.05.2025',
            description: '',
            doctor: 'Pan Kowalski',
            date: '16.05.2025',
            tags: [],
            notes: 'Treść notatki z wizyty',
            createdAt: Date.now(),
          }
        : records.find((r) => r.id === viewState.recordId) || records[0]
      : records[0];

  return (
    <div className="min-h-screen bg-[#141517] text-white flex flex-col items-center justify-center p-2 sm:p-6 overflow-x-hidden">
      {/* Main Mobile App Container */}
      <div className="w-full flex justify-center items-center">
        <PhoneFrame isFramed={true} accessibility={accessibility}>
          <div
            key={
              viewState.type +
              (viewState.type === 'record-details' ? '-' + viewState.recordId : '') +
              (viewState.type === 'settings-single-user' ? '-' + viewState.userId : '')
            }
            className="flex-1 flex flex-col w-full h-full overflow-hidden animate-view-fade"
          >
            {/* View: Logowanie i Rejestracja (Pierwszy krok przed wyborem konta) */}
            {viewState.type === 'login' && (
              <LoginView
                initialEmail={currentUser.email}
                onLogin={handleLogin}
                onRegister={handleRegister}
                showBackButton={false}
              />
            )}

            {/* View 1: Wybierz konto (Po zalogowaniu wybierasz siebie lub udostępnione konta) */}
            {viewState.type === 'account-select' && (
              <AccountSelectionView
                users={users}
                onSelectUser={handleSelectAccount}
                onAddNewUser={() => setViewState({ type: 'scan-qr', returnTo: 'account-select' })}
                onLogout={() => setViewState({ type: 'login' })}
              />
            )}

            {/* View: Skanowanie kodu QR (Dodanie użytkownika przez kod QR) */}
            {viewState.type === 'scan-qr' && (
              <ScanQRView
                currentUser={currentUser}
                availableUsersToScan={INITIAL_USERS.filter((u) => !users.some((existing) => existing.id === u.id))}
                onBack={() => setViewState({ type: viewState.returnTo || 'account-select' })}
                onUserScanned={handleScannedUser}
                onOpenUserProfile={(userId) => {
                  setCurrentUserId(userId);
                  setViewState({ type: 'main' });
                }}
              />
            )}

            {/* View 1b: Nowy użytkownik (manual fallback if needed) */}
            {viewState.type === 'new-user' && (
              <NewUserView
                onBack={() => setViewState({ type: 'account-select' })}
                onAddUser={handleAddNewUser}
              />
            )}

            {/* View 3: Główny ekran - Badania */}
            {viewState.type === 'main' && (
              <MainRecordsView
                currentUser={currentUser}
                records={userRecords}
                onOpenRecord={(id) => setViewState({ type: 'record-details', recordId: id })}
                onAddNewRecord={() => setViewState({ type: 'record-details', recordId: 'new' })}
                onOpenSettings={() => setViewState({ type: 'settings' })}
                onBack={() => setViewState({ type: 'account-select' })}
                canSwitchAccount={users.length > 1}
              />
            )}

            {/* View 4: Szczegóły badania / Dodanie nowego badania */}
            {viewState.type === 'record-details' && (
              <RecordDetailsView
                key={viewState.recordId}
                record={activeRecord}
                isNew={viewState.recordId === 'new'}
                onSave={handleSaveRecord}
                onDelete={handleDeleteRecord}
                onBack={() => setViewState({ type: 'main' })}
                onOpenSettings={() => setViewState({ type: 'settings' })}
              />
            )}

            {/* View 5: Ustawienia */}
            {viewState.type === 'settings' && (
              <SettingsView
                currentUser={currentUser}
                onBack={() => setViewState({ type: 'main' })}
                onSelectOption={(option) => {
                  if (option === 'accounts') setViewState({ type: 'settings-accounts' });
                  else if (option === 'verify') setViewState({ type: 'verify-user' });
                  else if (option === 'accessibility') setViewState({ type: 'settings-accessibility' });
                  else if (option === 'legal') setViewState({ type: 'settings-legal' });
                }}
                onLogout={() => setViewState({ type: 'login' })}
                isSingleUser={false}
              />
            )}

            {/* View 5a: Zarządzanie kontami */}
            {viewState.type === 'settings-accounts' && (
              <ManageAccountsView
                users={users}
                onBack={() => setViewState({ type: 'settings' })}
                onSelectUser={(userId) => setViewState({ type: 'settings-single-user', userId })}
                onAddNewUser={() => setViewState({ type: 'scan-qr', returnTo: 'settings-accounts' })}
              />
            )}

            {/* View 5b: Edycja profilu użytkownika (Single user) */}
            {viewState.type === 'settings-single-user' && (
              <SingleUserView
                user={users.find((u) => u.id === viewState.userId) || currentUser}
                onBack={() => setViewState({ type: 'settings-accounts' })}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                isOnlyUser={users.length <= 1}
                canDelete={viewState.userId !== loggedInUserId && users.length > 1}
              />
            )}

            {/* View 5c: Ustawienia dostępności */}
            {viewState.type === 'settings-accessibility' && (
              <AccessibilitySettingsView
                onBack={() => setViewState({ type: 'settings' })}
                settings={accessibility}
                onUpdateSettings={(newSettings) =>
                  setAccessibility((prev) => ({ ...prev, ...newSettings }))
                }
              />
            )}

            {/* View 6: Ustawienia - Ogólne */}
            {viewState.type === 'settings-general' && (
              <GeneralSettingsView
                currentUser={currentUser}
                onBack={() => setViewState({ type: 'settings' })}
                onResetData={handleResetData}
              />
            )}

            {/* View 7: Ustawienia - Informacje prawne */}
            {viewState.type === 'settings-legal' && (
              <LegalInfoView onBack={() => setViewState({ type: 'settings' })} />
            )}

            {/* View 8: Weryfikacja użytkownika (Udostępnij QR) */}
            {viewState.type === 'verify-user' && (
              <VerifyUserView
                currentUser={currentUser}
                allUsers={users}
                onBack={() => setViewState({ type: 'settings' })}
                onOpenSettings={() => setViewState({ type: 'settings' })}
                onLinkUser={(targetUserId) => {
                  handleLinkUser(targetUserId);
                }}
              />
            )}
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
}
