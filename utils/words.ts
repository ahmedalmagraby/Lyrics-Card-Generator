export interface Token {
  text: string;
  /** Sequential index for words; null for whitespace. */
  word: number | null;
}

/** Splits a line into words and the whitespace between them, so words can be highlighted individually. */
export function tokenize(line: string): Token[] {
  let word = 0;
  return line
    .split(/(\s+)/)
    .filter(Boolean)
    .map(text => (/^\s+$/.test(text) ? { text, word: null } : { text, word: word++ }));
}

export function toggleIndex(list: number[] | undefined, index: number): number[] {
  const current = list ?? [];
  return current.includes(index) ? current.filter(i => i !== index) : [...current, index].sort((a, b) => a - b);
}
