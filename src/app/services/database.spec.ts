import { TestBed } from '@angular/core/testing';
import { Database, DEFAULT_LOCAL_USER_ID } from './database';
import { firstValueFrom } from 'rxjs';

describe('Database', () => {
  let database: Database;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    database = TestBed.inject(Database);
  });

  it('seeds the mock records on first use', async () => {
    const records = await firstValueFrom(database.getAllMedicalRecords());
    expect(records.length).toBeGreaterThan(0);
    expect(localStorage.getItem('app_medical_records')).toBeTruthy();
  });

  it('defaults the local account to the senior profile', () => {
    expect(database.getLocalUserId()).toBe(DEFAULT_LOCAL_USER_ID);
  });

  it('persists a changed local account', () => {
    database.setLocalUserId('user-a');
    expect(database.getLocalUserId()).toBe('user-a');
  });

  it('returns medical records of the requested user', async () => {
    const records = await firstValueFrom(database.getMedicalRecordsByUserId('user-b'));
    expect(records.length).toBeGreaterThan(0);
    expect(records.every((record) => record.userId === 'user-b')).toBe(true);
  });

  it('grants access to a scanned profile and keeps it idempotent', async () => {
    // Senior 'user-b' nie ma jeszcze podopiecznych, więc dopisujemy 'user-c'
    database.setLocalUserId('user-b');

    expect(await firstValueFrom(database.addPatient('user-c'))).toBe(true);
    expect(database.hasAccess('user-c', 'user-b')).toBe(true);

    // Powtórne skanowanie nie duplikuje wpisu
    expect(await firstValueFrom(database.addPatient('user-c'))).toBe(true);

    expect(database.getPatientIds('user-b')).toEqual(['user-c']);
  });

  it('does not duplicate a patient that is already on the caregiver list', async () => {
    // Konto 'user-a' ma w bazie podopiecznych 'user-b' i 'user-c'
    database.setLocalUserId('user-a');

    expect(await firstValueFrom(database.addPatient('user-b'))).toBe(true);
    expect(database.getPatientIds('user-a')).toEqual(['user-b', 'user-c']);
  });

  it('refuses unknown ids and the local profile', async () => {
    expect(await firstValueFrom(database.addPatient('nie-ma-takiego-konta'))).toBe(false);
    expect(await firstValueFrom(database.addPatient(''))).toBe(false);

    // Nie udostępniamy samemu sobie profilu - domyślnie konto lokalne to user-b
    expect(await firstValueFrom(database.addPatient(DEFAULT_LOCAL_USER_ID))).toBe(false);
    expect(database.getPatientIds(DEFAULT_LOCAL_USER_ID)).toEqual([]);
  });

  it('keeps the roster of the caregiver in localStorage', async () => {
    // 'user-b' nie ma jeszcze żadnego podopiecznego, więc zapisujemy nowy wpis
    database.setLocalUserId('user-b');
    await firstValueFrom(database.addPatient('user-c'));

    const stored = JSON.parse(localStorage.getItem('app_users') ?? '[]');
    expect(stored.find((user: { id: string }) => user.id === 'user-b').patientIds).toEqual([
      'user-c',
    ]);
  });

  it('registers a new account with its role and switches the session to it', () => {
    const account = database.registerUser({
      firstName: 'Ola',
      lastName: 'Test',
      role: 'caregiver',
    });

    expect(database.getUserById(account.id)?.role).toBe('caregiver');
    expect(account.email).toBe('ola.test@example.com');
    // Świeży opiekun zaczyna bez podopiecznych
    expect(database.getPatientIds(account.id)).toEqual([]);

    database.setLocalUserId(account.id);
    expect(database.getLocalUserProfile()?.id).toBe(account.id);
    expect(database.getHomeRoute()).toBe('/caregiver-dashboard');
  });

  it('sends a senior account to the patient dashboard', () => {
    database.setLocalUserId('user-b');
    expect(database.getLocalUserRole()).toBe('senior');
    expect(database.getHomeRoute()).toBe('/senior-dashboard');
  });

  it('reports no session until an account is chosen', () => {
    expect(database.hasSession()).toBe(false);

    database.setLocalUserId('user-a');
    expect(database.hasSession()).toBe(true);

    database.signOut();
    expect(database.hasSession()).toBe(false);
  });

  it('includes a granted profile in the accessible profiles', async () => {
    // Konto user-b skanuje kod profilu user-c
    database.setLocalUserId('user-b');
    expect(await firstValueFrom(database.addPatient('user-c'))).toBe(true);

    const profiles = await firstValueFrom(database.getAccessibleProfiles());
    expect(profiles.map((profile) => profile.id)).toContain('user-c');
  });

  it('always exposes the own profile even without an access row', async () => {
    database.setLocalUserId('user-c');
    const profiles = await firstValueFrom(database.getAccessibleProfiles());
    expect(profiles.map((profile) => profile.id)).toContain('user-c');
  });
});
