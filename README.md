# Lyrics Card Generator

A React app for turning your favorite song lyrics into shareable image cards. Search for a track, pick the lines you love, style the card, then download, share, or copy it as a high-resolution PNG.

## Features

* **Song search** using the iTunes Search API, with results shown right under the search box, loading skeletons and recent searches.
* **Lyrics** from LRCLIB. Uses synced lyrics when available, falls back to plain lyrics, and retries with a fuzzy search (stripping "feat." / "Remastered" suffixes) when the exact lookup misses.
* **Line selection**: click to toggle, Shift-click to select a range, filter to find a line in long songs.
* **Customization**:
  * Card sizes: Classic (fits content), Square 1:1, Portrait 4:5, Story 9:16.
  * Backgrounds: colors extracted from the album artwork, presets, custom colors, and gradients with an angle control.
  * Seven fonts, three text sizes, left/center/right alignment, shadow or outline effects.
  * Text color picked automatically for contrast (can be overridden).
* **Export**: download a 3x PNG, share via the Web Share API (mobile), or copy the image to the clipboard.
* **Light/dark mode** that follows your system setting until you choose one, with no flash on load.
* **Works on phones**: the preview scales to fit, and the browser back button steps back through the flow.
* **Accessible**: keyboard operable, visible focus, labelled controls, AA-contrast buttons, reduced-motion support.

## Tech stack

* [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/) (strict)
* [Vite](https://vitejs.dev/) 6
* [Tailwind CSS](https://tailwindcss.com/) 4 via `@tailwindcss/vite`
* Self-hosted fonts via [Fontsource](https://fontsource.org/)
* [html2canvas](https://html2canvas.hertzen.com/) for image export (loaded on demand)
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
├── utils/                 # Color math, artwork palette, filename, export helpers
├── public/                # Favicon and placeholder artwork
├── App.tsx                # Flow, state and navigation
├── constants.ts           # Colors, fonts, card sizes
├── types.ts
└── index.css              # Tailwind theme, fonts, base styles
```

## License

[MIT](https://opensource.org/licenses/MIT)
