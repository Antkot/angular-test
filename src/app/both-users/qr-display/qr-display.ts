import { Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { toCanvas } from 'qrcode';
import { TopBar } from '../../shared/top-bar/top-bar';
import { Database } from '../../services/database';
import { User } from '../../models/app.models';

@Component({
  selector: 'app-qr-display',
  imports: [TopBar],
  styleUrl: './qr-display.scss',
  templateUrl: './qr-display.html',
})
export class QrDisplay {
  private readonly database = inject(Database);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('qrCanvas');

  /** Zalogowany profil - to jego id kodujemy i jego pokazujemy opiekunowi. */
  readonly patient = signal<User | undefined>(this.database.getLocalUserProfile());
  /** Payload encoded in the QR code - id of the profile shared by this device. */
  readonly patientId = this.database.getLocalUserId();
  readonly error = signal<string | null>(null);

  constructor() {
    afterNextRender(() => void this.renderQrCode());
  }

  private async renderQrCode(): Promise<void> {
    try {
      await toCanvas(this.canvas().nativeElement, this.patientId, {
        width: 224,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      });
    } catch {
      this.error.set('Nie udało się wygenerować kodu QR.');
    }
  }
}
