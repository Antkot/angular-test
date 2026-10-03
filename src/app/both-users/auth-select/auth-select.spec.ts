import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Database } from '../../services/database';
import { AuthSelect } from './auth-select';

describe('AuthSelect', () => {
  let fixture: ComponentFixture<AuthSelect>;
  let component: AuthSelect;
  let router: Router;
  let database: Database;

  // Database symuluje opóźnienie (delay) przy pobieraniu kont
  const flush = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AuthSelect],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthSelect);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    database = TestBed.inject(Database);
    fixture.detectChanges();
    await flush();
  });

  it('lists the accounts from the database', () => {
    expect(component.isLoading()).toBe(false);
    expect(component.accounts().length).toBe(3);
  });

  it('signs a caregiver in and opens the caregiver dashboard', () => {
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const caregiver = component.accounts().find((account) => account.id === 'user-a');

    component.signIn(caregiver!);

    expect(database.getLocalUserId()).toBe('user-a');
    expect(navigate).toHaveBeenCalledWith('/caregiver-dashboard');
  });

  it('signs a senior in and opens the patient dashboard', () => {
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const senior = component.accounts().find((account) => account.id === 'user-b');

    component.signIn(senior!);

    expect(database.getLocalUserId()).toBe('user-b');
    expect(navigate).toHaveBeenCalledWith('/senior-dashboard');
  });

  it('registers a new caregiver in the database and signs it in', () => {
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    component.openAddModal();
    component.chooseRole('caregiver');
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    (form.querySelector('[name="firstName"]') as HTMLInputElement).value = 'Ola';
    (form.querySelector('[name="lastName"]') as HTMLInputElement).value = 'Test';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    const created = database.getAllUsers().find((user) => user.firstName === 'Ola');
    expect(created?.role).toBe('caregiver');
    expect(component.isAddModalOpen()).toBe(false);

    expect(database.getLocalUserId()).toBe(created!.id);
    expect(navigate).toHaveBeenCalledWith('/caregiver-dashboard');
  });

  it('registers a new senior and keeps them on the patient dashboard', () => {
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const account = database.registerUser({
      firstName: 'Zofia',
      lastName: 'Pacjent',
      role: 'senior',
    });
    component.signIn(account);

    expect(navigate).toHaveBeenCalledWith('/senior-dashboard');
    // Senior nie ma listy podopiecznych - to rola opiekuna
    expect(database.getPatientIds(account.id)).toEqual([]);
  });

  it('closes the modal without registering anything', () => {
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    component.openAddModal();
    component.chooseRole('senior');
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.account-modal__close') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.isAddModalOpen()).toBe(false);
    expect(component.addMode()).toBe('choice');
    expect(database.getAllUsers().length).toBe(3);
    expect(navigate).not.toHaveBeenCalled();
  });
});