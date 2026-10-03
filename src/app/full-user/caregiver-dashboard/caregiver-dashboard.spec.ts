import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CaregiverDashboard } from './caregiver-dashboard';
import { Database } from '../../services/database';

describe('CaregiverDashboard', () => {
  let fixture: ComponentFixture<CaregiverDashboard>;
  let component: CaregiverDashboard;
  let database: Database;

  // Database symuluje opóźnienie (delay) przy pobieraniu profili
  const flush = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    fixture.detectChanges();
  };

  const createDashboard = async () => {
    fixture = TestBed.createComponent(CaregiverDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await flush();
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CaregiverDashboard],
      providers: [provideRouter([])],
    }).compileComponents();

    database = TestBed.inject(Database);
    database.setLocalUserId('user-a');

    await createDashboard();
  });

  it('lists the caregiver and the granted dependents', () => {
    expect(component.isLoading()).toBe(false);
    expect(component.roster().map((entry) => entry.user.id)).toEqual(['user-a', 'user-b', 'user-c']);
    expect(component.roster()[0].isSelf).toBe(true);
    expect(component.roster()[1].isSelf).toBe(false);
  });

  it('links each profile to the patient dashboard', () => {
    const links = fixture.nativeElement.querySelectorAll('a[href^="/senior-dashboard"]');

    expect(links.length).toBe(3);
    // Własny profil bez parametru, podopieczni z identyfikatorem
    expect((links[0] as HTMLAnchorElement).getAttribute('href')).toBe('/senior-dashboard');
    expect((links[1] as HTMLAnchorElement).getAttribute('href')).toBe('/senior-dashboard/user-b');
    expect((links[2] as HTMLAnchorElement).getAttribute('href')).toBe('/senior-dashboard/user-c');
  });

  it('links to the scanner', () => {
    const link = fixture.nativeElement.querySelector(
      'a[href="/qr-scanner"]',
    ) as HTMLAnchorElement;

    expect(link.textContent).toContain('Dodaj podopiecznego przez QR');
  });

  it('shows only the own profile for a freshly registered caregiver', async () => {
    const account = database.registerUser({
      firstName: 'Nowy',
      lastName: 'Opiekun',
      role: 'caregiver',
    });
    database.setLocalUserId(account.id);
    await createDashboard();

    expect(component.roster().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Nie masz jeszcze podopiecznych');
  });

  it('adds a scanned patient to the list on the next load', async () => {
    const caregiver = database.registerUser({
      firstName: 'Nowy',
      lastName: 'Opiekun',
      role: 'caregiver',
    });
    database.setLocalUserId(caregiver.id);
    expect(await firstValueFrom(database.addPatient('user-c'))).toBe(true);

    await createDashboard();

    expect(component.roster().map((entry) => entry.user.id)).toEqual(['user-c', caregiver.id]);
  });

  it('signs out and returns to the login screen', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    component.signOut();

    expect(database.hasSession()).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});