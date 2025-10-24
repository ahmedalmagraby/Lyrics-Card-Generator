import React, { forwardRef } from 'react';
import { Track, CustomizationOptions } from '../types';

interface LyricsCardProps {
  song: Track;
  lyrics: string[];
  customization: CustomizationOptions;
}

const LyricsCard = forwardRef<HTMLDivElement, LyricsCardProps>(({ song, lyrics, customization }, ref) => {
  const { backgroundColor, isTextLight, fontFamily, fontSize } = customization;
  const textColor = isTextLight ? 'text-white' : 'text-black';

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
      className={`w-[360px] p-8 rounded-2xl flex flex-col transition-all duration-300 ${fontFamily}`}
      style={{ backgroundColor: backgroundColor }}
    >
      {/* Header Section */}
      <div className="flex items-center">
        <img 
          src={song.album.images[0]?.url || 'https://picsum.photos/100'} 
          alt={song.album.name} 
          className="relative w-16 h-16 rounded-md shadow-md flex-shrink-0"
        />
        <div className="ml-4 overflow-hidden">
          <p className={`text-lg font-bold truncate ${textColor}`}>{song.name}</p>
          <p className={`text-sm opacity-80 truncate ${textColor}`}>{song.artists.map(a => a.name).join(', ')}</p>
        </div>
      </div>
      
      {/* Fading Gradient Separator */}
      <div className="w-full my-4" style={separatorStyle}></div>

      {/* Lyrics Section */}
      <div className="space-y-2">
        {lyrics.map((line, index) => (
          <p key={index} className={`${fontSize} font-bold leading-tight ${textColor}`}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
});

LyricsCard.displayName = 'LyricsCard';
export default LyricsCard;