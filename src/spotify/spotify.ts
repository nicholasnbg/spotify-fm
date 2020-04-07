import { generateNewPlaylist } from "./playlist";
import { ErrorOr } from "./../util/ErrorOr";
import axios from "axios";
import qs from "qs";
import { FetchTokens, Tokens, CreatePlaylistParams, SearchResponse, RawTrackData, SpotifyTrack, UserId } from "./types";
import { Right, Left } from "monet";

const CLIENT_ID = "9875b3946f944772849f68a9ed8d153b";
const scopes = "playlist-modify-public playlist-modify-private";
const redirectUri = "http://localhost:3535/callback";
const authUri = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
const tokenEnpoint = `https://accounts.spotify.com/api/token`;

//use this for development purposes only...
const at =
  "BQCU3eg8Lu4_oeCUskJl3lkUr0au-JAeProxlYwLRGerl7wuqHxr3lF30qlusQbGoIxpJtQP6PWwMuL5L3BXx085Z2TjbEm4y0cYzRFktx272BiG6k9JmlYzF9AiYwJCMAJ99SG2vcwlvnPaPfh8RNlTz19ooIQpRuqx7hSNBwNsWl8J5F_04ZjhPHqa9JwwckneHjkbo95pwak";



const requestTokens = async (authCode: string, fetchTokens: FetchTokens): Promise<ErrorOr<Tokens>> => {
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
const createPlaylist = async (authCode: string, playlistParams: CreatePlaylistParams, rawTracks: LastFmTrack[]) => {
  const currentUserId = await getCurrentUserId();
  currentUserId.flatMap(async (userId) => {
    const playlistName = generateName(playlistParams.startDate, playlistParams.endDate);
    const errorOrPlaylistId = await generateNewPlaylist(authCode, playlistName, "test decription", userId);
    errorOrPlaylistId.flatMap(async (playlistId) => {
      Promise.all(
        rawTracks
          .map((track) =>
            searchTrack(authCode, track).catch((err) => {
              throw Error("New error here" + err);
            })
          )
          .filter((t) => t !== null)
      )
        .then((tracks) => {
          addTracksToPlaylist(authCode, playlistId.value, tracks).catch((err) => {
            throw Error("Error adding track to playlist: " + err);
          });
        })
        .catch((err) => {
          throw Error(err);
        });
    });
  });
};



const getCurrentUserId = async (): Promise<ErrorOr<UserId>> => {
  const config = {
    transformResponse: handleGetUserIdResponse,
  };

  return axios.get("https://api.spotify.com/v1/me", config);
};

const handleGetUserIdResponse = (res: any, headers: any): ErrorOr<UserId> => {
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
): Promise<Error | any> => {
  const uris = tracks
    .filter((track) => track !== null)
    .map((track) => {
      console.log({ track });
      return track.uri;
    });
  const data = JSON.stringify({
    uris,
  });

  return await axios({
    method: "post",
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    headers: {
      Authorization: `Bearer ${authCode}`,
      "Content-Type": "application/json",
    },
    data,
  })
    .then((res) => {
      console.log("Added tracks succesfully");
      return res.data.snapshotId;
    })
    .catch((err) => {
      throw Error(err);
    });
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
