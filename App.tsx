import React, { useState, useEffect, useCallback } from 'react';
import { AppStep, Track, LyricsLine, CustomizationOptions } from './types';
import { searchTracks } from './services/spotifyService';
import { fetchLyrics } from './services/lyricsService';
import { PRESET_COLORS, FONT_OPTIONS, FONT_SIZE_OPTIONS } from './constants';
import StepIndicator from './components/StepIndicator';
import SearchStep from './components/SearchStep';
import SongSelectStep from './components/SongSelectStep';
import LyricsSelectStep from './components/LyricsSelectStep';
import CustomizeStep from './components/CustomizeStep';
import { MoonIcon, SunIcon } from './components/Icons';

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.SEARCH);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [selectedSong, setSelectedSong] = useState<Track | null>(null);
  const [lyrics, setLyrics] = useState<LyricsLine[] | null>(null);
  const [selectedLyrics, setSelectedLyrics] = useState<string[]>([]);
  const [customization, setCustomization] = useState<CustomizationOptions>({
    background: PRESET_COLORS[0],
    isTextLight: true,
    fontFamily: FONT_OPTIONS[0].className,
    fontSize: FONT_SIZE_OPTIONS[1].className, // Default to Medium
    textEffect: 'none',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setQuery(searchQuery);
    try {
      const results = await searchTracks(searchQuery);
      setSearchResults(results);
      setStep(AppStep.SELECT_SONG);
    } catch (err) {
      setError('Failed to search for songs. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSong = async (song: Track) => {
    setIsLoading(true);
    setError(null);
    setSelectedSong(song);
    setLyrics(null);
    setSelectedLyrics([]);
    setStep(AppStep.SELECT_LYRICS);
    try {
      const lyricsData = await fetchLyrics(song.artists[0].name, song.name, song.album.name);
      if (lyricsData && lyricsData.length > 0) {
        setLyrics(lyricsData);
      } else {
        setError('Lyrics not found for this song.');
        setLyrics([]); // Set to empty array to indicate we tried but found nothing
      }
    } catch (err) {
      setError('Could not fetch lyrics. Please try another song.');
      setLyrics([]); // Set to empty array on error
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLyricsSelect = (line: string) => {
    setSelectedLyrics(prev => 
      prev.includes(line) ? prev.filter(l => l !== line) : [...prev, line]
    );
  };

  const handleNextStep = () => {
    if (step === AppStep.SELECT_LYRICS) {
      setStep(AppStep.CUSTOMIZE);
    }
  };

  const handleBackStep = () => {
    setError(null);
    switch (step) {
      case AppStep.CUSTOMIZE:
        setStep(AppStep.SELECT_LYRICS);
        break;
      case AppStep.SELECT_LYRICS:
        setStep(AppStep.SELECT_SONG);
        setSelectedSong(null);
        setLyrics(null);
        setSelectedLyrics([]);
        break;
      case AppStep.SELECT_SONG:
        setStep(AppStep.SEARCH);
        setSearchResults([]);
        break;
    }
  };

  const renderStep = () => {
    switch (step) {
      case AppStep.SEARCH:
        return <SearchStep onSearch={handleSearch} isLoading={isLoading} initialQuery={query} />;
      case AppStep.SELECT_SONG:
        return <SongSelectStep songs={searchResults} onSelect={handleSelectSong} isLoading={isLoading} />;
      case AppStep.SELECT_LYRICS:
        return <LyricsSelectStep 
                  song={selectedSong!} 
                  lyrics={lyrics}
                  selectedLyrics={selectedLyrics}
                  onLyricSelect={handleLyricsSelect}
                  isLoading={isLoading} 
               />;
      case AppStep.CUSTOMIZE:
        return <CustomizeStep 
                  song={selectedSong!} 
                  lyrics={selectedLyrics} 
                  customization={customization}
                  setCustomization={setCustomization}
               />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen font-sans text-black dark:text-white bg-gray-100 dark:bg-brand-gray-500 transition-colors duration-300">
      <header className="p-4 flex justify-between items-center bg-white dark:bg-brand-gray-400 shadow-md">
        <div className="flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Lyrics Card Generator</h1>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-300 transition-colors">
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </header>
      
      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        <StepIndicator currentStep={step} />

        <div className="mt-8 bg-white dark:bg-brand-gray-400 p-6 rounded-xl shadow-lg animate-fade-in">
          {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">{error}</div>}
          
          {renderStep()}

          {step > AppStep.SEARCH && (
             <div className="mt-6 pt-6 border-t border-gray-200 dark:border-brand-gray-300 flex justify-between items-center">
                <button onClick={handleBackStep} className="px-6 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors disabled:opacity-50">
                  Back
                </button>
              
              {step === AppStep.SELECT_LYRICS && (
                <button onClick={handleNextStep} disabled={selectedLyrics.length === 0} className="px-6 py-2 bg-brand-green text-white font-bold rounded-full hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Continue
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}