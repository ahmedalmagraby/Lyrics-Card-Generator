# Lyrics Card Generator

A beautiful and interactive React application that allows users to create aesthetic lyric cards for their favorite songs. Search for tracks, select specific lyrics, customize the visual style, and download or share high-quality images.

## 🚀 Features

* **Song Search**: Instantly search for songs by title or artist using the iTunes Search API.
* **Lyrics Fetching**: Automatically retrieves synced lyrics using LrcLib.
* **Interactive Selection**: Click to select the specific lines of lyrics you want to feature on your card.
* **Deep Customization**:
* **Backgrounds**: Choose from solid preset colors, custom colors, or create beautiful gradients.
* **Typography**: Select from a wide variety of fonts (Serif, Sans-serif, Handwritten, etc.).
* **Text Effects**: Apply shadows or outlines to make text pop.
* **Theme**: Toggle between Light and Dark text modes.


* **Export & Share**:
* Download cards as high-resolution PNG files.
* Share directly via the Web Share API (on supported mobile devices).


* **Dark/Light Mode**: Fully responsive UI that adapts to system preferences or manual toggles.

## 🛠️ Tech Stack

* **Framework**: [React](https://react.dev/) (v19)
* **Build Tool**: [Vite](https://vitejs.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) (via CDN)
* **Image Generation**: [html2canvas](https://html2canvas.hertzen.com/)
* **Icons**: SVG Icons (Custom components)

## 📡 APIs Used

This project relies on free, public APIs and does not require private API keys for core functionality:

1. **[iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html)**: Used for searching songs and retrieving metadata (Album Art, Artist Name, Track Name).
* *Note: Although the file is named `spotifyService.ts`, the implementation uses Apple's iTunes API.*


2. **[LrcLib](https://lrclib.net/)**: An open API used to fetch synchronized lyrics.

## 🏃‍♂️ Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (Version 18 or 20+ recommended)
* npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lyrics-card-generator.git
cd lyrics-card-generator

```


2. Install dependencies:
```bash
npm install

```


3. Start the development server:
```bash
npm run dev

```


4. Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

## 📖 Usage Guide

1. **Search**: Enter a song title or artist name in the search bar.
2. **Select Song**: Choose the correct track from the search results.
3. **Select Lyrics**: The app will fetch lyrics. Click on the lines you want to include in your card.
4. **Customize**:
* Change the background color or set a gradient.
* Pick a font style and size.
* Adjust text effects (Shadow/Outline).


5. **Download/Share**: Click "Download" to save the image to your device, or "Share" to send it to other apps (mobile only).

## 📦 Deployment

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) configured to deploy the application to **GitHub Pages**.

To deploy:

1. Push your code to the `main` branch.
2. Go to your repository **Settings** > **Pages**.
3. Under **Build and deployment**, ensure "GitHub Actions" is selected as the source.
4. The workflow will automatically build and deploy the app.

## 📂 Project Structure

```
├── .github/workflows/   # CI/CD configuration
├── components/          # React components
│   ├── CustomizeStep.tsx
│   ├── LyricsCard.tsx   # The actual card being rendered/captured
│   ├── SearchStep.tsx
│   └── ...
├── services/            # API services
│   ├── lyricsService.ts # LrcLib integration
│   └── spotifyService.ts# iTunes API integration
├── types.ts             # TypeScript interfaces
├── constants.ts         # Configuration for colors, fonts, etc.
├── App.tsx              # Main application logic
└── vite.config.ts       # Vite configuration

```

## 📄 License

[MIT](https://opensource.org/licenses/MIT)
