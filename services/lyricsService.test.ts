import { describe, expect, it } from 'vitest';
import { cleanTitle, parseLRC, parsePlain, pickBest, primaryArtist, toResult, type LrcLibRecord } from './lyricsService';

const record = (overrides: Partial<LrcLibRecord>): LrcLibRecord => ({
  id: 1,
  trackName: 'Song',
  artistName: 'Artist',
  albumName: 'Album',
  duration: 200,
  instrumental: false,
  plainLyrics: null,
  syncedLyrics: null,
  ...overrides,
});

describe('parseLRC', () => {
  it('parses timestamps with 2 or 3 digit fractions', () => {
    expect(parseLRC('[00:12.34] Hello\n[01:02.500]World')).toEqual([
      { time: 12.34, line: 'Hello' },
      { time: 62.5, line: 'World' },
    ]);
  });

  it('expands lines with several timestamps and sorts by time', () => {
    expect(parseLRC('[00:30.00][00:10.00]Chorus\n[00:20.00]Verse')).toEqual([
      { time: 10, line: 'Chorus' },
      { time: 20, line: 'Verse' },
      { time: 30, line: 'Chorus' },
    ]);
  });

  it('accepts timestamps without fractions and long durations', () => {
    expect(parseLRC('[105:07]Late line')).toEqual([{ time: 105 * 60 + 7, line: 'Late line' }]);
  });

  it('ignores metadata tags, empty lines and word timestamps', () => {
    expect(parseLRC('[ar:Someone]\n[ti:Title]\n[00:01.00]\n[00:02.00]<00:02.10>Hi <00:02.50>there')).toEqual([
      { time: 2, line: 'Hi there' },
    ]);
  });

  it('drops instrumental markers', () => {
    expect(parseLRC('[00:01.00]♪\n[00:02.00] ♪ ♪\n[00:03.00]Words')).toEqual([{ time: 3, line: 'Words' }]);
  });

  it('handles CRLF line endings', () => {
    expect(parseLRC('[00:01.00]A\r\n[00:02.00]B')).toHaveLength(2);
  });
});

describe('parsePlain', () => {
  it('splits lines and drops blanks', () => {
    expect(parsePlain('One\n\n  Two  \r\nThree\n')).toEqual([
      { time: 0, line: 'One' },
      { time: 1, line: 'Two' },
      { time: 2, line: 'Three' },
    ]);
  });
});

describe('toResult', () => {
  it('prefers synced lyrics', () => {
    const result = toResult(record({ syncedLyrics: '[00:01.00]Synced', plainLyrics: 'Plain' }));
    expect(result).toEqual({ lines: [{ time: 1, line: 'Synced' }], synced: true, instrumental: false });
  });

  it('falls back to plain lyrics', () => {
    const result = toResult(record({ plainLyrics: 'Plain one\nPlain two' }));
    expect(result.synced).toBe(false);
    expect(result.lines.map(l => l.line)).toEqual(['Plain one', 'Plain two']);
  });

  it('reports instrumentals', () => {
    expect(toResult(record({ instrumental: true }))).toEqual({ lines: [], synced: false, instrumental: true });
  });
});

describe('cleanTitle', () => {
  it.each([
    ['Old Town Road (feat. Billy Ray Cyrus)', 'Old Town Road'],
    ['Here Comes the Sun - Remastered 2009', 'Here Comes the Sun'],
    ['Song [Radio Edit]', 'Song'],
    ['Track (Acoustic Version)', 'Track'],
    ['Plain Title', 'Plain Title'],
    ['Yesterday (Remastered 2009)', 'Yesterday'],
  ])('%s -> %s', (input, expected) => {
    expect(cleanTitle(input)).toBe(expected);
  });
});

describe('primaryArtist', () => {
  it('keeps the first credited artist', () => {
    expect(primaryArtist('Lil Nas X & Billy Ray Cyrus')).toBe('Lil Nas X');
    expect(primaryArtist('Artist A, Artist B')).toBe('Artist A');
    expect(primaryArtist('Solo')).toBe('Solo');
  });
});

describe('pickBest', () => {
  it('prefers synced lyrics with the closest duration', () => {
    const best = pickBest(
      [
        record({ id: 1, plainLyrics: 'x', duration: 200 }),
        record({ id: 2, syncedLyrics: '[00:01.00]x', duration: 260 }),
        record({ id: 3, syncedLyrics: '[00:01.00]x', duration: 201 }),
        record({ id: 4, duration: 200 }),
      ],
      200
    );
    expect(best?.id).toBe(3);
  });

  it('returns undefined when no record has lyrics', () => {
    expect(pickBest([record({})])).toBeUndefined();
  });
});
