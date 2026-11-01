import type { LyricsLine, LyricsResult, Track } from '../types';

// Lyrics come from LRCLIB (https://lrclib.net), an open lyrics database.

const API_URL = 'https://lrclib.net/api';

export interface LrcLibRecord {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

const cache = new Map<string, LyricsResult>();

const TIMESTAMP = /\[(\d+):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;
// Enhanced LRC word-level timestamps, e.g. <00:12.34>
const WORD_TIMESTAMP = /<\d+:\d{1,2}(?:[.:]\d{1,3})?>/g;
// Lines like "♪" mark instrumental breaks, not lyrics.
const isLyric = (text: string) => !!text && !/^[\s♪♫♬♩….\-]*$/.test(text);

/** Parses LRC content. Supports several timestamps per line and ignores metadata tags like [ar:]. */
export function parseLRC(content: string): LyricsLine[] {
  const lyrics: LyricsLine[] = [];
  for (const raw of content.split(/\r?\n/)) {
    const stamps = [...raw.matchAll(TIMESTAMP)];
    if (stamps.length === 0) continue;
    const text = raw.replace(TIMESTAMP, '').replace(WORD_TIMESTAMP, '').trim();
    if (!isLyric(text)) continue;
    for (const [, min, sec, frac = '0'] of stamps) {
      const time = parseInt(min, 10) * 60 + parseInt(sec, 10) + parseInt(frac.padEnd(3, '0'), 10) / 1000;
      lyrics.push({ time, line: text });
    }
  }
  return lyrics.sort((a, b) => a.time - b.time);
}

export function parsePlain(content: string): LyricsLine[] {
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(isLyric)
    .map((line, index) => ({ time: index, line }));
}

export function toResult(record: LrcLibRecord): LyricsResult {
  if (record.syncedLyrics) {
    const lines = parseLRC(record.syncedLyrics);
    if (lines.length > 0) return { lines, synced: true, instrumental: false };
  }
  if (record.plainLyrics) {
    const lines = parsePlain(record.plainLyrics);
    if (lines.length > 0) return { lines, synced: false, instrumental: false };
  }
  return { lines: [], synced: false, instrumental: record.instrumental };
}

/** Strips suffixes like "(feat. X)" or "- Remastered 2011" that rarely match lyrics databases. */
export function cleanTitle(title: string): string {
  return title
    .replace(/\s*[([](?:feat\.?|ft\.?|with |from |remaster|live|radio edit|[^)\]]*version|[^)\]]*mix)[^)\]]*[)\]]/gi, '')
    .replace(/\s+-\s+.*\b(?:remaster(?:ed)?|version|edit|live|mix|mono|stereo)\b.*$/i, '')
    .trim();
}

export function primaryArtist(artist: string): string {
  return artist.split(/\s*(?:,|&|\bfeat\.?|\bft\.?)\s*/i)[0].trim();
}

/** Prefers records with lyrics, then synced ones, then the closest duration. */
export function pickBest(records: LrcLibRecord[], durationSec?: number): LrcLibRecord | undefined {
  const score = (r: LrcLibRecord) => {
    let s = r.syncedLyrics ? 100 : 50;
    if (durationSec) s -= Math.min(Math.abs(r.duration - durationSec), 40);
    return s;
  };
  return records
    .filter(r => r.syncedLyrics || r.plainLyrics)
    .sort((a, b) => score(b) - score(a))[0];
}

async function getExact(track: Track, signal?: AbortSignal): Promise<LrcLibRecord | null> {
  const url = new URL(`${API_URL}/get`);
  url.searchParams.set('artist_name', track.artist);
  url.searchParams.set('track_name', track.name);
  url.searchParams.set('album_name', track.album);
  if (track.durationMs) url.searchParams.set('duration', Math.round(track.durationMs / 1000).toString());

  const response = await fetch(url, { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Lyrics lookup failed (${response.status})`);
  return response.json();
}

async function search(trackName: string, artistName: string, signal?: AbortSignal): Promise<LrcLibRecord[]> {
  const url = new URL(`${API_URL}/search`);
  url.searchParams.set('track_name', trackName);
  url.searchParams.set('artist_name', artistName);

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Lyrics search failed (${response.status})`);
  return response.json();
}

const hasLyrics = (r: LrcLibRecord | null): boolean => !!(r?.syncedLyrics || r?.plainLyrics);

export async function fetchLyrics(track: Track, signal?: AbortSignal): Promise<LyricsResult> {
  const cached = cache.get(track.id);
  if (cached) return cached;

  let record: LrcLibRecord | null = null;
  try {
    record = await getExact(track, signal);
  } catch (err) {
    // The exact endpoint sometimes returns 5xx when its upstream lookup times out; the search may still work.
    if (signal?.aborted) throw err;
    console.warn(err);
  }

  // The exact lookup needs title, artist, album and duration to line up; fall back to a fuzzy search.
  if (!hasLyrics(record) && !record?.instrumental) {
    const durationSec = track.durationMs ? track.durationMs / 1000 : undefined;
    const artist = primaryArtist(track.artist);
    const title = cleanTitle(track.name) || track.name;
    let found = pickBest(await search(title, artist, signal), durationSec);
    if (!found && title !== track.name) {
      found = pickBest(await search(track.name, artist, signal), durationSec);
    }
    record = found ?? record;
  }

  const result: LyricsResult = record ? toResult(record) : { lines: [], synced: false, instrumental: false };
  cache.set(track.id, result);
  return result;
}
