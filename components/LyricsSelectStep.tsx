import React, { useMemo, useState } from 'react';
import type { LyricsResult, Track } from '../types';
import { PLACEHOLDER_ARTWORK, RECOMMENDED_MAX_LINES } from '../constants';
import type { AudioPreview } from '../hooks/useAudioPreview';
import { AlertIcon, CheckIcon, SearchIcon } from './Icons';
import Spinner from './Spinner';
import PreviewButton from './PreviewButton';

interface LyricsSelectStepProps {
  song: Track;
  audio: AudioPreview;
  lyrics: LyricsResult | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  selectedIndices: number[];
  onLyricSelect: (index: number, extendRange: boolean) => void;
  onClear: () => void;
}

const LyricsSelectStep: React.FC<LyricsSelectStepProps> = ({
  song,
  audio,
  lyrics,
  isLoading,
  error,
  onRetry,
  selectedIndices,
  onLyricSelect,
  onClear,
}) => {
  const [filter, setFilter] = useState('');
  const selected = useMemo(() => new Set(selectedIndices), [selectedIndices]);

  const visibleLines = useMemo(() => {
    const lines = (lyrics?.lines ?? []).map((line, index) => ({ ...line, index }));
    const f = filter.trim().toLowerCase();
    return f ? lines.filter(l => l.line.toLowerCase().includes(f)) : lines;
  }, [lyrics, filter]);

  const hasLines = !!lyrics && lyrics.lines.length > 0;

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <img
          src={song.thumbnailUrl || PLACEHOLDER_ARTWORK}
          alt=""
          width={64}
          height={64}
          className="w-16 h-16 rounded-lg object-cover shadow shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold truncate">{song.name}</h2>
          <p className="text-gray-600 dark:text-brand-gray-100 truncate">{song.artist}</p>
        </div>
        <PreviewButton url={song.previewUrl} title={song.name} audio={audio} />
      </div>

      <div aria-live="polite">
        {isLoading && (
          <div className="flex flex-col justify-center items-center gap-3 h-48 text-brand-green">
            <Spinner className="w-8 h-8" label="Loading lyrics" />
            <span className="text-sm text-gray-500 dark:text-brand-gray-100">Finding lyrics…</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center gap-3 text-center p-6 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
            <AlertIcon className="w-6 h-6" />
            <p>{error}</p>
            <button onClick={onRetry} className="px-4 py-1.5 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700">
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && lyrics && !hasLines && (
          <div className="text-center py-10 px-4 text-gray-600 dark:text-brand-gray-100">
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {lyrics.instrumental ? 'This track is instrumental' : 'No lyrics found for this song'}
            </p>
            <p className="mt-1">Go back and pick another version or song.</p>
          </div>
        )}
      </div>

      {!isLoading && !error && hasLines && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="relative flex-1">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Find a line…"
                aria-label="Filter lyrics"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-100 dark:bg-brand-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 text-sm">
              <span className="text-gray-600 dark:text-brand-gray-100" aria-live="polite">
                {selectedIndices.length === 0
                  ? 'Tap lines to select'
                  : `${selectedIndices.length} line${selectedIndices.length === 1 ? '' : 's'} selected`}
              </span>
              {selectedIndices.length > 0 && (
                <button onClick={onClear} className="font-semibold text-brand-green-dark dark:text-brand-green hover:underline">
                  Clear
                </button>
              )}
            </div>
          </div>

          <p className="hidden sm:block text-xs text-gray-500 dark:text-brand-gray-100 mb-3">
            Tip: Shift-click to select a range of lines.
            {!lyrics.synced && ' These lyrics are unsynced, so line breaks may differ from the recording.'}
          </p>

          {selectedIndices.length > RECOMMENDED_MAX_LINES && (
            <p className="mb-3 text-sm rounded-lg px-3 py-2 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              {selectedIndices.length} lines will make a tall card. Fewer lines usually look better.
            </p>
          )}

          <ul className="max-h-[55vh] overflow-y-auto -mx-1 px-1 py-1 space-y-1 custom-scrollbar">
            {visibleLines.map(({ line, index }) => {
              const isSelected = selected.has(index);
              return (
                <li key={index}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={e => onLyricSelect(index, e.shiftKey)}
                    className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-lg text-base sm:text-lg transition-colors ${
                      isSelected
                        ? 'bg-brand-green-dark text-white'
                        : 'bg-gray-50 dark:bg-brand-gray-300/60 hover:bg-gray-100 dark:hover:bg-brand-gray-300'
                    }`}
                  >
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-white bg-white text-brand-green-dark' : 'border-gray-300 dark:border-brand-gray-200'
                      }`}
                    >
                      {isSelected && <CheckIcon className="w-3 h-3" />}
                    </span>
                    <span>{line}</span>
                  </button>
                </li>
              );
            })}
            {visibleLines.length === 0 && (
              <li className="text-center text-gray-500 dark:text-brand-gray-100 py-6">No lines match “{filter}”.</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default LyricsSelectStep;
