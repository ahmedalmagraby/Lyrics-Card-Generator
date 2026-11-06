import { stackFamilies } from './scriptFonts';

// modern-screenshot embeds every @font-face of a family, but a CJK font is split into over 100
// files. Building the CSS here means an image only carries the files its characters need.

/** Whether a CSS `unicode-range` value covers any of the code points. */
export function rangeCovers(unicodeRange: string, codePoints: number[]): boolean {
  const range = unicodeRange.trim();
  if (!range) return true;
  return range.split(',').some(part => {
    const value = part.trim().replace(/^u\+/i, '');
    const [from, to = from] = value.includes('?')
      ? [value.replace(/\?/g, '0'), value.replace(/\?/g, 'f')]
      : value.split('-');
    const start = parseInt(from, 16);
    const end = parseInt(to, 16);
    return codePoints.some(c => c >= start && c <= end);
  });
}

function fontFaceRules(rules: CSSRuleList, out: CSSFontFaceRule[] = []): CSSFontFaceRule[] {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSFontFaceRule) out.push(rule);
    else if ('cssRules' in rule) fontFaceRules((rule as CSSGroupingRule).cssRules, out);
  }
  return out;
}

function allFontFaces(): CSSFontFaceRule[] {
  return Array.from(document.styleSheets).flatMap(sheet => {
    try {
      return fontFaceRules(sheet.cssRules);
    } catch {
      return []; // stylesheets from another origin can't be read
    }
  });
}

const dataUrls = new Map<string, Promise<string>>();

function toDataUrl(url: string): Promise<string> {
  let result = dataUrls.get(url);
  if (!result) {
    result = fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`Font request failed (${response.status})`);
        return response.blob();
      })
      .then(
        blob =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          })
      );
    result.catch(() => dataUrls.delete(url));
    dataUrls.set(url, result);
  }
  return result;
}

async function embedRule(rule: CSSFontFaceRule): Promise<string | null> {
  const { style, parentStyleSheet } = rule;
  // The first source is woff2, which every browser that can export an image supports.
  const source = style.getPropertyValue('src').match(/url\(["']?([^"')]+)/)?.[1];
  if (!source) return null;
  try {
    const url = new URL(source, parentStyleSheet?.href ?? document.baseURI).href;
    const data = url.startsWith('data:') ? url : await toDataUrl(url);
    const range = style.getPropertyValue('unicode-range');
    return (
      `@font-face{font-family:${style.getPropertyValue('font-family')};` +
      `font-style:${style.getPropertyValue('font-style') || 'normal'};` +
      `font-weight:${style.getPropertyValue('font-weight') || 'normal'};` +
      `src:url("${data}");${range ? `unicode-range:${range};` : ''}}`
    );
  } catch (err) {
    console.warn('Could not embed a font in the image', err);
    return null;
  }
}

/** The @font-face CSS an image of `node` needs, with each font file inlined. */
export async function embeddedFontCss(node: HTMLElement): Promise<string> {
  const families = new Set(stackFamilies(getComputedStyle(node).fontFamily));
  const codePoints = [...new Set(Array.from(node.textContent ?? '', c => c.codePointAt(0)!))];
  const rules = allFontFaces().filter(
    rule =>
      stackFamilies(rule.style.getPropertyValue('font-family')).some(f => families.has(f)) &&
      rangeCovers(rule.style.getPropertyValue('unicode-range'), codePoints)
  );
  const css = await Promise.all(rules.map(embedRule));
  return css.filter(Boolean).join('\n');
}
