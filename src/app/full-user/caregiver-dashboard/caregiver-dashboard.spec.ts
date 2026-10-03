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
    await new Promise((resolve) => setTimeout(resolve, 800));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CaregiverDashboard],
      providers: [provideRouter([])],
    }).compileComponents();

    database = TestBed.inject(Database);
    database.setLocalUserId('user-a');

    fixture = TestBed.createComponent(CaregiverDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await flush();
  });

  it('separates the signed in account from its dependents', () => {
    expect(component.isLoading()).toBe(false);
    expect(component.self()?.id).toBe('user-a');
    // Anna ma w bazie podopiecznych 'user-b' i 'user-c'
    expect(component.dependents().map((dependent) => dependent.id)).toEqual(['user-b', 'user-c']);
  });

  it('renders a card per dependent and a link to the scanner', () => {
    const tiles = fixture.nativeElement.querySelectorAll(
      '.patient-tile',
    ) as NodeListOf<HTMLElement>;
    expect(tiles.length).toBe(2);

    const scannerLink = fixture.nativeElement.querySelector(
      'a[href="/qr-scanner"]',
    ) as HTMLAnchorElement;
    expect(scannerLink.textContent).toContain('Zeskanuj pacjenta');
  });

  it('shows an empty state for a freshly registered caregiver', async () => {
    const account = database.registerUser({
      firstName: 'Nowy',
      lastName: 'Opiekun',
      role: 'caregiver',
    });
    database.setLocalUserId(account.id);

    fixture = TestBed.createComponent(CaregiverDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await flush();

    expect(component.dependents()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('Brak podopiecznych');
  });

  it('adds a scanned patient to the list on the next load', async () => {
    expect(await firstValueFrom(database.addPatient('user-c'))).toBe(true);

    fixture = TestBed.createComponent(CaregiverDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await flush();

    expect(component.dependents().map((dependent) => dependent.id)).toContain('user-c');
  });

  it('signs out and returns to the login screen', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    component.signOut();

    expect(database.hasSession()).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/auth');
  });
});