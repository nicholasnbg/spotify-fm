import { map, bimap } from 'fp-ts/lib/Either';
import * as E from "fp-ts/lib/Either"
import { fetchTopTracks } from "./lastfm/lastfm";
import express from "express";
import dotenv from "dotenv";
import moment from "moment";
import { authUri, requestTokens, createPlaylist } from "./spotify/spotify";
import { fetchTokens } from "./spotify/fetchTokens";
import { CallbackQuery, Tokens, CreatePlaylistParams } from "./spotify/types";
import { left, either, isRight } from "fp-ts/lib/Either";
import { pipe } from 'fp-ts/lib/pipeable';

const app = express();
app.use(express.urlencoded({ extended: true }));
const port: number = parseInt(process.env.PORT) || 3535;

dotenv.config();

let tokens: Tokens = null;
const at =
  "BQDirb_rSo-u559hD9t3hUJF0L_OI_8uJgCe9ea7Qo8njQHPCrAaPCAFhoJG6FQlqsjtfNEEyE8hRMxaf9K9I2RZbNFejB-rtho6TgMQw5XHwAsWhv-57gv3VbsbFbvkp85X78SB-WLIV3du7y_q2CgpMYADaNYz5tmcLt_bLdNT1BBkGrD84AgnO0RGcWwuLQkXnr6AQyfBUDU";

app.get("/login", async (req, res) => {
  res.redirect(authUri);
});

app.get(
  "/callback",
  async (req, res) => {
    const handleLeft = (e:Error) => {res.status(401).send("Could not get tokens from Spotify")}
    const handleRight = (t:Tokens) => {tokens = t}

    try {
      const callbackQuery: CallbackQuery = req.query;
      if (callbackQuery.code) {
        requestTokens(callbackQuery.code, fetchTokens)().then(errorOrTokens => {
          pipe(
            errorOrTokens,
            E.fold(
              handleLeft,
              handleRight
            )
          )
        })
      }
    } catch (error) {
      console.log(error)
    }


  }
);

app.post("/createPlaylist", async (req, res) => {
    const params: CreatePlaylistParams = req.body as CreatePlaylistParams;
    const start = moment(params.startDate);
    const end = moment(params.endDate);

    const tracks = await fetchTopTracks("nicholasnbg", start, end, params.limit).then(res => {
      return res
    })
    await createPlaylist(at, params, tracks)()

    console.log("CREATED PLAYLIST SUCCESFULLY, NICE!")
    
    res.send("Succesfully created playlist");

});

app.listen(port, (err) => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on port ${port}`);
});

const today = moment();
const lastWeek = moment().subtract(1, "weeks");
