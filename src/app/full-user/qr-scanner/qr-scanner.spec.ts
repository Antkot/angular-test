import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Database } from '../../services/database';
import { QrScanner } from './qr-scanner';

const scannerMock = vi.hoisted(() => ({
  start: vi.fn(() => Promise.resolve(null)),
  stop: vi.fn(() => Promise.resolve()),
  clear: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  onSuccess: undefined as ((decodedText: string) => void) | undefined,
  startError: undefined as Error | undefined,
  instances: [] as { elementId: string }[],
}));

vi.mock('html5-qrcode', () => ({
  Html5Qrcode: class {
    isScanning = true;
    constructor(elementId: string) {
      scannerMock.instances.push({ elementId });
    }
    start(
      _camera: unknown,
      _config: unknown,
      onSuccess: (decodedText: string) => void,
    ): Promise<null> {
      scannerMock.onSuccess = onSuccess;
      return scannerMock.startError ? Promise.reject(scannerMock.startError) : scannerMock.start();
    }
    stop = scannerMock.stop;
    clear = scannerMock.clear;
    pause = scannerMock.pause;
    resume = scannerMock.resume;
  },
}));

describe('QrScanner', () => {
  let fixture: ComponentFixture<QrScanner>;
  let component: QrScanner;
  let router: Router;
  let database: Database;

  // Database symuluje opóźnienie (delay), więc trzeba poczekać na makrotaski
  const flush = async () => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    await fixture.whenStable();
  };

  const dialog = () => fixture.nativeElement.querySelector('.scan-confirm') as HTMLElement | null;
  const clickIn = (selector: string) => {
    const button = fixture.nativeElement.querySelector(selector) as HTMLButtonElement | null;
    button?.click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    scannerMock.instances.length = 0;
    scannerMock.startError = undefined;
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [QrScanner],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(QrScanner);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    database = TestBed.inject(Database);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('starts the camera in the #qr-reader container', () => {
    expect(scannerMock.instances.at(0)?.elementId).toBe('qr-reader');
    expect(scannerMock.start).toHaveBeenCalled();
    expect(component.status()).toBe('scanning');
  });

  it('asks for confirmation instead of granting access on a valid scan', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    // 'user-c' to konto obcej pacjentki - konto lokalne domyślnie to 'user-b'
    scannerMock.onSuccess?.('user-c');
    fixture.detectChanges();

    expect(dialog()).toBeTruthy();
    expect(dialog()?.textContent).toContain('Maria Kowalska (Babcia)');
    expect(scannerMock.pause).toHaveBeenCalled();
    // Nic jeszcze nie zapisujemy - decyzja opiekuna dopiero zapada w popupie.
    expect(database.getPatientIds('user-b')).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('grants access, stops the camera and redirects after confirming', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    scannerMock.onSuccess?.('user-c');
    fixture.detectChanges();
    clickIn('.scan-confirm__accept');
    await flush();

    expect(database.hasAccess('user-c', 'user-b')).toBe(true);
    expect(database.getPatientIds('user-b')).toEqual(['user-c']);
    expect(dialog()).toBeNull();
    expect(scannerMock.stop).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/caregiver-dashboard']);
  });

  it('cancelling the dialog changes nothing and resumes scanning', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    scannerMock.onSuccess?.('user-c');
    fixture.detectChanges();
    clickIn('.scan-confirm__cancel');

    expect(dialog()).toBeNull();
    expect(database.getPatientIds('user-b')).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBeNull();
    expect(scannerMock.resume).toHaveBeenCalled();
    expect(component.status()).toBe('scanning');
  });

  it('ignores repeated frames of the same code while the dialog is open', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    scannerMock.onSuccess?.('user-c');
    scannerMock.onSuccess?.('user-c');
    fixture.detectChanges();

    expect(component.pendingPatient()?.id).toBe('user-c');
    expect(database.getPatientIds('user-b')).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('refuses a QR code pointing at the local profile', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    scannerMock.onSuccess?.(database.getLocalUserId());
    await flush();
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('Twój własny profil');
    expect(dialog()).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
    expect(component.status()).toBe('scanning');
  });

  it('refuses an unknown id without redirecting', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    scannerMock.onSuccess?.('nie-ma-takiego-konta');
    await flush();

    expect(component.errorMessage()).toContain('Nie udało się dodać pacjenta');
    expect(dialog()).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('reports a camera failure instead of throwing', async () => {
    scannerMock.startError = new Error('NotAllowedError');
    fixture = TestBed.createComponent(QrScanner);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.status()).toBe('error');
    expect(fixture.componentInstance.errorMessage()).toContain('Nie udało się uruchomić kamery');
  });

  it('cleans up the scanner instance on destroy', async () => {
    fixture.destroy();
    await fixture.whenStable();

    expect(scannerMock.stop).toHaveBeenCalled();
    expect(scannerMock.clear).toHaveBeenCalled();
  });
});
