import { Routes } from '@angular/router';
import { AuthSelect } from './both-users/auth-select/auth-select';
import { RecordForm } from './both-users/record-form/record-form';
import { RecordDetail } from './both-users/record-detail/record-detail';
import { QrDisplay } from './both-users/qr-display/qr-display';
import { SeniorDashboard } from './senior/senior-dashboard/senior-dashboard';
import { CaregiverDashboard } from './full-user/caregiver-dashboard/caregiver-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthSelect },
  { path: 'record-form', component: RecordForm },
  { path: 'record-detail', component: RecordDetail },
  { path: 'senior-dashboard', component: SeniorDashboard },
  { path: 'qr-display', component: QrDisplay },
  // Lazy loaded: the camera library (html5-qrcode) is only needed on this route.
  {
    path: 'qr-scanner',
    loadComponent: () => import('./full-user/qr-scanner/qr-scanner').then((m) => m.QrScanner),
  },
  { path: 'caregiver-dashboard', component: CaregiverDashboard },
];
