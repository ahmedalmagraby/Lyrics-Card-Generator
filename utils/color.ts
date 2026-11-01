import type { Background } from '../types';

type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** True when white text has better contrast than black text on this color. */
export function prefersLightText(hex: string): boolean {
  const l = relativeLuminance(hex);
  const contrastWhite = 1.05 / (l + 0.05);
  const contrastBlack = (l + 0.05) / 0.05;
  return contrastWhite >= contrastBlack;
}

export function mixHex(a: string, b: string): string {
  const [ra, ga, ba] = hexToRgb(a);
  const [rb, gb, bb] = hexToRgb(b);
  return rgbToHex([(ra + rb) / 2, (ga + gb) / 2, (ba + bb) / 2]);
}

export function backgroundToCss(bg: Background): string {
  // Image backgrounds use the solid color as a base while the image loads.
  return bg.type === 'gradient'
    ? `linear-gradient(${bg.angle}deg, ${bg.gradientFrom}, ${bg.gradientTo})`
    : bg.color;
}

export function prefersLightTextFor(bg: Background): boolean {
  switch (bg.type) {
    case 'solid':
      return prefersLightText(bg.color);
    case 'gradient':
      return prefersLightText(mixHex(bg.gradientFrom, bg.gradientTo));
    default:
      // Photos are unpredictable; light text with a dim overlay reads best on most of them.
      return true;
  }
}

/** HSV saturation (0-1). */
export function saturationOf(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b);
  return max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
}

/** Raises a dark color's brightness (HSV value) to `minValue`, keeping its hue, and softens it slightly. */
export function brighten(hex: string, minValue = 0.85): string {
  const rgb = hexToRgb(hex);
  const max = Math.max(...rgb);
  if (max / 255 >= minValue) return hex;
  const factor = (255 * 0.96) / Math.max(max, 1);
  const scaled = rgb.map(v => Math.min(255, v * factor));
  return rgbToHex(scaled.map(v => v + (255 - v) * 0.2) as RGB);
}

/**
 * The most vivid artwork color, for accents. Dark colors are brightened so highlights stay
 * readable; returns `fallback` when the artwork has no real color (greys, black and white).
 */
export function vividColor(colors: string[], fallback: string): string {
  const value = (c: string) => Math.max(...hexToRgb(c)) / 255;
  const candidates = colors.filter(c => value(c) > 0.2 && saturationOf(c) > 0.35);
  const best = candidates.sort((a, b) => saturationOf(b) * (0.5 + value(b) / 2) - saturationOf(a) * (0.5 + value(a) / 2))[0];
  return best ? brighten(best) : fallback;
}
