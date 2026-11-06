import { FONT_OPTIONS } from '../constants';
import type { Script } from './script';

// These fonts are large, so a font is only downloaded once a card needs it. The browser then
// fetches just the parts of it that cover the characters on screen.

const LOADERS: Record<string, () => Promise<unknown>> = {
  'Noto Naskh Arabic Variable': () => import('@fontsource-variable/noto-naskh-arabic/wght.css'),
  'Noto Sans Arabic Variable': () => import('@fontsource-variable/noto-sans-arabic/wght.css'),
  'Noto Serif Hebrew Variable': () => import('@fontsource-variable/noto-serif-hebrew/wght.css'),
  'Noto Sans Hebrew Variable': () => import('@fontsource-variable/noto-sans-hebrew/wght.css'),
  'Noto Sans JP Variable': () => import('@fontsource-variable/noto-sans-jp/wght.css'),
  'Noto Sans KR Variable': () => import('@fontsource-variable/noto-sans-kr/wght.css'),
  'Noto Sans SC Variable': () => import('@fontsource-variable/noto-sans-sc/wght.css'),
  'Noto Sans TC Variable': () => import('@fontsource-variable/noto-sans-tc/wght.css'),
};

const CHINESE = ['Noto Sans SC Variable', 'Noto Sans TC Variable']; // Traditional fills in what Simplified lacks

const SCRIPT_FONTS: Record<Script, { serif: string[]; sans: string[] }> = {
  arabic: { serif: ['Noto Naskh Arabic Variable'], sans: ['Noto Sans Arabic Variable'] },
  hebrew: { serif: ['Noto Serif Hebrew Variable'], sans: ['Noto Sans Hebrew Variable'] },
  japanese: { serif: ['Noto Sans JP Variable'], sans: ['Noto Sans JP Variable'] },
  korean: { serif: ['Noto Sans KR Variable'], sans: ['Noto Sans KR Variable'] },
  chinese: { serif: CHINESE, sans: CHINESE },
};

/**
 * The CSS font stack for a card: the chosen font for Latin text, then a matching font for each
 * script. Returns undefined when the chosen font covers everything on its own.
 */
export function cardFontStack(fontClass: string, scripts: Script[]): string | undefined {
  if (scripts.length === 0) return undefined;
  const font = FONT_OPTIONS.find(f => f.className === fontClass) ?? FONT_OPTIONS[0];
  const families = [font.family, ...scripts.flatMap(script => SCRIPT_FONTS[script][font.scriptStyle])];
  return [...families.map(f => `"${f}"`), font.generic].join(', ');
}

/** Splits a CSS font stack into plain family names. */
export function stackFamilies(stack: string): string[] {
  return stack.split(',').map(f => f.trim().replace(/^["']|["']$/g, ''));
}

const loaded = new Map<string, Promise<unknown>>();

/** Loads the CSS for any script fonts in `families`. A failed load leaves the system font in place. */
export function loadFontFamilies(families: string[]): Promise<unknown> {
  return Promise.all(
    families.map(family => {
      const load = LOADERS[family];
      if (!load) return undefined;
      if (!loaded.has(family)) {
        loaded.set(
          family,
          load().catch(err => {
            loaded.delete(family);
            console.warn(`Could not load ${family}`, err);
          })
        );
      }
      return loaded.get(family);
    })
  );
}
