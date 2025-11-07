export const PRESET_COLORS = [
  '#1DB954',
  '#EF0078', // Pink
  '#F18A00', // Orange
  '#E13300', // Red
  '#008743', // Dark Green
  '#2D46B9', // Blue
  '#8400E1', // Purple
  '#191414', // Black
];

export const FONT_OPTIONS = [
    { name: 'Default', className: 'font-lora' },
    { name: 'Modern', className: 'font-lato' },
    { name: 'Classic', className: 'font-eb-garamond' },
    { name: 'Neutral', className: 'font-inter' },
    { name: 'Elegant', className: 'font-raleway' },
    { name: 'Bold', className: 'font-oswald' },
    { name: 'Slab', className: 'font-roboto-slab' },
    { name: 'Script', className: 'font-dancing-script' },
    { name: 'Handwritten', className: 'font-caveat' },
] as const;

export const FONT_SIZE_OPTIONS = [
  { name: 'Small', className: 'text-xl' },
  { name: 'Medium', className: 'text-2xl' },
  { name: 'Large', className: 'text-3xl' },
] as const;

export const TEXT_EFFECT_OPTIONS = [
    { id: 'none', name: 'None' },
    { id: 'shadow', name: 'Shadow' },
    { id: 'outline', name: 'Outline' },
] as const;