import { isTokenResponse } from './spotify/spotify';
import { fetchTopTracks } from "./lastfm/lastfm";
import express from "express";
import dotenv from "dotenv";
import moment from "moment";
import { authUri, requestTokens, createPlaylist } from "./spotify/spotify";

const app = express();
app.use(express.urlencoded({ extended: true })) 
const port: number = parseInt(process.env.PORT) || 3535;

dotenv.config();

let tokens: TokenResponse = null;

app.get("/login", async (req, res) => {
  res.redirect(authUri);
});

app.get("/callback", async (req, res) => {
  const callbackQuery: CallbackQuery = req.query;
  if (callbackQuery.code) {
    await requestTokens(callbackQuery.code).then(tokensResponse => {
      if (isTokenResponse(tokensResponse)) {
        tokens = tokensResponse;
        console.log("succesfully fetched tokens");
        console.log(tokens.access_token)
      }
    });
  } else {
    res.send("Whoops, something went wrong:" + callbackQuery.error);
  }
});

app.post("/createPlaylist", async (req, res) => {
  const params: CreatePlaylistParams = req.body as CreatePlaylistParams
  const start = moment(params.startDate)
  const end = moment(params.endDate)

  await fetchTopTracks("nicholasnbg", start, end, params.limit).then(tracks => {
    createPlaylist('', params, tracks)
  })

})

app.listen(port, err => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on port ${port}`);
});

const today = moment();
const lastWeek = moment().subtract(1, "weeks");
