import type { CardText, Track } from '../types';

/** The song as the card shows it. A name cleared by the user stays blank, which hides it. */
export const cardSong = (song: Track, text: CardText): Track => ({
  ...song,
  name: text.title ?? song.name,
  artist: text.artist ?? song.artist,
});

/** The song for places that need a name, like filenames, share text and the gallery. */
export const labelSong = (song: Track, text: CardText): Track => ({
  ...song,
  name: text.title?.trim() || song.name,
  artist: text.artist?.trim() || song.artist,
});
