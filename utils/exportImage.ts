/**
 * Renders a DOM node to a high-resolution PNG. modern-screenshot is loaded on demand and
 * draws the node through the browser's own layout engine (an SVG foreignObject), so the
 * image matches what's on screen, including text positioning and fonts.
 */
export async function renderToBlob(node: HTMLElement): Promise<Blob> {
  const [{ domToBlob }] = await Promise.all([import('modern-screenshot'), document.fonts.ready]);
  return domToBlob(node, {
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
