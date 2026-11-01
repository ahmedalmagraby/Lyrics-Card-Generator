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
  return bg.type === 'solid'
    ? bg.color
    : `linear-gradient(${bg.angle}deg, ${bg.gradientFrom}, ${bg.gradientTo})`;
}

export function prefersLightTextFor(bg: Background): boolean {
  return prefersLightText(bg.type === 'solid' ? bg.color : mixHex(bg.gradientFrom, bg.gradientTo));
}
