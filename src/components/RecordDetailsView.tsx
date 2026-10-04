import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Settings,
  Calendar as CalendarIcon,
  Plus,
  X,
  Upload,
  Camera,
  Trash2,
  FileText,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { MedicalRecord, Tag, Attachment } from '../types';
import { CalendarModal } from './CalendarModal';
import { INITIAL_TAGS } from '../data/mockData';

interface RecordDetailsViewProps {
  record: MedicalRecord;
  onSave: (updatedRecord: MedicalRecord) => void;
  onDelete?: (recordId: string) => void;
  onBack: () => void;
  onOpenSettings: () => void;
  isNew?: boolean;
}

export const RecordDetailsView: React.FC<RecordDetailsViewProps> = ({
  record,
  onSave,
  onDelete,
  onBack,
  onOpenSettings,
  isNew = false,
}) => {
  const [title, setTitle] = useState(record.title || (isNew ? 'Badanie z dnia 16.05.2025' : ''));
  const [description, setDescription] = useState(record.description || '');
  const [doctor, setDoctor] = useState(record.doctor || 'Pan Kowalski');
  const [date, setDate] = useState(record.date || '16.05.2025');
  const [tags, setTags] = useState<Tag[]>(record.tags || []);
  const [notes, setNotes] = useState(record.notes || 'Treść notatki z wizyty');
  const [attachments, setAttachments] = useState<Attachment[]>(record.attachments || []);

  // UI States
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
  const [newCustomTagName, setNewCustomTagName] = useState('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Snapshot of original values to detect changes
  const originalValues = useRef({
    title: record.title || '',
    description: record.description || '',
    doctor: record.doctor || 'Pan Kowalski',
    date: record.date || '16.05.2025',
    tagsJson: JSON.stringify(record.tags || []),
    notes: record.notes || 'Treść notatki z wizyty',
    attachmentsCount: (record.attachments || []).length,
  });

  const [hasChanged, setHasChanged] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const isFormDirty = () => {
    if (hasChanged) return true;
    if (isNew) {
      return (
        title.trim() !== '' ||
        description.trim() !== '' ||
        tags.length > 0 ||
        attachments.length > 0
      );
    }
    const orig = originalValues.current;
    return (
      title !== orig.title ||
      description !== orig.description ||
      doctor !== orig.doctor ||
      date !== orig.date ||
      notes !== orig.notes ||
      JSON.stringify(tags) !== orig.tagsJson ||
      attachments.length !== orig.attachmentsCount
    );
  };

  const handleBackClick = () => {
    if (isFormDirty()) {
      setShowUnsavedModal(true);
    } else {
      onBack();
    }
  };

  // Save changes
  const handleSave = () => {
    const updated: MedicalRecord = {
      ...record,
      title: title.trim() || (isNew ? `Badanie z dnia ${date}` : 'Badanie tomograf'),
      description,
      doctor,
      date,
      tags,
      notes,
      attachments,
    };
    onSave(updated);
    setHasChanged(false);
    onBack();
  };

  const handleSaveAndBack = () => {
    handleSave();
  };

  const handleRemoveTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  const handleAddTag = (tag: Tag) => {
    if (!tags.some((t) => t.id === tag.id || t.name === tag.name)) {
      setTags((prev) => [...prev, tag]);
    }
    setIsTagPickerOpen(false);
  };

  const handleCreateCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTagName.trim()) return;

    const colors = [
      { bg: '#BACDFD', text: '#1E293B' },
      { bg: '#F8D2D2', text: '#1E293B' },
      { bg: '#FED7AA', text: '#9A3412' },
      { bg: '#E9D5FF', text: '#6B21A8' },
      { bg: '#CCFBF1', text: '#115E59' },
    ];
    const picked = colors[Math.floor(Math.random() * colors.length)];

    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: newCustomTagName.trim(),
      bg: picked.bg,
      text: picked.text,
    };

    setTags((prev) => [...prev, newTag]);
    setNewCustomTagName('');
    setIsTagPickerOpen(false);
  };

  // Upload file handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImg = file.type.startsWith('image/');
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      type: isImg ? 'image' : 'file',
      url: URL.createObjectURL(file),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      date: new Date().toLocaleDateString('pl-PL'),
    };

    setAttachments((prev) => [...prev, newAtt]);
    setIsFabMenuOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Camera capture
  const startCamera = async () => {
    setShowCameraModal(true);
    setIsFabMenuOpen(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      // Camera permission not granted or unsupported, fallback to simulated photo
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && isCameraActive) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        addPhotoAttachment(dataUrl);
      }
    } else {
      // Fallback simulated snapshot
      const simulatedSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%232b3945"/><text x="50%" y="45%" fill="white" font-size="20" font-family="sans-serif" text-anchor="middle">ZDJĘCIE BADANIA</text><text x="50%" y="60%" fill="%238bc34a" font-size="14" font-family="sans-serif" text-anchor="middle">Wykonano: ${date}</text></svg>`;
      addPhotoAttachment(simulatedSvg);
    }
    stopCamera();
  };

  const addPhotoAttachment = (url: string) => {
    const newAtt: Attachment = {
      id: `photo-${Date.now()}`,
      name: `Zdjecie_badania_${Date.now().toString().slice(-4)}.jpg`,
      type: 'image',
      url,
      size: '2.1 MB',
      date: date || '16.05.2025',
    };
    setAttachments((prev) => [...prev, newAtt]);
  };

  const removeAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  return (
    <div className="relative flex-1 flex flex-col bg-white overflow-hidden">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white z-20">
        <button
          type="button"
          onClick={handleBackClick}
          className="p-1.5 -ml-1 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          aria-label="Wróć"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>

        <h1 className="text-sm font-bold text-neutral-900 tracking-tight truncate max-w-[170px]">
          {title || 'Badanie tomograf'}
        </h1>

        <button
          type="button"
          onClick={handleSave}
          className="py-1.5 px-4 bg-[#68B27A] hover:bg-[#5aa16b] active:bg-[#529362] text-white text-xs font-semibold rounded-md shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          Zapisz
        </button>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 animate-content-fade">
        {/* Tytuł */}
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-500 font-normal">Tytuł</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasChanged(true);
            }}
            placeholder="Badanie tomograf"
            className="w-full px-3 py-2 text-xs text-neutral-800 bg-white border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-400"
          />
        </div>

        {/* Opis */}
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-500 font-normal">Opis</label>
          <input
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setHasChanged(true);
            }}
            placeholder="Insert description"
            className="w-full px-3 py-2 text-xs text-neutral-800 bg-white border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-400"
          />
        </div>

        {/* Lekarz */}
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-500 font-normal">Lekarz</label>
          <input
            type="text"
            value={doctor}
            onChange={(e) => {
              setDoctor(e.target.value);
              setHasChanged(true);
            }}
            placeholder="Pan Kowalski"
            className="w-full px-3 py-2 text-xs text-neutral-800 bg-white border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-400"
          />
        </div>

        {/* Data badania with Calendar Icon */}
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-500 font-normal">Data badania</label>
          <div
            onClick={() => setIsCalendarOpen(true)}
            className="w-full px-3 py-2 text-xs text-neutral-800 bg-white border border-neutral-200 rounded-sm flex items-center justify-between cursor-pointer hover:border-neutral-300"
          >
            <span>{date || '16.05.2025'}</span>
            <CalendarIcon className="w-4 h-4 text-neutral-500" />
          </div>
        </div>

        {/* Tagi Section */}
        <div className="space-y-2.5">
          <label className="text-xs text-neutral-500 font-normal">Tagi</label>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                style={{
                  backgroundColor: tag.bg,
                  color: tag.text,
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full tracking-tight"
              >
                <span>{tag.name}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveTag(tag.id, e)}
                  className="hover:opacity-75 focus:outline-none cursor-pointer"
                  aria-label={`Usuń tag ${tag.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            {/* Dashed circular button to add tag */}
            <button
              type="button"
              onClick={() => setIsTagPickerOpen(!isTagPickerOpen)}
              className="w-7 h-7 rounded-full border border-dashed border-neutral-400 hover:border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              title="Dodaj tag"
            >
              <Plus className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>

          {/* Tag Picker Popover */}
          {isTagPickerOpen && (
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md mt-2 space-y-2.5">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">
                Wybierz lub utwórz tag:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INITIAL_TAGS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleAddTag(t)}
                    style={{ backgroundColor: t.bg, color: t.text }}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:scale-105 transition-transform"
                  >
                    + {t.name}
                  </button>
                ))}
              </div>

              {/* Custom tag input */}
              <form onSubmit={handleCreateCustomTag} className="flex items-center gap-1.5 pt-1 w-full">
                <input
                  type="text"
                  value={newCustomTagName}
                  onChange={(e) => setNewCustomTagName(e.target.value)}
                  placeholder="Wpisz nazwę..."
                  className="flex-1 min-w-0 w-0 px-2 py-1 text-xs bg-white border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-500"
                />
                <button
                  type="submit"
                  className="shrink-0 px-2.5 py-1 bg-neutral-800 text-white rounded-sm text-xs font-medium hover:bg-neutral-900 cursor-pointer whitespace-nowrap"
                >
                  Dodaj
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Notatki */}
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-500 font-normal">Notatki</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setHasChanged(true);
            }}
            placeholder="Treść notatki z wizyty"
            className="w-full px-3 py-2 text-xs text-neutral-800 bg-white border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-400 resize-none leading-relaxed"
          />
        </div>

        {/* Attachments list if any */}
        {attachments.length > 0 && (
          <div className="space-y-2 pt-1">
            <label className="text-xs text-neutral-500 font-normal">
              Załączniki ({attachments.length})
            </label>
            <div className="space-y-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 rounded-sm text-xs"
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    {att.type === 'image' ? (
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-8 h-8 rounded-xs object-cover border border-neutral-200 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xs bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                    <div className="truncate">
                      <p className="font-medium text-neutral-800 truncate">{att.name}</p>
                      <p className="text-[10px] text-neutral-400">{att.size || 'Plik'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 rounded"
                    title="Usuń"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete option if editing existing record */}
        {!isNew && onDelete && (
          <div className="pt-4 pb-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1.5 cursor-pointer py-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Usuń to badanie</span>
            </button>
          </div>
        )}

        {/* Bottom spacer for FAB */}
        <div className="h-28" />
      </div>

      {/* Floating Action Button & Menu (Matches Image 3, 4th screen) */}
      <div className="absolute right-5 bottom-6 z-30 flex flex-col items-end">
        {/* Actions when open */}
        {isFabMenuOpen && (
          <div className="flex flex-col items-end space-y-2.5 mb-3 transition-all animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Wgraj plik button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-white border border-neutral-200 rounded-sm text-xs font-semibold text-neutral-900 shadow-md hover:bg-neutral-50 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            >
              Wgraj plik
            </button>

            {/* Zrób zdjęcie button */}
            <button
              type="button"
              onClick={startCamera}
              className="px-5 py-2.5 bg-white border border-neutral-200 rounded-sm text-xs font-semibold text-neutral-900 shadow-md hover:bg-neutral-50 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            >
              Zrób zdjęcie
            </button>
          </div>
        )}

        {/* Main FAB Circle */}
        <button
          type="button"
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          className="w-14 h-14 bg-[#68B27A] hover:bg-[#5AA16B] active:bg-[#519160] text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
          aria-label={isFabMenuOpen ? 'Zamknij menu' : 'Dodaj załącznik'}
        >
          {isFabMenuOpen ? (
            <X className="w-7 h-7 stroke-[2]" />
          ) : (
            <Plus className="w-8 h-8 stroke-[2]" />
          )}
        </button>
      </div>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={date}
        onSelectDate={(newDate) => setDate(newDate)}
      />

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col justify-between p-4">
          <div className="flex justify-between items-center text-white pt-2">
            <span className="text-sm font-medium">Zrób zdjęcie badania</span>
            <button
              type="button"
              onClick={stopCamera}
              className="p-1 rounded-full bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Camera Viewport */}
          <div className="flex-1 my-4 bg-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center relative border border-neutral-800">
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-neutral-400">
                <Camera className="w-16 h-16 mx-auto mb-3 stroke-1 text-neutral-500" />
                <p className="text-sm text-neutral-300 font-medium">Podgląd aparatu</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-[220px]">
                  Kliknij przycisk poniżej, aby wykonać zdjęcie dokumentu lub wyniku badania.
                </p>
              </div>
            )}

            {/* Document alignment frame guides */}
            <div className="absolute inset-6 border-2 border-dashed border-white/40 pointer-events-none rounded-lg" />
          </div>

          {/* Capture Trigger Button */}
          <div className="flex justify-center pb-6">
            <button
              type="button"
              onClick={capturePhoto}
              className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                <Camera className="w-6 h-6 text-neutral-800" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-[300px] bg-white rounded-xl shadow-2xl p-5 border border-neutral-200 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">
              Usunąć badanie?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-5">
              Czy na pewno chcesz usunąć to badanie? Tej operacji nie można cofnąć.
            </p>
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-md transition-colors cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  if (onDelete) {
                    onDelete(record.id);
                  }
                  onBack();
                }}
                className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer shadow-xs"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Unsaved Changes Pop-up Modal (Matches Figma Right Screen) */}
      {showUnsavedModal && (
        <div
          className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-5 animate-in fade-in duration-150"
          onClick={() => setShowUnsavedModal(false)}
        >
          <div
            className="w-full max-w-[270px] bg-white rounded-xl p-5 shadow-2xl border border-neutral-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-neutral-900 mb-2">
              Czy zapisać zmiany?
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed mb-6">
              Zaraz opuścisz &apos;{title.trim() || `Badanie z dnia ${date}`}&apos; bez zapisania zmian. Czy jesteś pewien?
            </p>
            <div className="w-full flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedModal(false);
                  onBack();
                }}
                className="flex-1 py-2 px-2 border border-red-300 text-red-500 hover:bg-red-50 rounded-lg text-xs font-normal transition-colors cursor-pointer whitespace-nowrap"
              >
                Wyjdź bez zapisu
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedModal(false);
                  handleSave();
                }}
                className="flex-1 py-2 px-3 bg-[#68B27A] hover:bg-[#5aa16b] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
