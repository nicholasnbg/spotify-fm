import dotenv from "dotenv";
import express from "express";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import { pipe } from "fp-ts/lib/pipeable";
import moment from "moment";
import { fetchTopTracks } from "./lastfm/lastfm";
import { fetchTokens } from "./spotify/fetchTokens";
import { authUri, createPlaylist, requestTokens } from "./spotify/spotify";
import { CallbackQuery, CreatePlaylistParams, Tokens } from "./spotify/types";
import { traverseEither } from "./util/SequencesTraverses";

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

app.get("/callback", async (req, res) => {
  const handleLeft = (e: Error) => {
    res.status(401).send("Could not get tokens from Spotify" + String(e));
  };
  const handleRight = (t: Tokens) => {
    tokens = t;
  };

  try {
    const callbackQuery: CallbackQuery = req.query;
    if (callbackQuery.code) {
      requestTokens(callbackQuery.code, fetchTokens)().then((errorOrTokens) => {
        pipe(
          errorOrTokens,
          E.fold(handleLeft, handleRight)
          );
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/createPlaylist", async (req, res) => {
  const params: CreatePlaylistParams = req.body as CreatePlaylistParams;
  const start = moment(params.startDate);
  const end = moment(params.endDate);

  const errorOrTracksTask = fetchTopTracks("nicholasnbg", start, end, params.limit);

  await T.chain((errorOrTracks: E.Either<Error, LastFmTrack[]>) => {
    return T.map(E.flatten)(
      traverseEither(errorOrTracks, (tracks: LastFmTrack[]) => createPlaylist(tokens.access_token, params, tracks))
    );
  })(errorOrTracksTask)();

  console.log("CREATED PLAYLIST SUCCESFULLY, NICE!");

  res.send("Succesfully created playlist");
});

app.listen(port, (err) => (err ? console.log(err) : console.log(`server is listening on port ${port}`)));
