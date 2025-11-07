import React from 'react';
import { Track, LyricsLine } from '../types';
import Spinner from './Spinner';

interface LyricsSelectStepProps {
  song: Track;
  lyrics: LyricsLine[] | null;
  selectedLyrics: string[];
  onLyricSelect: (line: string) => void;
  isLoading: boolean;
}

const LyricsSelectStep: React.FC<LyricsSelectStepProps> = ({ song, lyrics, selectedLyrics, onLyricSelect, isLoading }) => {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Select Your Favorite Lines</h2>
        <p className="text-gray-600 dark:text-brand-gray-100">{song.name} by {song.artists.map(a => a.name).join(', ')}</p>
      </div>

      {isLoading && <div className="flex justify-center items-center h-48"><Spinner /></div>}
      
      {!isLoading && lyrics === null && (
          <div className="text-center p-8 text-gray-500">Error fetching lyrics.</div>
      )}

      {!isLoading && lyrics && lyrics.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          <p className="text-lg">Sorry, lyrics could not be found for this song.</p>
          <p>Please go back and try another song.</p>
        </div>
      )}

      {!isLoading && lyrics && lyrics.length > 0 && (
        <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {lyrics.map((line, index) => (
            <div
              key={`${line.time}-${index}`}
              onClick={() => onLyricSelect(line.line)}
              className={`p-3 my-1 rounded-md cursor-pointer transition-all duration-200 text-center text-lg ${
                selectedLyrics.includes(line.line)
                  ? 'bg-brand-green text-white scale-105'
                  : 'bg-gray-100 dark:bg-brand-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-200'
              }`}
            >
              {line.line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LyricsSelectStep;