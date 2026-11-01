import type { SavedCard } from '../types';

// Saved cards live in localStorage, so they stay on this device and browser only.

const KEY = 'savedCards';
export const MAX_SAVED_CARDS = 24;

export function loadSavedCards(): SavedCard[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Puts `card` first, replacing an older save with the same id, and caps the list length. */
export function upsertCard(cards: SavedCard[], card: SavedCard, max = MAX_SAVED_CARDS): SavedCard[] {
  return [card, ...cards.filter(c => c.id !== card.id)].slice(0, max);
}

/**
 * Persists the list, dropping the oldest cards if storage is full (uploaded photos are large).
 * Returns what was actually stored.
 */
export function persistCards(cards: SavedCard[]): SavedCard[] {
  let list = cards;
  while (true) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
      return list;
    } catch (err) {
      // Storage disabled (e.g. private mode): keep the cards in memory for this visit.
      if ((err as Error)?.name !== 'QuotaExceededError' || list.length <= 1) return list;
      list = list.slice(0, -1);
    }
  }
}

export function newCardId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
