import React from 'react';
import { Track } from '../types';

interface SongSelectStepProps {
  songs: Track[];
  onSelect: (song: Track) => void;
  isLoading: boolean;
}

const SongSelectStep: React.FC<SongSelectStepProps> = ({ songs, onSelect }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Select a Song</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {songs.map((song) => (
          <div 
            key={song.id} 
            onClick={() => onSelect(song)}
            className="cursor-pointer group flex flex-col items-center p-3 bg-gray-50 dark:bg-brand-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-brand-gray-200 transition-all duration-300"
          >
            <div className="relative w-full aspect-square">
              <img 
                src={song.album.images[0]?.url || 'https://picsum.photos/300'} 
                alt={song.album.name} 
                className="w-full h-full object-cover rounded-md shadow-lg" 
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity duration-300 rounded-md">
                 <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
              </div>
            </div>
            <p className="mt-2 font-semibold text-sm text-center truncate w-full text-gray-800 dark:text-white">{song.name}</p>
            <p className="text-xs text-gray-500 dark:text-brand-gray-100 text-center truncate w-full">{song.artists.map(a => a.name).join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongSelectStep;