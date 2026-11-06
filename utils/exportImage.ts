import { embeddedFontCss } from './exportFonts';
import { loadFontFamilies, stackFamilies } from './scriptFonts';

/** Makes sure the card's fonts are available, and returns the options that embed them in the image. */
async function fontOptions(node: HTMLElement) {
  await loadFontFamilies(stackFamilies(getComputedStyle(node).fontFamily));
  await document.fonts.ready;
  const cssText = await embeddedFontCss(node);
  return cssText ? { font: { cssText } } : {};
}

/**
 * Renders a DOM node to a high-resolution PNG. modern-screenshot is loaded on demand and
 * draws the node through the browser's own layout engine (an SVG foreignObject), so the
 * image matches what's on screen, including text positioning and fonts.
 */
export async function renderToBlob(node: HTMLElement): Promise<Blob> {
  const [{ domToBlob }, font] = await Promise.all([import('modern-screenshot'), fontOptions(node)]);
  return domToBlob(node, {
    ...font,
    // Layout size, not the on-screen size: the preview is scaled down with a CSS transform on phones.
    width: node.offsetWidth,
    height: node.offsetHeight,
    scale: 3,
    type: 'image/png',
    backgroundColor: null,
    // Don't set `font.preferredFormat`: in modern-screenshot 4.7 it drops the data of every
    // other @font-face (e.g. bold Latin), so text silently falls back to another font.
  });
}

/** Small preview for the saved-cards gallery (WebP keeps the rounded corners transparent). */
export async function renderThumbnail(node: HTMLElement): Promise<string> {
  const [{ domToWebp }, font] = await Promise.all([import('modern-screenshot'), fontOptions(node)]);
  return domToWebp(node, {
    ...font,
    width: node.offsetWidth,
    height: node.offsetHeight,
    scale: 0.5,
    quality: 0.8,
    backgroundColor: null,
  });
}

/** Reads an image file, downscaled so it fits in `maxSize` px, as a JPEG data URL. */
export function imageFileToDataUrl(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * ratio);
      canvas.height = Math.round(img.naturalHeight * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas unavailable'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image'));
    };
    img.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const canCopyImage = (): boolean =>
  typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write;

export function canShareFiles(): boolean {
  if (!navigator.canShare) return false;
  const probe = new File([new Blob()], 'probe.png', { type: 'image/png' });
  return navigator.canShare({ files: [probe] });
}
