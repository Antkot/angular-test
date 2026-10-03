import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SeniorDashboard } from './senior-dashboard';

describe('SeniorDashboard', () => {
  let fixture: ComponentFixture<SeniorDashboard>;
  let component: SeniorDashboard;

  // Database symuluje opóźnienie (delay), a pozycje ładują się jedna po drugiej,
  // więc czekamy z zapasem na oba etapy
  const flush = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SeniorDashboard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SeniorDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await flush();
  });

  it('shows the accessible profiles after loading', () => {
    expect(component.isLoading()).toBe(false);
    expect(component.profiles().length).toBeGreaterThan(0);
  });

  it('renders one patient tile per accessible profile', () => {
    const tiles = fixture.nativeElement.querySelectorAll(
      '.patient-tile',
    ) as NodeListOf<HTMLElement>;

    expect(tiles.length).toBe(component.profiles().length);
    // jsdom nie implementuje innerText, więc czytamy textContent
    expect(tiles[0].textContent).toContain('Jan Kowalski');
    expect(tiles[0].getAttribute('aria-pressed')).toBe('true');
  });

  it('renders a card per medical record with its title', () => {
    const cards = fixture.nativeElement.querySelectorAll('.record-card') as NodeListOf<HTMLElement>;

    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('Tomografia komputerowa głowy');
    expect(cards[0].textContent).toContain('dr hab. Marek Mostowiak');
  });

  it('marks the account of this device in the picker', () => {
    const badge = fixture.nativeElement.querySelector('.patient-tile__badge') as HTMLElement;
    expect(badge.textContent).toContain('To urządzenie');
  });

  it('selects the local account by default and marks it as this device', () => {
    expect(component.localUserId).toBe('user-b');
    expect(component.selectedPatientId()).toBe('user-b');
  });

  it('loads the records of the selected patient', () => {
    expect(component.records().length).toBe(2);
    expect(component.records().every((record) => record.userId === 'user-b')).toBe(true);
  });

  it('falls back to the first accessible profile when the local one is not visible', async () => {
    // Konto user-a nie ma dostępu do user-b w tabeli mocków
    localStorage.setItem('app_local_user_id', 'user-a');
    fixture = TestBed.createComponent(SeniorDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await flush();

    expect(component.localUserId).toBe('user-a');
    expect(component.profiles().map((profile) => profile.id)).toEqual(
      expect.arrayContaining(['user-a', 'user-b', 'user-c']),
    );
    expect(component.selectedPatientId()).toBe('user-a');
  });

  it('switches the records when another patient is chosen', async () => {
    // Dajemy konto opiekuna, które ma dostęp do trzech profili z mocków
    localStorage.setItem('app_local_user_id', 'user-a');
    fixture = TestBed.createComponent(SeniorDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await flush();

    expect(component.profiles().map((profile) => profile.id)).toEqual(
      expect.arrayContaining(['user-a', 'user-b', 'user-c']),
    );

    component.selectPatient('user-c');
    await flush();

    expect(component.selectedPatientId()).toBe('user-c');
    expect(component.records().length).toBe(1);
    expect(component.records()[0].userId).toBe('user-c');

    component.selectPatient('user-b');
    await flush();

    expect(component.records().length).toBe(2);
  });

  it('ignores re-selecting the same patient', async () => {
    component.selectPatient('user-b');
    await flush();

    expect(component.selectedPatientId()).toBe('user-b');
  });
});
