import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { LyricsResult, Track } from '../types';
import { PLACEHOLDER_ARTWORK, RECOMMENDED_MAX_LINES } from '../constants';
import type { AudioPreview } from '../hooks/useAudioPreview';
import { parseManualLyrics } from '../services/lyricsService';
import { AlertIcon, CheckIcon, SearchIcon } from './Icons';
import Spinner from './Spinner';
import PreviewButton from './PreviewButton';

interface LyricsSelectStepProps {
  song: Track;
  audio: AudioPreview;
  lyrics: LyricsResult | null;
  isLoading: boolean;
  error: string | null;
  notice?: string | null;
  onRetry: () => void;
  onUseFoundLyrics: () => void;
  selectedIndices: number[];
  onLyricSelect: (index: number, extendRange: boolean) => void;
  onClear: () => void;
  onManualLyrics: (text: string) => void;
  onEditingChange: (open: boolean) => void;
}

const LyricsSelectStep: React.FC<LyricsSelectStepProps> = ({
  song,
  audio,
  lyrics,
  isLoading,
  error,
  notice,
  onRetry,
  onUseFoundLyrics,
  selectedIndices,
  onLyricSelect,
  onClear,
  onManualLyrics,
  onEditingChange,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('');
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [manualText, setManualText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selected = useMemo(() => new Set(selectedIndices), [selectedIndices]);

  useEffect(() => {
    setFilter('');
  }, [lyrics]);

  useEffect(() => {
    onEditingChange(isManualFormOpen);
    return () => {
      onEditingChange(false);
    };
  }, [isManualFormOpen, onEditingChange]);

  useEffect(() => {
    if (isManualFormOpen && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isManualFormOpen]);

  const handleOpenManualForm = () => {
    setManualText(lyrics?.manual ? lyrics.lines.map(l => l.line).join('\n') : '');
    setIsManualFormOpen(true);
  };

  const handleCancelManual = () => {
    setIsManualFormOpen(false);
    rootRef.current?.focus();
  };

  const hasUsableLine = useMemo(() => parseManualLyrics(manualText).lines.length > 0, [manualText]);

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasUsableLine) return;
    onManualLyrics(manualText);
    setIsManualFormOpen(false);
    rootRef.current?.focus();
  };

  const visibleLines = useMemo(() => {
    const lines = (lyrics?.lines ?? []).map((line, index) => ({ ...line, index }));
    const f = filter.trim().toLowerCase();
    return f ? lines.filter(l => l.line.toLowerCase().includes(f)) : lines;
  }, [lyrics, filter]);

  const hasLines = !!lyrics && lyrics.lines.length > 0;

  return (
    <div ref={rootRef} tabIndex={-1} className="focus:outline-none">
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

      {isManualFormOpen ? (
        <form onSubmit={handleSaveManual} className="space-y-4">
          <div>
            <label
              htmlFor="manual-lyrics-input"
              className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-100"
            >
              Lyrics (one line per row)
            </label>
            <textarea
              id="manual-lyrics-input"
              ref={textareaRef}
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              maxLength={20000}
              rows={10}
              placeholder="Paste or type lyrics here…"
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-brand-gray-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-brand-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-green font-sans text-sm sm:text-base resize-y"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelManual}
              className="px-5 py-2 rounded-full font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-brand-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasUsableLine}
              className="px-5 py-2 rounded-full font-semibold text-white bg-brand-green-dark hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <>
          <div aria-live="polite">
            {isLoading && !hasLines && (
              <div className="flex flex-col justify-center items-center gap-3 h-48 text-brand-green">
                <Spinner className="w-8 h-8" label="Loading lyrics" />
                <span className="text-sm text-gray-500 dark:text-brand-gray-100">Finding lyrics…</span>
              </div>
            )}

            {!isLoading && error && (
              <div className="flex flex-col items-center gap-3 text-center p-6 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                <AlertIcon className="w-6 h-6" />
                <p>{error}</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={onRetry}
                    className="px-4 py-1.5 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenManualForm}
                    className="px-4 py-1.5 rounded-full font-semibold border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Enter lyrics manually
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !error && lyrics && !hasLines && (
              <div className="text-center py-10 px-4 text-gray-600 dark:text-brand-gray-100">
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {lyrics.instrumental ? 'This track is instrumental' : 'No lyrics found for this song'}
                </p>
                <p className="mt-1">Paste or enter your own lyrics, or go back and pick another version or song.</p>
                <button
                  type="button"
                  onClick={handleOpenManualForm}
                  className="mt-4 px-5 py-2.5 rounded-full font-bold text-white bg-brand-green-dark hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  Enter lyrics
                </button>
              </div>
            )}
          </div>

          {hasLines && (
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
                    <button
                      type="button"
                      onClick={onClear}
                      className="font-semibold text-brand-green-dark dark:text-brand-green hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-3 text-xs text-gray-500 dark:text-brand-gray-100">
                <p className="hidden sm:block">
                  Tip: Shift-click to select a range of lines.
                  {!lyrics.manual && !lyrics.synced && ' These lyrics are unsynced, so line breaks may differ from the recording.'}
                </p>
                <div className="flex items-center gap-3 ml-auto sm:ml-0">
                  {lyrics.manual ? (
                    <>
                      <button
                        type="button"
                        onClick={handleOpenManualForm}
                        className="py-1 font-medium text-brand-green-dark dark:text-brand-green hover:underline focus:outline-none focus:ring-1 focus:ring-brand-green rounded"
                      >
                        Edit lyrics
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={onUseFoundLyrics}
                        className="py-1 font-medium text-gray-600 dark:text-brand-gray-100 hover:underline focus:outline-none focus:ring-1 focus:ring-brand-green rounded disabled:opacity-50"
                      >
                        {isLoading ? 'Finding lyrics…' : 'Use found lyrics'}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenManualForm}
                      className="py-1 font-medium text-brand-green-dark dark:text-brand-green hover:underline focus:outline-none focus:ring-1 focus:ring-brand-green rounded"
                    >
                      Use your own lyrics
                    </button>
                  )}
                </div>
              </div>

              {notice && (
                <p
                  role="status"
                  className="mb-3 text-sm rounded-lg px-3 py-2 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                >
                  {notice}
                </p>
              )}

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
        </>
      )}
    </div>
  );
};

export default LyricsSelectStep;
