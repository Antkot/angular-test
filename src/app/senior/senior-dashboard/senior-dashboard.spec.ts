import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { Database } from '../../services/database';
import { SeniorDashboard } from './senior-dashboard';

describe('SeniorDashboard', () => {
  let fixture: ComponentFixture<SeniorDashboard>;
  let component: SeniorDashboard;
  let database: Database;
  let navigate: ReturnType<typeof vi.spyOn>;

  // Database symuluje opóźnienie (delay), więc czekamy na dane
  const flush = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    fixture.detectChanges();
  };

  const setup = async (localUserId: string, patientId: string | null) => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SeniorDashboard],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap(patientId ? { patientId } : {})) },
        },
      ],
    }).compileComponents();

    database = TestBed.inject(Database);
    database.setLocalUserId(localUserId);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(SeniorDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await flush();
  };

  // KONTEKST SENIORA
  describe('własny profil', () => {
    beforeEach(async () => setup('user-b', null));

    it('shows the profile of the signed in senior', () => {
      expect(component.profile()?.id).toBe('user-b');
      expect(fixture.nativeElement.textContent).toContain('Jan Kowalski');
    });

    it('loads only the records of the signed in senior', () => {
      expect(component.isLoading()).toBe(false);
      expect(component.records().length).toBe(2);
      expect(component.records().every((record) => record.userId === 'user-b')).toBe(true);
    });

    it('does not list other accounts', () => {
      expect(fixture.nativeElement.querySelectorAll('.patient-tile').length).toBe(0);
      expect(fixture.nativeElement.textContent).not.toContain('Anna');
      expect(fixture.nativeElement.textContent).not.toContain('Maria');
    });

    it('offers the access code and no back button', () => {
      const link = fixture.nativeElement.querySelector('a[href="/qr-display"]') as HTMLElement;
      expect(link.textContent).toContain('Pokaż mój kod dostępu');
      expect(fixture.nativeElement.querySelector('[aria-label="Wróć"]')).toBeNull();
    });
  });

  // KONTEKST OPIEKUNA
  describe('profil podopiecznego', () => {
    beforeEach(async () => setup('user-a', 'user-c'));

    it('shows the data of the chosen dependent', () => {
      expect(component.isCaregiverContext()).toBe(true);
      expect(component.profile()?.id).toBe('user-c');
      expect(fixture.nativeElement.textContent).toContain('Maria Kowalska');
      expect(component.records().length).toBe(1);
      expect(component.records()[0].userId).toBe('user-c');
    });

    it('has a back button and hides the access code', () => {
      expect(component.canShareAccessCode).toBe(false);
      // Strzałka powrotu siedzi w pasku na górze
      expect(fixture.nativeElement.querySelector('[aria-label="Wróć"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('a[href="/qr-display"]')).toBeNull();
    });

    it('returns to the caregiver dashboard', () => {
      component.goBack();

      expect(navigate).toHaveBeenCalledWith('/caregiver-dashboard');
    });

    it('keeps the access code for the own profile of the caregiver', async () => {
      await setup('user-a', 'user-a');

      expect(component.isCaregiverContext()).toBe(false);
      expect(component.canShareAccessCode).toBe(true);
    });

    it('redirects when the caregiver has no access to the profile', async () => {
      await setup('user-b', 'user-c');

      expect(navigate).toHaveBeenCalledWith('/senior-dashboard');
      expect(component.profile()).toBeUndefined();
    });
  });

  it('signs out and returns to the login screen', async () => {
    await setup('user-b', null);

    component.signOut();

    expect(database.hasSession()).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});