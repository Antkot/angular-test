import { Component, computed, model, output, signal } from '@angular/core';

interface CalendarDay {
  day: number;
  muted: boolean;
  date: Date;
}

const MONTH_NAMES = [
  'STYCZEŃ',
  'LUTY',
  'MARZEC',
  'KWIECIEŃ',
  'MAJ',
  'CZERWIEC',
  'LIPIEC',
  'SIERPIEŃ',
  'WRZESIEŃ',
  'PAŹDZIERNIK',
  'LISTOPAD',
  'GRUDZIEŃ',
];

const WEEK_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/** "DD.MM.RRRR" -> Date (null gdy format nie pasuje). */
function parseDate(value: string): Date | null {
  const [day, month, year] = value.split('.').map(Number);
  if (!day || !month || !year) {
    return null;
  }
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/** Arkusz kalendarza (bottom sheet) - wybór dnia badania. */
@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
})
export class DatePicker {
  /** Wybrana data w formacie "DD.MM.RRRR" (two-way). */
  readonly value = model<string>('');
  readonly closed = output<void>();

  readonly monthNames = MONTH_NAMES;
  readonly weekDays = WEEK_DAYS;

  /** Miesiąc pokazywany w siatce. */
  readonly cursor = signal<Date>(new Date());

  readonly monthLabel = computed(() => {
    const date = this.cursor();
    return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  });

  /** Siatka 6x7 - dni z sąsiednich miesięcy są wyciszone. */
  readonly days = computed<CalendarDay[]>(() => {
    const cursor = this.cursor();
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const offset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: CalendarDay[] = [];
    // Poprzedni miesiąc (od końca)
    for (let i = offset; i > 0; i--) {
      const date = new Date(year, month - 1, daysInMonth + 1 - i);
      cells.push({ day: date.getDate(), muted: true, date });
    }
    // Bieżący miesiąc
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, muted: false, date: new Date(year, month, day) });
    }
    // Następny miesiąc (do pełnego siatki)
    for (let day = 1; cells.length < 42; day++) {
      cells.push({ day, muted: true, date: new Date(year, month + 1, day) });
    }
    return cells;
  });

  ngOnInit(): void {
    this.cursor.set(parseDate(this.value()) ?? new Date());
  }

  isSelected(day: CalendarDay): boolean {
    const selected = parseDate(this.value());
    return !!selected && selected.getTime() === day.date.getTime();
  }

  /** Przesunięcie widoku o miesiąc (delta = -1 / +1). */
  shiftMonth(delta: number): void {
    this.cursor.update((date) => new Date(date.getFullYear(), date.getMonth() + delta, 1));
  }

  selectDay(day: CalendarDay): void {
    this.value.set(formatDate(day.date));
    if (day.muted) {
      this.cursor.set(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
    }
    this.closed.emit();
  }
}