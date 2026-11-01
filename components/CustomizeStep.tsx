import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Background, CustomizationOptions, Track } from '../types';
import {
  CARD_SIZE_OPTIONS,
  CARD_WIDTH,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  GRADIENT_PRESETS,
  PRESET_COLORS,
  TEXT_ALIGN_OPTIONS,
  TEXT_EFFECT_OPTIONS,
} from '../constants';
import { prefersLightTextFor } from '../utils/color';
import { cardFilename } from '../utils/filename';
import { canCopyImage, canShareFiles, downloadBlob, PREVIEW_SCALER_ATTR, renderToBlob } from '../utils/exportImage';
import LyricsCard from './LyricsCard';
import { AlertIcon, CheckIcon, CopyIcon, DownloadIcon, ShareIcon } from './Icons';
import Spinner from './Spinner';

interface CustomizeStepProps {
  song: Track;
  lyrics: string[];
  customization: CustomizationOptions;
  setCustomization: React.Dispatch<React.SetStateAction<CustomizationOptions>>;
  artworkColors: string[];
}

type Action = 'download' | 'share' | 'copy';
type Status = { kind: 'success' | 'error'; text: string } | null;

const PREVIEW_PADDING = 32;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-brand-gray-100 mb-2.5">{title}</h3>
    {children}
  </section>
);

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; name: string; className?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            value === o.id
              ? 'bg-brand-green-dark text-white'
              : 'bg-gray-100 dark:bg-brand-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-200'
          } ${o.className ?? ''}`}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}

const Swatch: React.FC<{ background: string; selected: boolean; label: string; onClick: () => void }> = ({
  background,
  selected,
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-pressed={selected}
    title={label}
    className={`w-8 h-8 rounded-full ring-1 ring-black/10 dark:ring-white/10 transition-transform hover:scale-110 ${
      selected ? 'outline-2 outline-offset-2 outline-brand-green' : ''
    }`}
    style={{ background }}
  />
);

const ColorInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <label className="flex items-center gap-2 text-sm font-medium">
    <span className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-black/10 dark:ring-white/20 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-green">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="absolute -inset-2 w-12 h-12 cursor-pointer border-0 p-0"
      />
    </span>
    {label}
  </label>
);

const CustomizeStep: React.FC<CustomizeStepProps> = ({ song, lyrics, customization, setCustomization, artworkColors }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [cardHeight, setCardHeight] = useState(500);
  const [overflowing, setOverflowing] = useState(false);
  const [busy, setBusy] = useState<Action | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [canShare] = useState(canShareFiles);
  const [canCopy] = useState(canCopyImage);

  const { background } = customization;
  const fileName = cardFilename(song.artist, song.name);

  const update = (patch: Partial<CustomizationOptions>) => setCustomization(c => ({ ...c, ...patch }));

  // Changing the background also picks the more readable text color; the toggle can override it.
  const setBackground = (patch: Partial<Background>) =>
    setCustomization(c => {
      const next = { ...c.background, ...patch };
      return { ...c, background: next, isTextLight: prefersLightTextFor(next) };
    });

  // Scale the preview down to fit narrow screens. Export always renders at full size.
  useLayoutEffect(() => {
    const preview = previewRef.current;
    const card = cardRef.current;
    if (!preview || !card) return;
    const measure = () => {
      setScale(Math.min(1, (preview.clientWidth - PREVIEW_PADDING) / CARD_WIDTH));
      setCardHeight(card.offsetHeight);
      setOverflowing(card.scrollHeight > card.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(preview);
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (card) setOverflowing(card.scrollHeight > card.clientHeight + 1);
  }, [customization, lyrics]);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 3500);
    return () => clearTimeout(timer);
  }, [status]);

  const run = async (action: Action, task: () => Promise<string | null>) => {
    if (!cardRef.current || busy) return;
    setBusy(action);
    setStatus(null);
    try {
      const message = await task();
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
    run('download', async () => {
      downloadBlob(await renderToBlob(cardRef.current!), fileName);
      return 'Image downloaded';
    });

  const handleShare = () =>
    run('share', async () => {
      const blob = await renderToBlob(cardRef.current!);
      await navigator.share({
        files: [new File([blob], fileName, { type: 'image/png' })],
        title: `${song.name} lyrics`,
        text: `${song.name} by ${song.artist}`,
      });
      return null;
    });

  const handleCopy = () =>
    run('copy', async () => {
      // Pass the promise directly so Safari keeps the user-gesture context.
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': renderToBlob(cardRef.current!) })]);
      return 'Image copied to clipboard';
    });

  const artworkGradient = artworkColors.length >= 2 ? { from: artworkColors[0], to: artworkColors[1] } : null;
  const gradientPresets = artworkGradient ? [artworkGradient, ...GRADIENT_PRESETS] : GRADIENT_PRESETS;

  const actionButton = 'w-full px-4 py-3 rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-6 lg:gap-8">
      {/* Preview (first on mobile) */}
      <div className="lg:order-2">
        <div className="lg:sticky lg:top-24 space-y-3">
          <div
            ref={previewRef}
            className="rounded-xl bg-gray-100 dark:bg-brand-gray-500 flex justify-center overflow-hidden"
            style={{ padding: PREVIEW_PADDING / 2 }}
          >
            <div style={{ width: CARD_WIDTH * scale, height: cardHeight * scale }}>
              <div
                {...{ [PREVIEW_SCALER_ATTR]: '' }}
                className="rounded-2xl shadow-2xl"
                style={{ width: CARD_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
              >
                <LyricsCard ref={cardRef} song={song} lyrics={lyrics} customization={customization} />
              </div>
            </div>
          </div>

          {overflowing && (
            <p className="flex items-center gap-2 text-sm rounded-lg px-3 py-2 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertIcon className="w-4 h-4 shrink-0" />
              The lyrics don't fit this size. Try a smaller font, fewer lines, or the Classic size.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={handleDownload} disabled={!!busy} className={`${actionButton} bg-brand-green-dark text-white hover:bg-green-800`}>
              {busy === 'download' ? <Spinner label="Creating image" /> : <><DownloadIcon /> Download</>}
            </button>
            {canShare && (
              <button onClick={handleShare} disabled={!!busy} className={`${actionButton} bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200`}>
                {busy === 'share' ? <Spinner label="Creating image" /> : <><ShareIcon /> Share</>}
              </button>
            )}
            {canCopy && (
              <button onClick={handleCopy} disabled={!!busy} className={`${actionButton} bg-gray-100 dark:bg-brand-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-200`}>
                {busy === 'copy' ? <Spinner label="Creating image" /> : <><CopyIcon /> Copy</>}
              </button>
            )}
          </div>

          <div aria-live="polite" className="min-h-6 text-sm text-center">
            {status && (
              <span className={`inline-flex items-center gap-1.5 ${status.kind === 'success' ? 'text-brand-green-dark dark:text-brand-green' : 'text-red-600 dark:text-red-400'}`}>
                {status.kind === 'success' ? <CheckIcon className="w-4 h-4" /> : <AlertIcon className="w-4 h-4" />}
                {status.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="lg:order-1 space-y-6">
        <Section title="Card size">
          <div role="radiogroup" aria-label="Card size" className="grid grid-cols-4 gap-2">
            {CARD_SIZE_OPTIONS.map(o => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={customization.cardSize === o.id}
                onClick={() => update({ cardSize: o.id })}
                className={`flex flex-col items-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  customization.cardSize === o.id
                    ? 'bg-brand-green-dark text-white'
                    : 'bg-gray-100 dark:bg-brand-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-200'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="block border-2 border-current rounded-sm"
                  style={{ width: 18, height: o.aspect ? 18 / o.aspect : 22, borderStyle: o.aspect ? 'solid' : 'dashed' }}
                />
                {o.name}
                <span className="font-normal opacity-75">{o.hint}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Background">
          <div className="mb-3">
            <Segmented
              label="Background type"
              options={[{ id: 'solid', name: 'Solid' }, { id: 'gradient', name: 'Gradient' }]}
              value={background.type}
              onChange={type => setBackground({ type })}
            />
          </div>

          {background.type === 'solid' ? (
            <div className="space-y-3">
              {artworkColors.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-brand-gray-100 mb-1.5">From artwork</p>
                  <div className="flex flex-wrap gap-2">
                    {artworkColors.map(color => (
                      <Swatch
                        key={color}
                        background={color}
                        label={`Artwork color ${color}`}
                        selected={background.color.toLowerCase() === color.toLowerCase()}
                        onClick={() => setBackground({ color })}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 dark:text-brand-gray-100 mb-1.5">Presets</p>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map(color => (
                    <Swatch
                      key={color}
                      background={color}
                      label={`Color ${color}`}
                      selected={background.color.toLowerCase() === color.toLowerCase()}
                      onClick={() => setBackground({ color })}
                    />
                  ))}
                  <ColorInput label="Custom" value={background.color} onChange={color => setBackground({ color })} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {gradientPresets.map((g, i) => (
                  <Swatch
                    key={`${g.from}-${g.to}-${i}`}
                    background={`linear-gradient(45deg, ${g.from}, ${g.to})`}
                    label={i === 0 && artworkGradient ? 'Artwork gradient' : `Gradient ${g.from} to ${g.to}`}
                    selected={background.gradientFrom === g.from && background.gradientTo === g.to}
                    onClick={() => setBackground({ gradientFrom: g.from, gradientTo: g.to })}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 p-3 rounded-lg bg-gray-50 dark:bg-brand-gray-300/60">
                <ColorInput label="From" value={background.gradientFrom} onChange={gradientFrom => setBackground({ gradientFrom })} />
                <ColorInput label="To" value={background.gradientTo} onChange={gradientTo => setBackground({ gradientTo })} />
                <label className="flex items-center gap-2 text-sm font-medium flex-1 min-w-[160px]">
                  Angle
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={15}
                    value={background.angle}
                    onChange={e => setBackground({ angle: Number(e.target.value) })}
                    className="flex-1 accent-brand-green"
                  />
                  <span className="w-10 text-right tabular-nums text-gray-500 dark:text-brand-gray-100">{background.angle}°</span>
                </label>
              </div>
            </div>
          )}
        </Section>

        <Section title="Font">
          <Segmented
            label="Font"
            options={FONT_OPTIONS.map(f => ({ id: f.className, name: f.name, className: `${f.className} !text-base !font-normal` }))}
            value={customization.fontFamily}
            onChange={fontFamily => update({ fontFamily })}
          />
        </Section>

        <div className="grid sm:grid-cols-2 gap-6">
          <Section title="Text size">
            <Segmented
              label="Text size"
              options={FONT_SIZE_OPTIONS.map(s => ({ id: s.className, name: s.name }))}
              value={customization.fontSize}
              onChange={fontSize => update({ fontSize })}
            />
          </Section>

          <Section title="Alignment">
            <Segmented
              label="Text alignment"
              options={TEXT_ALIGN_OPTIONS}
              value={customization.textAlign}
              onChange={textAlign => update({ textAlign })}
            />
          </Section>

          <Section title="Text effect">
            <Segmented
              label="Text effect"
              options={TEXT_EFFECT_OPTIONS}
              value={customization.textEffect}
              onChange={textEffect => update({ textEffect })}
            />
          </Section>

          <Section title="Text color">
            <Segmented
              label="Text color"
              options={[{ id: 'light', name: 'Light' }, { id: 'dark', name: 'Dark' }]}
              value={customization.isTextLight ? 'light' : 'dark'}
              onChange={v => update({ isTextLight: v === 'light' })}
            />
          </Section>
        </div>
      </div>
    </div>
  );
};

export default CustomizeStep;
