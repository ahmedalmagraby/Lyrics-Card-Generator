/** Attribute on the element that scales the preview to fit small screens; reset before capture. */
export const PREVIEW_SCALER_ATTR = 'data-card-scaler';

/** Renders a DOM node to a high-resolution PNG. html2canvas is loaded on demand. */
export async function renderToBlob(node: HTMLElement): Promise<Blob> {
  const [{ default: html2canvas }] = await Promise.all([import('html2canvas'), document.fonts.ready]);
  const canvas = await html2canvas(node, {
    scale: 3,
    backgroundColor: null,
    useCORS: true,
    logging: false,
    onclone: doc => {
      // Animations restart in the cloned document; freeze everything at its final state.
      const style = doc.createElement('style');
      style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
      doc.head.appendChild(style);
      // html2canvas reads the page background even when capturing one element, and it
      // can't parse Tailwind v4's oklch() colors. The card itself uses hex/rgba only.
      for (const el of [doc.documentElement, doc.body]) {
        el.style.backgroundColor = 'transparent';
        el.style.color = '#000';
      }
      doc.querySelectorAll<HTMLElement>(`[${PREVIEW_SCALER_ATTR}]`).forEach(el => {
        el.style.transform = 'none';
      });
    },
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Could not encode image'))), 'image/png');
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
