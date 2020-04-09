import axios from "axios";
import rateLimit from "axios-rate-limit";
import { Either, flatten, left, right } from "fp-ts/lib/Either";
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

  return T.map(flatten)(
    TE.tryCatch(
      () => rateLimitHttpClient.get(endpoint, config).then((res) => handleSearchTrackResponse(res)),
      (err) => new Error("Problem searching for track")
    )
  );
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
