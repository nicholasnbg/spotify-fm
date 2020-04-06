import axios from "axios";
import rateLimit from "axios-rate-limit";
import qs from "qs";

const CLIENT_ID = "9875b3946f944772849f68a9ed8d153b";
const scopes = "playlist-modify-public playlist-modify-private";
const redirectUri = "http://localhost:3535/callback";
const authUri = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
const tokenEnpoint = `https://accounts.spotify.com/api/token`;

//use this for development purposes only...
const at =
  "BQCU3eg8Lu4_oeCUskJl3lkUr0au-JAeProxlYwLRGerl7wuqHxr3lF30qlusQbGoIxpJtQP6PWwMuL5L3BXx085Z2TjbEm4y0cYzRFktx272BiG6k9JmlYzF9AiYwJCMAJ99SG2vcwlvnPaPfh8RNlTz19ooIQpRuqx7hSNBwNsWl8J5F_04ZjhPHqa9JwwckneHjkbo95pwak";

const rateLimitConfig = {
  maxRequests: 30,
  perMilliseconds: 3500,
};
const rateLimitHttpClient = rateLimit(axios.create(), rateLimitConfig);

const requestTokens = async (authCode: string): Promise<TokenResponse> => {
  const data = qs.stringify({
    grant_type: "authorization_code",
    code: authCode,
    redirect_uri: "http://localhost:3535/callback",
    client_id: CLIENT_ID,
    client_secret: process.env.SPOTIFY_SECRET,
  });

  return axios({
    method: "post",
    url: tokenEnpoint,
    data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((res) => res.data)
    .catch((err) => {
      throw Error(err);
    });
};

const refreshToken = async (token: string) => {
  const data = qs.stringify({
    grant_type: "refresh_token",
    refresh_token: token,
    client_id: CLIENT_ID,
    client_secret: process.env.SPOTIFY_SECRET,
  });

  return await axios({
    method: "post",
    url: tokenEnpoint,
    data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((res) => res.data)
    .catch((err) => {
      throw Error(err);
    });
};

const createPlaylist = async (authCode: string, playlistParams: CreatePlaylistParams, rawTracks: LastFmTrack[]) => {
  const currentUserId = await getCurrentUserId(authCode);
  const playlistName = await generateName(playlistParams.startDate, playlistParams.endDate);
  const playlistId = await generateNewPlaylist(authCode, playlistName, "test decription", currentUserId);
  Promise.all(
    rawTracks.map((track) =>
      searchTrack(authCode, track).catch((err) => {
        throw Error("New error here" + err);
      })
    ).filter(t => t !== null)
  )
    .then((tracks) => {
      addTracksToPlaylist(authCode, playlistId, tracks).catch((err) => {
        throw Error("Error adding track to playlist: " + err);
      });
    })
    .catch((err) => {
      throw Error(err);
    });
};

const searchTrack = (authCode: string, track: LastFmTrack): Promise<SpotifyTrack> => {
  const queryParams = {
    q: `${track.name} ${track.artist}`,
    type: "track",
    limit: "1",
  };
  const result = rateLimitHttpClient({
    method: "get",
    url: `https://api.spotify.com/v1/search?${qs.stringify(queryParams)}`,
    headers: {
      Authorization: `Bearer ${authCode}`,
    },
  })
    .then((res) => {
      const searchResponse: SearchResponse = JSON.parse(JSON.stringify(res.data.tracks));
      // const trackData: RawTrackData = !(searchResponse.total === 0) ? searchResponse.items[0] : null;
      let trackData: RawTrackData = null
      if(!(searchResponse.total === 0)){
        console.log("We got a response")
        trackData = searchResponse.items[0]
      }

      let validTrack: SpotifyTrack | null = null;
      if (trackData && trackData.uri) {
        const spotifyTrack: SpotifyTrack = {
          name: trackData.name,
          artist: trackData.artists[0]?.name,
          album: trackData.album.name,
          id: trackData.id,
          uri: trackData.uri,
        };
        validTrack = spotifyTrack;
      }

      if (validTrack) {
        return validTrack;
      } else {
        return null;
      }
    })
    .catch((err) => {
      throw new Error("Error searching for track:" + err);
    });

  return result;
};

const getCurrentUserId = async (authCode: string): Promise<string> => {
  return await axios({
    url: "https://api.spotify.com/v1/me",
    headers: {
      Authorization: `Bearer ${authCode}`,
    },
  })
    .then((res) => res.data.id)
    .catch((err) => {
      throw Error("error getting user: " + err);
    });
};

const generateNewPlaylist = async (
  authCode: string,
  playlistName: string,
  description: string,
  userId: string
): Promise<string> => {
  const data = JSON.stringify({
    name: playlistName,
    description,
  });

  console.log(data);
  return await axios({
    method: "post",
    url: `https://api.spotify.com/v1/users/${userId}/playlists`,
    headers: {
      Authorization: `Bearer ${authCode}`,
      "Content-Type": "application/json",
    },
    data,
  })
    .then((res) => {
      return res.data.id;
    })
    .catch((err) => {
      throw Error(err);
    });
};

const addTracksToPlaylist = async (
  authCode: string,
  playlistId: string,
  tracks: SpotifyTrack[]
): Promise<Error | any> => {
  const uris = tracks
    .filter(track => track !== null)
    .map((track) => {
      console.log({track})
      return track.uri});
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

const isTokenResponse = (arg: any): arg is TokenResponse => {
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

export { authUri, requestTokens, isTokenResponse, createPlaylist };
