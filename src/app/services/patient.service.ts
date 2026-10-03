import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

/** Single source of truth for a patient profile - shared by every tab. */
export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  bloodType: string;
  allergies: string[];
  medications: string[];
  notes: string;
  updatedAt: number;
}

/** Fields a user is allowed to edit - `id` and `updatedAt` are managed by the service. */
export type PatientPatch = Partial<Omit<Patient, 'id' | 'updatedAt'>>;

/** Profiles indexed by id, so a patient is stored exactly once - no duplicates between roles. */
export type PatientRegistry = Record<string, Patient>;

type SyncMessage = { type: 'upsert'; patient: Patient } | { type: 'request'; id: string };

const STORAGE_KEY = 'meddocs.patients.v1';
const LOCAL_ID_KEY = 'meddocs.local-patient-id.v1';
const CHANNEL_NAME = 'meddocs.patients.v1';

function createDefaultPatient(id: string): Patient {
  return {
    id,
    name: 'Jan Kowalski',
    birthDate: '1948-05-12',
    bloodType: 'A+',
    allergies: ['penicylina'],
    medications: ['amlodypina 5 mg'],
    notes: 'Wymaga kontroli ciśnienia dwa razy w tygodniu.',
    updatedAt: Date.now(),
  };
}

/**
 * Placeholder for a profile we only know the id of. `updatedAt: 0` marks it as
 * unconfirmed so that the real record received from the owning tab always wins.
 */
function createPlaceholderPatient(id: string): Patient {
  return {
    id,
    name: '',
    birthDate: '',
    bloodType: '',
    allergies: [],
    medications: [],
    notes: '',
    updatedAt: 0,
  };
}

function safeStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function createId(): string {
  const cryptoApi = globalThis.crypto;
  return typeof cryptoApi?.randomUUID === 'function'
    ? cryptoApi.randomUUID()
    : `pat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isPatient(value: unknown): value is Patient {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<Patient>;
  return typeof candidate.id === 'string' && candidate.id.length > 0;
}

/**
 * Merges incoming records into the local registry, newest `updatedAt` wins, so a tab
 * that lags behind can never resurrect outdated data. Returns the same reference when
 * nothing changed, which lets callers skip persisting.
 */
function mergeRegistry(current: PatientRegistry, incoming: PatientRegistry): PatientRegistry {
  let merged: PatientRegistry | undefined;
  for (const [id, patient] of Object.entries(incoming)) {
    if (!isPatient(patient) || patient.id !== id) {
      continue;
    }
    const existing = current[id];
    if (!existing || patient.updatedAt >= existing.updatedAt) {
      merged ??= { ...current };
      merged[id] = patient;
    }
  }
  return merged ?? current;
}

/**
 * Stores patient profiles and keeps every open tab in sync in real time:
 * - `localPatient` - the profile that belongs to this browser (shown as a QR code),
 * - `sharedPatients` - profiles granted to this tab after scanning a QR code.
 *
 * Profiles live in a single registry keyed by patient id (persisted in `localStorage`),
 * so the senior and the caregiver edit one copy of the same data. Updates are pushed
 * instantly to all other tabs through `BroadcastChannel`, with `storage` events as
 * a fallback for browsers/contexts without `BroadcastChannel`.
 */
@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly storage = safeStorage();
  private readonly registry = signal<PatientRegistry>(this.restore());
  private readonly sharedIds = signal<string[]>([]);
  private channel: BroadcastChannel | null = null;

  /** Id of the profile owned by this browser - encoded in the displayed QR code. */
  readonly localPatientId = signal(this.resolveLocalId());

  /** All known profiles (local + shared), useful for dashboards. */
  readonly patients = computed(() => Object.values(this.registry()));

  /** The profile owned by this browser. */
  readonly localPatient = computed(() => this.registry()[this.localPatientId()]);

  /** Profiles shared with this tab through a scanned QR code. */
  readonly sharedPatients = computed(() => {
    const registry = this.registry();
    return this.sharedIds()
      .filter((id) => id !== this.localPatientId())
      .map((id) => registry[id])
      .filter((patient): patient is Patient => !!patient);
  });

  constructor() {
    this.connect();
    this.destroyRef.onDestroy(() => this.disconnect());
  }

  /** Id of the patient whose profile is displayed as a QR code. */
  getLocalPatientId(): string {
    return this.localPatientId();
  }

  /** Returns a stored profile or `undefined` when the id is unknown. */
  getPatient(id: string): Patient | undefined {
    return this.registry()[id];
  }

  /**
   * Merges `data` into the profile `id` and pushes the change to every other tab.
   * Unknown ids are seeded with a default profile first.
   */
  updatePatient(id: string, data: PatientPatch): Patient {
    const current = this.registry()[id] ?? createDefaultPatient(id);
    const updated: Patient = { ...current, ...data, id, updatedAt: Date.now() };
    this.applyUpsert(updated);
    this.broadcast({ type: 'upsert', patient: updated });
    return updated;
  }

  /**
   * Grants access to the profile `id` (usually decoded from a QR code).
   * Returns `false` only when the id is empty or already available in this tab.
   */
  addSharedPatientById(id: string): boolean {
    const patientId = id.trim();
    if (!patientId || patientId === this.localPatientId()) {
      return false;
    }

    this.sharedIds.update((ids) => (ids.includes(patientId) ? ids : [...ids, patientId]));

    if (!this.registry()[patientId]) {
      // Show an unconfirmed placeholder right away, then ask the tab owning the
      // profile for the real data.
      this.applyUpsert(createPlaceholderPatient(patientId));
      this.broadcast({ type: 'request', id: patientId });
    }
    return true;
  }

  private resolveLocalId(): string {
    const storedId = this.storage?.getItem(LOCAL_ID_KEY) ?? null;
    const id = storedId?.trim() || createId();
    this.storage?.setItem(LOCAL_ID_KEY, id);

    if (!this.registry()[id]) {
      this.applyUpsert(createDefaultPatient(id));
    }
    return id;
  }

  private restore(): PatientRegistry {
    const raw = this.storage?.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) {
        return {};
      }
      const registry: PatientRegistry = {};
      for (const [id, patient] of Object.entries(parsed as Record<string, unknown>)) {
        if (isPatient(patient) && patient.id === id) {
          registry[id] = patient;
        }
      }
      return registry;
    } catch {
      return {};
    }
  }

  /** Single write path: keeps the signal, `localStorage` and other tabs consistent. */
  private applyUpsert(patient: Patient): void {
    const next = mergeRegistry(this.registry(), { [patient.id]: patient });
    if (next === this.registry()) {
      return;
    }
    this.registry.set(next);

    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage full or unavailable - the signal state still works in this tab.
    }
  }

  private connect(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<SyncMessage>) => this.onMessage(event.data);
    }
    globalThis.addEventListener?.('storage', this.onStorage);
  }

  private disconnect(): void {
    globalThis.removeEventListener?.('storage', this.onStorage);
    this.channel?.close();
    this.channel = null;
  }

  private readonly onStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY || !event.newValue) {
      return;
    }
    try {
      const parsed: unknown = JSON.parse(event.newValue);
      if (typeof parsed === 'object' && parsed !== null) {
        // Merged, not replaced: the writing tab may still hold an outdated snapshot.
        this.registry.update((registry) => mergeRegistry(registry, parsed as PatientRegistry));
      }
    } catch {
      // Ignore malformed payloads written by other tabs.
    }
  };

  private onMessage(message: SyncMessage | undefined): void {
    if (!message || typeof message !== 'object') {
      return;
    }
    if (message.type === 'upsert' && isPatient(message.patient)) {
      this.applyUpsert(message.patient);
    } else if (message.type === 'request' && message.id) {
      // Another tab needs a profile we own - hand over the confirmed record only.
      const patient = this.registry()[message.id];
      if (patient && patient.updatedAt > 0) {
        this.broadcast({ type: 'upsert', patient });
      }
    }
  }

  private broadcast(message: SyncMessage): void {
    this.channel?.postMessage(message);
  }
}
