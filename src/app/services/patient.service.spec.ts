import { Injector } from '@angular/core';
import { PatientService } from './patient.service';

/** A service instance in its own injector scope, i.e. a separate browser tab. */
function createTab(): PatientService {
  return Injector.create({ providers: [PatientService] }).get(PatientService);
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('PatientService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds a stable local patient and exposes it', () => {
    const tab = createTab();
    const id = tab.getLocalPatientId();

    expect(id).toBeTruthy();
    expect(tab.localPatient()?.id).toBe(id);
    expect(tab.sharedPatients()).toEqual([]);
    // A second tab on the same origin reuses the id, so the QR code stays valid.
    expect(createTab().getLocalPatientId()).toBe(id);
  });

  it('updates a patient and keeps a single copy in storage', () => {
    const tab = createTab();
    const id = tab.getLocalPatientId();

    tab.updatePatient(id, { name: 'Anna Nowak', allergies: ['aspiryna'] });

    expect(tab.localPatient()?.name).toBe('Anna Nowak');
    const stored = JSON.parse(localStorage.getItem('meddocs.patients.v1')!);
    expect(Object.keys(stored)).toEqual([id]);
    expect(stored[id].allergies).toEqual(['aspiryna']);
  });

  it('adds a shared patient once and never duplicates it', () => {
    const tab = createTab();

    expect(tab.addSharedPatientById('senior-42')).toBe(true);
    expect(tab.addSharedPatientById('senior-42')).toBe(true);
    expect(tab.sharedPatients().map((patient) => patient.id)).toEqual(['senior-42']);
    expect(tab.addSharedPatientById('   ')).toBe(false);
  });

  it('refuses to share the local profile with itself', () => {
    const tab = createTab();

    expect(tab.addSharedPatientById(tab.getLocalPatientId())).toBe(false);
    expect(tab.sharedPatients()).toEqual([]);
  });

  it('pushes senior edits to the caregiver tab in real time', async () => {
    const seniorTab = createTab();
    const caregiverTab = createTab();
    const seniorId = seniorTab.getLocalPatientId();

    seniorTab.updatePatient(seniorId, { notes: 'Lekarz zmienił notatki.' });
    await settle();

    expect(caregiverTab.localPatient().notes).toBe('Lekarz zmienił notatki.');
  });

  it('resolves a scanned id from the profile owned by the other tab', async () => {
    const caregiverTab = createTab();
    const seniorTab = createTab();

    seniorTab.updatePatient('senior-42', { name: 'Anna Nowak', bloodType: 'O-' });
    caregiverTab.addSharedPatientById('senior-42');
    await settle();

    expect(caregiverTab.sharedPatients().map((patient) => patient.id)).toEqual(['senior-42']);
    expect(caregiverTab.getPatient('senior-42')?.name).toBe('Anna Nowak');
    expect(caregiverTab.getPatient('senior-42')?.bloodType).toBe('O-');
  });

  it('shows an unconfirmed placeholder for an id nobody knows yet', () => {
    const tab = createTab();

    tab.addSharedPatientById('unknown-1');

    const shared = tab.sharedPatients()[0];
    expect(shared.id).toBe('unknown-1');
    // Placeholders carry no profile data, so the real record always wins later.
    expect(shared.updatedAt).toBe(0);
  });

  it('ignores stale storage payloads and accepts new entries', () => {
    const tab = createTab();
    const id = tab.getLocalPatientId();
    const current = tab.localPatient()!;

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'meddocs.patients.v1',
        newValue: JSON.stringify({
          [id]: { ...current, name: 'Stara wersja', updatedAt: current.updatedAt - 1000 },
          'other-tab': { ...current, id: 'other-tab' },
        }),
      }),
    );

    expect(tab.localPatient()?.name).toBe(current.name);
    expect(tab.getPatient('other-tab')?.id).toBe('other-tab');
  });
});
