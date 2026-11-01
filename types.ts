export enum AppStep {
  SEARCH,
  SELECT_LYRICS,
  CUSTOMIZE,
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  /** 600x600 artwork used on the card. */
  artworkUrl: string;
  /** Smaller artwork for the results grid. */
  thumbnailUrl: string;
  durationMs?: number;
}

export interface LyricsLine {
  /** Seconds from song start for synced lyrics, line number for plain lyrics. */
  time: number;
  line: string;
}

export interface LyricsResult {
  lines: LyricsLine[];
  /** False when only plain (unsynced) lyrics were available. */
  synced: boolean;
  instrumental: boolean;
}

export type BackgroundType = 'solid' | 'gradient';

export interface Background {
  type: BackgroundType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  /** Gradient angle in degrees. */
  angle: number;
}

export type TextEffect = 'none' | 'shadow' | 'outline';
export type TextAlign = 'left' | 'center' | 'right';
export type CardSize = 'classic' | 'square' | 'portrait' | 'story';

export interface CustomizationOptions {
  background: Background;
  isTextLight: boolean;
  fontFamily: string;
  fontSize: string;
  textEffect: TextEffect;
  textAlign: TextAlign;
  cardSize: CardSize;
}
