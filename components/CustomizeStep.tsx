import React, { useRef, useState, useEffect } from 'react';
import { Track, CustomizationOptions } from '../types';
import { PRESET_COLORS, FONT_OPTIONS, FONT_SIZE_OPTIONS, TEXT_EFFECT_OPTIONS } from '../constants';
import LyricsCard from './LyricsCard';
import { DownloadIcon, PaletteIcon, TextColorIcon, FontIcon, FontSizeIcon, ShareIcon, TextEffectIcon } from './Icons';
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
        <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-brand-green' : 'bg-gray-300 dark:bg-brand-gray-200'}`}></div>
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
  const [isSharing, setIsSharing] = useState(false);
  const [canShare, setCanShare] = useState(false);
  
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [gradientStart, setGradientStart] = useState('#ff7e5f');
  const [gradientEnd, setGradientEnd] = useState('#feb47b');
  const [customSolidColor, setCustomSolidColor] = useState(() => {
    return customization.background.startsWith('#') ? customization.background : PRESET_COLORS[0];
  });
  
  const fileName = `${song.artists[0].name.toLowerCase()}-${song.name.toLowerCase()}-lyrics.png`;

  const handleGradientChange = (startColor: string, endColor: string) => {
    const newGradient = `linear-gradient(to top right, ${startColor}, ${endColor})`;
    setCustomization(c => ({...c, background: newGradient}));
  };
  
  useEffect(() => {
    // Check for Web Share API support
    if (navigator.share) {
      setCanShare(true);
    }
  }, []);

  useEffect(() => {
    if (backgroundType === 'solid') {
      setCustomization(c => ({...c, background: customSolidColor}));
    } else {
      handleGradientChange(gradientStart, gradientEnd);
    }
  }, [backgroundType]);

  const generateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current || !window.html2canvas) return null;
    try {
      const canvas = await window.html2canvas(cardRef.current, {
        scale: 3, // for higher resolution
        backgroundColor: null,
        useCORS: true,
      });
      return canvas;
    } catch (error) {
       console.error('Failed to generate canvas', error);
       alert('Could not create image. Please try again.');
       return null;
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const canvas = await generateCanvas();
    if (canvas) {
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
    setIsDownloading(false);
  };

  const handleShare = async () => {
    if (!navigator.share) return;
    setIsSharing(true);
    const canvas = await generateCanvas();

    if (canvas) {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }
        const file = new File([blob], fileName, { type: 'image/png' });
        try {
          await navigator.share({
            files: [file],
            title: `${song.name} Lyrics`,
            text: `Check out these lyrics for ${song.name} by ${song.artists[0].name}!`,
          });
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
             console.error('Share failed:', error);
          }
        } finally {
          setIsSharing(false);
        }
      }, 'image/png');
    } else {
       setIsSharing(false);
    }
  };


  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Controls */}
      <div className="lg:w-1/3 space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white"><PaletteIcon /> Background Style</h3>
          
          <div className="flex bg-gray-200 dark:bg-brand-gray-300 rounded-full p-1 mb-4">
            <button onClick={() => setBackgroundType('solid')} className={`w-1/2 rounded-full py-1 text-sm font-semibold transition-colors ${backgroundType === 'solid' ? 'bg-white dark:bg-brand-gray-200 shadow text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Solid
            </button>
            <button onClick={() => setBackgroundType('gradient')} className={`w-1/2 rounded-full py-1 text-sm font-semibold transition-colors ${backgroundType === 'gradient' ? 'bg-white dark:bg-brand-gray-200 shadow text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Gradient
            </button>
          </div>
          
          {backgroundType === 'solid' ? (
            <div className="animate-fade-in space-y-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Preset Colors</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setCustomization(c => ({...c, background: color}));
                      setCustomSolidColor(color);
                    }}
                    className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${customization.background === color ? 'ring-2 ring-offset-2 ring-brand-green dark:ring-offset-brand-gray-400' : ''}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
                <div className="relative w-8 h-8">
                  <input 
                    type="color" 
                    value={customSolidColor}
                    onChange={(e) => {
                      setCustomization(c => ({...c, background: e.target.value}));
                      setCustomSolidColor(e.target.value);
                    }}
                    className="w-full h-full rounded-full cursor-pointer border-2 border-dashed border-gray-300 dark:border-brand-gray-200 appearance-none bg-transparent"
                    style={{'--color': customSolidColor} as React.CSSProperties} // for potential custom styling
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in space-y-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Custom Gradient</p>
              <div className="flex items-center justify-around gap-4 bg-gray-100 dark:bg-brand-gray-300 p-3 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                      <label htmlFor="gradient-start" className="text-sm">Start</label>
                      <input
                          id="gradient-start"
                          type="color"
                          value={gradientStart}
                          onChange={(e) => {
                              setGradientStart(e.target.value);
                              handleGradientChange(e.target.value, gradientEnd);
                          }}
                          className="w-12 h-12 p-0 border-none rounded-lg cursor-pointer bg-transparent"
                      />
                  </div>
                   <div className="flex flex-col items-center gap-2">
                      <label htmlFor="gradient-end" className="text-sm">End</label>
                      <input
                          id="gradient-end"
                          type="color"
                          value={gradientEnd}
                          onChange={(e) => {
                              setGradientEnd(e.target.value);
                              handleGradientChange(gradientStart, e.target.value);
                          }}
                          className="w-12 h-12 p-0 border-none rounded-lg cursor-pointer bg-transparent"
                      />
                  </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white"><FontIcon /> Font Style</h3>
           <div className="flex items-center gap-2 flex-wrap">
              {FONT_OPTIONS.map(font => (
                <button
                  key={font.className}
                  onClick={() => setCustomization(c => ({...c, fontFamily: font.className}))}
                  className={`px-3 py-1.5 rounded-full text-base transition-colors ${
                    customization.fontFamily === font.className 
                      ? 'bg-brand-green text-white' 
                      : 'bg-gray-200 dark:bg-brand-gray-300 hover:bg-gray-300 dark:hover:bg-brand-gray-200'
                  } ${font.className}`}
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
                      ? 'bg-brand-green text-white' 
                      : 'bg-gray-200 dark:bg-brand-gray-300 hover:bg-gray-300 dark:hover:bg-brand-gray-200'
                  }`}
                >
                  {size.name}
                </button>
              ))}
           </div>
        </div>

        <div>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white"><TextEffectIcon /> Text Effect</h3>
            <div className="flex items-center gap-2 flex-wrap">
                {TEXT_EFFECT_OPTIONS.map(effect => (
                    <button
                        key={effect.id}
                        onClick={() => setCustomization(c => ({...c, textEffect: effect.id}))}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                        customization.textEffect === effect.id 
                            ? 'bg-brand-green text-white' 
                            : 'bg-gray-200 dark:bg-brand-gray-300 hover:bg-gray-300 dark:hover:bg-brand-gray-200'
                        }`}
                    >
                        {effect.name}
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
        
        <div className="w-full mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading || isSharing}
            className="w-full px-6 py-3 bg-brand-green text-white font-bold rounded-full hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDownloading ? <Spinner /> : <><DownloadIcon /> Download</>}
          </button>
          {canShare && (
             <button
                onClick={handleShare}
                disabled={isDownloading || isSharing}
                className="w-full px-6 py-3 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
              {isSharing ? <Spinner /> : <><ShareIcon /> Share</>}
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="lg:w-2/3 flex-grow flex items-center justify-center p-4 bg-gray-100 dark:bg-brand-gray-500 rounded-lg">
        <LyricsCard ref={cardRef} song={song} lyrics={lyrics} customization={customization} />
      </div>
    </div>
  );
};

export default CustomizeStep;