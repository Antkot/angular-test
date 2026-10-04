import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LegalInfoViewProps {
  onBack: () => void;
}

export const LegalInfoView: React.FC<LegalInfoViewProps> = ({ onBack }) => {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden text-neutral-900">
      {/* Top Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white z-10">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 -ml-1 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          aria-label="Wróć"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>

        <h1 className="text-sm font-bold text-neutral-900 tracking-tight">
          Informacje prawne
        </h1>

        <div className="w-8" />
      </div>

      {/* Legal Document Content - Dry, Formal, No Icons */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 text-xs text-neutral-700 leading-relaxed font-normal animate-content-fade">
        {/* Document Header */}
        <div className="border-b border-neutral-200 pb-4">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium mb-1">
            Dokument formalny
          </p>
          <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-tight leading-snug">
            Regulamin Świadczenia Usług oraz Klauzula Informacyjna RODO
          </h2>
          <p className="text-[11px] text-neutral-500 mt-1 font-mono">
            Tekst jednolity z dnia 1 stycznia 2026 r.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
            § 1. Postanowienia ogólne i definicje
          </h3>
          <p className="text-justify text-neutral-700">
            1. Niniejszy regulamin określa zasady, zakres oraz warunki techniczne świadczenia usług
            drogą elektroniczną za pośrednictwem aplikacji mobilnej MediCard (dalej: „Aplikacja”).
          </p>
          <p className="text-justify text-neutral-700">
            2. Administratorem danych osobowych Użytkowników w rozumieniu Rozporządzenia Parlamentu
            Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (dalej: „RODO”) jest
            MediCard Spółka z o.o. z siedzibą w Warszawie.
          </p>
          <p className="text-justify text-neutral-700">
            3. Użytkownikiem jest każda osoba fizyczna posiadająca pełną zdolność do czynności
            prawnych lub działająca za zgodą i pod nadzorem przedstawiciela ustawowego, która
            utworzyła konto w Aplikacji.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
            § 2. Przetwarzanie szczególnych kategorii danych osobowych
          </h3>
          <p className="text-justify text-neutral-700">
            1. Przetwarzanie danych dotyczących zdrowia Użytkownika następuje na podstawie wyraźnej,
            dobrowolnej i świadomej zgody Użytkownika (art. 9 ust. 2 lit. a RODO) w celu
            elektronicznego gromadzenia, archiwizacji i organizacji dokumentacji medycznej.
          </p>
          <p className="text-justify text-neutral-700">
            2. Dane medyczne przechowywane w Aplikacji podlegają szyfrowaniu symetrycznemu w spoczynku
            oraz zabezpieczeniu protokołem TLS w trakcie transmisji sieciowej. Administrator stosuje
            środki techniczne i organizacyjne zapobiegające nieuprawnionemu dostępowi osób trzecich.
          </p>
          <p className="text-justify text-neutral-700">
            3. Dane medyczne Użytkownika nie są udostępniane podmiotom komercyjnym, zakładom
            ubezpieczeń ani podmiotom trzecim w celach reklamowych lub profilowania behawioralnego.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
            § 3. Upoważnienia do wglądu i udostępnianie danych osobom bliskim
          </h3>
          <p className="text-justify text-neutral-700">
            1. Za pośrednictwem zintegrowanego mechanizmu kryptograficznego kodu QR Użytkownik
            uprawniony jest do wygenerowania jednorazowego tokenu dostępowego dla wskazanego opiekuna
            lub osoby bliskiej.
          </p>
          <p className="text-justify text-neutral-700">
            2. Przyznanie dostępu w Aplikacji nie zastępuje sformalizowanego pełnomocnictwa medycznego
            ani oświadczenia woli, o którym mowa w art. 26 ust. 1 ustawy z dnia 6 listopada 2008 r.
            o prawach pacjenta i Rzeczniku Praw Pacjenta.
          </p>
          <p className="text-justify text-neutral-700">
            3. Użytkownik może w każdym czasie, ze skutkiem natychmiastowym, cofnąć udzielony dostęp
            poprzez usunięcie powiązania profilu w menu zarządzania kontami.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
            § 4. Prawa podmiotu danych (Realizacja uprawnień RODO)
          </h3>
          <p className="text-justify text-neutral-700">
            1. Użytkownikowi przysługuje prawo dostępu do treści swoich danych, ich sprostowania,
            ograniczenia przetwarzania, przeniesienia w ustrukturyzowanym formacie oraz prawo do
            żądania trwałego usunięcia danych („prawo do bycia zapomnianym”).
          </p>
          <p className="text-justify text-neutral-700">
            2. Trwałe usunięcie konta przez Użytkownika powoduje natychmiastowe, nieodwracalne
            skasowanie wpisów z pamięci lokalnej oraz z bazy danych Administratora.
          </p>
          <p className="text-justify text-neutral-700">
            3. Użytkownik ma prawo wniesienia skargi do organu nadzorczego – Prezesa Urzędu Ochrony
            Danych Osobowych (PUODO).
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
            § 5. Wyłączenie odpowiedzialności za diagnozę lekarską
          </h3>
          <p className="text-justify text-neutral-700">
            1. Aplikacja stanowi wyłącznie narzędzie ewidencyjno-organizacyjne służące do
            przechowywania kopii dokumentacji sporządzonej przez uprawnione podmioty lecznicze.
          </p>
          <p className="text-justify text-neutral-700">
            2. Żadne informacje, podsumowania, tagi ani przypomnienia generowane w Aplikacji nie
            stanowią świadczenia zdrowotnego, diagnozy lekarskiej ani porady medycznej w rozumieniu
            ustawy z dnia 15 kwietnia 2011 r. o działalności leczniczej. Wszelkie decyzje
            terapeutyczne wymagają konsultacji z lekarzem.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2 pb-6">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
            § 6. Postanowienia końcowe
          </h3>
          <p className="text-justify text-neutral-700">
            1. Prawem właściwym dla zobowiązań wynikających z korzystania z Aplikacji jest prawo
            Rzeczypospolitej Polskiej.
          </p>
          <p className="text-justify text-neutral-700">
            2. W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają odpowiednie
            przepisy Kodeksu cywilnego, ustawy o świadczeniu usług drogą elektroniczną oraz RODO.
          </p>
          <p className="text-justify text-neutral-700">
            3. Wszelkie spory rozstrzygane będą przez właściwy polski sąd powszechny.
          </p>
        </section>
      </div>
    </div>
  );
};
