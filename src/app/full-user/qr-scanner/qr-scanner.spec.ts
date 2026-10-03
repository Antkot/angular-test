import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { QrScanner } from './qr-scanner';

const scannerMock = vi.hoisted(() => ({
  start: vi.fn(() => Promise.resolve(null)),
  stop: vi.fn(() => Promise.resolve()),
  clear: vi.fn(),
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
  },
}));

describe('QrScanner', () => {
  let fixture: ComponentFixture<QrScanner>;
  let component: QrScanner;
  let router: Router;
  let patientService: PatientService;

  beforeEach(async () => {
    scannerMock.startError = undefined;
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [QrScanner],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(QrScanner);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    patientService = TestBed.inject(PatientService);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('starts the camera in the #qr-reader container', () => {
    expect(scannerMock.instances.at(0)?.elementId).toBe('qr-reader');
    expect(scannerMock.start).toHaveBeenCalled();
    expect(component.status()).toBe('scanning');
  });

  it('shares the scanned patient, stops the camera and redirects', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    scannerMock.onSuccess?.('senior-42');
    await fixture.whenStable();

    expect(patientService.sharedPatients().map((patient) => patient.id)).toEqual(['senior-42']);
    expect(scannerMock.stop).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/caregiver-dashboard']);
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
