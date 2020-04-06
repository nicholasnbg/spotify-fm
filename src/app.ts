import { isTokenResponse } from "./spotify/spotify";
import { fetchTopTracks } from "./lastfm/lastfm";
import express from "express";
import dotenv from "dotenv";
import moment from "moment";
import { authUri, requestTokens, createPlaylist } from "./spotify/spotify";

const app = express();
app.use(express.urlencoded({ extended: true }));
const port: number = parseInt(process.env.PORT) || 3535;

dotenv.config();

let tokens: TokenResponse = null;
const at = 'BQD52DCVujUPbhxVA7LTiqkLC8XQ4iJfe2GwEWiNrMNSdbvenXOm-AdqIuAYCdRuZ9bcfOAhcqRtvVuMOES-F-aIotStESWcKNIJHP1NmqdY083dZtludeK2hkHMJZqoQ9v7nGSGcq_RVuV6xqRC7QiBhnyrCBxUCXqNybnPT-bHxcApZdERDi692_oqmuhHNJvHwyjL_M8jucM'

app.get("/login", async (req, res) => {
  res.redirect(authUri);
});

app.get("/callback", async (req, res) => {
  const callbackQuery: CallbackQuery = req.query;
  if (callbackQuery.code) {
    await requestTokens(callbackQuery.code).then(tokensResponse => {
      tokens = tokensResponse;
      console.log(tokens.access_token)
      console.log("succesfully fetched tokens");
    }).catch(err => {throw Error(err)});
  } else {
    res.send("Whoops, something went wrong:" + callbackQuery.error);
  }
});

app.post("/createPlaylist", async (req, res) => {
  try {
    const params: CreatePlaylistParams = req.body as CreatePlaylistParams;
    const start = moment(params.startDate);
    const end = moment(params.endDate);

    await fetchTopTracks("nicholasnbg", start, end, params.limit).then(tracks => {
      createPlaylist(at, params, tracks);
    })
    .catch(err => {
      throw Error(err)});

    res.send("Succesfully created playlist");
  } catch (error) {
    console.log("I'm in this mofo")
    console.log(error);
  }
});

app.listen(port, err => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on port ${port}`);
});

const today = moment();
const lastWeek = moment().subtract(1, "weeks");
