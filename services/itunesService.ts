import type { Track } from '../types';

// Song search uses the public Apple iTunes Search API (no key required).

export interface ITunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100?: string;
  trackTimeMillis?: number;
  wrapperType: string;
}

interface ITunesResponse {
  resultCount: number;
  results: ITunesResult[];
}

const cache = new Map<string, Track[]>();

/** iTunes artwork URLs end in e.g. `100x100bb.jpg`; swap in any size. */
function resizeArtwork(url: string, size: number): string {
  return url.replace(/\/\d+x\d+bb\./, `/${size}x${size}bb.`);
}

export function mapResults(results: ITunesResult[]): Track[] {
  const seen = new Set<string>();
  const tracks: Track[] = [];
  for (const item of results) {
    if (item.wrapperType !== 'track' || !item.trackName) continue;
    // The same song often appears on several albums and compilations.
    const key = `${item.trackName}|${item.artistName}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const artwork = item.artworkUrl100 ?? '';
    tracks.push({
      id: item.trackId.toString(),
      name: item.trackName,
      artist: item.artistName,
      album: item.collectionName,
      artworkUrl: artwork && resizeArtwork(artwork, 600),
      thumbnailUrl: artwork && resizeArtwork(artwork, 300),
      durationMs: item.trackTimeMillis,
    });
  }
  return tracks;
}

export async function searchTracks(query: string, signal?: AbortSignal): Promise<Track[]> {
  const key = query.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('term', query.trim());
  url.searchParams.set('entity', 'song');
  url.searchParams.set('limit', '25');

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Song search failed (${response.status})`);
  }

  const data: ITunesResponse = await response.json();
  const tracks = mapResults(data.results);
  cache.set(key, tracks);
  return tracks;
}
