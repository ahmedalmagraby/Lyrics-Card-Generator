import type { CardSize, TextAlign, TextEffect } from './types';

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
  { name: 'Default', className: 'font-lora' },
  { name: 'Classic', className: 'font-eb-garamond' },
  { name: 'Modern', className: 'font-inter' },
  { name: 'Elegant', className: 'font-raleway' },
  { name: 'Bold', className: 'font-oswald' },
  { name: 'Script', className: 'font-dancing-script' },
  { name: 'Handwritten', className: 'font-caveat' },
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
  { id: 'left', name: 'Left' },
  { id: 'center', name: 'Center' },
  { id: 'right', name: 'Right' },
];

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
