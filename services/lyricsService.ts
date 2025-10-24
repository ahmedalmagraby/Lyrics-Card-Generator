
import { LyricsLine } from '../types';

const API_URL = 'https://lrclib.net/api/get';

interface LrcLibResponse {
    syncedLyrics?: string;
}

function parseLRC(lrcContent: string): LyricsLine[] {
    const lines = lrcContent.split('\n');
    const lyrics: LyricsLine[] = [];

    for (const line of lines) {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
            const time = minutes * 60 + seconds + milliseconds / 1000;
            const text = match[4].trim();
            if (text) {
                lyrics.push({ time, line: text });
            }
        }
    }
    return lyrics;
}


export async function fetchLyrics(artistName: string, trackName: string, albumName: string): Promise<LyricsLine[]> {
    const url = new URL(API_URL);
    url.searchParams.append('artist_name', artistName);
    url.searchParams.append('track_name', trackName);
    url.searchParams.append('album_name', albumName);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
        if (response.status === 404) {
            return []; // No lyrics found, not an error
        }
        throw new Error('Failed to fetch lyrics');
    }

    const data: LrcLibResponse = await response.json();
    
    if (data.syncedLyrics) {
        return parseLRC(data.syncedLyrics);
    }

    return [];
}
