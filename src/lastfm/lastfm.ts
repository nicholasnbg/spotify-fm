import { pipe } from 'fp-ts/lib/pipeable';
import axios from "axios";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { Moment } from "moment";
import { right, left } from "fp-ts/lib/Either";

const fetchTopTracks = (
  username: string,
  startDate: Moment,
  endDate: Moment,
  limit: number
): T.Task<E.Either<Error, LastFmTrack[]>> => {
  const API_KEY = process.env.LASTFM_API_KEY;
  const LASTFM_BASE_URL = "http://ws.audioscrobbler.com/2.0/";
  const TOP_TRACKS_ENPOINT = generateTopTracksEndpoint(username, startDate, endDate, API_KEY);

  const endpoint = LASTFM_BASE_URL + TOP_TRACKS_ENPOINT;
  console.log("FETCHING TRACKS FROM: " + endpoint);

  const errorOrResponse = TE.tryCatch(
      () => axios.get(endpoint),
      (err) => new Error("Problem fetching top tracks: " + String(err))
    )

  return pipe(
    errorOrResponse,
    T.map((errorOrResp) => E.chain(res => handleTopTracksResponse(res, limit))(errorOrResp))
  )
};

const handleTopTracksResponse = (res: any, limit: number): E.Either<Error, LastFmTrack[]> => {
  const { data } = res;
  const tracks = data?.weeklytrackchart?.track
  return tracks ? right(tracks.map(transformTrack).slice(0, limit)) : left(Error("Error transforming tracks response"))
}

const generateTopTracksEndpoint = (username: string, startDate: Moment, endDate: Moment, apiKey: string): string => {
  const startUnix = startDate.startOf("D").unix();
  const endUnix = endDate.endOf("D").unix();
  return `?method=user.getweeklytrackchart&user=${username}&api_key=${apiKey}&format=json&from=${startUnix}&to=${endUnix}`;
};

const transformTrack = (rawTrack: RawTrack): LastFmTrack => ({
  artist: rawTrack.artist["#text"],
  image: rawTrack.image.filter((i) => i.size === "medium")[0]["#text"],
  name: rawTrack.name,
  playcount: rawTrack.playcount,
  rank: rawTrack["@attr"].rank,
});

export { fetchTopTracks, generateTopTracksEndpoint, transformTrack };
