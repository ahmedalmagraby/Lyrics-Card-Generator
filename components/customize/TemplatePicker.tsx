import React from 'react';
import type { CustomizationOptions, Track } from '../../types';
import { applyTemplate, surpriseMe, TEMPLATES } from '../../utils/templates';
import { backgroundToCss } from '../../utils/color';
import { ShuffleIcon } from '../Icons';
import { Section } from './controls';

interface TemplatePickerProps {
  song: Track;
  customization: CustomizationOptions;
  artworkColors: string[];
  onApply: (next: CustomizationOptions) => void;
}

const TemplatePicker: React.FC<TemplatePickerProps> = ({ song, customization, artworkColors, onApply }) => {
  const ctx = { artworkColors };

  return (
    <Section title="Templates">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 custom-scrollbar">
        <button
          type="button"
          onClick={() => onApply(applyTemplate(customization, surpriseMe(ctx)))}
          className="shrink-0 w-[4.5rem] h-24 rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs font-semibold bg-gradient-to-br from-fuchsia-500 via-orange-400 to-yellow-300 text-gray-900 hover:brightness-105"
        >
          <ShuffleIcon className="w-6 h-6" />
          Surprise me
        </button>
        {TEMPLATES.map(t => {
          const preview = applyTemplate(customization, t.build(ctx));
          const { background } = preview;
          const image = background.type === 'artwork' ? song.thumbnailUrl : background.type === 'photo' ? background.photo : undefined;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onApply(preview)}
              title={`Apply the ${t.name} template`}
              className="shrink-0 w-[4.5rem] flex flex-col items-center gap-1 text-xs font-medium group"
            >
              <span
                className={`relative isolate w-full h-[4.5rem] rounded-xl overflow-hidden flex items-center justify-center ring-1 ring-black/10 dark:ring-white/10 group-hover:ring-2 group-hover:ring-brand-green ${preview.fontFamily}`}
                style={{ background: backgroundToCss(background), color: preview.isTextLight ? '#fff' : '#000' }}
              >
                {image && (
                  <>
                    <img src={image} alt="" className="absolute inset-0 -z-10 w-full h-full object-cover blur-[3px] scale-110" />
                    <span className="absolute inset-0 -z-10" style={{ backgroundColor: `rgba(0,0,0,${background.dim})` }} />
                  </>
                )}
                <span
                  className="text-2xl font-bold"
                  style={{ textShadow: preview.textEffect === 'glow' ? `0 0 8px ${preview.accentColor}` : undefined }}
                >
                  Aa
                </span>
              </span>
              <span className="truncate w-full text-center">{t.name}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
};

export default TemplatePicker;
