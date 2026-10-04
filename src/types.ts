export interface Tag {
  id: string;
  name: string;
  bg: string;
  text: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string;
  date?: string;
  size?: string;
}

export interface MedicalRecord {
  id: string;
  userId: string;
  title: string;
  description: string;
  doctor: string;
  date: string; // DD.MM.YYYY
  tags: Tag[];
  notes: string;
  attachments?: Attachment[];
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarBg: string;
  avatarBorder: string;
  avatarText: string;
  role: 'patient' | 'caregiver';
  sharedWith?: string[];
  accessTo?: string[];
}

export type ViewState =
  | { type: 'login'; selectedEmail?: string; selectedName?: string }
  | { type: 'account-select' }
  | { type: 'scan-qr'; returnTo?: 'account-select' | 'settings-accounts' }
  | { type: 'new-user' }
  | { type: 'main' }
  | { type: 'record-details'; recordId: string | 'new' }
  | { type: 'settings' }
  | { type: 'settings-accounts' }
  | { type: 'settings-single-user'; userId: string }
  | { type: 'settings-accessibility' }
  | { type: 'settings-general' }
  | { type: 'settings-legal' }
  | { type: 'verify-user' }
  | { type: 'verify-share-qr' }
  | { type: 'verify-scan-qr' };
