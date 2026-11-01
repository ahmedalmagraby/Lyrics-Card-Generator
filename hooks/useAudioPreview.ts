import { useCallback, useEffect, useRef, useState } from 'react';

export interface AudioPreview {
  /** URL of the clip that is playing (or loading), if any. */
  playingUrl: string | null;
  /** 0-1 progress of the playing clip. */
  progress: number;
  toggle: (url: string) => void;
  stop: () => void;
}

/** One shared <audio> element, so starting a preview stops the previous one. */
export function useAudioPreview(): AudioPreview {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const getAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'none';
      audio.volume = 0.8;
      audio.addEventListener('timeupdate', () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0));
      audio.addEventListener('ended', () => {
        setPlayingUrl(null);
        setProgress(0);
      });
      audio.addEventListener('error', () => {
        setPlayingUrl(null);
        setProgress(0);
      });
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlayingUrl(null);
    setProgress(0);
  }, []);

  const toggle = useCallback(
    (url: string) => {
      const audio = getAudio();
      if (playingUrl === url) {
        stop();
        return;
      }
      audio.src = url;
      setPlayingUrl(url);
      setProgress(0);
      audio.play().catch(err => {
        if ((err as Error).name !== 'AbortError') console.warn('Preview playback failed', err);
        setPlayingUrl(current => (current === url ? null : current));
      });
    },
    [playingUrl, stop]
  );

  useEffect(() => () => audioRef.current?.pause(), []);

  return { playingUrl, progress, toggle, stop };
}
