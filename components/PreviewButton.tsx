import React from 'react';
import type { AudioPreview } from '../hooks/useAudioPreview';
import { PauseIcon, PlayIcon } from './Icons';

interface PreviewButtonProps {
  url?: string;
  title: string;
  audio: AudioPreview;
  size?: 'sm' | 'md';
  /** Include a position utility (e.g. `absolute ...`); defaults to `relative`. */
  className?: string;
}

/** Play/pause for a song's 30-second preview, with a progress ring while playing. */
const PreviewButton: React.FC<PreviewButtonProps> = ({ url, title, audio, size = 'md', className = 'relative' }) => {
  if (!url) return null;
  const playing = audio.playingUrl === url;
  const box = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  const r = 46;
  const circumference = 2 * Math.PI * r;

  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation();
        audio.toggle(url);
      }}
      aria-label={playing ? `Pause preview of ${title}` : `Play preview of ${title}`}
      aria-pressed={playing}
      className={`${box} shrink-0 rounded-full flex items-center justify-center bg-brand-green-dark text-white shadow-lg hover:bg-green-800 hover:scale-105 transition ${className}`}
    >
      {playing && (
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - audio.progress)}
          />
        </svg>
      )}
      {playing ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
    </button>
  );
};

export default PreviewButton;
