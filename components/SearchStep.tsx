import React, { useState, useRef } from 'react';
import { SearchIcon, XIcon } from './Icons';
import Spinner from './Spinner';

interface SearchStepProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery: string;
}

const SearchStep: React.FC<SearchStepProps> = ({ onSearch, isLoading, initialQuery }) => {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Find a Song</h2>
      <p className="text-gray-600 dark:text-brand-gray-100 mb-6">Search by song title or artist to get started.</p>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="flex items-stretch rounded-full bg-gray-100 dark:bg-brand-gray-300 shadow-sm overflow-hidden ring-2 ring-transparent focus-within:ring-brand-green transition-all duration-300">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Blinding Lights The Weeknd"
              className="w-full h-full pl-12 pr-10 py-3 bg-transparent focus:outline-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {query && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-brand-gray-200"
                  aria-label="Clear search"
                >
                  <XIcon />
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 bg-brand-green text-white font-bold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
          >
            {isLoading ? <Spinner /> : 'Search'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchStep;