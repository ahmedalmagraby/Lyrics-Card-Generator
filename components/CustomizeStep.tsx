import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Background, CardLine, CardText, CustomizationOptions, Track } from '../types';
import {
  CARD_SIZE_OPTIONS,
  CARD_WIDTH,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  TEXT_EFFECT_OPTIONS,
  textAlignOptions,
} from '../constants';
import { cardSong, labelSong } from '../utils/cardSong';
import { prefersLightTextFor } from '../utils/color';
import { cardDirection } from '../utils/script';
import { toggleIndex } from '../utils/words';
import LyricsCard from './LyricsCard';
import { AlertIcon } from './Icons';
import { Section, Segmented } from './customize/controls';
import BackgroundControls from './customize/BackgroundControls';
import TextControls from './customize/TextControls';
import TemplatePicker from './customize/TemplatePicker';
import ExportActions from './customize/ExportActions';

interface CustomizeStepProps {
  song: Track;
  lines: CardLine[];
  /** Original lyric text per line id, to detect and reset edits. */
  originals: Record<number, string>;
  cardText: CardText;
  setCardText: React.Dispatch<React.SetStateAction<CardText>>;
  customization: CustomizationOptions;
  setCustomization: React.Dispatch<React.SetStateAction<CustomizationOptions>>;
  artworkColors: string[];
  onSave: (thumbnail: string) => void;
}

const PREVIEW_PADDING = 32;

const CustomizeStep: React.FC<CustomizeStepProps> = ({
  song,
  lines,
  originals,
  cardText,
  setCardText,
  customization,
  setCustomization,
  artworkColors,
  onSave,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [cardHeight, setCardHeight] = useState(500);
  const [overflowing, setOverflowing] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);

  const shownSong = cardSong(song, cardText);
  const direction = cardDirection(lines.map(line => line.text), shownSong.name);

  const update = (patch: Partial<CustomizationOptions>) => setCustomization(c => ({ ...c, ...patch }));

  // Changing the background also picks the more readable text color; the toggle can override it.
  const setBackground = (patch: Partial<Background>) =>
    setCustomization(c => {
      const next = { ...c.background, ...patch };
      return { ...c, background: next, isTextLight: prefersLightTextFor(next) };
    });

  const toggleWord = (lineId: number, word: number) =>
    setCardText(t => ({ ...t, highlights: { ...t.highlights, [lineId]: toggleIndex(t.highlights[lineId], word) } }));

  const editLine = (lineId: number, text: string) =>
    setCardText(t => {
      const edits = { ...t.edits };
      if (text === originals[lineId]) delete edits[lineId];
      else edits[lineId] = text;
      // Word positions change when the text changes, so drop this line's highlights.
      const highlights = { ...t.highlights };
      delete highlights[lineId];
      return { ...t, edits, highlights };
    });

  const editName = (key: 'title' | 'artist', value: string, original: string) =>
    setCardText(t => {
      const next = { ...t };
      if (value === original) delete next[key];
      else next[key] = value;
      return next;
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
    // Script fonts arrive after the first render and can change how much text fits.
    document.fonts.addEventListener('loadingdone', measure);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener('loadingdone', measure);
    };
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (card) setOverflowing(card.scrollHeight > card.clientHeight + 1);
  }, [customization, lines, cardText.caption, cardText.title, cardText.artist]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-6 lg:gap-8">
      {/* Preview (first on mobile) */}
      <div className="lg:order-2">
        <div className="lg:sticky lg:top-24 space-y-3">
          <div
            ref={previewRef}
            className={`relative rounded-xl bg-gray-100 dark:bg-brand-gray-500 flex justify-center overflow-hidden transition-shadow ${
              highlightMode ? 'ring-2 ring-brand-green' : ''
            }`}
            style={{ padding: PREVIEW_PADDING / 2 }}
          >
            <div style={{ width: CARD_WIDTH * scale, height: cardHeight * scale }}>
              <div
                className="rounded-2xl shadow-2xl"
                style={{ width: CARD_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
              >
                <LyricsCard
                  ref={cardRef}
                  song={shownSong}
                  lines={lines}
                  caption={cardText.caption}
                  customization={customization}
                  onWordClick={highlightMode ? toggleWord : undefined}
                />
              </div>
            </div>
          </div>

          {highlightMode ? (
            <div className="flex items-center justify-between gap-3 text-sm rounded-lg px-3 py-2 bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-200">
              <span>Tap words on the card to highlight them.</span>
              <button type="button" onClick={() => setHighlightMode(false)} className="font-semibold hover:underline">
                Done
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setHighlightMode(true)}
              className="w-full text-sm font-semibold text-brand-green-dark dark:text-brand-green hover:underline"
            >
              Highlight words on the card
            </button>
          )}

          {overflowing && (
            <p className="flex items-center gap-2 text-sm rounded-lg px-3 py-2 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertIcon className="w-4 h-4 shrink-0" />
              The lyrics don't fit this size. Try a smaller font, fewer lines, or the Classic size.
            </p>
          )}

          <ExportActions song={labelSong(song, cardText)} cardRef={cardRef} onSave={onSave} />
        </div>
      </div>

      {/* Controls */}
      <div className="lg:order-1 space-y-6">
        <TemplatePicker song={song} customization={customization} artworkColors={artworkColors} onApply={setCustomization} />

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

        <BackgroundControls song={song} background={customization.background} artworkColors={artworkColors} onChange={setBackground} />

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
            <Segmented label="Text alignment" options={textAlignOptions(direction)} value={customization.textAlign} onChange={textAlign => update({ textAlign })} />
          </Section>

          <Section title="Text effect">
            <Segmented label="Text effect" options={TEXT_EFFECT_OPTIONS} value={customization.textEffect} onChange={textEffect => update({ textEffect })} />
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

        <TextControls
          song={song}
          shownSong={shownSong}
          onEditTitle={title => editName('title', title, song.name)}
          onEditArtist={artist => editName('artist', artist, song.artist)}
          lines={lines}
          originals={originals}
          caption={cardText.caption}
          customization={customization}
          artworkColors={artworkColors}
          highlightMode={highlightMode}
          onHighlightModeChange={setHighlightMode}
          onEditLine={editLine}
          onCaptionChange={caption => setCardText(t => ({ ...t, caption }))}
          onClearHighlights={() => setCardText(t => ({ ...t, highlights: {} }))}
          onChange={update}
        />
      </div>
    </div>
  );
};

export default CustomizeStep;
