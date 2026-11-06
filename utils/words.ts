import { CJK } from './script';

export interface Token {
  text: string;
  /** Sequential index for words; null for whitespace. */
  word: number | null;
}

/** Chinese and Japanese don't put spaces between words, so ask the browser where the words are. */
function splitCjk(text: string): string[] {
  if (typeof Intl.Segmenter === 'undefined') return Array.from(text);
  const segments = new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text);
  return Array.from(segments, s => s.segment);
}

/** Splits a line into words and the whitespace between them, so words can be highlighted individually. */
export function tokenize(line: string): Token[] {
  let word = 0;
  return line
    .split(/(\s+)/)
    .filter(Boolean)
    .flatMap(text => (CJK.test(text) ? splitCjk(text) : [text]))
    .map(text => (/^\s+$/.test(text) ? { text, word: null } : { text, word: word++ }));
}

export function toggleIndex(list: number[] | undefined, index: number): number[] {
  const current = list ?? [];
  return current.includes(index) ? current.filter(i => i !== index) : [...current, index].sort((a, b) => a - b);
}
