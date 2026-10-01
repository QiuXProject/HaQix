import { useState, useMemo } from 'react';
import { ArrowLeft, Search, PlusCircle, CheckCircle, Mail, Sparkles, Send, Filter } from 'lucide-react';
import { HUGE_GAMES_DATABASE, CatalogGame } from './gamesData';

interface RequestGameModalProps {
  game: CatalogGame | { id: string; title: string; genre: string; year: number; developer?: string };
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestGameModal({ game, onClose, onSuccess }: RequestGameModalProps) {
  const [userEmail, setUserEmail] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [preferredVersion, setPreferredVersion] = useState('Najnowsza stabilna wersja (ze wszystkimi DLC)');
  const [sendingMethod, setSendingMethod] = useState<'mailto' | 'direct'>('mailto');

  const subject = encodeURIComponent(`[HAQIX - Prośba o dodanie gry] ${game.title}`);
  const bodyText = `Cześć załogo HAQIX,

Chciałbym zgłosić prośbę o dodanie do serwisu HAQIX następującej gry:

🎮 Nazwa gry: ${game.title}
🏷️ Gatunek: ${game.genre}
📅 Rok / Wersja: ${game.year || 'Brak danych'}
🏢 Deweloper/Wydawca: ${game.developer || 'Nieznany'}
📦 Preferowana wersja: ${preferredVersion}
📝 Dodatkowe uwagi: ${additionalNotes || 'Brak'}
👤 Mój kontakt: ${userEmail || 'Anonim'}

Pozdrawiam i dziękuję za Waszą pracę!`;

  const mailtoLink = `mailto:hxsupport@proton.me?subject=${subject}&body=${encodeURIComponent(bodyText)}`;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingMethod === 'mailto') {
      window.location.href = mailtoLink;
    }
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-xl bg-[#0f0f0f] border border-[#2a2a2a] rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
        {/* Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#e21a22] rounded-full blur-[90px] opacity-20 pointer-events-none" />

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#e21a22]/10 border border-[#e21a22]/30 flex items-center justify-center text-[#e21a22]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black font-montserrat">Potwierdź Zgłoszenie Gry</h3>
              <p className="text-xs text-[#888]">Wiadomość trafi bezpośrednio na: <span className="text-[#e21a22] font-semibold">hxsupport@proton.me</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Podsumowanie wybranej gry */}
        <div className="bg-[#161616] border border-[#282828] rounded-2xl p-4 mb-6">
          <div className="text-[11px] uppercase tracking-wider text-[#e21a22] font-black font-montserrat mb-1">Wybrany tytuł:</div>
          <div className="text-lg font-black font-montserrat text-white">{game.title}</div>
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-[#999]">
            <span className="bg-[#222] px-2.5 py-1 rounded-lg border border-[#333]">{game.genre}</span>
            {game.year && <span className="bg-[#222] px-2.5 py-1 rounded-lg border border-[#333]">{game.year}</span>}
            {game.developer && <span className="bg-[#222] px-2.5 py-1 rounded-lg border border-[#333]">{game.developer}</span>}
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#aaa] uppercase tracking-wider mb-2 font-montserrat">
              Preferowane wydanie / wersja
            </label>
            <select
              value={preferredVersion}
              onChange={(e) => setPreferredVersion(e.target.value)}
              className="w-full bg-[#161616] border border-[#282828] focus:border-[#e21a22] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
            >
              <option value="Najnowsza stabilna wersja (ze wszystkimi DLC)">Najnowsza stabilna wersja (ze wszystkimi DLC)</option>
              <option value="Edycja Deluxe / Ultimate / GOTY">Edycja Deluxe / Ultimate / GOTY</option>
              <option value="Repack (FitGirl / DODI - mniejszy rozmiar)">Repack (FitGirl / DODI - mniejszy rozmiar)</option>
              <option value="Wersja bez instalacji (Portable / Direct Play)">Wersja bez instalacji (Portable)</option>
              <option value="Wersja z polską wersją językową (Napisy/Dubbing)">Wersja z pełnym spolszczeniem</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#aaa] uppercase tracking-wider mb-2 font-montserrat">
              Twój E-mail (opcjonalnie do powiadomienia)
            </label>
            <input
              type="email"
              placeholder="np. jan.kowalski@gmail.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-[#161616] border border-[#282828] focus:border-[#e21a22] rounded-xl px-4 py-3 text-sm text-white placeholder-[#555] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#aaa] uppercase tracking-wider mb-2 font-montserrat">
              Dodatkowe uwagi / linki (opcjonalnie)
            </label>
            <textarea
              rows={2}
              placeholder="Np. zależy mi na konkretnej aktualizacji lub spolszczeniu..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full bg-[#161616] border border-[#282828] focus:border-[#e21a22] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-[#2a2a2a] text-[#aaa] hover:text-white hover:bg-[#1a1a1a] transition-all font-semibold text-sm"
            >
              Anuluj
            </button>
            <div className="flex gap-2">
              <button
                type="submit"
                onClick={() => setSendingMethod('mailto')}
                className="flex items-center gap-2 bg-[#e21a22] hover:bg-[#ff2d35] text-white px-6 py-3 rounded-xl font-black font-montserrat text-sm transition-all shadow-lg shadow-red-950/40 hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
                WYŚLIJ E-MAIL DO SUPPORTU
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddGamePage({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedGame, setSelectedGame] = useState<CatalogGame | null>(null);
  const [customGameTitle, setCustomGameTitle] = useState('');
  const [customGameGenre] = useState('Inne / Custom');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successGameTitle, setSuccessGameTitle] = useState('');

  // Unikalne gatunki
  const genres = useMemo(() => {
    const set = new Set<string>();
    HUGE_GAMES_DATABASE.forEach((g) => {
      const main = g.genre.split('/')[0].trim();
      set.add(main);
    });
    return ['all', ...Array.from(set)];
  }, []);

  // Filtrowanie z ogromnej bazy
  const filteredGames = useMemo(() => {
    return HUGE_GAMES_DATABASE.filter((game) => {
      const matchSearch =
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (game.developer && game.developer.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchGenre =
        selectedGenre === 'all' ||
        game.genre.toLowerCase().includes(selectedGenre.toLowerCase());

      return matchSearch && matchGenre;
    });
  }, [searchQuery, selectedGenre]);

  const handleSelectGame = (game: CatalogGame) => {
    setSelectedGame(game);
  };

  const handleSuccess = (title: string) => {
    setSelectedGame(null);
    setShowCustomModal(false);
    setSuccessGameTitle(title);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 6000);
  };

  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-out] pb-24">
      {/* Toast sukcesu */}
      {showSuccessToast && (
        <div className="fixed top-8 right-8 z-50 bg-[#0d2818] border border-[#2d6a4f] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-[fadeSlideDown_0.4s_ease-out]">
          <CheckCircle className="w-7 h-7 text-[#52b788]" />
          <div>
            <div className="font-bold text-sm font-montserrat">Prośba została pomyślnie wysłana!</div>
            <div className="text-xs text-[#b7e4c7]">Zgłoszenie o grę <span className="font-bold text-white">„{successGameTitle}”</span> trafiło do <span className="underline">hxsupport@proton.me</span></div>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-[#888] hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Nawigacja powrotna */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#a3a3a3] hover:text-white transition-colors mb-6 group cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        <span className="font-montserrat font-medium text-sm">Wróć do strony głównej</span>
      </button>

      {/* Hero sekcji Dodaj Grę */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#121212] via-[#1a0f0f] to-[#121212] border border-[#262626] rounded-3xl p-8 md:p-12 mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e21a22] rounded-full blur-[140px] opacity-15 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#e21a22]/10 border border-[#e21a22]/30 px-3.5 py-1.5 rounded-full text-xs font-black font-montserrat text-[#e21a22] uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Centrum Życzeń & Propozycji Społeczności
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-montserrat tracking-tight leading-tight mb-4">
            Zaproponuj nową grę na <span className="text-[#e21a22]">HAQIX</span>
          </h1>
          <p className="text-[#a3a3a3] text-sm md:text-base leading-relaxed">
            Brakuje Twojej ulubionej gry? Wybierz ją z naszej ogromnej bazy poniżej lub wpisz własny tytuł, a po kliknięciu <strong className="text-white">„Dalej / Wyślij”</strong> wygenerujemy gotową prośbę bezpośrednio do naszego supportu na adres <span className="text-[#e21a22] font-semibold">hxsupport@proton.me</span>.
          </p>
        </div>
      </div>

      {/* Pasek wyszukiwania w bazie gier */}
      <div className="bg-[#0e0e0e] border border-[#222] rounded-2xl p-5 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              type="text"
              placeholder="Wyszukaj grę w bazie (np. GTA 5, Cyberpunk, Gothic, Call of Duty, FIFA, Sims)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-[#2a2a2a] focus:border-[#e21a22] rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-[#555] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#777] hover:text-white"
              >
                Wyczyść
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-[#777] shrink-0 hidden sm:block" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-xs text-[#ccc] focus:outline-none focus:border-[#e21a22] font-medium"
            >
              <option value="all">Wszystkie gatunki ({HUGE_GAMES_DATABASE.length})</option>
              {genres.filter(g => g !== 'all').map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Szybkie tagi najpopularniejszych */}
        <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-[#1a1a1a] text-xs">
          <span className="text-[#666] font-semibold text-[11px] uppercase tracking-wider font-montserrat">Popularne prośby:</span>
          {['Grand Theft Auto V (GTA 5)', 'Grand Theft Auto VI (GTA 6)', 'Wiedźmin 3', 'Minecraft', 'Call of Duty: Black Ops 6', 'EA SPORTS FC 25', 'Forza Horizon 5'].map((pop) => (
            <button
              key={pop}
              onClick={() => setSearchQuery(pop.split(' ')[0])}
              className="bg-[#181818] hover:bg-[#252525] border border-[#282828] text-[#aaa] hover:text-white px-3 py-1 rounded-lg transition-colors text-[11px]"
            >
              {pop}
            </button>
          ))}
        </div>
      </div>

      {/* Informacja o liczbie wyników + przycisk dodania niestandardowej gry */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-[#777] font-montserrat">
          Znaleziono <span className="text-[#e21a22] font-black">{filteredGames.length}</span> gier gotowych do zgłoszenia
        </div>
        <button
          onClick={() => setShowCustomModal(true)}
          className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#e21a22] text-[#ddd] hover:text-white px-4 py-2 rounded-xl text-xs font-bold font-montserrat transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#e21a22]" />
          Nie ma Twojej gry na liście? Wpisz własny tytuł
        </button>
      </div>

      {/* Ogromna Lista / Siatka Gier */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="group relative bg-[#101010] hover:bg-[#161616] border border-[#202020] hover:border-[#e21a22]/60 rounded-2xl p-5 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-black tracking-widest uppercase bg-[#1c1c1c] text-[#999] px-2.5 py-0.5 rounded-md border border-[#2a2a2a]">
                  {game.genre}
                </span>
                {game.popular && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#e21a22] bg-[#e21a22]/10 px-2 py-0.5 rounded-md border border-[#e21a22]/20">
                    ★ HIT
                  </span>
                )}
              </div>
              <h3 className="font-montserrat font-bold text-base text-white group-hover:text-[#e21a22] transition-colors leading-snug mb-1">
                {game.title}
              </h3>
              <p className="text-xs text-[#666] font-medium">
                {game.developer ? `${game.developer} • ` : ''}{game.year}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
              <span className="text-[11px] text-[#777]">Gotowy szablon zgłoszenia</span>
              <button
                onClick={() => handleSelectGame(game)}
                className="flex items-center gap-1.5 bg-[#e21a22] hover:bg-[#ff2d35] text-white px-4 py-2 rounded-xl text-xs font-black font-montserrat transition-all shadow-md shadow-red-950/30 group-hover:scale-105 active:scale-95"
              >
                <span>Dalej</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-16 bg-[#101010] border border-[#202020] rounded-3xl p-8">
          <p className="text-lg font-bold text-[#888] mb-2 font-montserrat">Nie znaleziono gry „{searchQuery}” na liście</p>
          <p className="text-xs text-[#555] mb-6">Możesz zgłosić dowolny inny tytuł używając formularza własnej gry.</p>
          <button
            onClick={() => {
              setCustomGameTitle(searchQuery);
              setShowCustomModal(true);
            }}
            className="inline-flex items-center gap-2 bg-[#e21a22] hover:bg-[#ff2d35] text-white px-6 py-3 rounded-xl text-sm font-black font-montserrat transition-all shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            Zgłoś „{searchQuery || 'Własną Grę'}” do hxsupport@proton.me
          </button>
        </div>
      )}

      {/* Modal dla wybranej gry z listy */}
      {selectedGame && (
        <RequestGameModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onSuccess={() => handleSuccess(selectedGame.title)}
        />
      )}

      {/* Modal dla własnego tytułu */}
      {showCustomModal && (
        <RequestGameModal
          game={{
            id: 'custom',
            title: customGameTitle || 'Własna Propozycja Gry',
            genre: customGameGenre,
            year: new Date().getFullYear(),
            developer: 'Zgłoszenie Użytkownika',
          }}
          onClose={() => setShowCustomModal(false)}
          onSuccess={() => handleSuccess(customGameTitle || 'Własna Gra')}
        />
      )}
    </div>
  );
}
