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
  /** 30-second audio preview from iTunes. */
  previewUrl?: string;
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

/** `artwork` and `photo` draw an image (optionally blurred and dimmed) behind the text. */
export type BackgroundType = 'solid' | 'gradient' | 'artwork' | 'photo';

export interface Background {
  type: BackgroundType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  /** Gradient angle in degrees. */
  angle: number;
  /** Blur radius in px for image backgrounds. */
  blur: number;
  /** Black overlay opacity (0-1) for image backgrounds. */
  dim: number;
  /** Uploaded photo as a data URL. */
  photo?: string;
}

export type TextEffect = 'none' | 'shadow' | 'outline' | 'glow';
export type TextAlign = 'left' | 'center' | 'right';
export type CardSize = 'classic' | 'square' | 'portrait' | 'story';
export type HighlightStyle = 'color' | 'marker';

export interface CustomizationOptions {
  background: Background;
  isTextLight: boolean;
  fontFamily: string;
  fontSize: string;
  textEffect: TextEffect;
  textAlign: TextAlign;
  cardSize: CardSize;
  /** Color for highlighted words and the glow effect. */
  accentColor: string;
  highlightStyle: HighlightStyle;
}

/** The user's changes on top of the selected lyrics. Keys are indices into the song's lyrics. */
export interface CardText {
  edits: Record<number, string>;
  /** Word indices (see utils/words.ts) highlighted per line. */
  highlights: Record<number, number[]>;
  caption: string;
}

export interface CardLine {
  /** Index of the line in the song's lyrics. */
  id: number;
  text: string;
  highlights: number[];
}

export interface SavedCard {
  id: string;
  savedAt: number;
  song: Track;
  lineIndices: number[];
  /** Line text at save time, in case the lyrics source changes later. */
  lineTexts: string[];
  cardText: CardText;
  customization: CustomizationOptions;
  /** Small rendered preview as a data URL. */
  thumbnail: string;
}
