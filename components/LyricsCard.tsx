import React, { forwardRef } from 'react';
import { Track, CustomizationOptions } from '../types';

interface LyricsCardProps {
  song: Track;
  lyrics: string[];
  customization: CustomizationOptions;
}

const LyricsCard = forwardRef<HTMLDivElement, LyricsCardProps>(({ song, lyrics, customization }, ref) => {
  const { background, isTextLight, fontFamily, fontSize, textEffect } = customization;
  const textColor = isTextLight ? 'text-white' : 'text-black';

  const getTextEffectStyle = (): React.CSSProperties => {
    const shadowColor = isTextLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)';
    const outlineColor = isTextLight ? 'rgb(0 0 0 / 70%)' : 'rgb(255 255 255 / 70%)';
    
    switch (textEffect) {
      case 'shadow':
        return { textShadow: `2px 2px 4px ${shadowColor}` };
      
      case 'outline':
        return {
            textShadow: `
            -1px -1px 0 ${outlineColor},
             1px -1px 0 ${outlineColor},
            -1px  1px 0 ${outlineColor},
             1px  1px 0 ${outlineColor}
            `
        };
        
      case 'none':
      default:
        return {};
    }
  };

  const textStyle = getTextEffectStyle();

  // The separator will be a soft, fading horizontal line that adapts to the text color.
  const separatorStyle = {
    height: '1px',
    backgroundImage: isTextLight
      ? 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)'
      : 'linear-gradient(to right, transparent, rgba(0, 0, 0, 0.2), transparent)',
  };

  return (
    <div
      ref={ref}
      className={`w-[400px] min-h-[500px] flex-shrink-0 mx-auto p-8 rounded-2xl flex flex-col transition-all duration-300 shadow-2xl ${fontFamily}`}
      style={{ background: background }}
    >
      {/* Header Section */}
      <div className="flex items-center gap-5">
        <img 
          src={song.album.images[0]?.url || 'https://picsum.photos/100'} 
          alt={song.album.name} 
          crossOrigin="anonymous"
          className="w-20 h-20 rounded-lg shadow-md flex-shrink-0 object-cover"
        />
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className={`text-2xl font-bold leading-tight break-words ${textColor}`} style={textStyle}>{song.name}</p>
          <p className={`text-base opacity-90 leading-tight mt-1 break-words ${textColor}`} style={textStyle}>{song.artists.map(a => a.name).join(', ')}</p>
        </div>
      </div>
      
      {/* Fading Gradient Separator */}
      <div className="w-full my-6" style={separatorStyle}></div>

      {/* Lyrics Section */}
      <div className="space-y-4 flex-grow">
        {lyrics.map((line, index) => (
          <p key={index} className={`${fontSize} font-bold leading-snug whitespace-pre-wrap break-words ${textColor}`} style={textStyle}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
});

LyricsCard.displayName = 'LyricsCard';
export default LyricsCard;