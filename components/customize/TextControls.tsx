import React from 'react';
import type { CardLine, CustomizationOptions, HighlightStyle } from '../../types';
import { ACCENT_PRESETS, MAX_CAPTION_LENGTH } from '../../constants';
import { ColorInput, Section, Segmented, Swatch } from './controls';

interface TextControlsProps {
  lines: CardLine[];
  originals: Record<number, string>;
  caption: string;
  customization: CustomizationOptions;
  artworkColors: string[];
  highlightMode: boolean;
  onHighlightModeChange: (on: boolean) => void;
  onEditLine: (id: number, text: string) => void;
  onCaptionChange: (caption: string) => void;
  onClearHighlights: () => void;
  onChange: (patch: Partial<CustomizationOptions>) => void;
}

const HIGHLIGHT_STYLES: readonly { id: HighlightStyle; name: string }[] = [
  { id: 'color', name: 'Colored text' },
  { id: 'marker', name: 'Marker' },
];

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-brand-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-green';

const TextControls: React.FC<TextControlsProps> = ({
  lines,
  originals,
  caption,
  customization,
  artworkColors,
  highlightMode,
  onHighlightModeChange,
  onEditLine,
  onCaptionChange,
  onClearHighlights,
  onChange,
}) => {
  const hasHighlights = lines.some(l => l.highlights.length > 0);
  const accents = [...new Set([...artworkColors, ...ACCENT_PRESETS].map(c => c.toUpperCase()))];

  return (
    <>
      <Section title="Highlight words">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={highlightMode}
              onClick={() => onHighlightModeChange(!highlightMode)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                highlightMode
                  ? 'bg-brand-green-dark text-white'
                  : 'bg-gray-100 dark:bg-brand-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-200'
              }`}
            >
              {highlightMode ? 'Done highlighting' : 'Tap words to highlight'}
            </button>
            {hasHighlights && (
              <button type="button" onClick={onClearHighlights} className="px-2 py-1.5 text-sm text-gray-500 hover:underline">
                Clear highlights
              </button>
            )}
          </div>
          <Segmented
            label="Highlight style"
            options={HIGHLIGHT_STYLES}
            value={customization.highlightStyle}
            onChange={highlightStyle => onChange({ highlightStyle })}
          />
          <div className="flex flex-wrap items-center gap-2">
            {accents.map(color => (
              <Swatch
                key={color}
                background={color}
                label={`Accent color ${color}`}
                selected={customization.accentColor.toUpperCase() === color}
                onClick={() => onChange({ accentColor: color })}
              />
            ))}
            <ColorInput label="Custom" value={customization.accentColor} onChange={accentColor => onChange({ accentColor })} />
          </div>
          <p className="text-xs text-gray-500 dark:text-brand-gray-100">The accent color is also used by the Glow effect.</p>
        </div>
      </Section>

      <Section title="Edit lines">
        <div className="space-y-2">
          {lines.map(line => {
            const edited = line.text !== originals[line.id];
            return (
              <div key={line.id} className="flex items-center gap-2">
                <input
                  value={line.text}
                  onChange={e => onEditLine(line.id, e.target.value)}
                  aria-label={`Lyric line: ${originals[line.id]}`}
                  className={inputClass}
                />
                {edited && (
                  <button
                    type="button"
                    onClick={() => onEditLine(line.id, originals[line.id])}
                    className="shrink-0 px-2 py-1 text-xs font-semibold text-gray-500 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            );
          })}
          <label className="block pt-2">
            <span className="text-xs text-gray-500 dark:text-brand-gray-100">Caption (optional)</span>
            <input
              value={caption}
              maxLength={MAX_CAPTION_LENGTH}
              onChange={e => onCaptionChange(e.target.value)}
              placeholder="e.g. this song on repeat all summer"
              className={`${inputClass} mt-1`}
            />
          </label>
        </div>
      </Section>
    </>
  );
};

export default TextControls;
