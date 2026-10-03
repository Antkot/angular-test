import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TopBar } from '../../shared/top-bar/top-bar';
import { DatePicker } from '../../shared/date-picker/date-picker';
import { TagColor, tagColor } from '../../data/tag-colors';
import { KNOWN_TAGS } from '../../data/mock-db';
import { SENIOR_HOME_ROUTE, Database } from '../../services/database';
import { MedicalRecord } from '../../models/app.models';

/**
 * Ekran „Record details" z projektu - służy do dodawania (/record-form)
 * i edycji (/record-detail/:recordId) badania.
 */
@Component({
  selector: 'app-record-detail',
  standalone: true,
  imports: [TopBar, DatePicker],
  templateUrl: './record-detail.html',
  styleUrl: './record-detail.scss',
})
export class RecordDetail implements OnInit {
  private readonly database = inject(Database);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public readonly isNew = signal(true);
  public readonly recordId = signal<string | null>(null);

  public readonly title = signal('');
  public readonly description = signal('');
  public readonly doctor = signal('');
  public readonly date = signal('');
  public readonly notes = signal('');
  public readonly tags = signal<string[]>([]);
  public readonly attachments = signal<string[]>([]);

  public readonly calendarOpen = signal(false);
  public readonly fabMenuOpen = signal(false);
  public readonly tagPickerOpen = signal(false);
  public readonly newTag = signal('');
  public readonly saveLabel = signal('Zapisz');

  public readonly knownTags = KNOWN_TAGS;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('recordId');
      const record = id ? this.database.getMedicalRecordById(id) : undefined;

      this.recordId.set(record?.id ?? null);
      this.isNew.set(!record);

      // Nowe badanie: wartości domyślne spójne z projektem.
      this.title.set(record?.title ?? 'Badanie z dnia ' + this.today());
      this.description.set(record?.description ?? '');
      this.doctor.set(record?.doctor ?? 'dr Jan Kowalski');
      this.date.set(record?.date ?? this.today());
      this.notes.set(record?.notes ?? '');
      this.tags.set(record?.tags ?? []);
      this.attachments.set(record?.attachments ?? []);
    });
  }

  public tagColor(tag: string): TagColor {
    return tagColor(tag);
  }

  public onInput(event: Event, field: 'title' | 'description' | 'doctor' | 'notes'): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    switch (field) {
      case 'title':
        this.title.set(value);
        break;
      case 'description':
        this.description.set(value);
        break;
      case 'doctor':
        this.doctor.set(value);
        break;
      case 'notes':
        this.notes.set(value);
        break;
    }
  }

  // --- TAGI ---

  public toggleTagPicker(): void {
    this.tagPickerOpen.update((open) => !open);
  }

  public addTag(tag: string): void {
    const name = tag.trim();
    if (name && !this.tags().includes(name)) {
      this.tags.update((tags) => [...tags, name]);
    }
    this.newTag.set('');
    this.tagPickerOpen.set(false);
  }

  public removeTag(tag: string): void {
    this.tags.update((tags) => tags.filter((current) => current !== tag));
  }

  public onNewTag(event: Event): void {
    this.newTag.set((event.target as HTMLInputElement).value);
  }

  // --- ZAŁĄCZNIKI ---

  public toggleFabMenu(): void {
    this.fabMenuOpen.update((open) => !open);
  }

  public addFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const names = Array.from(input.files ?? []).map((file) => file.name);

    if (names.length > 0) {
      this.attachments.update((current) => [...current, ...names]);
    }
    input.value = '';
    this.fabMenuOpen.set(false);
  }

  public removeAttachment(name: string): void {
    this.attachments.update((current) => current.filter((file) => file !== name));
  }

  // --- ZAPIS / USUNIĘCIE ---

  public async save(): Promise<void> {
    const existingId = this.recordId();
    const record: MedicalRecord = {
      id: existingId ?? `rec-${Date.now()}`,
      // Nowe badanie zapisujemy dla zalogowanego konta.
      userId: existingId
        ? (this.database.getMedicalRecordById(existingId)?.userId ?? this.database.getLocalUserId())
        : this.database.getLocalUserId(),
      title: this.title().trim() || 'Badanie bez nazwy',
      description: this.description(),
      doctor: this.doctor(),
      date: this.date(),
      tags: this.tags(),
      notes: this.notes(),
      hasAttachments: this.attachments().length > 0,
      attachments: this.attachments(),
    };

    if (existingId) {
      await firstValueFrom(this.database.updateMedicalRecord(record));
    } else {
      await firstValueFrom(this.database.addMedicalRecord(record));
    }

    this.goBack();
  }

  public async remove(): Promise<void> {
    const existingId = this.recordId();
    if (existingId) {
      await firstValueFrom(this.database.deleteMedicalRecord(existingId));
    }
    this.goBack();
  }

  public goBack(): void {
    // Wracamy do widoku, z którego weszliśmy (profil pacjenta lub opiekuna).
    void this.router.navigateByUrl(SENIOR_HOME_ROUTE);
  }

  private today(): string {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;
  }
}