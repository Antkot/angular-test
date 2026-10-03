import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TopBar } from '../../shared/top-bar/top-bar';
import { TagColor, tagColor } from '../../data/tag-colors';
import { AUTH_ROUTE, CAREGIVER_HOME_ROUTE, Database } from '../../services/database';
import { MedicalRecord, User, UserId } from '../../models/app.models';

/**
 * Uniwersalny widok profilu pacjenta:
 * - bez parametru → własny profil (kontekst seniora: dane + "Pokaż mój kod dostępu"),
 * - /senior-dashboard/:patientId → profil podopiecznego (kontekst opiekuna: dane + powrót).
 */
@Component({
  selector: 'app-senior-dashboard',
  standalone: true,
  imports: [RouterLink, TopBar],
  templateUrl: './senior-dashboard.html',
  styleUrls: ['./senior-dashboard.scss'],
})
export class SeniorDashboard implements OnInit {
  private readonly database = inject(Database);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Oglądany profil: własny albo podopieczny wybrany przez opiekuna.
  public readonly profile = signal<User | undefined>(undefined);
  public readonly records = signal<MedicalRecord[]>([]);
  public readonly isLoading = signal(true);
  /** Opiekun ogląda cudzy profil - wtedy dashboard jest szczegółami podopiecznego. */
  public readonly isCaregiverContext = signal(false);
  /** Fraza wyszukiwarki na liście badań. */
  public readonly search = signal('');
  /** Wybrany filtr tagu (null = wszystkie). */
  public readonly tagFilter = signal<string | null>(null);
  public readonly filterOpen = signal(false);

  /** Unikalne tagi z badań - źródło filtrów pod wyszukiwarką. */
  public readonly allTags = computed(() => [
    ...new Set(this.records().flatMap((record) => record.tags)),
  ]);

  /** Tytuł paska: imię i nazwisko oglądanego profilu. */
  public readonly profileTitle = computed(() => {
    const account = this.profile();
    if (account) {
      return `${account.firstName} ${account.lastName}`;
    }
    return this.isCaregiverContext() ? 'Profil podopiecznego' : 'Panel Seniora';
  });

  /** Badania przefiltrowane wyszukiwarką i wybranym tagiem. */
  public readonly filteredRecords = computed(() => {
    const phrase = this.search().trim().toLocaleLowerCase();
    const tag = this.tagFilter();

    return this.records().filter((record) => {
      const matchesTag = tag === null || record.tags.includes(tag);
      const matchesText =
        !phrase ||
        [record.title, record.doctor, record.description, record.date, ...record.tags]
          .join(' ')
          .toLocaleLowerCase()
          .includes(phrase);

      return matchesTag && matchesText;
    });
  });

  public tagColor(tag: string): TagColor {
    return tagColor(tag);
  }

  /** Liczba załączników badania ("1 załącznik" / "3 załączniki"). */
  public attachmentLabel(record: MedicalRecord): string {
    const count = record.attachments?.length ?? (record.hasAttachments ? 1 : 0);
    return count === 1 ? '1 załącznik' : `${count} załączników`;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => this.showProfile(params.get('patientId')));
  }

  public onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  public toggleFilter(): void {
    this.filterOpen.update((open) => !open);
  }

  public selectTag(tag: string | null): void {
    this.tagFilter.set(tag);
  }

  /** Kod QR udostępnia własny profil - profilu podopiecznego nie udostępniamy stąd. */
  public get canShareAccessCode(): boolean {
    return !this.isCaregiverContext();
  }

  /** Powrót do listy podopiecznych (tylko w kontekście opiekuna). */
  public goBack(): void {
    void this.router.navigateByUrl(CAREGIVER_HOME_ROUTE);
  }

  /** Wylogowanie: wracamy na ekran logowania/rejestracji. */
  public signOut(): void {
    this.database.signOut();
    void this.router.navigateByUrl(AUTH_ROUTE);
  }

  private showProfile(requestedId: string | null): void {
    const localUserId = this.database.getLocalUserId();
    const patientId = requestedId?.trim() || localUserId;

    // Na profil cudzego konta wchodzimy tylko z poziomu opiekuna, który ma do niego dostęp.
    if (patientId !== localUserId && !this.database.hasAccess(patientId, localUserId)) {
      void this.router.navigateByUrl(this.database.getHomeRoute());
      return;
    }

    this.isCaregiverContext.set(patientId !== localUserId);
    this.profile.set(this.database.getUserById(patientId));
    this.loadRecords(patientId);
  }

  private loadRecords(patientId: UserId): void {
    this.isLoading.set(true);
    this.records.set([]);

    this.database.getMedicalRecordsByUserId(patientId).subscribe({
      next: (records: MedicalRecord[]) => {
        this.records.set(records);
        this.isLoading.set(false);
      },
      error: () => {
        this.records.set([]);
        this.isLoading.set(false);
      },
    });
  }
}