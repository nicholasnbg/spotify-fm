interface CallbackQuery {
  code?: string;
  error?: string;
  state?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
}

interface SearchResponse {
  items: RawTrackData[]
}

interface RawTrackData {
  album: {
    name: string;
  };
  artists: {
    name: string;
  }[];
  name: string;
  id: string;
  uri: string;
}

interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  id: string;
  uri: string
}

interface CreatePlaylistParams {
  playlistName: string;
  startDate: string;
  endDate: string;
  limit: number;
}
