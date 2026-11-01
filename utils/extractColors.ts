import { rgbToHex } from './color';

type RGB = [number, number, number];

const SAMPLE_SIZE = 48;
const MIN_DISTANCE = 60;

function distance(a: RGB, b: RGB): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function saturation([r, g, b]: RGB): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/**
 * Picks up to `count` distinct dominant colors from RGBA pixel data.
 * Pixels are bucketed (4 bits per channel) and buckets are weighted by size and saturation,
 * so vivid colors win over large dull areas.
 */
export function dominantColors(data: Uint8ClampedArray, count = 5): string[] {
  const buckets = new Map<number, { sum: RGB; n: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.sum[0] += r; bucket.sum[1] += g; bucket.sum[2] += b; bucket.n++;
    } else {
      buckets.set(key, { sum: [r, g, b], n: 1 });
    }
  }

  const candidates = [...buckets.values()]
    .map(({ sum, n }) => {
      const rgb: RGB = [sum[0] / n, sum[1] / n, sum[2] / n];
      return { rgb, weight: n * (0.4 + saturation(rgb)) };
    })
    .sort((a, b) => b.weight - a.weight);

  const picked: RGB[] = [];
  for (const { rgb } of candidates) {
    if (picked.every(p => distance(p, rgb) >= MIN_DISTANCE)) picked.push(rgb);
    if (picked.length === count) break;
  }
  return picked.map(rgbToHex);
}

const cache = new Map<string, Promise<string[]>>();

/** Extracts dominant colors from an image URL. Resolves to [] if the image can't be read (e.g. CORS). */
export function extractColors(url: string): Promise<string[]> {
  const cached = cache.get(url);
  if (cached) return cached;

  const promise = new Promise<string[]>(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = SAMPLE_SIZE;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve([]);
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        resolve(dominantColors(ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data));
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = url;
  });
  cache.set(url, promise);
  return promise;
}
