import React, { useEffect, useState } from 'react';
import type { Track } from '../../types';
import { cardFilename } from '../../utils/filename';
import { canCopyImage, canShareFiles, downloadBlob, renderThumbnail, renderToBlob } from '../../utils/exportImage';
import { AlertIcon, BookmarkIcon, CheckIcon, CopyIcon, DownloadIcon, ShareIcon } from '../Icons';
import Spinner from '../Spinner';

interface ExportActionsProps {
  song: Track;
  cardRef: React.RefObject<HTMLDivElement | null>;
  /** Called with a thumbnail whenever the card is saved or exported. */
  onSave: (thumbnail: string) => void;
}

type Action = 'download' | 'share' | 'copy' | 'save';
type Status = { kind: 'success' | 'error'; text: string } | null;

const actionButton =
  'w-full px-4 py-3 rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

const ExportActions: React.FC<ExportActionsProps> = ({ song, cardRef, onSave }) => {
  const [busy, setBusy] = useState<Action | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [canShare] = useState(canShareFiles);
  const [canCopy] = useState(canCopyImage);
  const fileName = cardFilename(song.artist, song.name);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 3500);
    return () => clearTimeout(timer);
  }, [status]);

  // Exporting also saves the card to the gallery, so it can be reopened later.
  const saveQuietly = (node: HTMLElement) =>
    renderThumbnail(node)
      .then(onSave)
      .catch(err => console.warn('Could not save card to gallery', err));

  const run = async (action: Action, task: (node: HTMLElement) => Promise<string | null>) => {
    const node = cardRef.current;
    if (!node || busy) return;
    setBusy(action);
    setStatus(null);
    try {
      const message = await task(node);
      if (message) setStatus({ kind: 'success', text: message });
    } catch (err) {
      const name = (err as Error)?.name;
      if (name === 'AbortError') return; // user closed the share sheet
      console.error(err);
      setStatus({
        kind: 'error',
        text: name === 'NotAllowedError' ? 'Your browser blocked this. Try Download instead.' : 'Could not create the image. Please try again.',
      });
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = () =>
    run('download', async node => {
      downloadBlob(await renderToBlob(node), fileName);
      await saveQuietly(node);
      return 'Image downloaded and saved to your cards';
    });

  const handleShare = () =>
    run('share', async node => {
      const blob = await renderToBlob(node);
      await navigator.share({
        files: [new File([blob], fileName, { type: 'image/png' })],
        title: `${song.name} lyrics`,
        text: `${song.name} by ${song.artist}`,
      });
      await saveQuietly(node);
      return null;
    });

  const handleCopy = () =>
    run('copy', async node => {
      // Pass the promise directly so Safari keeps the user-gesture context.
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': renderToBlob(node) })]);
      await saveQuietly(node);
      return 'Image copied to clipboard';
    });

  const handleSave = () =>
    run('save', async node => {
      onSave(await renderThumbnail(node));
      return 'Saved to your cards';
    });

  const label = (action: Action, icon: React.ReactNode, text: string) =>
    busy === action ? <Spinner label="Working" /> : <>{icon} {text}</>;

  return (
    <>
      <div className="grid grid-cols-2 sm:flex gap-2">
        <button onClick={handleDownload} disabled={!!busy} className={`${actionButton} col-span-2 bg-brand-green-dark text-white hover:bg-green-800`}>
          {label('download', <DownloadIcon />, 'Download')}
        </button>
        {canShare && (
          <button onClick={handleShare} disabled={!!busy} className={`${actionButton} bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200`}>
            {label('share', <ShareIcon />, 'Share')}
          </button>
        )}
        {canCopy && (
          <button onClick={handleCopy} disabled={!!busy} className={`${actionButton} bg-gray-100 dark:bg-brand-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-200`}>
            {label('copy', <CopyIcon />, 'Copy')}
          </button>
        )}
        <button onClick={handleSave} disabled={!!busy} className={`${actionButton} bg-gray-100 dark:bg-brand-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-200`}>
          {label('save', <BookmarkIcon />, 'Save')}
        </button>
      </div>

      <div aria-live="polite" className="min-h-6 text-sm text-center">
        {status && (
          <span
            className={`inline-flex items-center gap-1.5 ${
              status.kind === 'success' ? 'text-brand-green-dark dark:text-brand-green' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {status.kind === 'success' ? <CheckIcon className="w-4 h-4" /> : <AlertIcon className="w-4 h-4" />}
            {status.text}
          </span>
        )}
      </div>
    </>
  );
};

export default ExportActions;
