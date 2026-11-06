import type { CardSize, TextAlign, TextEffect } from './types';
import type { TextDirection } from './utils/script';

export const PRESET_COLORS = [
  '#1DB954', // Green
  '#EF0078', // Pink
  '#F18A00', // Orange
  '#E13300', // Red
  '#008743', // Dark Green
  '#2D46B9', // Blue
  '#8400E1', // Purple
  '#191414', // Black
];

export const GRADIENT_PRESETS = [
  { from: '#ff7e5f', to: '#feb47b' }, // Sunset
  { from: '#6a11cb', to: '#2575fc' }, // Indigo
  { from: '#11998e', to: '#38ef7d' }, // Mint
  { from: '#ee0979', to: '#ff6a00' }, // Flame
  { from: '#0f2027', to: '#2c5364' }, // Midnight
  { from: '#c471f5', to: '#fa71cd' }, // Candy
];

export const FONT_OPTIONS = [
  { name: 'Default', className: 'font-lora', family: 'Lora', generic: 'serif', scriptStyle: 'serif' },
  { name: 'Classic', className: 'font-eb-garamond', family: 'EB Garamond', generic: 'serif', scriptStyle: 'serif' },
  { name: 'Modern', className: 'font-inter', family: 'Inter', generic: 'sans-serif', scriptStyle: 'sans' },
  { name: 'Elegant', className: 'font-raleway', family: 'Raleway', generic: 'sans-serif', scriptStyle: 'sans' },
  { name: 'Bold', className: 'font-oswald', family: 'Oswald', generic: 'sans-serif', scriptStyle: 'sans' },
  { name: 'Script', className: 'font-dancing-script', family: 'Dancing Script', generic: 'cursive', scriptStyle: 'serif' },
  { name: 'Handwritten', className: 'font-caveat', family: 'Caveat', generic: 'cursive', scriptStyle: 'serif' },
] as const;

export const FONT_SIZE_OPTIONS = [
  { name: 'Small', className: 'text-xl' },
  { name: 'Medium', className: 'text-2xl' },
  { name: 'Large', className: 'text-3xl' },
] as const;

export const TEXT_EFFECT_OPTIONS: readonly { id: TextEffect; name: string }[] = [
  { id: 'none', name: 'None' },
  { id: 'shadow', name: 'Shadow' },
  { id: 'outline', name: 'Outline' },
  { id: 'glow', name: 'Glow' },
];

/** Accent colors for highlighted words and the glow effect (artwork colors are offered too). */
export const ACCENT_PRESETS = ['#1DB954', '#F7D774', '#FF2BD6', '#38BDF8', '#FF6A00', '#FFFFFF'];

export const MAX_CAPTION_LENGTH = 80;

/** Uploaded photos are downscaled to this many px on the long side. */
export const PHOTO_MAX_SIZE = 1200;

export const TEXT_ALIGN_OPTIONS: readonly { id: TextAlign; name: string }[] = [
  { id: 'start', name: 'Left' },
  { id: 'center', name: 'Center' },
  { id: 'end', name: 'Right' },
];

const RTL_TEXT_ALIGN_OPTIONS: readonly { id: TextAlign; name: string }[] = [
  { id: 'end', name: 'Left' },
  { id: 'center', name: 'Center' },
  { id: 'start', name: 'Right' },
];

/** The alignment buttons always read Left, Center, Right; what each one stores depends on the direction. */
export const textAlignOptions = (direction: TextDirection) =>
  direction === 'rtl' ? RTL_TEXT_ALIGN_OPTIONS : TEXT_ALIGN_OPTIONS;

/** Card width is fixed; `aspect` is width / height (null = grows with content). */
export const CARD_SIZE_OPTIONS: readonly { id: CardSize; name: string; hint: string; aspect: number | null }[] = [
  { id: 'classic', name: 'Classic', hint: 'Fits content', aspect: null },
  { id: 'square', name: 'Square', hint: '1:1', aspect: 1 },
  { id: 'portrait', name: 'Portrait', hint: '4:5', aspect: 4 / 5 },
  { id: 'story', name: 'Story', hint: '9:16', aspect: 9 / 16 },
];

export const CARD_WIDTH = 400;

/** Selecting more lines than this makes the card very tall. */
export const RECOMMENDED_MAX_LINES = 8;

export const PLACEHOLDER_ARTWORK = `${import.meta.env.BASE_URL}placeholder-artwork.svg`;
