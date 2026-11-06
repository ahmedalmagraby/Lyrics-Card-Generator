import type { TextAlign } from '../types';

/** Writing systems that need a font of their own. Latin, Cyrillic and Greek are covered by the card fonts. */
export type Script = 'arabic' | 'hebrew' | 'japanese' | 'korean' | 'chinese';
export type TextDirection = 'ltr' | 'rtl';

const ARABIC = /\p{Script=Arabic}/u;
const HEBREW = /\p{Script=Hebrew}/u;
const KANA = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;
const HANGUL = /\p{Script=Hangul}/u;
const HAN = /\p{Script=Han}/u;

const RTL_LETTER = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}]/u;
const LETTER = /\p{L}/u;

/** Text with no spaces between words, so it has to be split into words some other way. */
export const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

export function detectScripts(text: string): Script[] {
  const scripts: Script[] = [];
  if (ARABIC.test(text)) scripts.push('arabic');
  if (HEBREW.test(text)) scripts.push('hebrew');
  const kana = KANA.test(text);
  const hangul = HANGUL.test(text);
  if (kana) scripts.push('japanese');
  if (hangul) scripts.push('korean');
  // Japanese and Korean fonts include their own Han characters.
  if (HAN.test(text) && !kana && !hangul) scripts.push('chinese');
  return scripts;
}

/** The main direction of some text: right-to-left when most of its letters are. Numbers and punctuation don't count. */
export function textDirection(text: string): TextDirection {
  let rtl = 0;
  let ltr = 0;
  for (const char of text) {
    if (RTL_LETTER.test(char)) rtl++;
    else if (LETTER.test(char)) ltr++;
  }
  return rtl > ltr ? 'rtl' : 'ltr';
}

/** A card follows its lyrics, or the song title when the lyrics have no letters in them. */
export function cardDirection(lines: string[], title: string): TextDirection {
  const text = lines.join(' ');
  return textDirection(LETTER.test(text) ? text : title);
}

/** Turns a logical alignment into the physical side of the card. */
export function physicalAlign(align: TextAlign, direction: TextDirection): 'left' | 'center' | 'right' {
  if (align === 'center') return 'center';
  return (align === 'start') === (direction === 'ltr') ? 'left' : 'right';
}

/** Cards saved before alignment followed the text direction stored `left` and `right`. */
export function normalizeTextAlign(align: string): TextAlign {
  if (align === 'left' || align === 'start') return 'start';
  if (align === 'right' || align === 'end') return 'end';
  return 'center';
}
