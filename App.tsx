import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppStep, CardLine, CardText, CustomizationOptions, LyricsResult, SavedCard, Track } from './types';
import { searchTracks } from './services/itunesService';
import { fetchLyrics } from './services/lyricsService';
import { loadSavedCards, newCardId, persistCards, upsertCard } from './services/galleryStore';
import { FONT_OPTIONS, FONT_SIZE_OPTIONS, GRADIENT_PRESETS, PRESET_COLORS } from './constants';
import { prefersLightText, vividColor } from './utils/color';
import { extractColors } from './utils/extractColors';
import { useAudioPreview } from './hooks/useAudioPreview';
import StepIndicator from './components/StepIndicator';
import SearchStep from './components/SearchStep';
import LyricsSelectStep from './components/LyricsSelectStep';
import CustomizeStep from './components/CustomizeStep';
import { ArrowLeftIcon, ArrowRightIcon, LogoIcon, MoonIcon, SunIcon } from './components/Icons';

const DEFAULT_CUSTOMIZATION: CustomizationOptions = {
  background: {
    type: 'solid',
    color: PRESET_COLORS[0],
    gradientFrom: GRADIENT_PRESETS[0].from,
    gradientTo: GRADIENT_PRESETS[0].to,
    angle: 45,
    blur: 28,
    dim: 0.45,
  },
  isTextLight: true,
  fontFamily: FONT_OPTIONS[0].className,
  fontSize: FONT_SIZE_OPTIONS[1].className,
  textEffect: 'none',
  textAlign: 'left',
  cardSize: 'classic',
  accentColor: PRESET_COLORS[0],
  highlightStyle: 'color',
};

const EMPTY_CARD_TEXT: CardText = { edits: {}, highlights: {}, caption: '' };

/** Fills in options added after a card was saved. */
const withDefaults = (c: CustomizationOptions): CustomizationOptions => ({
  ...DEFAULT_CUSTOMIZATION,
  ...c,
  background: { ...DEFAULT_CUSTOMIZATION.background, ...c.background },
});

