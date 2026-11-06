import React, { useRef, useState } from 'react';
import type { SavedCard, Track } from '../types';
import { PLACEHOLDER_ARTWORK } from '../constants';
import type { AudioPreview } from '../hooks/useAudioPreview';
import { AlertIcon, HistoryIcon, SearchIcon, XIcon } from './Icons';
import Spinner from './Spinner';
import PreviewButton from './PreviewButton';
import SavedCardsGallery from './SavedCardsGallery';

interface SearchStepProps {
  initialQuery: string;
  results: Track[] | null;
  isSearching: boolean;
  error: string | null;
  onSearch: (query: string) => void;
  onSelect: (song: Track) => void;
  selectedId?: string;
  audio: AudioPreview;
  savedCards: SavedCard[];
  openingCardId: string | null;
  onOpenSaved: (card: SavedCard) => void;
  onDeleteSaved: (id: string) => void;
}

const RECENTS_KEY = 'recentSearches';
const MAX_RECENTS = 5;

function loadRecents(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENTS) : [];
  } catch {
    return [];
  }
}

function saveRecents(recents: string[]) {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
  } catch { /* storage unavailable */ }
}

const SearchStep: React.FC<SearchStepProps> = ({
  initialQuery,
  results,
  isSearching,
  error,
  onSearch,
  onSelect,
  selectedId,
  audio,
  savedCards,
  openingCardId,
  onOpenSaved,
  onDeleteSaved,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [recents, setRecents] = useState(loadRecents);
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    onSearch(trimmed);
    const next = [trimmed, ...recents.filter(r => r.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENTS);
    setRecents(next);
    saveRecents(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur(); // close the mobile keyboard so results are visible
    runSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const clearRecents = () => {
    setRecents([]);
    saveRecents([]);
  };

  return (
    <div>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Find a song</h2>
        <p className="text-gray-600 dark:text-brand-gray-100 mb-5">Search by song title, artist, or both.</p>
      </div>

      <form onSubmit={handleSubmit} role="search" className="max-w-xl mx-auto">
        <div className="flex items-stretch rounded-full bg-gray-100 dark:bg-brand-gray-300 overflow-hidden ring-2 ring-transparent focus-within:ring-brand-green transition-shadow">
          <div className="relative flex-grow">
            <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              dir="auto"
              enterKeyHint="search"
              aria-label="Song or artist"
              autoFocus={!results}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. Blinding Lights The Weeknd"
              className="w-full h-full pl-12 pr-10 py-3 bg-transparent focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-brand-gray-200"
                aria-label="Clear search"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-5 sm:px-7 bg-brand-green-dark text-white font-bold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[96px]"
          >
            {isSearching ? <Spinner label="Searching" /> : 'Search'}
          </button>
        </div>
      </form>

      {!results && !isSearching && recents.length > 0 && (
        <div className="max-w-xl mx-auto mt-4 flex flex-wrap items-center gap-2 text-sm">
          <HistoryIcon className="w-4 h-4 text-gray-400" />
          {recents.map(r => (
            <button
              key={r}
              onClick={() => runSearch(r)}
              className="px-3 py-1 rounded-full bg-gray-100 dark:bg-brand-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-200 text-gray-700 dark:text-gray-200"
            >
              {r}
            </button>
          ))}
          <button onClick={clearRecents} className="px-2 py-1 text-gray-500 hover:underline">
            Clear
          </button>
        </div>
      )}

      <div aria-live="polite" className="mt-8">
        {error && (
          <div className="flex flex-col items-center gap-3 text-center p-6 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
            <AlertIcon className="w-6 h-6" />
            <p>{error}</p>
            <button
              onClick={() => runSearch(query)}
              className="px-4 py-1.5 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {!error && isSearching && !results && <ResultsSkeleton />}

        {!error && results && results.length === 0 && !isSearching && (
          <p className="text-center text-gray-500 dark:text-brand-gray-100 py-8">
            No songs found. Try a different spelling or add the artist name.
          </p>
        )}

        {!error && results && results.length > 0 && (
          <ul
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 transition-opacity ${
              isSearching ? 'opacity-50' : ''
            }`}
            aria-label="Search results"
          >
            {results.map(song => (
              <li key={song.id} className="relative group/item">
                <PreviewButton
                  url={song.previewUrl}
                  title={song.name}
                  audio={audio}
                  size="sm"
                  className={`absolute top-4 right-4 z-10 transition-opacity ${
                    audio.playingUrl === song.previewUrl
                      ? 'opacity-100'
                      : 'opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100'
                  }`}
                />
                <button
                  onClick={() => onSelect(song)}
                  className={`w-full text-start group p-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-brand-gray-300 ${
                    song.id === selectedId ? 'bg-gray-100 dark:bg-brand-gray-300 ring-2 ring-brand-green' : ''
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 dark:bg-brand-gray-300 shadow">
                    <img
                      src={song.thumbnailUrl || PLACEHOLDER_ARTWORK}
                      onError={e => {
                        e.currentTarget.src = PLACEHOLDER_ARTWORK;
                      }}
                      alt=""
                      width={300}
                      height={300}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p dir="auto" className="mt-2 font-semibold text-sm truncate" title={song.name}>
                    {song.name}
                  </p>
                  <p dir="auto" className="text-xs text-gray-500 dark:text-brand-gray-100 truncate" title={song.artist}>
                    {song.artist}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SavedCardsGallery cards={savedCards} openingId={openingCardId} onOpen={onOpenSaved} onDelete={onDeleteSaved} />
    </div>
  );
};

const ResultsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4" aria-hidden="true">
    {Array.from({ length: 10 }, (_, i) => (
      <div key={i} className="p-2 animate-pulse">
        <div className="aspect-square rounded-lg bg-gray-200 dark:bg-brand-gray-300" />
        <div className="mt-2 h-3.5 w-4/5 rounded bg-gray-200 dark:bg-brand-gray-300" />
        <div className="mt-1.5 h-3 w-1/2 rounded bg-gray-200 dark:bg-brand-gray-300" />
      </div>
    ))}
  </div>
);

export default SearchStep;
