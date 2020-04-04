import { fetchTopTracks } from "./lastfm/lastfm";
import express from "express";
import dotenv from "dotenv";
import moment from "moment";
import { authUri, requestTokens } from "./spotify/spotify";

const app = express();
const port: number = parseInt(process.env.PORT) || 3535;

dotenv.config();

app.get("/login", async (req, res) => {
  res.redirect(authUri);
});

app.get("/callback", async (req, res) => {
  const callbackQuery: CallbackQuery = req.query;
  if (callbackQuery.code) {
    const tracks = await fetchTopTracks("nicholasnbg", lastWeek, today, 100);
    const tokens = await requestTokens(callbackQuery.code)
  } else {
    res.send("Whoops, something went wrong:" + callbackQuery.error);
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
