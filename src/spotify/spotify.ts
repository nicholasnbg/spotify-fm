import { generateNewPlaylist } from "./playlist";
import axios from "axios";
import qs from "qs";
import { FetchTokens, Tokens, CreatePlaylistParams, SearchResponse, RawTrackData, SpotifyTrack, UserId } from "./types";
import { Right, Left, Either, List, Maybe, Some } from "monet";
import { searchTrack } from "./tracks";

const CLIENT_ID = "9875b3946f944772849f68a9ed8d153b";
const scopes = "playlist-modify-public playlist-modify-private";
const redirectUri = "http://localhost:3535/callback";
const authUri = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
const tokenEnpoint = `https://accounts.spotify.com/api/token`;

//use this for development purposes only...
const at =
  "BQCU3eg8Lu4_oeCUskJl3lkUr0au-JAeProxlYwLRGerl7wuqHxr3lF30qlusQbGoIxpJtQP6PWwMuL5L3BXx085Z2TjbEm4y0cYzRFktx272BiG6k9JmlYzF9AiYwJCMAJ99SG2vcwlvnPaPfh8RNlTz19ooIQpRuqx7hSNBwNsWl8J5F_04ZjhPHqa9JwwckneHjkbo95pwak";

const requestTokens = async (authCode: string, fetchTokens: FetchTokens): Promise<Either<Error, Tokens>> => {
  const data = {
    grant_type: "authorization_code",
    code: authCode,
    redirect_uri: "http://localhost:3535/callback",
    client_id: CLIENT_ID,
    client_secret: process.env.SPOTIFY_SECRET,
  };

  return fetchTokens(tokenEnpoint, data);
};

// This shoudl return some indication of success or failure
const createPlaylist = async (
  authCode: string,
  playlistParams: CreatePlaylistParams,
  rawTracks: LastFmTrack[]
): Promise<Either<Error, string>> => {
  const currentUserId = await getCurrentUserId();

  const x: Either<Error, Promise<Either<Error, string>>> = currentUserId.map(async (userId) => {
    const playlistName = generateName(playlistParams.startDate, playlistParams.endDate);
    const errorOrPlaylistId = await generateNewPlaylist(authCode, playlistName, "test decription", userId);
    const y: Either<Error, Promise<Either<Error, string>>> = errorOrPlaylistId.map(async (playlistId) => {
      const errorsOrTracks = await Promise.all(rawTracks.map((track) => searchTrack(authCode, track)));
      const maybeTracks = List.fromArray(errorsOrTracks.map((eot) => eot.toMaybe()));
      const tracks = maybeTracks.flattenMaybe<SpotifyTrack>().toArray();
      const errorOrPlaylistSnapshotId = await addTracksToPlaylist(authCode, playlistId.value, tracks);
      return errorOrPlaylistSnapshotId;
    });
    const a = sequenceEither(y);
    const b = await (await a).flatMap((e) => e);
    return b;
  });

  const d = await sequenceEither(x);
  const fsd = d.flatMap((abc) => abc);

  return fsd;
};

const sequenceEither = <E, T>(errorOrPromise: Either<E, Promise<T>>): Promise<Either<E, T>> => {
  return errorOrPromise.foldRight(null)(async (promise, acc) => {
    const res = await promise;
    return Promise.resolve(res);
  });
};

//   return currentUserId.flatMap((userId): Either<Error, string> => {
//     const playlistName = generateName(playlistParams.startDate, playlistParams.endDate);
//     const errorOrPlaylistId = generateNewPlaylist(authCode, playlistName, "test decription", userId)
//       .then(playlistId => {
//         return errorOrPlaylistId.flatMap((playlistId): Either<Error, string> => {
//          const x =  Promise.all(rawTracks.map((track) => searchTrack(authCode, track)))

//         //  .then(errorsOrTracks => {
//         //     const maybeTracks = errorsOrTracks.map((eot) => eot.toMaybe());
//         //     const tracks = List.fromArray(maybeTracks).flattenMaybe<SpotifyTrack>().toArray();
//         //     return addTracksToPlaylist(authCode, playlistId.value, tracks).then(errorOrPlaylistSnapshotId => {
//         //       return errorOrPlaylistSnapshotId
//         //     })
//         //   })
//         });

//       })
//   });
// };

const getCurrentUserId = async (): Promise<Either<Error, UserId>> => {
  const config = {
    transformResponse: handleGetUserIdResponse,
  };

  return axios.get("https://api.spotify.com/v1/me", config);
};

const handleGetUserIdResponse = (res: any, headers: any): Either<Error, UserId> => {
  const { data } = JSON.parse(res);
  if (data) {
    const { id } = data;
    return Right({
      value: id,
    });
  } else {
    return Left(Error("Could not retrieve user ID"));
  }
};

const addTracksToPlaylist = async (
  authCode: string,
  playlistId: string,
  tracks: SpotifyTrack[]
): Promise<Either<Error, string>> => {
  const uris = [];
  tracks.forEach((track) => {
    console.log(track.name);
    uris.push(track.uri);
  });
  const data = JSON.stringify({
    uris,
  });

  const endpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

  const headers = {
    Authorization: `Bearer ${authCode}`,
    "Content-Type": "application/json",
  };
  const config = {
    headers,
    responseTransformer: handleAddTracksResponse,
  };

  return axios.post(endpoint, data, config);
};

const handleAddTracksResponse = (data: any, headers: any): Either<Error, string> => {
  const parsed = JSON.parse(data);
  if (parsed.snapshotId) {
    return Right(parsed.snapshotId);
  } else {
    return Left(Error("Something went wrong adding tracks... "));
  }
};

const isTokenResponse = (arg: any): arg is Tokens => {
  return (
    arg &&
    arg.access_token &&
    typeof arg.access_token === "string" &&
    arg.refresh_token &&
    typeof arg.refresh_token === "string" &&
    arg.scope &&
    typeof arg.scope === "string"
  );
};

const generateName = (start: string, end: string): string => {
  return `Top tracks from ${start} - ${end}`;
};

export { authUri, requestTokens, isTokenResponse, createPlaylist, getCurrentUserId, handleGetUserIdResponse };
