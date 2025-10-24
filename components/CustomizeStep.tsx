import React, { useRef, useState } from 'react';
import { Track, CustomizationOptions } from '../types';
import { PRESET_COLORS, FONT_OPTIONS, FONT_SIZE_OPTIONS } from '../constants';
import LyricsCard from './LyricsCard';
import { DownloadIcon, PaletteIcon, TextColorIcon, FontIcon, FontSizeIcon } from './Icons';
import Spinner from './Spinner';

// Fix: Add html2canvas to the Window interface to resolve TypeScript errors.
declare global {
  interface Window {
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  }
}

interface CustomizeStepProps {
  song: Track;
  lyrics: string[];
  customization: CustomizationOptions;
  setCustomization: React.Dispatch<React.SetStateAction<CustomizationOptions>>;
}

const Toggle: React.FC<{ checked: boolean, onChange: (checked: boolean) => void, children: React.ReactNode }> = ({ checked, onChange, children }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-spotify-green' : 'bg-gray-300 dark:bg-spotify-gray-200'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
      </div>
      <div className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
        {children}
      </div>
    </label>
  )
};

const CustomizeStep: React.FC<CustomizeStepProps> = ({ song, lyrics, customization, setCustomization }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || !window.html2canvas) return;
    setIsDownloading(true);
    try {
      const canvas = await window.html2canvas(cardRef.current, {
        scale: 3, // for higher resolution
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `${song.artists[0].name.toLowerCase()}-${song.name.toLowerCase()}-lyrics.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download image', error);
      alert('Could not download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Controls */}
      <div className="lg:w-1/3 space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white"><PaletteIcon /> Background Color</h3>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setCustomization(c => ({...c, backgroundColor: color}))}
                className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${customization.backgroundColor === color ? 'ring-2 ring-offset-2 ring-spotify-green dark:ring-offset-spotify-gray-400' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
            <label
              className="w-8 h-8 rounded-full cursor-pointer bg-gray-200 dark:bg-spotify-gray-300 flex items-center justify-center"
            >
              <input 
                type="color" 
                value={customization.backgroundColor}
                onChange={(e) => setCustomization(c => ({...c, backgroundColor: e.target.value}))}
                className="w-full h-full opacity-0 cursor-pointer"
              />
              <span className="absolute text-gray-500 dark:text-gray-400 text-xl">+</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white"><FontIcon /> Font Style</h3>
           <div className="flex items-center gap-2 flex-wrap">
              {FONT_OPTIONS.map(font => (
                <button
                  key={font.className}
                  onClick={() => setCustomization(c => ({...c, fontFamily: font.className}))}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    customization.fontFamily === font.className 
                      ? 'bg-spotify-green text-white' 
                      : 'bg-gray-200 dark:bg-spotify-gray-300 hover:bg-gray-300 dark:hover:bg-spotify-gray-200'
                  }`}
                >
                  {font.name}
                </button>
              ))}
           </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white"><FontSizeIcon /> Font Size</h3>
           <div className="flex items-center gap-2 flex-wrap">
              {FONT_SIZE_OPTIONS.map(size => (
                <button
                  key={size.className}
                  onClick={() => setCustomization(c => ({...c, fontSize: size.className}))}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    customization.fontSize === size.className 
                      ? 'bg-spotify-green text-white' 
                      : 'bg-gray-200 dark:bg-spotify-gray-300 hover:bg-gray-300 dark:hover:bg-spotify-gray-200'
                  }`}
                >
                  {size.name}
                </button>
              ))}
           </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">Options</h3>
          <Toggle checked={customization.isTextLight} onChange={isLight => setCustomization(c => ({...c, isTextLight: isLight}))}>
             <span className="flex items-center gap-2"><TextColorIcon /> Light Text</span>
          </Toggle>
        </div>
        
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full mt-8 px-6 py-3 bg-spotify-green text-white font-bold rounded-full hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isDownloading ? <Spinner /> : <><DownloadIcon /> Download Image</>}
        </button>
      </div>

      {/* Preview */}
      <div className="lg:w-2/3 flex-grow flex items-center justify-center p-4 bg-gray-100 dark:bg-spotify-gray-500 rounded-lg">
        <LyricsCard ref={cardRef} song={song} lyrics={lyrics} customization={customization} />
      </div>
    </div>
  );
};

export default CustomizeStep;