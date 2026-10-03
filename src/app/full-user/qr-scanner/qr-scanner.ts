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
import { Html5Qrcode } from 'html5-qrcode';
import { PatientService } from '../../services/patient.service';

/** Keeps only the patient id from whatever the QR code carries. */
function extractPatientId(decodedText: string): string | null {
  const text = decodedText.trim();
  if (!text) {
    return null;
  }
  if (text.startsWith('{')) {
    try {
      const id = (JSON.parse(text) as { id?: unknown }).id;
      return typeof id === 'string' && id.trim() ? id.trim() : null;
    } catch {
      return null;
    }
  }
  const fromUrl = /[?&](?:patient|id)=([^&]+)/.exec(text);
  return decodeURIComponent(fromUrl ? fromUrl[1] : text);
}

@Component({
  selector: 'app-qr-scanner',
  styleUrl: './qr-scanner.scss',
  templateUrl: './qr-scanner.html',
})
export class QrScanner implements OnDestroy {
  private readonly patientService = inject(PatientService);
  private readonly router = inject(Router);
  private readonly reader = viewChild.required<ElementRef<HTMLDivElement>>('qrReader');

  readonly status = signal<'starting' | 'scanning' | 'success' | 'error'>('starting');
  readonly errorMessage = signal<string | null>(null);

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
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
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

  private async onScanSuccess(decodedText: string): Promise<void> {
    if (this.handled) {
      return;
    }
    const patientId = extractPatientId(decodedText);
    if (!patientId) {
      this.errorMessage.set('Nierozpoznany kod QR - zeskanuj kod wyświetlony przez seniora.');
      return;
    }
    if (patientId === this.patientService.getLocalPatientId()) {
      this.errorMessage.set('To jest Twój własny profil - poproś o kod innego pacjenta.');
      return;
    }
    if (!this.patientService.addSharedPatientById(patientId)) {
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
