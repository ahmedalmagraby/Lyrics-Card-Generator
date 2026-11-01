import React, { useRef, useState } from 'react';
import type { Background, BackgroundType, Track } from '../../types';
import { GRADIENT_PRESETS, PHOTO_MAX_SIZE, PRESET_COLORS } from '../../constants';
import { imageFileToDataUrl } from '../../utils/exportImage';
import { ColorInput, panel, RangeInput, Section, Segmented, Swatch } from './controls';

interface BackgroundControlsProps {
  song: Track;
  background: Background;
  artworkColors: string[];
  onChange: (patch: Partial<Background>) => void;
}

const TYPES: readonly { id: BackgroundType; name: string }[] = [
  { id: 'solid', name: 'Solid' },
  { id: 'gradient', name: 'Gradient' },
  { id: 'artwork', name: 'Artwork' },
  { id: 'photo', name: 'Photo' },
];

const BackgroundControls: React.FC<BackgroundControlsProps> = ({ song, background, artworkColors, onChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const artworkGradient = artworkColors.length >= 2 ? { from: artworkColors[0], to: artworkColors[1] } : null;
  const gradientPresets = artworkGradient ? [artworkGradient, ...GRADIENT_PRESETS] : GRADIENT_PRESETS;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError(null);
    try {
      onChange({ type: 'photo', photo: await imageFileToDataUrl(file, PHOTO_MAX_SIZE) });
    } catch {
      setPhotoError('That file could not be read as an image.');
    }
  };

  const handleType = (type: BackgroundType) => {
    // Pick a photo straight away instead of showing an empty photo background.
    if (type === 'photo' && !background.photo) fileRef.current?.click();
    else onChange({ type });
  };

  const imageAdjustments = (
    <div className={panel}>
      <RangeInput label="Blur" value={background.blur} min={0} max={60} step={2} format={v => `${v}px`} onChange={blur => onChange({ blur })} />
      <RangeInput
        label="Dim"
        value={background.dim}
        min={0}
        max={0.8}
        step={0.05}
        format={v => `${Math.round(v * 100)}%`}
        onChange={dim => onChange({ dim })}
      />
    </div>
  );

  return (
    <Section title="Background">
      <div className="mb-3">
        <Segmented label="Background type" options={TYPES} value={background.type} onChange={handleType} />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={e => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {background.type === 'solid' && (
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
                    onClick={() => onChange({ color })}
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
                  onClick={() => onChange({ color })}
                />
              ))}
              <ColorInput label="Custom" value={background.color} onChange={color => onChange({ color })} />
            </div>
          </div>
        </div>
      )}

      {background.type === 'gradient' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {gradientPresets.map((g, i) => (
              <Swatch
                key={`${g.from}-${g.to}-${i}`}
                background={`linear-gradient(45deg, ${g.from}, ${g.to})`}
                label={i === 0 && artworkGradient ? 'Artwork gradient' : `Gradient ${g.from} to ${g.to}`}
                selected={background.gradientFrom === g.from && background.gradientTo === g.to}
                onClick={() => onChange({ gradientFrom: g.from, gradientTo: g.to })}
              />
            ))}
          </div>
          <div className={panel}>
            <ColorInput label="From" value={background.gradientFrom} onChange={gradientFrom => onChange({ gradientFrom })} />
            <ColorInput label="To" value={background.gradientTo} onChange={gradientTo => onChange({ gradientTo })} />
            <RangeInput
              label="Angle"
              value={background.angle}
              min={0}
              max={360}
              step={15}
              format={v => `${v}°`}
              onChange={angle => onChange({ angle })}
            />
          </div>
        </div>
      )}

      {background.type === 'artwork' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-brand-gray-100">
            Uses the cover of <span className="font-semibold">{song.album}</span>, blurred and dimmed so the lyrics stay readable.
          </p>
          {imageAdjustments}
        </div>
      )}

      {background.type === 'photo' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {background.photo && (
              <img src={background.photo} alt="" className="w-12 h-12 rounded-lg object-cover ring-1 ring-black/10" />
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 dark:bg-brand-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-200"
            >
              {background.photo ? 'Change photo' : 'Choose photo'}
            </button>
            <span className="text-xs text-gray-500 dark:text-brand-gray-100">Stays on your device.</span>
          </div>
          {photoError && <p className="text-sm text-red-600 dark:text-red-400">{photoError}</p>}
          {background.photo && imageAdjustments}
        </div>
      )}
    </Section>
  );
};

export default BackgroundControls;
