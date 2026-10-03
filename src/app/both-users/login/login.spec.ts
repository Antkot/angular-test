import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Database } from '../../services/database';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('signs a known account in and opens the dashboard of its role', async () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const database = TestBed.inject(Database);

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    (form.querySelector('[name="email"]') as HTMLInputElement).value = 'anna.opiekun@example.com';
    (form.querySelector('[name="password"]') as HTMLInputElement).value = 'haslo123';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();

    expect(database.getLocalUserId()).toBe('user-a');
    expect(navigate).toHaveBeenCalledWith('/caregiver-dashboard');
  });

  it('refuses wrong credentials', async () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    (form.querySelector('[name="email"]') as HTMLInputElement).value = 'anna.opiekun@example.com';
    (form.querySelector('[name="password"]') as HTMLInputElement).value = 'zle-haslo';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('Nieprawidłowy');
    expect(navigate).not.toHaveBeenCalled();
  });
});
