import { map, bimap } from 'fp-ts/lib/Either';
// import { isTokenResponse } from "./spotify/spotify";
import { fetchTopTracks } from "./lastfm/lastfm";
import express from "express";
import dotenv from "dotenv";
import moment from "moment";
// import { authUri, requestTokens, createPlaylist } from "./spotify/spotify";
import { authUri, requestTokens } from "./spotify/spotify";
import { fetchTokens } from "./spotify/fetchTokens";
import { CallbackQuery, Tokens, CreatePlaylistParams } from "./spotify/types";
import { left, either, isRight } from "fp-ts/lib/Either";

const app = express();
app.use(express.urlencoded({ extended: true }));
const port: number = parseInt(process.env.PORT) || 3535;

dotenv.config();

let tokens: Tokens = null;
const at =
  "BQD52DCVujUPbhxVA7LTiqkLC8XQ4iJfe2GwEWiNrMNSdbvenXOm-AdqIuAYCdRuZ9bcfOAhcqRtvVuMOES-F-aIotStESWcKNIJHP1NmqdY083dZtludeK2hkHMJZqoQ9v7nGSGcq_RVuV6xqRC7QiBhnyrCBxUCXqNybnPT-bHxcApZdERDi692_oqmuhHNJvHwyjL_M8jucM";

app.get("/login", async (req, res) => {
  res.redirect(authUri);
});

app.get(
  "/callback",
  async (req, res) => {
    try {
      const callbackQuery: CallbackQuery = req.query;
      if (callbackQuery.code) {
        const errorOrTokens = await requestTokens(callbackQuery.code, fetchTokens)

        const handleLeft = (e:Error) => {res.status(401).send("Could not get tokens from Spotify")}
        const handleRight = (t:Tokens) => {tokens = t}

        bimap<Error, void, Tokens, void>(handleLeft, handleRight)(errorOrTokens)
      }
    } catch (error) {
      console.log(error)
    }


  }
);

// app.post("/createPlaylist", async (req, res) => {
//   try {
//     const params: CreatePlaylistParams = req.body as CreatePlaylistParams;
//     const start = moment(params.startDate);
//     const end = moment(params.endDate);

//     await fetchTopTracks("nicholasnbg", start, end, params.limit)
//       .then((tracks) => {
//         createPlaylist(at, params, tracks);
//       })
//       .catch((err) => {
//         throw Error(err);
//       });

//     res.send("Succesfully created playlist");
//   } catch (error) {
//     console.log("I'm in this mofo");
//     console.log(error);
//   }
// });

app.listen(port, (err) => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on port ${port}`);
});

const today = moment();
const lastWeek = moment().subtract(1, "weeks");
