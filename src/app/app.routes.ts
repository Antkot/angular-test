import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthSelect } from './both-users/auth-select/auth-select';
import { RecordForm } from './both-users/record-form/record-form';
import { RecordDetail } from './both-users/record-detail/record-detail';
import { QrDisplay } from './both-users/qr-display/qr-display';
import { SeniorDashboard } from './senior/senior-dashboard/senior-dashboard';
import { CaregiverDashboard } from './full-user/caregiver-dashboard/caregiver-dashboard';
import { DataView } from './data/data-view';
import { AUTH_ROUTE, Database } from './services/database';

/**
 * Strażnik sesji: bez zalogowanego konta (profilu) nie ma czego pokazywać,
 * więc odsyłamy na ekran logowania/rejestracji. Ścieżki chronione odpowiadają
 * stałym z services/database.ts (AUTH_ROUTE, SENIOR_HOME_ROUTE, CAREGIVER_HOME_ROUTE).
 */
const sessionGuard: CanActivateFn = () => {
  const database = inject(Database);
  const router = inject(Router);

  return database.hasSession() ? true : router.createUrlTree([AUTH_ROUTE]);
};

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthSelect },

  // Widok pacjenta + ekran kodu QR udostępnianego opiekunowi.
  { path: 'senior-dashboard', component: SeniorDashboard, canActivate: [sessionGuard] },
  { path: 'qr-display', component: QrDisplay, canActivate: [sessionGuard] },

  // Lazy loaded: the camera library (html5-qrcode) is only needed on this route.
  {
    path: 'qr-scanner',
    loadComponent: () => import('./full-user/qr-scanner/qr-scanner').then((m) => m.QrScanner),
    canActivate: [sessionGuard],
  },

  // Widok opiekuna: lista podopiecznych + dodawanie kolejnych kodami QR.
  { path: 'caregiver-dashboard', component: CaregiverDashboard, canActivate: [sessionGuard] },

  // Widoki deweloperskie - poza przepływem, więc bez strażnika sesji.
  { path: 'record-form', component: RecordForm },
  { path: 'record-detail', component: RecordDetail },
  { path: 'data', component: DataView },

  { path: '**', redirectTo: 'auth' },
];