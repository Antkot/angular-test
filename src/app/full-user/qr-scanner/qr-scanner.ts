import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Html5Qrcode } from 'html5-qrcode';
import { VerifyHeader } from '../../shared/verify-header/verify-header';
import { Database } from '../../services/database';

/** Largest scan area in px - matches `.scan-frame` in the stylesheet. */
const MAX_SCAN_AREA = 240;

/** Zawartość kodu QR to id profilu pacjenta - zostawiamy samo id. */
function extractPatientId(decodedText: string): string | null {
  const id = decodedText.trim();
  return id || null;
}

@Component({
  selector: 'app-qr-scanner',
  imports: [VerifyHeader],
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

  private scanner: Html5Qrcode | null = null;
  private handled = false;

  constructor() {
    afterNextRender(() => void this.startScanner());
  }

  ngOnDestroy(): void {
    void this.stopScanner();
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
        (decodedText) => void this.onScanSuccess(decodedText),
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

  private async onScanSuccess(decodedText: string): Promise<void> {
    if (this.handled) {
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

    const granted = await firstValueFrom(this.database.addPatient(patientId));
    if (!granted) {
      this.errorMessage.set('Nie udało się dodać pacjenta - zeskanuj kod ponownie.');
      return;
    }

    this.handled = true;
    this.status.set('success');
    await this.stopScanner();
    await this.router.navigate(['/caregiver-dashboard']);
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
