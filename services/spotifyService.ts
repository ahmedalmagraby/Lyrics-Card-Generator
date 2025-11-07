import { Track } from '../types';

// NOTE: This service uses the public Apple iTunes Search API for song searches.
// The data is mapped to a generic 'Track' interface for use throughout the application.

interface ITunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  wrapperType: string;
}

interface ITunesResponse {
  resultCount: number;
  results: ITunesResult[];
}

/**
 * Searches for songs using the public Apple iTunes Search API.
 * @param query The search query (e.g., song title, artist).
 * @returns A promise that resolves to an array of tracks matching the Track interface.
 */
export async function searchTracks(query: string): Promise<Track[]> {
  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.append('term', query);
  url.searchParams.append('entity', 'song');
  url.searchParams.append('limit', '12');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to search for songs. Please try again.');
  }

  const data: ITunesResponse = await response.json();
  
  // Map the iTunes API response to the Track interface used throughout the app.
  return data.results
    // Filter out any non-song results that might sneak in
    .filter(item => item.wrapperType === 'track' && item.trackName)
    .map((item: ITunesResult) => ({
      id: item.trackId.toString(),
      name: item.trackName,
      artists: [{ name: item.artistName }],
      album: {
        name: item.collectionName,
        // Replace the default 100x100 image with a higher resolution 600x600 one.
        images: [{ url: item.artworkUrl100.replace('100x100', '600x600') }],
      },
  }));
}