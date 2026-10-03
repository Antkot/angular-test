import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataView } from './data-view';
import { Database } from '../services/database';

describe('DataView', () => {
  let fixture: ComponentFixture<DataView>;
  let component: DataView;

  const flush = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [DataView] }).compileComponents();

    fixture = TestBed.createComponent(DataView);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await flush();
  });

  it('lists users, access grants and records', () => {
    expect(component.isLoading()).toBe(false);
    expect(component.users().length).toBe(3);
    expect(component.records().length).toBeGreaterThan(0);
    expect(component.access().length).toBeGreaterThan(0);
  });

  it('starts with the senior account as the local one', () => {
    expect(component.localUserId()).toBe('user-b');
  });

  it('changes the local account', () => {
    // Używamy selecta z szablonu, żeby zdarzenie szło naturalną ścieżką
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('user-b');

    select.value = 'user-a';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.localUserId()).toBe('user-a');
    expect(TestBed.inject(Database).getLocalUserId()).toBe('user-a');
  });

  it('counts records per user', () => {
    expect(component.recordCount('user-b')).toBe(2);
    expect(component.recordCount('user-c')).toBe(1);
  });

  it('marks grants created from a QR code', () => {
    expect(
      component.isQrGrant({ id: 'acc-qr-1', userId: 'user-b', grantedToUserId: 'user-a' }),
    ).toBe(true);
    expect(component.isQrGrant({ id: 'acc-2', userId: 'user-b', grantedToUserId: 'user-a' })).toBe(
      false,
    );
  });
});
