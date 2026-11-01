import { describe, expect, it } from 'vitest';
import type { CustomizationOptions, SavedCard } from '../types';
import { tokenize, toggleIndex } from './words';
import { applyTemplate, surpriseMe, TEMPLATES } from './templates';
import { upsertCard } from '../services/galleryStore';
import { FONT_OPTIONS } from '../constants';

const base: CustomizationOptions = {
  background: { type: 'solid', color: '#1DB954', gradientFrom: '#000000', gradientTo: '#ffffff', angle: 45, blur: 28, dim: 0.45, photo: 'data:x' },
  isTextLight: true,
  fontFamily: 'font-lora',
  fontSize: 'text-2xl',
  textEffect: 'none',
  textAlign: 'left',
  cardSize: 'classic',
  accentColor: '#1DB954',
  highlightStyle: 'color',
};

describe('tokenize', () => {
  it('numbers words and keeps whitespace', () => {
    expect(tokenize("I've  been here")).toEqual([
      { text: "I've", word: 0 },
      { text: '  ', word: null },
      { text: 'been', word: 1 },
      { text: ' ', word: null },
      { text: 'here', word: 2 },
    ]);
  });

  it('round-trips the text exactly', () => {
    const line = ' leading and trailing ';
    expect(tokenize(line).map(t => t.text).join('')).toBe(line);
  });

  it('handles empty lines', () => {
    expect(tokenize('')).toEqual([]);
  });
});

describe('toggleIndex', () => {
  it('adds in order and removes', () => {
    expect(toggleIndex(undefined, 2)).toEqual([2]);
    expect(toggleIndex([3], 1)).toEqual([1, 3]);
    expect(toggleIndex([1, 3], 3)).toEqual([1]);
  });
});

describe('templates', () => {
  it('every template produces a complete, valid customization', () => {
    for (const t of TEMPLATES) {
      const next = applyTemplate(base, t.build({ artworkColors: ['#123456', '#EF0078'] }));
      expect(next.fontFamily, t.id).toMatch(/^font-/);
      expect(FONT_OPTIONS.map(f => f.className), t.id).toContain(next.fontFamily);
      expect(next.background.photo, t.id).toBe('data:x'); // uploaded photo is kept
      expect(typeof next.isTextLight, t.id).toBe('boolean');
    }
  });

  it('derives text color from the background when the template does not set it', () => {
    const light = applyTemplate(base, { background: { type: 'solid', color: '#FFFFFF' } });
    expect(light.isTextLight).toBe(false);
    const forced = applyTemplate(base, { background: { type: 'solid', color: '#FFFFFF' }, isTextLight: true });
    expect(forced.isTextLight).toBe(true);
  });

  it('surprise me is deterministic for a given random source', () => {
    let seed = 0.1;
    const random = () => (seed = (seed * 9301 + 0.49297) % 1);
    const a = surpriseMe({ artworkColors: [] }, random);
    seed = 0.1;
    const b = surpriseMe({ artworkColors: [] }, random);
    expect(a).toEqual(b);
    expect(FONT_OPTIONS.map(f => f.className)).toContain(a.fontFamily);
  });
});

describe('upsertCard', () => {
  const card = (id: string, savedAt: number) => ({ id, savedAt }) as SavedCard;

  it('puts the newest first and replaces the same id', () => {
    const list = upsertCard([card('a', 1), card('b', 2)], card('a', 3));
    expect(list.map(c => [c.id, c.savedAt])).toEqual([['a', 3], ['b', 2]]);
  });

  it('caps the list', () => {
    const list = upsertCard([card('a', 1), card('b', 2)], card('c', 3), 2);
    expect(list.map(c => c.id)).toEqual(['c', 'a']);
  });
});
