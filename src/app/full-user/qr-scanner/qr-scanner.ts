import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Html5Qrcode } from 'html5-qrcode';
import { TopBar } from '../../shared/top-bar/top-bar';
import { AvatarColor, avatarColor } from '../../data/tag-colors';
import { Database } from '../../services/database';
import { User, UserId } from '../../models/app.models';

/** Largest scan area in px - matches `.scan-frame` in the stylesheet. */
const MAX_SCAN_AREA = 240;

/** Zawartość kodu QR to id profilu pacjenta - zostawiamy samo id. */
function extractPatientId(decodedText: string): string | null {
  const id = decodedText.trim();
  return id || null;
}

@Component({
  selector: 'app-qr-scanner',
  imports: [TopBar, RouterLink],
  styleUrl: './qr-scanner.scss',
  templateUrl: './qr-scanner.html',
})
export class QrScanner implements OnDestroy {
  private readonly database = inject(Database);
  private readonly router = inject(Router);
  private readonly reader = viewChild.required<ElementRef<HTMLDivElement>>('qrReader');

  readonly status = signal<'starting' | 'scanning' | 'success' | 'error'>('starting');
  readonly errorMessage = signal<string | null>(null);
  /** Konto skanujące - do niego dopisujemy pacjenta po odczytaniu kodu. */
  readonly caregiver = signal(this.database.getLocalUserProfile());
  /** Profil z zeskanowanego kodu - czeka na potwierdzenie w popupie. */
  readonly pendingPatient = signal<User | undefined>(undefined);

  private scanner: Html5Qrcode | null = null;
  /**
   * Blokada skanowania: kod czeka na decyzję opiekuna albo zapisujemy uprawnienie.
   * Bez niej kamera czytałaby ten sam kod w kolejnych klatkach.
   */
  private scanLocked = false;

  constructor() {
    afterNextRender(() => void this.startScanner());
  }

  ngOnDestroy(): void {
    void this.stopScanner();
  }

  public avatar(userId: UserId): AvatarColor {
    return avatarColor(userId);
  }

  /** Popup potwierdzenia: kliknięcie w tło (nie w kartkę) też odmawia. */
  public closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancelPendingPatient();
    }
  }

  /** Opiekun potwierdził kod - nadzynamy dostęp i wracamy na pulpit opiekuna. */
  public async confirmPendingPatient(): Promise<void> {
    const patient = this.pendingPatient();
    if (!patient) {
      return;
    }
    this.pendingPatient.set(undefined);
    await this.stopScanner();

    const granted = await firstValueFrom(this.database.addPatient(patient.id));
    if (!granted) {
      // Zapis się nie udał, więc wracamy do skanowania z komunikatem.
      this.scanLocked = false;
      this.errorMessage.set('Nie udało się dodać pacjenta - zeskanuj kod ponownie.');
      await this.startScanner();
      return;
    }

    this.status.set('success');
    await this.router.navigate(['/caregiver-dashboard']);
  }

  /** Opiekun odmówił - nic nie zmieniamy w bazie i wracamy do skanowania. */
  public cancelPendingPatient(): void {
    if (!this.pendingPatient()) {
      return;
    }
    this.pendingPatient.set(undefined);
    this.scanLocked = false;
    this.errorMessage.set(null);
    this.resumeScanner();
  }

  private async startScanner(): Promise<void> {
    const scanner = new Html5Qrcode(this.reader().nativeElement.id, { verbose: false });
    this.scanner = scanner;
    try {
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          // Square viewport, so the white brackets in the overlay match the scan area.
          aspectRatio: 1,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.min(MAX_SCAN_AREA, viewfinderWidth * 0.6, viewfinderHeight * 0.6);
            return { width: size, height: size };
          },
        },
        (decodedText) => this.onScanSuccess(decodedText),
        // Called for every frame without a readable code - expected while scanning.
        () => void 0,
      );
      this.status.set('scanning');
    } catch {
      this.status.set('error');
      this.errorMessage.set(
        'Nie udało się uruchomić kamery. Sprawdź uprawnienia do urządzenia i spróbuj ponownie.',
      );
    }
  }

  private onScanSuccess(decodedText: string): void {
    if (this.scanLocked) {
      return;
    }
    const patientId = extractPatientId(decodedText);
    if (!patientId) {
      this.errorMessage.set('Nierozpoznany kod QR - zeskanuj kod wyświetlony przez seniora.');
      return;
    }
    if (patientId === this.database.getLocalUserId()) {
      this.errorMessage.set('To jest Twój własny profil - poproś o kod innego pacjenta.');
      return;
    }
    const patient = this.database.getUserById(patientId);
    if (!patient) {
      this.errorMessage.set('Nie udało się dodać pacjenta - zeskanuj kod ponownie.');
      return;
    }

    // Kod wiarygodny, ale jeszcze nic nie zapisujemy - najpierw pytamy opiekuna.
    this.scanLocked = true;
    this.pauseScanner();
    this.pendingPatient.set(patient);
  }

  /** Pauzujemy podgląd, żeby za popupem nie świeciła kamera. */
  private pauseScanner(): void {
    this.scanner?.pause(true);
  }

  private resumeScanner(): void {
    this.scanner?.resume();
  }

  private async stopScanner(): Promise<void> {
    const scanner = this.scanner;
    this.scanner = null;
    if (!scanner) {
      return;
    }
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch {
      // The camera may already be released - clearing below is enough.
    }
    try {
      scanner.clear();
    } catch {
      // Nothing to clean up.
    }
  }
}
