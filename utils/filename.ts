/** Builds a filesystem-safe PNG name like `the-weeknd-blinding-lights-lyrics.png`. */
export function cardFilename(artist: string, title: string): string {
  const slug = `${artist} ${title}`
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[/\\:*?"<>|.,'()[\]{}!@#$%^&+=~`;]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/^-|-$/g, '');
  return `${slug || 'lyrics-card'}-lyrics.png`;
}
