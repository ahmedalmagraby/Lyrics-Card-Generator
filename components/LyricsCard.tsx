import React, { forwardRef } from 'react';
import type { CustomizationOptions, Track } from '../types';
import { CARD_SIZE_OPTIONS, CARD_WIDTH, PLACEHOLDER_ARTWORK } from '../constants';
import { backgroundToCss } from '../utils/color';

interface LyricsCardProps {
  song: Track;
  lyrics: string[];
  customization: CustomizationOptions;
}

// Colors on the card are plain hex/rgba inline styles on purpose: html2canvas
// cannot parse Tailwind v4's oklch() palette colors.

const LyricsCard = forwardRef<HTMLDivElement, LyricsCardProps>(({ song, lyrics, customization }, ref) => {
  const { background, isTextLight, fontFamily, fontSize, textEffect, textAlign, cardSize } = customization;
  const textColor = isTextLight ? '#ffffff' : '#000000';
  const aspect = CARD_SIZE_OPTIONS.find(o => o.id === cardSize)?.aspect ?? null;

  const textShadow = (() => {
    switch (textEffect) {
      case 'shadow':
        return `2px 2px 4px ${isTextLight ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'}`;
      case 'outline': {
        const c = isTextLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
        return `-1px -1px 0 ${c}, 1px -1px 0 ${c}, -1px 1px 0 ${c}, 1px 1px 0 ${c}`;
      }
      default:
        return undefined;
    }
  })();

  const separatorStyle: React.CSSProperties = {
    height: '1px',
    backgroundImage: isTextLight
      ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.35), transparent)'
      : 'linear-gradient(to right, transparent, rgba(0,0,0,0.2), transparent)',
  };

  return (
    <div
      ref={ref}
      className={`p-8 rounded-2xl flex flex-col overflow-hidden ${fontFamily}`}
      style={{
        width: CARD_WIDTH,
        height: aspect ? Math.round(CARD_WIDTH / aspect) : undefined,
        minHeight: aspect ? undefined : 500,
        background: backgroundToCss(background),
        color: textColor,
        textShadow,
      }}
    >
      <div className="flex items-center gap-5 shrink-0">
        <img
          src={song.artworkUrl || PLACEHOLDER_ARTWORK}
          onError={e => {
            e.currentTarget.src = PLACEHOLDER_ARTWORK;
          }}
          alt={song.album}
          crossOrigin="anonymous"
          width={80}
          height={80}
          className="w-20 h-20 rounded-lg shrink-0 object-cover"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold leading-tight break-words">{song.name}</p>
          <p className="text-base leading-tight mt-1 break-words" style={{ opacity: 0.9 }}>
            {song.artist}
          </p>
        </div>
      </div>

      <div className="w-full my-6 shrink-0" style={separatorStyle} />

      <div
        className={`flex-grow flex flex-col gap-4 ${aspect ? 'justify-center' : ''}`}
        style={{ textAlign }}
      >
        {lyrics.map((line, index) => (
          <p key={index} className={`${fontSize} font-bold leading-snug whitespace-pre-wrap break-words`}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
});

LyricsCard.displayName = 'LyricsCard';
export default LyricsCard;
