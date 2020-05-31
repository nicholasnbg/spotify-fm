import { pipe } from 'fp-ts/lib/pipeable';
import axios from "axios";
import rateLimit from "axios-rate-limit";
import { Either, left, right } from "fp-ts/lib/Either";
import * as E from 'fp-ts/lib/Either'
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import qs from "qs";
import { SpotifyTrack } from "./types";

const rateLimitConfig = {
  maxRequests: 30,
  perMilliseconds: 3500,
};
const rateLimitHttpClient = rateLimit(axios.create(), rateLimitConfig);

export const searchTrack = (authCode: string, track: LastFmTrack): T.Task<Either<Error, SpotifyTrack>> => {
  const queryParams = {
    q: `${track.name} ${track.artist}`,
    type: "track",
    limit: "1",
  };

  const endpoint = `https://api.spotify.com/v1/search?${qs.stringify(queryParams)}`;

  const headers = {
    Authorization: `Bearer ${authCode}`,
  };

  const config = {
    headers,
  };

  const errorOrResponseTask: T.Task<Either<Error,any>> = TE.tryCatch(
    () => rateLimitHttpClient.get(endpoint, config),
    (err) => new Error("Problem searching for track")
  );

  return pipe(
    errorOrResponseTask,
    T.map((errorOrResp) => E.chain(handleSearchTrackResponse)(errorOrResp))
  )
};

export const handleSearchTrackResponse = (res: any): Either<Error, SpotifyTrack> => {
  const { data } = res;
  if (data && data?.tracks?.items && data.tracks.total > 0) {
    return transformTrack(data.tracks.items[0]);
  } else {
    return left(Error("Coudln't parse track response"));
  }
};

const transformTrack = (rawTrack: any): Either<Error, SpotifyTrack> => {
  if (rawTrack.name && rawTrack.artists[0]?.name && rawTrack.album?.name && rawTrack.id && rawTrack.uri) {
    return right({
      name: rawTrack.name,
      artist: rawTrack.artists[0].name,
      album: rawTrack.album.name,
      id: rawTrack.id,
      uri: rawTrack.uri,
    });
  } else {
    return left(Error("Could not transform track"));
  }
};

export const addTracksToPlaylist = (
  authCode: string,
  playlistId: string,
  tracks: SpotifyTrack[]
): T.Task<Either<Error, string>> => {
  console.log("ADDING TRACKS");

  const uris = tracks.map(track => track.uri);
  const data = JSON.stringify({ uris });
  const endpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  const config = {
    headers: {
      Authorization: `Bearer ${authCode}`,
      "Content-Type": "application/json",
    },
  };

  const errorOrResponseTask = TE.tryCatch(
      () => axios.post(endpoint, data, config),
      (err) => Error("Couldn't add tracks:" + String(err))
    )

  return pipe(
    errorOrResponseTask,
    T.map((errorOrResp) => E.chain(handleAddTracksResponse)(errorOrResp))
  )
};

export const handleAddTracksResponse = (res: any): Either<Error, string> => {
  const { data } = res;
  return data.snapshot_id ? right(data.snapshot_id) : left(Error("Something went wrong handling addTracks response "));
};
