import * as E from "fp-ts/lib/Either";
import { Either } from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import { seqArrayTask, traverseEither } from "../util/SequencesTraverses";
import { generateNewPlaylist } from "./playlist";
import { addTracksToPlaylist, searchTrack } from "./tracks";
import { CreatePlaylistParams, FetchTokens, PlaylistId, SpotifyTrack, Tokens, UserId } from "./types";
import { getCurrentUserId } from "./user";

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


export const createPlaylist = (
  authCode: string,
  playlistParams: CreatePlaylistParams,
  rawTracks: LastFmTrack[]
): T.Task<Either<Error, string>> => {
  const playlistName = generateName(playlistParams.startDate, playlistParams.endDate);

  const errorOrUserIdTask = getCurrentUserId(authCode);

  return T.chain((errorOrUserId: Either<Error, UserId>) => {
    const errorOrPlaylistIdTask = T.map(E.flatten)(
      traverseEither(errorOrUserId, (id: UserId) => generateNewPlaylist(authCode, playlistName, "test description", id))
    );

    return T.chain((errorOrPlaylistId: Either<Error, PlaylistId>) => {
      const eitherTaskRes = traverseEither(errorOrPlaylistId, (playlistId: PlaylistId) => {
        console.log("SEARCHING TRACKS");
        const tracksTask = seqArrayTask(rawTracks.map((track) => searchTrack(authCode, track)));

        return T.chain((eoTracksArr: Either<Error, SpotifyTrack>[]) => {
          const validTracks = eoTracksArr.filter(E.isRight).map((r) => r.right);
          const addTracks = addTracksToPlaylist(authCode, playlistId.value, validTracks);
          return addTracks;
        })(tracksTask);
      });

      return T.map(E.flatten)(eitherTaskRes);
    })(errorOrPlaylistIdTask);
  })(errorOrUserIdTask);
};



const generateName = (start: string, end: string): string => {
  return `Top tracks from ${start} - ${end}`;
};
