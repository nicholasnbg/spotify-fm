import axios from "axios";
import qs from "qs";

const CLIENT_ID = "9875b3946f944772849f68a9ed8d153b";
const scopes = "playlist-modify-public playlist-modify-private";
const redirectUri = "http://localhost:3535/callback";
const authUri = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
const tokenEnpoint = `https://accounts.spotify.com/api/token`;

const at =
  "BQD1PRlSXBoZ1n4Kfpts5utjkTTS5myauQxnjH-ZBDPHxbcSoqrNZUfwWqFt0bocf5HcAes2Gol_EMt4rRBcLOfBvkKH-kXlt3M73SWb6O6VSgzfJLOscHkV46FjaJojUqvEfCokfOHY1GIJp2OrZZz3RMM0Tzc_V489wMk0cR5rdPxlGtQ8ZchDL2RCep6AaDE18bi7wr-E1dY";

const requestTokens = async (authCode: string): Promise<string | TokenResponse> => {
  const data = qs.stringify({
    grant_type: "authorization_code",
    code: authCode,
    redirect_uri: "http://localhost:3535/callback",
    client_id: CLIENT_ID,
    client_secret: process.env.SPOTIFY_SECRET
  });

  const result = await axios({
    method: "post",
    url: tokenEnpoint,
    data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(res => res.data)
    .catch(err => "something went wrong fetching the tokens");
  return result;
};

const refreshToken = async (token: string) => {
  const data = qs.stringify({
    grant_type: "refresh_token",
    refresh_token: token,
    client_id: CLIENT_ID,
    client_secret: process.env.SPOTIFY_SECRET
  });

  const result = await axios({
    method: "post",
    url: tokenEnpoint,
    data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(res => res.data)
    .catch(err => "something went wrong refreshing the token");
  return result;
};

const createPlaylist = async (accessToken: string, playlistParams: CreatePlaylistParams, tracks: LastFmTrack[]) => {
  const spotifyTracks = await Promise.all(tracks.map(track => searchTrack(at, track)));
  const currentUserId = await getCurrentUserId(at);
  if(typeof currentUserId === "string") {
    const playlistName = generateName(playlistParams.startDate, playlistParams.endDate)
    const playlistId = await generateNewPlaylist(at, playlistName, "test decription", currentUserId)
    console.log(playlistId)
  } else {
    console.log("shit")
  }
};

const searchTrack = async (authCode: string = "", track: LastFmTrack): Promise<Error | SpotifyTrack> => {
  const queryParams = {
    q: `${track.name} ${track.artist}`,
    type: "track",
    limit: "1"
  };
  const result = await axios({
    method: "get",
    url: `https://api.spotify.com/v1/search?${qs.stringify(queryParams)}`,
    headers: {
      Authorization: `Bearer ${authCode}`
    }
  })
    .then(res => {
      const searchResponse: SearchResponse = JSON.parse(JSON.stringify(res.data.tracks));
      const trackData: RawTrackData = searchResponse.items.length > 0 ? searchResponse.items[0] : null;
      const spotifyTrack: SpotifyTrack = {
        name: trackData.name,
        artist: trackData.artists[0]?.name,
        album: trackData.album.name,
        id: trackData.id
      };
      return spotifyTrack;
    })
    .catch(err => Error("Error searching for track:" + err));

  return result;
};

const getCurrentUserId = async (authCode: string): Promise<Error | string> => {
  return await axios({
    url: "https://api.spotify.com/v1/me",
    headers: {
      Authorization: `Bearer ${authCode}`
    }
  })
    .then(res => res.data.id)
    .catch(err => Error("error getting user: " + err));
};

const generateNewPlaylist = async (authCode: string, playlistName: string, description: string, userId: string): Promise<Error | string> => {

  const data = JSON.stringify({
    name: playlistName,
    description
  })

  console.log(data)
  return await axios({
    method: 'post',
    url: `https://api.spotify.com/v1/users/${userId}/playlists`,
    headers: {
      Authorization: `Bearer ${authCode}`,
      "Content-Type": "application/json"
    },
    data
  }).then(res => {
    return res.data.id
  }).catch(err => Error(err));
}

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
  return `Top tracks from ${start} - ${end}`
}

export { authUri, requestTokens, isTokenResponse, createPlaylist };
