import type { Background, CustomizationOptions } from '../types';
import { FONT_OPTIONS, GRADIENT_PRESETS, PRESET_COLORS, TEXT_ALIGN_OPTIONS } from '../constants';
import { prefersLightTextFor, vividColor } from './color';

export interface TemplateContext {
  artworkColors: string[];
}

type TemplatePatch = Partial<Omit<CustomizationOptions, 'background'>> & { background: Partial<Background> };

export interface Template {
  id: string;
  name: string;
  build: (ctx: TemplateContext) => TemplatePatch;
}

const BRAND_GREEN = '#1DB954';

export const TEMPLATES: Template[] = [
  {
    id: 'blur',
    name: 'Artwork Blur',
    build: ({ artworkColors }) => ({
      background: { type: 'artwork', blur: 28, dim: 0.45 },
      fontFamily: 'font-inter',
      textAlign: 'left',
      textEffect: 'shadow',
      cardSize: 'classic',
      highlightStyle: 'color',
      accentColor: vividColor(artworkColors, BRAND_GREEN),
    }),
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    build: ({ artworkColors }) => ({
      background: { type: 'solid', color: artworkColors[0] ?? '#2D46B9' },
      fontFamily: 'font-inter',
      textAlign: 'left',
      textEffect: 'none',
      cardSize: 'classic',
      highlightStyle: 'marker',
      accentColor: '#FFFFFF',
    }),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    build: () => ({
      background: { type: 'solid', color: '#F4F1EA' },
      isTextLight: false,
      fontFamily: 'font-eb-garamond',
      textAlign: 'left',
      textEffect: 'none',
      cardSize: 'square',
      highlightStyle: 'marker',
      accentColor: '#F7D774',
    }),
  },
  {
    id: 'neon',
    name: 'Neon',
    build: () => ({
      background: { type: 'solid', color: '#0B0B14' },
      isTextLight: true,
      fontFamily: 'font-oswald',
      textAlign: 'center',
      textEffect: 'glow',
      cardSize: 'portrait',
      highlightStyle: 'color',
      accentColor: '#FF2BD6',
    }),
  },
  {
    id: 'sunset',
    name: 'Sunset',
    build: () => ({
      background: { type: 'gradient', gradientFrom: '#ee0979', gradientTo: '#ff6a00', angle: 135 },
      isTextLight: true,
      fontFamily: 'font-dancing-script',
      textAlign: 'center',
      textEffect: 'shadow',
      cardSize: 'square',
      highlightStyle: 'color',
      accentColor: '#FFE29A',
    }),
  },
  {
    id: 'story',
    name: 'Night Story',
    build: ({ artworkColors }) => ({
      background: { type: 'artwork', blur: 40, dim: 0.6 },
      fontFamily: 'font-oswald',
      textAlign: 'center',
      textEffect: 'none',
      cardSize: 'story',
      highlightStyle: 'color',
      accentColor: vividColor(artworkColors, BRAND_GREEN),
    }),
  },
  {
    id: 'notebook',
    name: 'Notebook',
    build: () => ({
      background: { type: 'solid', color: '#FFFBEA' },
      isTextLight: false,
      fontFamily: 'font-caveat',
      textAlign: 'left',
      textEffect: 'none',
      cardSize: 'portrait',
      highlightStyle: 'marker',
      accentColor: '#9AE6B4',
    }),
  },
];

/** Merges a template into the current options. Text color follows the background unless the template sets it. */
export function applyTemplate(current: CustomizationOptions, patch: TemplatePatch): CustomizationOptions {
  const background = { ...current.background, ...patch.background };
  return {
    ...current,
    ...patch,
    background,
    isTextLight: patch.isTextLight ?? prefersLightTextFor(background),
  };
}

const pick = <T,>(items: readonly T[], random: () => number): T => items[Math.floor(random() * items.length)];

/** A random but tasteful combination, built from the same parts the controls offer. */
export function surpriseMe({ artworkColors }: TemplateContext, random: () => number = Math.random): TemplatePatch {
  const colors = artworkColors.length ? artworkColors : PRESET_COLORS;
  const gradient = pick(GRADIENT_PRESETS, random);
  const backgrounds: Partial<Background>[] = [
    { type: 'solid', color: pick(colors, random) },
    { type: 'solid', color: pick(PRESET_COLORS, random) },
    { type: 'gradient', gradientFrom: gradient.from, gradientTo: gradient.to, angle: pick([45, 90, 135, 180], random) },
    { type: 'artwork', blur: pick([16, 28, 40], random), dim: pick([0.35, 0.45, 0.55], random) },
  ];
  return {
    background: pick(backgrounds, random),
    fontFamily: pick(FONT_OPTIONS, random).className,
    textAlign: pick(TEXT_ALIGN_OPTIONS, random).id,
    textEffect: pick(['none', 'shadow', 'glow'] as const, random),
    highlightStyle: pick(['color', 'marker'] as const, random),
    accentColor: vividColor(colors, BRAND_GREEN),
  };
}
