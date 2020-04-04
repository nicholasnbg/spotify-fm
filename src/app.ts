import { fetchTopTracks } from "./lastfm/lastfm";
import express from "express";
import dotenv from "dotenv";
import moment from "moment";

const app = express();
const port = 3535;

dotenv.config();

app.get("/", (req, res) => {
  fetchTopTracks("nicholasnbg", lastWeek, today);
});

app.listen(port, err => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on port ${port}`);
});

const today = moment();
const lastWeek = moment().subtract(1, "weeks");
