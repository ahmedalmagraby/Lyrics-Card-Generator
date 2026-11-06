import { describe, expect, it } from 'vitest';
import { FONT_OPTIONS, TEXT_ALIGN_OPTIONS, textAlignOptions } from '../constants';
import { rangeCovers } from './exportFonts';
import { cardDirection, detectScripts, normalizeTextAlign, physicalAlign, textDirection } from './script';
import { cardFontStack, stackFamilies } from './scriptFonts';
import { cardFilename } from './filename';

describe('detectScripts', () => {
  it.each([
    ['مرحبا', ['arabic']],
    ['سلام دنیا', ['arabic']],
    ['שלום', ['hebrew']],
    ['こんにちは', ['japanese']],
    ['カタカナ', ['japanese']],
    ['안녕하세요', ['korean']],
    ['你好世界', ['chinese']],
    ['Hello, Привет, Γειά', []],
    ['', []],
  ])('%s', (text, expected) => {
    expect(detectScripts(text)).toEqual(expected);
  });

  it('treats Han characters next to kana as Japanese, not Chinese', () => {
    expect(detectScripts('東京のこと')).toEqual(['japanese']);
  });

  it('treats Han characters next to Hangul as Korean, not Chinese', () => {
    expect(detectScripts('大韓民国 대한민국')).toEqual(['korean']);
  });

  it('finds every script in mixed text', () => {
    expect(detectScripts('Hello مرحبا שלום')).toEqual(['arabic', 'hebrew']);
  });
});

describe('textDirection', () => {
  it.each([
    ['مرحبا بالعالم', 'rtl'],
    ['שלום עולם', 'rtl'],
    ['Hello world', 'ltr'],
    ['你好', 'ltr'],
    ['', 'ltr'],
    ['123 !?', 'ltr'],
  ])('%s -> %s', (text, expected) => {
    expect(textDirection(text)).toBe(expected);
  });

  it('follows most of the letters, not the first one', () => {
    expect(textDirection('Baby حبيبي يا نور العين')).toBe('rtl');
    expect(textDirection('حب is all you need in this world')).toBe('ltr');
  });
});

describe('cardDirection', () => {
  it('follows the lyrics over the title', () => {
    expect(cardDirection(['مرحبا بالعالم'], 'English Title')).toBe('rtl');
    expect(cardDirection(['Hello world'], 'عنوان')).toBe('ltr');
  });

  it('uses the title when the lyrics have no letters', () => {
    expect(cardDirection(['123 !'], 'عنوان')).toBe('rtl');
    expect(cardDirection([], 'عنوان')).toBe('rtl');
  });
});

describe('alignment', () => {
  it('flips start and end on right-to-left cards', () => {
    expect(physicalAlign('start', 'ltr')).toBe('left');
    expect(physicalAlign('end', 'ltr')).toBe('right');
    expect(physicalAlign('start', 'rtl')).toBe('right');
    expect(physicalAlign('end', 'rtl')).toBe('left');
    expect(physicalAlign('center', 'rtl')).toBe('center');
  });

  it('labels every button with the side it really aligns to', () => {
    for (const direction of ['ltr', 'rtl'] as const) {
      const options = textAlignOptions(direction);
      expect(options.map(o => o.name)).toEqual(['Left', 'Center', 'Right']);
      for (const option of options) expect(physicalAlign(option.id, direction)).toBe(option.name.toLowerCase());
    }
    expect(TEXT_ALIGN_OPTIONS.map(o => o.id)).toEqual(['start', 'center', 'end']);
  });

  it('upgrades alignment from older saved cards', () => {
    expect(normalizeTextAlign('left')).toBe('start');
    expect(normalizeTextAlign('right')).toBe('end');
    expect(normalizeTextAlign('center')).toBe('center');
    expect(normalizeTextAlign('start')).toBe('start');
    expect(normalizeTextAlign('end')).toBe('end');
  });
});

describe('cardFontStack', () => {
  it('leaves Latin cards on the chosen font alone', () => {
    expect(cardFontStack('font-lora', [])).toBeUndefined();
  });

  it('puts the chosen font first and the generic font last', () => {
    expect(cardFontStack('font-lora', ['arabic'])).toBe('"Lora", "Noto Naskh Arabic Variable", serif');
    expect(cardFontStack('font-inter', ['arabic'])).toBe('"Inter", "Noto Sans Arabic Variable", sans-serif');
    expect(cardFontStack('font-oswald', ['hebrew'])).toBe('"Oswald", "Noto Sans Hebrew Variable", sans-serif');
    expect(cardFontStack('font-caveat', ['hebrew'])).toBe('"Caveat", "Noto Serif Hebrew Variable", cursive');
  });

  it('falls back to Traditional Chinese after Simplified', () => {
    expect(stackFamilies(cardFontStack('font-inter', ['chinese'])!)).toEqual([
      'Inter',
      'Noto Sans SC Variable',
      'Noto Sans TC Variable',
      'sans-serif',
    ]);
  });

  it('has a stack for every font option', () => {
    for (const font of FONT_OPTIONS) expect(cardFontStack(font.className, ['korean'])).toContain('Noto Sans KR Variable');
  });
});

describe('stackFamilies', () => {
  it('reads the format browsers report', () => {
    expect(stackFamilies('Lora, "Noto Naskh Arabic Variable", serif')).toEqual(['Lora', 'Noto Naskh Arabic Variable', 'serif']);
  });
});

describe('rangeCovers', () => {
  const code = (c: string) => c.codePointAt(0)!;

  it('matches single values and ranges', () => {
    expect(rangeCovers('U+0-FF, U+131', [code('a')])).toBe(true);
    expect(rangeCovers('U+0-FF, U+131', [0x131])).toBe(true);
    expect(rangeCovers('U+0-FF, U+131', [0x132])).toBe(false);
  });

  it('matches lowercase ranges and characters beyond the basic plane', () => {
    expect(rangeCovers('U+25ee8,U+25f23', [0x25f23])).toBe(true);
    expect(rangeCovers('U+25ee8,U+25f23', [0x25f24])).toBe(false);
  });

  it('matches wildcards', () => {
    expect(rangeCovers('U+4??', [0x4a0])).toBe(true);
    expect(rangeCovers('U+4??', [0x500])).toBe(false);
  });

  it('treats a missing range as covering everything', () => {
    expect(rangeCovers('', [0x10])).toBe(true);
  });

  it('is true if any one character is covered', () => {
    expect(rangeCovers('U+600-6FF', [code('a'), code('م')])).toBe(true);
  });
});

describe('cardFilename with non-Latin names', () => {
  it('keeps the letters intact', () => {
    expect(cardFilename('فنان', 'أغنية جميلة')).toBe('فنان-أغنية-جميلة-lyrics.png'.normalize('NFC'));
  });

  it('keeps Korean and Japanese characters composed', () => {
    const name = cardFilename('아이유', 'がんばれ');
    expect(name).toBe('아이유-がんばれ-lyrics.png'.normalize('NFC'));
  });
});
