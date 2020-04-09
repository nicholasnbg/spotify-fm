import { generateNewPlaylist } from "./playlist";
import axios from "axios";
import qs from "qs";
import {
  FetchTokens,
  Tokens,
  CreatePlaylistParams,
  SearchResponse,
  RawTrackData,
  SpotifyTrack,
  UserId,
  PlaylistId,
} from "./types";
import { right, left, Either, chain } from "fp-ts/lib/Either";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import * as A from "fp-ts/lib/Array";
import { pipe, pipeable } from "fp-ts/lib/pipeable";
import { searchTrack, addTracksToPlaylist } from "./tracks";
import { getApplicative, make } from "fp-ts/lib/Const";
import { Monoid } from "fp-ts/lib/Monoid";

const CLIENT_ID = "9875b3946f944772849f68a9ed8d153b";
const scopes = "playlist-modify-public playlist-modify-private";
const redirectUri = "http://localhost:3535/callback";
export const authUri = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
const tokenEnpoint = `https://accounts.spotify.com/api/token`;

// use this for development purposes only...
const at =
  "BQCU3eg8Lu4_oeCUskJl3lkUr0au-JAeProxlYwLRGerl7wuqHxr3lF30qlusQbGoIxpJtQP6PWwMuL5L3BXx085Z2TjbEm4y0cYzRFktx272BiG6k9JmlYzF9AiYwJCMAJ99SG2vcwlvnPaPfh8RNlTz19ooIQpRuqx7hSNBwNsWl8J5F_04ZjhPHqa9JwwckneHjkbo95pwak";

export const requestTokens = (authCode: string, fetchTokens: FetchTokens): T.Task<Either<Error, Tokens>> => {
  const data = {
    grant_type: "authorization_code",
    code: authCode,
    redirect_uri: "http://localhost:3535/callback",
    client_id: CLIENT_ID,
    client_secret: process.env.SPOTIFY_SECRET,
  };

  return fetchTokens(tokenEnpoint, data);
};

const _ = pipeable(T.task);

const seqEitherTask = E.either.sequence(T.task);
const seqArrayTask = A.array.sequence(T.task);

export const createPlaylist = (
  authCode: string,
  playlistParams: CreatePlaylistParams,
  rawTracks: LastFmTrack[]
): T.Task<Either<Error, string>> => {
  const errorOrUserIdTask = getCurrentUserId(authCode);
  const playlistName = generateName(playlistParams.startDate, playlistParams.endDate);

  return _.chain((errorOrUserId: Either<Error, UserId>) => {
    const errorOrTask = E.map((id: UserId) => generateNewPlaylist(authCode, playlistName, "test decription", id))(
      errorOrUserId
    );
    const errorOrPlaylistIdTask = T.map(E.flatten)(seqEitherTask(errorOrTask));
    return _.chain((errorOrPlaylistId: Either<Error, PlaylistId>) => {
        const eitherTaskRes =  E.map((playlistId: PlaylistId) => {
          console.log("SEARCHING TRACKS")
          const tracksTask = seqArrayTask(rawTracks.map((track) => searchTrack(authCode, track)));
          return _.chain((eoTracksArr: Either<Error, SpotifyTrack>[]) => {
            const validTracks = eoTracksArr.filter(E.isRight).map((r) => r.right);
            const addTracks = addTracksToPlaylist(authCode, playlistId.value, validTracks);
            return addTracks;
          })(tracksTask);
        })(errorOrPlaylistId);
        return T.map(E.flatten)(seqEitherTask(eitherTaskRes))
    })(errorOrPlaylistIdTask);
  })(errorOrUserIdTask);
};

const getCurrentUserId = (authCode: string): T.Task<Either<Error, UserId>> => {
  const headers = {
    Authorization: `Bearer ${authCode}`,
  };

  const config = {
    headers,
  };

  return T.map(E.flatten)(
    TE.tryCatch(
      () => axios.get("https://api.spotify.com/v1/me", config).then((res) => handleGetUserIdResponse(res)),
      (err) => Error("Problem getting current user" + err)
    )
  );
};

const handleGetUserIdResponse = (res: any): Either<Error, UserId> => {
  const { data } = res;
  return data?.id
    ? right({
        value: data.id,
      })
    : left(Error("Could not retrieve user ID"));
};

const generateName = (start: string, end: string): string => {
  return `Top tracks from ${start} - ${end}`;
};

export { getCurrentUserId, handleGetUserIdResponse };
