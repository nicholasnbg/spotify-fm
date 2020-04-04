import axios from "axios";
import qs from "qs";

const CLIENT_ID = "9875b3946f944772849f68a9ed8d153b";
const scopes = "playlist-modify-public playlist-modify-private";
const redirectUri = "http://localhost:3535/callback";
const authUri = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
const tokenEnpoint = `https://accounts.spotify.com/api/token`;

const requestTokens = async (
  authCode: string
): Promise<string | TokenResponse> => {
  const encodedAuth = new Buffer(
    CLIENT_ID + ":" + "a4ce4fe7d681449a91a80b6cc6a2d67c"
  ).toString("base64");

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

export { authUri, requestTokens };
