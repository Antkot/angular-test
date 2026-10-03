import { Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { toCanvas } from 'qrcode';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-qr-display',
  styleUrl: './qr-display.scss',
  templateUrl: './qr-display.html',
})
export class QrDisplay {
  private readonly patientService = inject(PatientService);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('qrCanvas');

  readonly patientId = this.patientService.getLocalPatientId();
  readonly localPatient = this.patientService.localPatient;
  readonly error = signal<string | null>(null);

  constructor() {
    afterNextRender(() => void this.renderQrCode());
  }

  private async renderQrCode(): Promise<void> {
    try {
      await toCanvas(this.canvas().nativeElement, this.patientId, {
        width: 280,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
    } catch {
      this.error.set('Nie udało się wygenerować kodu QR.');
    }
  }
}
