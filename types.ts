export enum AppStep {
  SEARCH,
  SELECT_SONG,
  SELECT_LYRICS,
  CUSTOMIZE,
}

export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

export interface LyricsLine {
  time: number;
  line: string;
}

export interface CustomizationOptions {
  background: string; // Can be solid color or gradient
  isTextLight: boolean;
  fontFamily: string;
  fontSize: string;
  textEffect: 'none' | 'shadow' | 'outline';
}
