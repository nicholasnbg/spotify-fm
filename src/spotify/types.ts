import { Either } from "fp-ts/lib/Either"
import { Task } from "fp-ts/lib/Task"

type FetchTokens = (s: string, o: object) => Task<Either<Error, Tokens>>

interface CallbackQuery {
  code?: string;
  error?: string;
  state?: string;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
  scope: string;
}

interface UserId {
  value: string;
}

interface PlaylistId { 
  value: string
}

interface SearchResponse {
  items: RawTrackData[];
  total: number;
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
  uri: string;
}

interface CreatePlaylistParams {
  playlistName: string;
  startDate: string;
  endDate: string;
  limit: number;
}

export {FetchTokens, CallbackQuery, Tokens, SearchResponse, RawTrackData, SpotifyTrack, CreatePlaylistParams, UserId, PlaylistId}