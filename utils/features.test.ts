import { describe, expect, it } from 'vitest';
import type { CustomizationOptions, SavedCard } from '../types';
import { cardSong, labelSong } from './cardSong';
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
  textAlign: 'start',
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

describe('tokenize with CJK text', () => {
  it('splits Japanese and Chinese lines without spaces into several words', () => {
    for (const line of ['私は東京に住んでいます', '我喜欢听音乐']) {
      const tokens = tokenize(line);
      expect(tokens.filter(t => t.word !== null).length).toBeGreaterThan(1);
      expect(tokens.map(t => t.text).join('')).toBe(line);
    }
  });

  it('keeps Arabic and Korean words whole, as they use spaces', () => {
    expect(tokenize('مرحبا بالعالم').filter(t => t.word !== null).map(t => t.text)).toEqual(['مرحبا', 'بالعالم']);
    expect(tokenize('안녕하세요 세상').filter(t => t.word !== null).map(t => t.text)).toEqual(['안녕하세요', '세상']);
  });

  it('leaves Latin words untouched', () => {
    expect(tokenize("don't stop").filter(t => t.word !== null).map(t => t.text)).toEqual(["don't", 'stop']);
  });
});

describe('song names on the card', () => {
  const song = { id: '1', name: 'Baadak Ala Baly', artist: 'Fairouz', album: 'A', artworkUrl: '', thumbnailUrl: '' };
  const text = { edits: {}, highlights: {}, caption: '' };

  it('uses the catalog names until they are edited', () => {
    expect(cardSong(song, text)).toEqual(song);
    expect(labelSong(song, text)).toEqual(song);
  });

  it('applies edits without changing the song used for lookups', () => {
    const shown = cardSong(song, { ...text, title: 'بعدك على بالي', artist: 'فيروز' });
    expect(shown.name).toBe('بعدك على بالي');
    expect(shown.artist).toBe('فيروز');
    expect(song.name).toBe('Baadak Ala Baly');
    expect(shown.id).toBe('1');
  });

  it('keeps a cleared name blank on the card but not in labels', () => {
    const cleared = { ...text, artist: '  ', title: '' };
    expect(cardSong(song, cleared).name).toBe('');
    expect(labelSong(song, cleared).name).toBe('Baadak Ala Baly');
    expect(labelSong(song, cleared).artist).toBe('Fairouz');
  });
});
