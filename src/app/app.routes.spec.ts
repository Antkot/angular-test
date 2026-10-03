import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { Database } from './services/database';

describe('app.routes', () => {
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('redirects the root url to the login screen', async () => {
    await router.navigateByUrl('/');

    expect(router.url).toBe('/login');
  });

  it('sends a visitor without an account to the login screen', async () => {
    await RouterTestingHarness.create();

    await router.navigateByUrl('/senior-dashboard');
    expect(router.url).toBe('/login');

    await router.navigateByUrl('/qr-display');
    expect(router.url).toBe('/login');

    await router.navigateByUrl('/caregiver-dashboard');
    expect(router.url).toBe('/login');

    await router.navigateByUrl('/qr-scanner');
    expect(router.url).toBe('/login');
  });

  it('opens the patient dashboard when an account is signed in', async () => {
    TestBed.inject(Database).setLocalUserId('user-b');
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/senior-dashboard');

    expect(router.url).toBe('/senior-dashboard');
    expect(harness.routeNativeElement?.textContent).toContain('Panel Seniora');
    // Senior ma przycisk otwierający ekran kodu QR
    const link = harness.routeNativeElement?.querySelector('a[href="/qr-display"]');
    expect(link?.textContent).toContain('Pokaż mój kod dostępu');
  });

  it('opens the caregiver dashboard when an account is signed in', async () => {
    TestBed.inject(Database).setLocalUserId('user-a');
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/caregiver-dashboard');

    expect(router.url).toBe('/caregiver-dashboard');
    expect(harness.routeNativeElement?.querySelector('a[href="/qr-scanner"]')).toBeTruthy();
  });

  it('sends an unknown url to the login screen', async () => {
    await RouterTestingHarness.create();

    await router.navigateByUrl('/nie-ma-takiej-strony');

    expect(router.url).toBe('/login');
  });
});