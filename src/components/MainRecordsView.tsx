import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Settings,
  Search,
  Calendar,
  Plus,
  FileText,
  X,
} from 'lucide-react';
import { MedicalRecord, Tag, UserProfile } from '../types';
import { INITIAL_TAGS } from '../data/mockData';

interface MainRecordsViewProps {
  currentUser: UserProfile;
  records: MedicalRecord[];
  onOpenRecord: (recordId: string) => void;
  onAddNewRecord: () => void;
  onOpenSettings: () => void;
  onBack: () => void;
  canSwitchAccount?: boolean;
}

export const MainRecordsView: React.FC<MainRecordsViewProps> = ({
  currentUser,
  records,
  onOpenRecord,
  onAddNewRecord,
  onOpenSettings,
  onBack,
  canSwitchAccount = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Modal & Popover States
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);

  // Form values inside modal (Default values match Figma screen)
  const [tempDoctor, setTempDoctor] = useState('Mariusz Kowalski');
  const [tempDateRange, setTempDateRange] = useState('05.05.2025 - 16.05.2026');
  const [startDateInput, setStartDateInput] = useState('2025-05-05');
  const [endDateInput, setEndDateInput] = useState('2026-05-16');
  const [tempSelectedTags, setTempSelectedTags] = useState<Tag[]>([INITIAL_TAGS[0]]);

  // Applied filters (active)
  const [appliedDoctor, setAppliedDoctor] = useState<string>('');
  const [appliedDateRange, setAppliedDateRange] = useState<string>('');
  const [appliedTags, setAppliedTags] = useState<Tag[]>([]);

  // Robust date parser for DD.MM.YYYY and YYYY-MM-DD
  const parseDateToTimestamp = (dStr: string): number | null => {
    if (!dStr) return null;
    const s = dStr.trim();
    // Format DD.MM.YYYY
    const dotParts = s.split('.');
    if (dotParts.length === 3) {
      const day = parseInt(dotParts[0], 10);
      const month = parseInt(dotParts[1], 10) - 1;
      const year = parseInt(dotParts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day, 0, 0, 0).getTime();
      }
    }
    // Format YYYY-MM-DD
    const dashParts = s.split('-');
    if (dashParts.length === 3 && dashParts[0].length === 4) {
      const year = parseInt(dashParts[0], 10);
      const month = parseInt(dashParts[1], 10) - 1;
      const day = parseInt(dashParts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day, 0, 0, 0).getTime();
      }
    }
    const parsed = Date.parse(s);
    return isNaN(parsed) ? null : parsed;
  };

  // List of available doctors
  const availableDoctors = useMemo(() => {
    const list = ['Mariusz Kowalski', 'Pan Kowalski', 'Dr Anna Wójcik', 'Dr n. med. Robert Lewandowski'];
    records.forEach((r) => {
      if (r.doctor && !list.includes(r.doctor)) {
        list.push(r.doctor);
      }
    });
    return list;
  }, [records]);

  // List of all tags
  const allAvailableTags = useMemo(() => {
    const tagMap = new Map<string, Tag>();
    INITIAL_TAGS.forEach((t) => tagMap.set(t.name, t));
    records.forEach((r) => {
      r.tags?.forEach((t) => tagMap.set(t.name, t));
    });
    return Array.from(tagMap.values());
  }, [records]);

  // Filter records by search text, doctor, date range, and tags
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // 1. Text search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        rec.title.toLowerCase().includes(q) ||
        rec.description.toLowerCase().includes(q) ||
        rec.doctor.toLowerCase().includes(q) ||
        rec.date.includes(q) ||
        rec.tags.some((t) => t.name.toLowerCase().includes(q));

      // 2. Doctor filter
      const matchesDoctor =
        !appliedDoctor ||
        appliedDoctor === 'Wszyscy lekarze' ||
        rec.doctor.toLowerCase().includes(appliedDoctor.toLowerCase()) ||
        (appliedDoctor.includes('Kowalski') && rec.doctor.includes('Kowalski'));

      // 3. Date range filter
      let matchesDate = true;
      if (appliedDateRange && appliedDateRange.trim() !== '') {
        const recTime = parseDateToTimestamp(rec.date);
        if (recTime !== null) {
          if (appliedDateRange.includes('-')) {
            const [startStr, endStr] = appliedDateRange.split('-').map((s) => s.trim());
            const startTime = parseDateToTimestamp(startStr);
            const endTime = parseDateToTimestamp(endStr);
            if (startTime !== null && endTime !== null) {
              // inclusive to end of day
              matchesDate = recTime >= startTime && recTime <= (endTime + 86400000 - 1);
            } else if (startTime !== null) {
              matchesDate = recTime >= startTime;
            } else if (endTime !== null) {
              matchesDate = recTime <= (endTime + 86400000 - 1);
            }
          } else {
            const singleTime = parseDateToTimestamp(appliedDateRange);
            if (singleTime !== null) {
              matchesDate = Math.abs(recTime - singleTime) < 86400000;
            }
          }
        }
      }

      // 4. Tags filter
      const matchesTags =
        appliedTags.length === 0 ||
        appliedTags.some((appliedT) =>
          rec.tags.some((recT) => recT.name.toLowerCase() === appliedT.name.toLowerCase())
        );

      return matchesSearch && matchesDoctor && matchesDate && matchesTags;
    });
  }, [records, searchQuery, appliedDoctor, appliedDateRange, appliedTags]);

  const hasActiveFilters = Boolean(
    appliedDoctor || appliedDateRange || appliedTags.length > 0
  );

  const handleApplyFilters = () => {
    setAppliedDoctor(tempDoctor);
    setAppliedDateRange(tempDateRange);
    setAppliedTags(tempSelectedTags);
    setIsDoctorDropdownOpen(false);
    setIsDateDropdownOpen(false);
    setIsTagPickerOpen(false);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setTempDoctor('');
    setTempDateRange('');
    setStartDateInput('');
    setEndDateInput('');
    setTempSelectedTags([]);
    setAppliedDoctor('');
    setAppliedDateRange('');
    setAppliedTags([]);
    setIsDoctorDropdownOpen(false);
    setIsDateDropdownOpen(false);
    setIsTagPickerOpen(false);
    setIsFilterModalOpen(false);
  };

  return (
    <div className="relative flex-1 flex flex-col bg-white overflow-hidden text-neutral-900">
      {/* Top Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white z-10">
        {canSwitchAccount ? (
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 -ml-1 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
            aria-label="Wybierz konto"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
        ) : (
          <div className="w-8" />
        )}

        <h1 className="text-base font-bold text-neutral-900 tracking-tight">
          {currentUser.name}
        </h1>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 -mr-1 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          aria-label="Ustawienia"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>

      {/* Search Input Bar (Matches Figma Screen) */}
      <div className="shrink-0 px-4 pt-3 pb-2 bg-white">
        <div className="relative flex items-center border border-neutral-300 rounded-full bg-white px-3 py-2 shadow-2xs focus-within:border-neutral-500 transition-colors">
          {/* Left Filter Icon (funnel / 3 horizontal lines) */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="p-1 text-neutral-700 hover:text-black rounded transition-colors relative cursor-pointer"
            title="Otwórz menu filtrów"
            aria-label="Filtry"
          >
            <svg
              className="w-4 h-4 stroke-[1.9]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="9" y1="18" x2="15" y2="18" />
            </svg>
            {hasActiveFilters && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#68B27A] ring-1.5 ring-white" />
            )}
          </button>

          {/* Input text */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Wyszukaj wizytę"
            className="flex-1 bg-transparent px-2.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none"
          />

          {/* Right Search Glass Icon */}
          <div className="p-1 text-neutral-500">
            <Search className="w-4 h-4 stroke-[1.9]" />
          </div>
        </div>

        {/* Active Filter Chips Bar (if filters are applied) */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 pt-2 pb-1 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-neutral-500 shrink-0 font-medium">Aktywne:</span>
            {appliedDoctor && (
              <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full shrink-0 flex items-center gap-1">
                {appliedDoctor}
                <button
                  type="button"
                  onClick={() => setAppliedDoctor('')}
                  className="hover:text-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {appliedDateRange && (
              <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full shrink-0 flex items-center gap-1">
                {appliedDateRange}
                <button
                  type="button"
                  onClick={() => setAppliedDateRange('')}
                  className="hover:text-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {appliedTags.map((t) => (
              <span
                key={t.id}
                style={{ backgroundColor: t.bg, color: t.text }}
                className="px-2 py-0.5 rounded-full shrink-0 font-medium flex items-center gap-1"
              >
                {t.name}
                <button
                  type="button"
                  onClick={() => setAppliedTags((prev) => prev.filter((st) => st.id !== t.id))}
                  className="hover:opacity-70 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#68B27A] font-semibold hover:underline shrink-0 pl-1 cursor-pointer"
            >
              Wyczyść
            </button>
          </div>
        )}
      </div>

      {/* Records Scrollable List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 animate-content-fade">
        {filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <FileText className="w-12 h-12 mx-auto stroke-1 text-neutral-300 mb-2" />
            <p className="text-sm font-medium text-neutral-600">Brak badań</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-[240px] mx-auto">
              {searchQuery || hasActiveFilters
                ? 'Brak wyników dla podanych filtrów. Kliknij „Wyczyść”, aby zobaczyć wszystkie.'
                : 'Dodaj pierwsze badanie za pomocą zielonego przycisku poniżej.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 text-xs text-[#68B27A] font-semibold underline cursor-pointer"
              >
                Wyczyść wszystkie filtry
              </button>
            )}
          </div>
        ) : (
          filteredRecords.map((record, idx) => (
            <div
              key={record.id}
              onClick={() => onOpenRecord(record.id)}
              style={{ animationDelay: `${Math.min(idx * 35, 210)}ms` }}
              className="bg-white border border-neutral-200 rounded-md p-3.5 hover:border-neutral-300 hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer text-left animate-item-fade"
            >
              {/* Header: Title and Tags */}
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-bold text-neutral-900 leading-snug">
                  {record.title}
                </h2>

                {/* Tags on the right */}
                {record.tags && record.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {record.tags.map((tag) => (
                      <span
                        key={tag.id}
                        style={{
                          backgroundColor: tag.bg,
                          color: tag.text,
                        }}
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap tracking-tight"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="text-xs text-neutral-400 mt-0.5 font-normal">
                {record.date}
              </div>

              {/* Description */}
              {record.description && (
                <p className="text-xs text-neutral-700 mt-2 line-clamp-2 leading-relaxed font-normal">
                  {record.description}
                </p>
              )}

              {/* Attached files badge indicator if any */}
              {record.attachments && record.attachments.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center text-[11px] text-neutral-400 gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{record.attachments.length} {record.attachments.length === 1 ? 'załącznik' : 'załączniki'}</span>
                </div>
              )}
            </div>
          ))
        )}

        {/* Bottom spacer so FAB doesn't cover last card */}
        <div className="h-20" />
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="absolute right-5 bottom-6 z-30">
        <button
          type="button"
          onClick={onAddNewRecord}
          className="w-14 h-14 bg-[#68B27A] hover:bg-[#5AA16B] active:bg-[#519160] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
          aria-label="Dodaj badanie"
        >
          <Plus className="w-8 h-8 stroke-[2]" />
        </button>
      </div>

      {/* Filter Pop-up Modal (Matches Figma Screenshot Exactly) */}
      {isFilterModalOpen && (
        <div
          className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[0.5px] flex items-center justify-center p-4 animate-modal-backdrop"
          onClick={() => {
            setIsFilterModalOpen(false);
            setIsDoctorDropdownOpen(false);
            setIsDateDropdownOpen(false);
            setIsTagPickerOpen(false);
          }}
        >
          <div
            className="w-full max-w-[285px] bg-white rounded-2xl p-5 shadow-2xl border border-neutral-100 flex flex-col text-neutral-900 animate-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title: Filtry */}
            <h2 className="text-sm font-bold text-neutral-900 mb-3.5 text-left">
              Filtry
            </h2>

            {/* Field 1: Lekarz */}
            <div className="space-y-1 mb-3.5 text-left">
              <label className="text-xs text-neutral-500 font-normal block">
                Lekarz
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsDoctorDropdownOpen(!isDoctorDropdownOpen);
                    setIsDateDropdownOpen(false);
                    setIsTagPickerOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-neutral-800 bg-white border border-neutral-200 rounded-sm flex items-center justify-between hover:border-neutral-300 transition-colors cursor-pointer text-left"
                >
                  <span className="truncate">
                    {tempDoctor || 'Mariusz Kowalski'}
                  </span>
                  <span className="text-[9px] text-neutral-500 ml-2">▼</span>
                </button>

                {/* Doctor Dropdown List */}
                {isDoctorDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-30 max-h-40 overflow-y-auto py-1 text-xs animate-popover-in">
                    <button
                      type="button"
                      onClick={() => {
                        setTempDoctor('');
                        setIsDoctorDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left hover:bg-neutral-50 transition-colors cursor-pointer ${
                        !tempDoctor ? 'font-semibold text-[#68B27A]' : 'text-neutral-700'
                      }`}
                    >
                      Wszyscy lekarze
                    </button>
                    {availableDoctors.map((doc) => (
                      <button
                        key={doc}
                        type="button"
                        onClick={() => {
                          setTempDoctor(doc);
                          setIsDoctorDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left hover:bg-neutral-50 transition-colors cursor-pointer truncate ${
                          tempDoctor === doc ? 'font-semibold text-[#68B27A]' : 'text-neutral-700'
                        }`}
                      >
                        {doc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Field 2: Okres */}
            <div className="space-y-1 mb-3.5 text-left">
              <label className="text-xs text-neutral-500 font-normal block">
                Okres
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsDateDropdownOpen(!isDateDropdownOpen);
                    setIsDoctorDropdownOpen(false);
                    setIsTagPickerOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-neutral-800 bg-white border border-neutral-200 rounded-sm flex items-center justify-between hover:border-neutral-300 transition-colors cursor-pointer text-left"
                >
                  <span className="truncate">
                    {tempDateRange || 'Wszystkie daty'}
                  </span>
                  <Calendar className="w-4 h-4 text-neutral-500 shrink-0 ml-2" />
                </button>

                {/* Date Picker & Presets Popover */}
                {isDateDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl z-40 p-3 text-xs space-y-3 animate-popover-in">
                    <span className="text-[11px] font-bold text-neutral-800 block">
                      Wybierz zakres dat
                    </span>

                    {/* From / To Date Inputs */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-neutral-500 w-8 shrink-0">Od:</span>
                        <input
                          type="date"
                          value={startDateInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStartDateInput(val);
                            if (val && endDateInput) {
                              const [y1, m1, d1] = val.split('-');
                              const [y2, m2, d2] = endDateInput.split('-');
                              setTempDateRange(`${d1}.${m1}.${y1} - ${d2}.${m2}.${y2}`);
                            } else if (val) {
                              const [y1, m1, d1] = val.split('-');
                              setTempDateRange(`${d1}.${m1}.${y1}`);
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded text-neutral-800 focus:outline-none focus:border-[#68B27A]"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-neutral-500 w-8 shrink-0">Do:</span>
                        <input
                          type="date"
                          value={endDateInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEndDateInput(val);
                            if (startDateInput && val) {
                              const [y1, m1, d1] = startDateInput.split('-');
                              const [y2, m2, d2] = val.split('-');
                              setTempDateRange(`${d1}.${m1}.${y1} - ${d2}.${m2}.${y2}`);
                            } else if (val) {
                              const [y2, m2, d2] = val.split('-');
                              setTempDateRange(`${d2}.${m2}.${y2}`);
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded text-neutral-800 focus:outline-none focus:border-[#68B27A]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setStartDateInput('');
                          setEndDateInput('');
                          setTempDateRange('');
                          setIsDateDropdownOpen(false);
                        }}
                        className="flex-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-xs font-medium cursor-pointer transition-colors text-center"
                      >
                        Wyczyść
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDateDropdownOpen(false)}
                        className="flex-1 py-1.5 bg-[#68B27A] hover:bg-[#5aa16b] text-white rounded text-xs font-semibold cursor-pointer transition-colors text-center"
                      >
                        Gotowe
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Field 3: Tagi */}
            <div className="space-y-1 mb-5 text-left">
              <label className="text-xs text-neutral-500 font-normal block">
                Tagi
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {/* Circular dashed button with + */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTagPickerOpen(!isTagPickerOpen);
                      setIsDoctorDropdownOpen(false);
                      setIsDateDropdownOpen(false);
                    }}
                    className="w-7 h-7 rounded-full border border-dashed border-neutral-400 hover:border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                    title="Dodaj tag do filtra"
                  >
                    <Plus className="w-4 h-4 stroke-[1.8]" />
                  </button>

                  {/* Tag Selector Popover */}
                  {isTagPickerOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-neutral-200 rounded-md shadow-xl z-40 p-2 space-y-1.5 animate-popover-in">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block px-1">
                        Wybierz tag:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {allAvailableTags.map((t) => {
                          const isSelected = tempSelectedTags.some((st) => st.name === t.name);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setTempSelectedTags((prev) => prev.filter((st) => st.name !== t.name));
                                } else {
                                  setTempSelectedTags((prev) => [...prev, t]);
                                }
                              }}
                              style={{ backgroundColor: t.bg, color: t.text }}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-transform cursor-pointer ${
                                isSelected ? 'ring-2 ring-[#68B27A] scale-105' : 'opacity-80 hover:opacity-100'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {t.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected tag pills */}
                {tempSelectedTags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTempSelectedTags((prev) => prev.filter((st) => st.id !== t.id))}
                    style={{ backgroundColor: t.bg, color: t.text }}
                    className="text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1 cursor-pointer hover:opacity-85 transition-opacity"
                    title="Kliknij, aby usunąć z filtra"
                  >
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions: Wyczyść and Filtruj */}
            <div className="flex items-center space-x-2.5 pt-1">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2 px-3 bg-white border border-[#68B27A] text-[#68B27A] hover:bg-[#68B27A]/10 active:bg-[#68B27A]/20 rounded-md text-xs font-medium text-center transition-colors cursor-pointer"
              >
                Wyczyść
              </button>

              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex-1 py-2 px-3 bg-[#68B27A] hover:bg-[#5aa16b] active:bg-[#529362] text-white rounded-md text-xs font-medium text-center transition-colors cursor-pointer shadow-xs"
              >
                Filtruj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
