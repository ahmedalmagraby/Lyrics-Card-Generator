import React from 'react';
import type { SavedCard } from '../types';
import { TrashIcon } from './Icons';
import Spinner from './Spinner';

interface SavedCardsGalleryProps {
  cards: SavedCard[];
  openingId: string | null;
  onOpen: (card: SavedCard) => void;
  onDelete: (id: string) => void;
}

const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

const SavedCardsGallery: React.FC<SavedCardsGalleryProps> = ({ cards, openingId, onOpen, onDelete }) => {
  if (cards.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="saved-cards-heading">
      <div className="flex items-baseline justify-between mb-3">
        <h3 id="saved-cards-heading" className="text-lg font-bold">
          Your cards
        </h3>
        <span className="text-xs text-gray-500 dark:text-brand-gray-100">Saved in this browser</span>
      </div>
      <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {cards.map(card => (
          <li key={card.id} className="relative group/card">
            <button
              type="button"
              onClick={() => onOpen(card)}
              disabled={!!openingId}
              className="w-full text-left rounded-xl p-1.5 hover:bg-gray-100 dark:hover:bg-brand-gray-300 transition-colors disabled:cursor-wait"
              aria-label={`Open card for ${card.song.name} by ${card.song.artist}`}
            >
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-gray-100 dark:bg-brand-gray-300 flex items-center justify-center">
                <img src={card.thumbnail} alt="" className="max-w-full max-h-full object-contain" loading="lazy" />
                {openingId === card.id && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                    <Spinner label="Opening card" />
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs font-semibold truncate">{card.song.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-brand-gray-100">{dateFormat.format(card.savedAt)}</p>
            </button>
            <button
              type="button"
              onClick={() => onDelete(card.id)}
              aria-label={`Delete card for ${card.song.name}`}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 hover:bg-red-600 transition"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SavedCardsGallery;
