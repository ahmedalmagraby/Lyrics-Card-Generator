# Lyrics Card Generator

A React app for turning your favorite song lyrics into shareable image cards. Search for a track, pick the lines you love, style the card, then download, share, or copy it as a high-resolution PNG.

## Features

* **Song search** using the iTunes Search API, with results shown right under the search box, loading skeletons and recent searches.
* **Audio previews**: play a song's 30-second preview from the results or while picking lyrics.
* **Lyrics** from LRCLIB. Uses synced lyrics when available, falls back to plain lyrics, and retries with a fuzzy search (stripping "feat." / "Remastered" suffixes) when the exact lookup misses. If a song has no lyrics, or you want different wording, you can paste your own.
* **Lyrics in any direction**: Arabic and Hebrew lyrics run right to left automatically, on the card and in every list and text box, and mixed lines keep their words in the right order. Arabic, Hebrew, Japanese, Korean and Chinese each get a matching font, which only downloads when a card needs it.
* **Line selection**: click to toggle, Shift-click to select a range, filter to find a line in long songs.
* **Customization**:
  * One-tap templates (Artwork Blur, Spotlight, Minimal, Neon, Sunset, Night Story, Notebook) and a Surprise me shuffle.
  * Card sizes: Classic (fits content), Square 1:1, Portrait 4:5, Story 9:16.
  * Backgrounds: colors extracted from the album artwork, presets, custom colors, gradients, the blurred album cover, or your own photo (with blur and dim controls).
  * Seven fonts, three text sizes, left/center/right alignment, shadow, outline or glow effects.
  * Tap words on the card to highlight them (colored text or marker), edit the song name, artist and lines, and add a caption.
  * Text color picked automatically for contrast (can be overridden).
* **Export**: download a 3x PNG, share via the Web Share API (mobile), or copy the image to the clipboard. The export matches the preview exactly.
* **Your cards**: saved or exported cards are kept in the browser, so you can reopen and tweak them later.
* **Light/dark mode** that follows your system setting until you choose one, with no flash on load.
* **Works on phones**: the preview scales to fit, and the browser back button steps back through the flow.
* **Accessible**: keyboard operable, visible focus, labelled controls, AA-contrast buttons, reduced-motion support.

## Tech stack

* [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/) (strict)
* [Vite](https://vitejs.dev/) 6
* [Tailwind CSS](https://tailwindcss.com/) 4 via `@tailwindcss/vite`
* Self-hosted fonts via [Fontsource](https://fontsource.org/), including Noto fonts for Arabic, Hebrew and CJK
* [modern-screenshot](https://github.com/qq15725/modern-screenshot) for image export (loaded on demand)
* [Vitest](https://vitest.dev/) for unit tests

## APIs used

No API keys are required.

1. **[iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html)**: song search and metadata (`services/itunesService.ts`).
2. **[LRCLIB](https://lrclib.net/)**: synced and plain lyrics (`services/lyricsService.ts`).

## Getting started

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000/Lyrics-Card-Generator/.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check with `tsc` |
| `npm test` | Run unit tests |

## Deployment

`.github/workflows/deploy.yml` type-checks, tests and builds every push and pull request, and deploys `main` to **GitHub Pages**. In the repository go to **Settings → Pages** and set the source to **GitHub Actions**.

The app is served from `/Lyrics-Card-Generator/` (see `base` in `vite.config.ts`). Change it if your repository has a different name.

## Project structure

```
├── .github/workflows/     # CI + GitHub Pages deploy
├── components/
│   ├── SearchStep.tsx     # Search box + results grid
│   ├── LyricsSelectStep.tsx
│   ├── CustomizeStep.tsx  # Controls, scaled preview, export actions
│   ├── LyricsCard.tsx     # The card that gets rendered to PNG
│   └── ...
├── services/              # iTunes and LRCLIB clients (with caching)
├── utils/                 # Color math, artwork palette, filename, export helpers, script and direction detection
├── public/                # Favicon and placeholder artwork
├── App.tsx                # Flow, state and navigation
├── constants.ts           # Colors, fonts, card sizes
├── types.ts
└── index.css              # Tailwind theme, fonts, base styles
```

## License

[MIT](https://opensource.org/licenses/MIT)
