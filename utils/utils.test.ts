import { describe, expect, it } from 'vitest';
import { backgroundToCss, hexToRgb, prefersLightText, prefersLightTextFor, relativeLuminance } from './color';
import { dominantColors } from './extractColors';
import { cardFilename } from './filename';
import { mapResults } from '../services/itunesService';

describe('color', () => {
  it('parses short and long hex', () => {
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
    expect(hexToRgb('#1DB954')).toEqual([29, 185, 84]);
  });

  it('computes luminance extremes', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1);
  });

  it('chooses readable text color', () => {
    expect(prefersLightText('#191414')).toBe(true);
    expect(prefersLightText('#2D46B9')).toBe(true);
    expect(prefersLightText('#feb47b')).toBe(false);
    expect(prefersLightText('#ffffff')).toBe(false);
  });

  it('builds CSS for backgrounds', () => {
    const bg = { type: 'gradient' as const, color: '#000', gradientFrom: '#111111', gradientTo: '#222222', angle: 90 };
    expect(backgroundToCss(bg)).toBe('linear-gradient(90deg, #111111, #222222)');
    expect(backgroundToCss({ ...bg, type: 'solid' })).toBe('#000');
    expect(prefersLightTextFor(bg)).toBe(true);
  });
});

describe('dominantColors', () => {
  const pixels = (colors: [number, number, number, number][]) => new Uint8ClampedArray(colors.flat());

  it('returns distinct colors ordered by weight', () => {
    const data = pixels([
      ...Array(50).fill([200, 30, 30, 255]),
      ...Array(30).fill([30, 30, 200, 255]),
      ...Array(10).fill([202, 32, 31, 255]), // same bucket area as red
    ]);
    const colors = dominantColors(data, 5);
    expect(colors).toHaveLength(2);
    expect(colors[0]).toMatch(/^#c[89a-f]/); // red first
  });

  it('skips transparent pixels', () => {
    expect(dominantColors(pixels([[255, 0, 0, 0]]))).toEqual([]);
  });
});

describe('cardFilename', () => {
  it('produces a safe slug', () => {
    expect(cardFilename('The Weeknd', 'Blinding Lights')).toBe('the-weeknd-blinding-lights-lyrics.png');
    expect(cardFilename('AC/DC', 'Back In Black?')).toBe('acdc-back-in-black-lyrics.png');
    expect(cardFilename('Beyoncé', 'Halo')).toBe('beyonce-halo-lyrics.png');
    expect(cardFilename('', '***')).toBe('lyrics-card-lyrics.png');
  });
});

describe('mapResults', () => {
  const item = (id: number, name: string, artist = 'A') => ({
    trackId: id,
    trackName: name,
    artistName: artist,
    collectionName: 'Album',
    artworkUrl100: 'https://example.com/img/100x100bb.jpg',
    trackTimeMillis: 1000,
    wrapperType: 'track',
  });

  it('dedupes the same song on different albums and resizes artwork', () => {
    const tracks = mapResults([item(1, 'Song'), item(2, 'song'), item(3, 'Other'), { ...item(4, 'X'), wrapperType: 'collection' }]);
    expect(tracks.map(t => t.id)).toEqual(['1', '3']);
    expect(tracks[0].artworkUrl).toBe('https://example.com/img/600x600bb.jpg');
    expect(tracks[0].thumbnailUrl).toBe('https://example.com/img/300x300bb.jpg');
  });
});