const isAbort = (err: unknown) => err instanceof DOMException && err.name === 'AbortError';

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Follow the OS setting until the user picks a theme explicitly.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem('theme')) return;
      } catch { /* storage unavailable */ }
      setTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch { /* storage unavailable */ }
  };

  return [theme, toggle] as const;
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [step, setStep] = useState<AppStep>(AppStep.SEARCH);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selectedSong, setSelectedSong] = useState<Track | null>(null);
  const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  // Indices (not text) so duplicate lines are handled and song order is kept.
  const [selectedLineIndices, setSelectedLineIndices] = useState<number[]>([]);
  const lastClickedIndex = useRef<number | null>(null);

  const [artworkColors, setArtworkColors] = useState<string[]>([]);
  const [customization, setCustomization] = useState<CustomizationOptions>(DEFAULT_CUSTOMIZATION);
  const [cardText, setCardText] = useState<CardText>(EMPTY_CARD_TEXT);
  // Saving again updates the same gallery entry until another song is picked.
  const [cardId, setCardId] = useState(newCardId);
  // A reopened card keeps its own colors instead of the artwork defaults.
  const keepCustomization = useRef(false);

  const [savedCards, setSavedCards] = useState<SavedCard[]>(loadSavedCards);
  const [openingCardId, setOpeningCardId] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const audio = useAudioPreview();

  const searchAbort = useRef<AbortController | null>(null);
  const lyricsAbort = useRef<AbortController | null>(null);

  // --- Navigation (synced with browser history so the back button steps back) ---

  const goForward = (next: AppStep) => {
    window.history.pushState({ step: next }, '');
    setStep(next);
  };

  const goBackTo = (target: AppStep) => {
    if (target < step) window.history.go(target - step);
  };

  useEffect(() => {
    window.history.replaceState({ step: AppStep.SEARCH }, '');
  }, []);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      let next: AppStep = e.state?.step ?? AppStep.SEARCH;
      // Don't land on a step whose data is gone (e.g. after going forward again).
      if (next >= AppStep.SELECT_LYRICS && !selectedSong) next = AppStep.SEARCH;
      if (next === AppStep.CUSTOMIZE && selectedLineIndices.length === 0) next = AppStep.SELECT_LYRICS;
      setStep(next);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [selectedSong, selectedLineIndices.length]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // --- Data loading ---

  const handleSearch = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    searchAbort.current?.abort();
    const controller = new AbortController();
    searchAbort.current = controller;

    setQuery(trimmed);
    setIsSearching(true);
    setSearchError(null);
    try {
      setSearchResults(await searchTracks(trimmed, controller.signal));
    } catch (err) {
      if (isAbort(err)) return;
      console.error(err);
      setSearchError('Could not reach the song search. Check your connection and try again.');
    } finally {
      if (searchAbort.current === controller) setIsSearching(false);
    }
  };

  const loadLyrics = useCallback(async (song: Track) => {
    lyricsAbort.current?.abort();
    const controller = new AbortController();
    lyricsAbort.current = controller;

    setIsLoadingLyrics(true);
    setLyricsError(null);
    setLyrics(null);
    try {
      const result = await fetchLyrics(song, controller.signal);
      setLyrics(result);
    } catch (err) {
      if (isAbort(err)) return;
      console.error(err);
      setLyricsError('Could not load lyrics. Check your connection and try again.');
    } finally {
      if (lyricsAbort.current === controller) setIsLoadingLyrics(false);
    }
  }, []);

  const handleSelectSong = (song: Track) => {
    if (audio.playingUrl && audio.playingUrl !== song.previewUrl) audio.stop();
    if (song.id !== selectedSong?.id) {
      setSelectedSong(song);
      setSelectedLineIndices([]);
      setCardText(EMPTY_CARD_TEXT);
      setCardId(newCardId());
      lastClickedIndex.current = null;
      loadLyrics(song);
    } else if (lyricsError) {
      loadLyrics(song);
    }
    goForward(AppStep.SELECT_LYRICS);
  };

  // Default the card colors to the album artwork's palette.
  useEffect(() => {
    if (!selectedSong?.artworkUrl) return;
    const keep = keepCustomization.current;
    keepCustomization.current = false;
    let cancelled = false;
    setArtworkColors([]);
    extractColors(selectedSong.artworkUrl).then(colors => {
      if (cancelled || colors.length === 0) return;
      setArtworkColors(colors);
      if (keep) return;
      setCustomization(c => ({
        ...c,
        background: {
          ...c.background,
          type: 'solid',
          color: colors[0],
          gradientFrom: colors[0],
          gradientTo: colors[1] ?? colors[0],
        },
        isTextLight: prefersLightText(colors[0]),
        accentColor: vividColor(colors.slice(1), '#1DB954'),
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [selectedSong]);

  // --- Lyrics selection ---

  const handleLyricsSelect = (index: number, extendRange: boolean) => {
    // Read the anchor now: the updater below runs later, after the ref is overwritten.
    const anchor = lastClickedIndex.current;
    setSelectedLineIndices(prev => {
      let next: number[];
      if (extendRange && anchor !== null && anchor !== index) {
        const [from, to] = anchor < index ? [anchor, index] : [index, anchor];
        const range = Array.from({ length: to - from + 1 }, (_, i) => from + i);
        next = [...new Set([...prev, ...range])];
      } else {
        next = prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index];
      }
      return next.sort((a, b) => a - b);
    });
    lastClickedIndex.current = index;
  };

  const originals = useMemo(() => {
    const map: Record<number, string> = {};
    for (const i of selectedLineIndices) if (lyrics?.lines[i]) map[i] = lyrics.lines[i].line;
    return map;
  }, [lyrics, selectedLineIndices]);

  const cardLines = useMemo<CardLine[]>(
    () =>
      selectedLineIndices
        .filter(i => i in originals)
        .map(i => ({ id: i, text: cardText.edits[i] ?? originals[i], highlights: cardText.highlights[i] ?? [] })),
    [selectedLineIndices, originals, cardText]
  );

  // --- Saved cards ---

  const handleSaveCard = (thumbnail: string) => {
    if (!selectedSong) return;
    const card: SavedCard = {
      id: cardId,
      savedAt: Date.now(),
      song: selectedSong,
      lineIndices: selectedLineIndices,
      lineTexts: selectedLineIndices.map(i => originals[i] ?? ''),
      cardText,
      customization,
      thumbnail,
    };
    setSavedCards(cards => persistCards(upsertCard(cards, card)));
  };

  const handleDeleteCard = (id: string) => setSavedCards(cards => persistCards(cards.filter(c => c.id !== id)));

  const handleOpenCard = async (card: SavedCard) => {
    if (openingCardId) return;
    setOpeningCardId(card.id);
    setGalleryError(null);
    audio.stop();
    try {
      const result = await fetchLyrics(card.song);
      // If the lyrics source changed since saving, keep the saved wording as edits.
      const edits = { ...card.cardText.edits };
      card.lineIndices.forEach((index, n) => {
        if (!(index in edits) && result.lines[index]?.line !== card.lineTexts[n]) edits[index] = card.lineTexts[n];
      });
      const indices = card.lineIndices.filter(i => i < result.lines.length);
      if (indices.length === 0) throw new Error('Saved lines no longer exist');

      lyricsAbort.current?.abort();
      keepCustomization.current = true;
      setSelectedSong({ ...card.song }); // new object so the artwork-color effect always runs (and clears the flag)
      setLyrics(result);
      setLyricsError(null);
      setIsLoadingLyrics(false);
      setSelectedLineIndices(indices);
      setCardText({ ...card.cardText, edits });
      setCustomization(withDefaults(card.customization));
      setCardId(card.id);
      lastClickedIndex.current = null;
      window.history.pushState({ step: AppStep.SELECT_LYRICS }, '');
      goForward(AppStep.CUSTOMIZE);
    } catch (err) {
      console.error(err);
      setGalleryError('Could not reopen that card. Check your connection and try again.');
    } finally {
      setOpeningCardId(null);
    }
  };

  // --- Render ---

  const renderStep = () => {
    switch (step) {
      case AppStep.SEARCH:
        return (
          <>
            <SearchStep
              initialQuery={query}
              results={searchResults}
              isSearching={isSearching}
              error={searchError}
              onSearch={handleSearch}
              onSelect={handleSelectSong}
              selectedId={selectedSong?.id}
              audio={audio}
              savedCards={savedCards}
              openingCardId={openingCardId}
              onOpenSaved={handleOpenCard}
              onDeleteSaved={handleDeleteCard}
            />
            {galleryError && (
              <p role="alert" className="mt-3 text-sm text-center text-red-600 dark:text-red-400">
                {galleryError}
              </p>
            )}
          </>
        );
      case AppStep.SELECT_LYRICS:
        return selectedSong && (
          <LyricsSelectStep
            song={selectedSong}
            audio={audio}
            lyrics={lyrics}
            isLoading={isLoadingLyrics}
            error={lyricsError}
            onRetry={() => loadLyrics(selectedSong)}
            selectedIndices={selectedLineIndices}
            onLyricSelect={handleLyricsSelect}
            onClear={() => setSelectedLineIndices([])}
          />
        );
      case AppStep.CUSTOMIZE:
        return selectedSong && (
          <CustomizeStep
            song={selectedSong}
            lines={cardLines}
            originals={originals}
            cardText={cardText}
            setCardText={setCardText}
            customization={customization}
            setCustomization={setCustomization}
            artworkColors={artworkColors}
            onSave={handleSaveCard}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-brand-gray-300 bg-white/85 dark:bg-brand-gray-400/85 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
          <a
            href={import.meta.env.BASE_URL}
            onClick={e => {
              if (step === AppStep.SEARCH) return;
              e.preventDefault();
              goBackTo(AppStep.SEARCH);
            }}
            className="flex items-center gap-2.5 rounded-md"
          >
            <LogoIcon className="w-8 h-8 text-brand-green" />
            <span className="text-lg md:text-xl font-bold">Lyrics Card Generator</span>
          </a>
          <button
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-brand-gray-300 transition-colors"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-10">
        <StepIndicator currentStep={step} onStepClick={goBackTo} />

        <div className="mt-6 md:mt-8 bg-white dark:bg-brand-gray-400 rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/5">
          <div key={step} className="p-4 sm:p-6 animate-fade-in">
            {renderStep()}
          </div>

          {step > AppStep.SEARCH && (
            <div className="sticky bottom-0 z-10 px-4 sm:px-6 py-4 flex justify-between items-center gap-3 border-t border-gray-200 dark:border-brand-gray-300 bg-white/90 dark:bg-brand-gray-400/90 backdrop-blur rounded-b-2xl">
              <button
                onClick={() => goBackTo(step - 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-brand-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-200 transition-colors"
              >
                <ArrowLeftIcon /> Back
              </button>

              {step === AppStep.SELECT_LYRICS && (
                <button
                  onClick={() => goForward(AppStep.CUSTOMIZE)}
                  disabled={selectedLineIndices.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-white bg-brand-green-dark hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRightIcon />
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-500 dark:text-brand-gray-100">
        Song data from the iTunes Search API · Lyrics from{' '}
        <a href="https://lrclib.net" target="_blank" rel="noreferrer" className="underline hover:text-brand-green">
          LRCLIB
        </a>
      </footer>
    </div>
  );
}
