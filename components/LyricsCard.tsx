import React, { forwardRef } from 'react';
import type { CardLine, CustomizationOptions, Track } from '../types';
import { CARD_SIZE_OPTIONS, CARD_WIDTH, PLACEHOLDER_ARTWORK } from '../constants';
import { backgroundToCss, prefersLightText } from '../utils/color';
import { tokenize } from '../utils/words';

interface LyricsCardProps {
  song: Track;
  lines: CardLine[];
  caption: string;
  customization: CustomizationOptions;
  /** When set, words become clickable so they can be highlighted. */
  onWordClick?: (lineId: number, wordIndex: number) => void;
}

const LyricsCard = forwardRef<HTMLDivElement, LyricsCardProps>(
  ({ song, lines, caption, customization, onWordClick }, ref) => {
    const { background, isTextLight, fontFamily, fontSize, textEffect, textAlign, cardSize, accentColor, highlightStyle } =
      customization;
    const textColor = isTextLight ? '#ffffff' : '#000000';
    const aspect = CARD_SIZE_OPTIONS.find(o => o.id === cardSize)?.aspect ?? null;
    const imageSrc =
      background.type === 'artwork' ? song.artworkUrl : background.type === 'photo' ? background.photo : undefined;

    const textShadow = (() => {
      switch (textEffect) {
        case 'shadow':
          return `2px 2px 4px ${isTextLight ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'}`;
        case 'outline': {
          const c = isTextLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
          return `-1px -1px 0 ${c}, 1px -1px 0 ${c}, -1px 1px 0 ${c}, 1px 1px 0 ${c}`;
        }
        case 'glow':
          return `0 0 6px ${accentColor}, 0 0 18px ${accentColor}`;
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

    const highlightStyleFor = (on: boolean): React.CSSProperties | undefined => {
      if (!on) return undefined;
      if (highlightStyle === 'color') return { color: accentColor };
      return {
        backgroundColor: accentColor,
        color: prefersLightText(accentColor) ? '#ffffff' : '#000000',
        textShadow: 'none',
        borderRadius: '0.2em',
        padding: '0 0.12em',
        margin: '0 -0.12em',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
      };
    };

    const renderLine = (line: CardLine) =>
      tokenize(line.text).map((token, i) => {
        if (token.word === null) return token.text;
        const word = token.word;
        const on = line.highlights.includes(word);
        if (!onWordClick) {
          return on ? <span key={i} style={highlightStyleFor(true)}>{token.text}</span> : token.text;
        }
        return (
          <span
            key={i}
            role="button"
            tabIndex={0}
            aria-pressed={on}
            onClick={() => onWordClick(line.id, word)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onWordClick(line.id, word);
              }
            }}
            className="cursor-pointer rounded-[0.2em] hover:outline-2 hover:outline-dashed hover:outline-current/50"
            style={highlightStyleFor(on)}
          >
            {token.text}
          </span>
        );
      });

    return (
      <div
        ref={ref}
        className={`relative isolate p-6 rounded-2xl flex flex-col overflow-hidden ${fontFamily}`}
        style={{
          width: CARD_WIDTH,
          height: aspect ? Math.round(CARD_WIDTH / aspect) : undefined,
          background: backgroundToCss(background),
          color: textColor,
          textShadow,
        }}
      >
        {imageSrc && (
          // clip-path (not just overflow: hidden) keeps the rounded corners when a blurred
          // image is rendered for export.
          <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden" style={{ clipPath: 'inset(0 round 1rem)' }}>
            <img
              src={imageSrc}
              alt=""
              crossOrigin={background.type === 'artwork' ? 'anonymous' : undefined}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter: background.blur ? `blur(${background.blur}px)` : undefined,
                // Enlarge a blurred image so its soft edges stay outside the card.
                transform: background.blur ? `scale(${1 + background.blur / 100})` : undefined,
              }}
            />
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${background.dim})` }} />
          </div>
        )}

        <div className="flex items-center gap-3.5 shrink-0">
          <img
            src={song.artworkUrl || PLACEHOLDER_ARTWORK}
            onError={e => {
              e.currentTarget.src = PLACEHOLDER_ARTWORK;
            }}
            alt={song.album}
            crossOrigin="anonymous"
            width={64}
            height={64}
            className="w-16 h-16 rounded-lg shrink-0 object-cover"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold leading-tight break-words">{song.name}</p>
            <p className="text-base leading-tight mt-0.5 break-words" style={{ opacity: 0.9 }}>
              {song.artist}
            </p>
          </div>
        </div>

        <div className="w-full my-4 shrink-0" style={separatorStyle} />

        <div className={`flex-grow flex flex-col gap-2.5 ${aspect ? 'justify-center' : ''}`} style={{ textAlign }}>
          {lines.map(line => (
            <p key={line.id} className={`${fontSize} font-bold leading-tight whitespace-pre-wrap break-words`}>
              {renderLine(line)}
            </p>
          ))}
        </div>

        {caption.trim() && (
          <p className="mt-4 shrink-0 text-base italic leading-snug break-words" style={{ textAlign, opacity: 0.85 }}>
            {caption.trim()}
          </p>
        )}
      </div>
    );
  }
);

LyricsCard.displayName = 'LyricsCard';
export default LyricsCard;
