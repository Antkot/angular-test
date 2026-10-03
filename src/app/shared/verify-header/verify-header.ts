import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Database } from '../../services/database';

@Component({
  selector: 'app-verify-header',
  styleUrl: './verify-header.scss',
  templateUrl: './verify-header.html',
})
export class VerifyHeader {
  private readonly router = inject(Router);
  private readonly database = inject(Database);

  /**
   * Powrót do widoku głównego zalogowanego konta - senior zobaczy swój panel,
   * opiekun swój. Działa też przy wejściu wprost na adres (bez wpisów w historii).
   */
  goBack(): void {
    void this.router.navigateByUrl(this.database.getHomeRoute());
  }
}